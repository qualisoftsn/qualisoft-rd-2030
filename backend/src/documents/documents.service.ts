import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  Logger,
  StreamableFile
} from '@nestjs/common';
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

@Injectable()
export class DocumentsService {
  downloadVersion(id: string, versionId: string, tenantId: any): { stream: any; fileName: any; fileSize: any; contentType: any; } | PromiseLike<{ stream: any; fileName: any; fileSize: any; contentType: any; }> {
    throw new Error('Method not implemented.');
  }
  bulkDownload(ids: string[], tenantId: any, res: Response<any, Record<string, any>>) {
    throw new Error('Method not implemented.');
  }
  approveVersion(id: string, versionId: string, approvalDto: ApprovalDto, tenantId: any, U_Id: any) {
    throw new Error('Method not implemented.');
  }
  createNewVersion(id: string, revisionDto: CreateRevisionDto, file: Express.Multer.File, tenantId: any, U_Id: any) {
    throw new Error('Method not implemented.');
  }
  update(id: string, dto: UpdateDocumentDto, tenantId: any) {
    throw new Error('Method not implemented.');
  }
  getFileForPreview(id: string, tenantId: any, res: Response<any, Record<string, any>>) {
    throw new Error('Method not implemented.');
  }
  private readonly logger = new Logger(DocumentsService.name);

  constructor(private prisma: PrismaService) {}

  /** 📊 KPIs Documentaires */
  async getStats(tenantId: string) {
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(now.getMonth() + 1);

    const [total, approved, pending, overdue] = await Promise.all([
      this.prisma.document.count({ where: { tenantId, DOC_IsArchived: false, DOC_IsActive: true } }),
      this.prisma.document.count({ where: { tenantId, DOC_Status: DocStatus.APPROUVE, DOC_IsArchived: false } }),
      this.prisma.document.count({ where: { tenantId, DOC_Status: DocStatus.EN_REVUE, DOC_IsArchived: false } }),
      this.prisma.document.count({ where: { tenantId, DOC_NextReviewDate: { lt: now }, DOC_IsArchived: false } })
    ]);

    return { total, approved, pending, overdue };
  }

  /** ✅ Mapper ISO : Sync totale avec le Frontend */
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
        tenantId, 
        DOC_IsArchived: false, 
        DOC_IsActive: true,
        ...(filters.category && { DOC_Category: filters.category }),
        ...(filters.status && { DOC_Status: filters.status }),
      },
      include: {
        DOC_Versions: { orderBy: { DV_VersionNumber: 'desc' }, take: 1, include: { DV_CreatedBy: true } },
        DOC_Processus: true,
        DOC_Owner: true
      },
      orderBy: { DOC_UpdatedAt: 'desc' }
    });
  }

  /** 🏗️ Création Documentaire (Zéro-Erreur Prisma) */
  async create(data: CreateDocumentDto, file: Express.Multer.File, tenantId: string, userId: string) {
    // 🛡️ Vérification de sécurité pour DOC_Title (Cause de ton crash précédent)
    if (!data.DOC_Title) {
      throw new BadRequestException("Argument `DOC_Title` is missing in the SMI configuration.");
    }

    const months = data.DOC_ReviewFrequencyMonths || 12;
    const nextReview = new Date();
    nextReview.setMonth(nextReview.getMonth() + months);

    return this.prisma.document.create({
      data: {
        DOC_Title: data.DOC_Title,
        DOC_Reference: data.DOC_Category,
        DOC_Description: data.DOC_Description,
        DOC_Category: data.DOC_Category || DocCategory.PROCEDURE,
        DOC_Status: DocStatus.EN_REVUE,
        DOC_ReviewFrequencyMonths: months,
        DOC_NextReviewDate: nextReview,
        DOC_CurrentVersion: 1,
        DOC_OwnerId: userId,
        DOC_SiteId: data.DOC_SiteId,
        DOC_ProcessusId: data.DOC_ProcessusId,
        tenantId: tenantId,
        DOC_Versions: {
          create: {
            DV_VersionNumber: 1,
            DV_FileUrl: file.path,
            DV_FileName: file.originalname,
            DV_FileSize: file.size,
            DV_FileType: file.originalname.split('.').pop()?.toLowerCase(),
            DV_Status: DocStatus.EN_REVUE,
            DV_CreatedById: userId,
            DV_ChangeDescription: "Initialisation du document (§7.5.2)"
          }
        }
      }
    });
  }

  async findOne(id: string, tenantId: string) {
    const doc = await this.prisma.document.findFirst({
      where: { DOC_Id: id, tenantId, DOC_IsActive: true },
      include: { DOC_Versions: { orderBy: { DV_VersionNumber: 'desc' } }, DOC_Processus: true, DOC_Owner: true }
    });
    if (!doc) throw new NotFoundException("Document introuvable.");
    return doc;
  }

  async archive(id: string, tenantId: string, userId: string) {
    return this.prisma.document.update({
      where: { DOC_Id: id },
      data: { DOC_IsArchived: true, DOC_Status: DocStatus.ARCHIVE, DOC_ArchivedAt: new Date(), DOC_ArchivedById: userId }
    });
  }
  
  private async generateReference(category: DocCategory, tenantId: string): Promise<string> {
    const count = await this.prisma.document.count({ where: { tenantId, DOC_Category: category } });
    const prefix = category.substring(0, 2).toUpperCase();
    return `${prefix}-${(count + 1).toString().padStart(3, '0')}-A`;
  }
}