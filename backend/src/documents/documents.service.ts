import { Injectable, NotFoundException, BadRequestException, Logger, StreamableFile } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { CreateRevisionDto } from './dto/revision.dto';
import { ApprovalDto } from './dto/approval.dto';
import { QueryDocumentsDto } from './dto/query-documents.dto';
import { DocStatus, DocCategory } from '@prisma/client';
import { existsSync, createReadStream } from 'fs';
import { join } from 'path';
import { Response } from 'express';

let archiver: any;
try { archiver = require('archiver'); } catch (e) { archiver = null; }

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  constructor(private prisma: PrismaService) {}

  async getStats(tenantId: string) {
    const now = new Date();
    const [total, approved, pending, overdue] = await Promise.all([
      this.prisma.document.count({ where: { tenantId, DOC_IsArchived: false, DOC_IsActive: true } }),
      this.prisma.document.count({ where: { tenantId, DOC_Status: DocStatus.APPROUVE, DOC_IsArchived: false } }),
      this.prisma.document.count({ where: { tenantId, DOC_Status: DocStatus.EN_REVUE, DOC_IsArchived: false } }),
      this.prisma.document.count({ where: { tenantId, DOC_NextReviewDate: { lt: now }, DOC_IsArchived: false } })
    ]);
    return { total, approved, pending, overdue };
  }

  async findAllIso(tenantId: string, filters: QueryDocumentsDto) {
    const docs = await this.findAll(tenantId, filters);
    return docs.map(doc => ({
      DOC_Id: doc.DOC_Id,
      status: doc.DOC_Status,
      isArchived: doc.DOC_IsArchived,
      metadata: {
        reference: doc.DOC_Reference || 'SANS RÉF',
        title: doc.DOC_Title,
        category: doc.DOC_Category,
        processus: doc.DOC_Processus?.PR_Libelle || 'NON RATTACHÉ',
        retentionPeriod: Math.round(doc.DOC_ReviewFrequencyMonths / 12),
        author: doc.DOC_Owner ? `${doc.DOC_Owner.U_FirstName} ${doc.DOC_Owner.U_LastName}` : 'SYSTÈME',
        version: doc.DOC_CurrentVersion,
        modificationDate: doc.DOC_UpdatedAt
      },
      currentVersion: doc.DOC_Versions[0] ? {
        fileName: doc.DOC_Versions[0].DV_FileName,
        size: doc.DOC_Versions[0].DV_FileSize,
        fileUrl: doc.DOC_Versions[0].DV_FileUrl
      } : null
    }));
  }

  async findAll(tenantId: string, filters: QueryDocumentsDto) {
    return this.prisma.document.findMany({
      where: { 
        tenantId, DOC_IsArchived: false, DOC_IsActive: true,
        ...(filters.category && { DOC_Category: filters.category }),
        ...(filters.status && { DOC_Status: filters.status }),
      },
      include: {
        DOC_Versions: { orderBy: { DV_VersionNumber: 'desc' }, take: 1, include: { DV_CreatedBy: true } },
        DOC_Processus: true, DOC_Owner: true
      },
      orderBy: { DOC_UpdatedAt: 'desc' }
    });
  }

  async findOne(id: string, tenantId: string) {
    const doc = await this.prisma.document.findFirst({
      where: { DOC_Id: id, tenantId, DOC_IsActive: true },
      include: { DOC_Versions: { orderBy: { DV_VersionNumber: 'desc' }, include: { DV_CreatedBy: true } }, DOC_Processus: true, DOC_Owner: true }
    });
    if (!doc) throw new NotFoundException("Document introuvable.");
    return doc;
  }

  async create(data: CreateDocumentDto, file: Express.Multer.File, tenantId: string, userId: string) {
    const reference = data.DOC_Category || await this.generateReference(data.DOC_Category || DocCategory.PROCEDURE, tenantId);
    const months = data.DOC_ReviewFrequencyMonths || 12;
    const nextReview = new Date();
    nextReview.setMonth(nextReview.getMonth() + months);

    return this.prisma.document.create({
      data: {
        DOC_Title: data.DOC_Title, DOC_Reference: reference, DOC_Description: data.DOC_Description,
        DOC_Category: data.DOC_Category || DocCategory.PROCEDURE, DOC_Status: DocStatus.EN_REVUE,
        DOC_ReviewFrequencyMonths: months, DOC_NextReviewDate: nextReview, DOC_OwnerId: userId, tenantId,
        DOC_Versions: {
          create: {
            DV_VersionNumber: 1, DV_FileUrl: file.path, DV_FileName: file.originalname,
            DV_FileSize: file.size, DV_FileType: file.originalname.split('.').pop(),
            DV_CreatedById: userId, DV_Status: DocStatus.EN_REVUE
          }
        }
      }
    });
  }

  async update(id: string, dto: UpdateDocumentDto, tenantId: string) {
    return this.prisma.document.update({ where: { DOC_Id: id, tenantId }, data: dto });
  }

  async createNewVersion(id: string, dto: CreateRevisionDto, file: Express.Multer.File, tenantId: string, userId: string) {
    const doc = await this.findOne(id, tenantId);
    const nextVersion = doc.DOC_CurrentVersion + 1;

    return this.prisma.$transaction(async (tx) => {
      const version = await tx.documentVersion.create({
        data: {
          DV_DocumentId: id, DV_VersionNumber: nextVersion, DV_FileUrl: file.path,
          DV_FileName: file.originalname, DV_FileSize: file.size, DV_CreatedById: userId,
          DV_ChangeDescription: dto.changeDescription, DV_Status: DocStatus.EN_REVUE
        }
      });
      await tx.document.update({ where: { DOC_Id: id }, data: { DOC_CurrentVersion: nextVersion, DOC_Status: DocStatus.EN_REVUE } });
      return version;
    });
  }

  async approveVersion(id: string, versionId: string, approvalDto: ApprovalDto, tenantId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const version = await tx.documentVersion.update({
        where: { DV_Id: versionId },
        data: { 
          DV_Status: approvalDto.approved ? DocStatus.APPROUVE : DocStatus.REJETE,
          DV_ApprovedById: userId, DV_ApprovedAt: new Date(), DV_RejectionComment: approvalDto.comment
        }
      });
      if (approvalDto.approved) {
        await tx.document.update({ where: { DOC_Id: id }, data: { DOC_Status: DocStatus.APPROUVE } });
        await tx.documentVersion.updateMany({ where: { DV_DocumentId: id, DV_Id: { not: versionId }, DV_Status: DocStatus.APPROUVE }, data: { DV_Status: DocStatus.OBSOLETE } });
      }
      return version;
    });
  }

  async getFileForPreview(id: string, tenantId: string, res: Response) {
    const doc = await this.findOne(id, tenantId);
    const version = doc.DOC_Versions[0];
    const path = join(process.cwd(), version.DV_FileUrl);
    if (!existsSync(path)) throw new NotFoundException("Fichier manquant.");
    res.setHeader('Content-Type', 'application/pdf');
    return new StreamableFile(createReadStream(path));
  }

  async downloadVersion(id: string, versionId: string, tenantId: string) {
    const version = await this.prisma.documentVersion.findFirst({ where: { DV_Id: versionId, DV_Document: { tenantId } } });
    if (!version) throw new NotFoundException();
    return {
      stream: new StreamableFile(createReadStream(join(process.cwd(), version.DV_FileUrl))),
      fileName: version.DV_FileName, fileSize: version.DV_FileSize, contentType: 'application/octet-stream'
    };
  }

  async bulkDownload(ids: string[], tenantId: string, res: Response) {
    if (!archiver) throw new BadRequestException("Archiver non installé.");
    const archive = archiver('zip');
    res.setHeader('Content-Type', 'application/zip');
    archive.pipe(res);
    const docs = await this.prisma.document.findMany({ where: { DOC_Id: { in: ids }, tenantId }, include: { DOC_Versions: { take: 1, orderBy: { DV_VersionNumber: 'desc' } } } });
    for (const doc of docs) {
      const v = doc.DOC_Versions[0];
      if (v && existsSync(v.DV_FileUrl)) archive.file(v.DV_FileUrl, { name: v.DV_FileName });
    }
    return archive.finalize();
  }

  async archive(id: string, tenantId: string, userId: string) {
    return this.prisma.document.update({ where: { DOC_Id: id, tenantId }, data: { DOC_IsArchived: true, DOC_Status: DocStatus.ARCHIVE, DOC_ArchivedById: userId, DOC_ArchivedAt: new Date() } });
  }

  private async generateReference(category: DocCategory, tenantId: string): Promise<string> {
    const prefixes = { [DocCategory.PROCEDURE]: 'PR', [DocCategory.MANUEL]: 'MA', [DocCategory.ENREGISTREMENT]: 'RE' };
    const count = await this.prisma.document.count({ where: { tenantId, DOC_Category: category } });
    return `${prefixes[category] || 'DO'}-${(count + 1).toString().padStart(3, '0')}-A`;
  }
}