import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  Logger,
  StreamableFile,
  ForbiddenException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { CreateRevisionDto } from './dto/revision.dto';
import { ApprovalDto } from './dto/approval.dto';
import { QueryDocumentsDto } from './dto/query-documents.dto';
import { DocStatus, DocCategory } from '@prisma/client';
import { addMonths, isPast, format } from 'date-fns';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { Response } from 'express';

// Import archiver de façon conditionnelle (si installé)
let archiver: any;
try {
  archiver = require('archiver');
} catch (e) {
  archiver = null;
}

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(private prisma: PrismaService) {}

  async getStats(tenantId: string) {
    const now = new Date();
    const thirtyDaysLater = addMonths(now, 1);

    const [
      total,
      approved,
      pending,
      overdue,
      toReviewSoon
    ] = await Promise.all([
      this.prisma.document.count({ 
        where: { tenantId, DOC_IsArchived: false, DOC_IsActive: true } 
      }),
      this.prisma.document.count({ 
        where: { tenantId, DOC_Status: DocStatus.APPROUVE, DOC_IsArchived: false } 
      }),
      this.prisma.document.count({ 
        where: { tenantId, DOC_Status: DocStatus.EN_REVUE, DOC_IsArchived: false } 
      }),
      this.prisma.document.count({ 
        where: { 
          tenantId, 
          DOC_NextReviewDate: { lt: now },
          DOC_Status: { not: DocStatus.OBSOLETE },
          DOC_IsArchived: false
        } 
      }),
      this.prisma.document.count({
        where: {
          tenantId,
          DOC_NextReviewDate: { lte: thirtyDaysLater, gte: now },
          DOC_Status: DocStatus.APPROUVE,
          DOC_IsArchived: false
        }
      })
    ]);

    return { total, approved, pending, overdue, toReviewSoon };
  }

  async findAll(tenantId: string, filters: QueryDocumentsDto) {
    const where: any = { 
      tenantId,
      DOC_IsArchived: false,
      DOC_IsActive: true
    };

    if (filters.category) {
      where.DOC_Category = filters.category;
    }

    if (filters.status) {
      where.DOC_Status = filters.status;
    }

    if (filters.processus && filters.processus !== 'ALL') {
      where.DOC_ProcessusId = filters.processus;
    }

    if (filters.q) {
      const search = { contains: filters.q, mode: 'insensitive' };
      where.OR = [
        { DOC_Title: search },
        { DOC_Reference: search },
        { DOC_Description: search },
        { DOC_Tags: { has: filters.q } }
      ];
    }

    if (filters.dateRange === 'overdue') {
      where.DOC_NextReviewDate = { lt: new Date() };
      where.DOC_Status = { not: DocStatus.OBSOLETE };
    }

    if (filters.tags && filters.tags.length > 0) {
      where.DOC_Tags = { hasEvery: filters.tags };
    }

    return this.prisma.document.findMany({
      where,
      include: {
        DOC_Versions: {
          where: { DV_IsActive: true },
          orderBy: { DV_VersionNumber: 'desc' },
          take: 1,
          include: {
            DV_CreatedBy: { 
              select: { U_Id: true, U_FirstName: true, U_LastName: true } 
            },
            DV_ApprovedBy: { 
              select: { U_Id: true, U_FirstName: true, U_LastName: true } 
            }
          }
        },
        DOC_Processus: { select: { PR_Libelle: true, PR_Code: true, PR_Id: true } },
        DOC_Site: { select: { S_Name: true } },
        DOC_Owner: { select: { U_Id: true, U_FirstName: true, U_LastName: true } }
      },
      orderBy: { DOC_UpdatedAt: 'desc' }
    });
  }

  async findOne(id: string, tenantId: string) {
    const doc = await this.prisma.document.findFirst({
      where: { DOC_Id: id, tenantId, DOC_IsActive: true },
      include: {
        DOC_Versions: {
          where: { DV_IsActive: true },
          orderBy: { DV_VersionNumber: 'desc' },
          include: {
            DV_CreatedBy: { 
              select: { U_Id: true, U_FirstName: true, U_LastName: true, U_Role: true } 
            },
            DV_ApprovedBy: { 
              select: { U_Id: true, U_FirstName: true, U_LastName: true } 
            }
          }
        },
        DOC_Processus: true,
        DOC_Site: true,
        DOC_Owner: { 
          select: { U_Id: true, U_FirstName: true, U_LastName: true } 
        },
      }
    });

    if (!doc) throw new NotFoundException("Document introuvable.");
    return doc;
  }

  async create(
    data: CreateDocumentDto, 
    file: Express.Multer.File, 
    tenantId: string, 
    userId: string
  ) {
    const reference = await this.generateReference(data.DOC_Category || DocCategory.PROCEDURE, tenantId);
    const nextReviewDate = addMonths(new Date(), data.DOC_ReviewFrequencyMonths || 12);

    try {
      return await this.prisma.document.create({
        data: {
          DOC_Reference: reference,
          DOC_Title: data.DOC_Title,
          DOC_Description: data.DOC_Description,
          DOC_Category: data.DOC_Category || DocCategory.PROCEDURE,
          DOC_Status: DocStatus.EN_REVUE,
          DOC_ProcessusId: data.DOC_ProcessusId,
          DOC_SiteId: data.DOC_SiteId,
          DOC_OwnerId: userId,
          tenantId,
          DOC_ReviewFrequencyMonths: data.DOC_ReviewFrequencyMonths || 12,
          DOC_NextReviewDate: nextReviewDate,
          DOC_Tags: data.DOC_Tags || [],
          DOC_Department: data.DOC_Department,
          DOC_CurrentVersion: 1,
          
          DOC_Versions: {
            create: {
              DV_VersionNumber: 1,
              DV_FileUrl: file.path,
              DV_FileName: file.originalname,
              DV_FileSize: file.size,
              DV_FileType: this.getFileExtension(file.originalname),
              DV_Status: DocStatus.EN_REVUE,
              DV_CreatedById: userId,
              DV_ChangeDescription: "Création initiale du document"
            }
          }
        },
        include: {
          DOC_Versions: true,
          DOC_Owner: true,
          DOC_Processus: true
        }
      });
    } catch (error: any) {
      this.logger.error(`Erreur création document: ${error.message}`);
      throw new BadRequestException("Impossible de créer le document.");
    }
  }

  async createNewVersion(
    docId: string, 
    data: CreateRevisionDto,
    file: Express.Multer.File, 
    tenantId: string, 
    userId: string
  ) {
    const doc = await this.prisma.document.findFirst({
      where: { DOC_Id: docId, tenantId, DOC_IsActive: true },
      include: { 
        DOC_Versions: { 
          where: { DV_IsActive: true },
          orderBy: { DV_VersionNumber: 'desc' }, 
          take: 1 
        } 
      }
    });

    if (!doc) throw new NotFoundException("Document introuvable.");
    
    if (doc.DOC_Status === DocStatus.OBSOLETE || doc.DOC_IsArchived) {
      throw new BadRequestException("Impossible de réviser un document obsolète ou archivé.");
    }

    const lastVersion = doc.DOC_Versions[0];
    const newVersionNumber = (lastVersion?.DV_VersionNumber || 0) + 1;

    return this.prisma.$transaction(async (tx) => {
      const newVersion = await tx.documentVersion.create({
        data: {
          DV_VersionNumber: newVersionNumber,
          DV_FileUrl: file.path,
          DV_FileName: file.originalname,
          DV_FileSize: file.size,
          DV_FileType: this.getFileExtension(file.originalname),
          DV_Status: DocStatus.EN_REVUE,
          DV_CreatedById: userId,
          DV_DocumentId: docId,
          DV_ChangeDescription: data.changeDescription
        }
      });

      await tx.document.update({
        where: { DOC_Id: docId },
        data: { 
          DOC_Status: DocStatus.EN_REVUE,
          DOC_CurrentVersion: newVersionNumber,
          DOC_UpdatedAt: new Date()
        }
      });

      return newVersion;
    });
  }

  async approveVersion(
    docId: string,
    versionId: string, 
    approvalData: ApprovalDto,
    tenantId: string,
    approverId: string
  ) {
    return this.prisma.$transaction(async (tx) => {
      const version = await tx.documentVersion.findUnique({
        where: { DV_Id: versionId, DV_IsActive: true },
        include: { DV_Document: true }
      });

      if (!version || version.DV_Document.tenantId !== tenantId) {
        throw new NotFoundException("Version introuvable.");
      }

      if (version.DV_DocumentId !== docId) {
        throw new BadRequestException("Incohérence document/version.");
      }

      if (approvalData.approved) {
        await tx.documentVersion.update({
          where: { DV_Id: versionId },
          data: { 
            DV_Status: DocStatus.APPROUVE,
            DV_ApprovedById: approverId,
            DV_ApprovedAt: new Date()
          }
        });

        const nextReviewDate = addMonths(
          new Date(), 
          version.DV_Document.DOC_ReviewFrequencyMonths || 12
        );

        await tx.document.update({
          where: { DOC_Id: docId },
          data: { 
            DOC_Status: DocStatus.APPROUVE,
            DOC_NextReviewDate: nextReviewDate,
            DOC_UpdatedAt: new Date()
          }
        });

        await tx.documentVersion.updateMany({
          where: { 
            DV_DocumentId: docId, 
            DV_Id: { not: versionId },
            DV_Status: DocStatus.APPROUVE 
          },
          data: { DV_Status: DocStatus.OBSOLETE }
        });

        return { success: true, status: 'approved', version: version.DV_VersionNumber };
      } else {
        await tx.documentVersion.update({
          where: { DV_Id: versionId },
          data: { 
            DV_Status: DocStatus.REJETE, 
            DV_RejectionComment: approvalData.comment 
          }
        });
        
        await tx.document.update({
          where: { DOC_Id: docId },
          data: { DOC_Status: DocStatus.BROUILLON }
        });
        
        return { success: true, status: 'rejected' };
      }
    });
  }

  async getFileForPreview(docId: string, tenantId: string, res: Response) {
    const doc = await this.findOne(docId, tenantId);
    const version = doc.DOC_Versions[0];
    
    if (!version) throw new NotFoundException("Aucune version disponible.");

    const filePath = join(process.cwd(), version.DV_FileUrl);
    if (!existsSync(filePath)) {
      throw new NotFoundException("Fichier physique introuvable.");
    }

    const ext = version.DV_FileType?.toLowerCase() || 'pdf';
    const contentType = ext === 'pdf' ? 'application/pdf' : 
                       ext === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
                       'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', ext === 'pdf' ? 'inline' : `attachment; filename="${encodeURIComponent(version.DV_FileName)}"`);
    
    const fileStream = createReadStream(filePath);
    return new StreamableFile(fileStream);
  }

  async downloadVersion(docId: string, versionId: string, tenantId: string) {
    const doc = await this.findOne(docId, tenantId);
    const version = doc.DOC_Versions.find(v => v.DV_Id === versionId);
    
    if (!version) throw new NotFoundException("Version non trouvée.");

    const filePath = join(process.cwd(), version.DV_FileUrl);
    if (!existsSync(filePath)) {
      throw new NotFoundException("Fichier introuvable.");
    }

    const fileStream = createReadStream(filePath);
    return {
      stream: new StreamableFile(fileStream),
      fileName: version.DV_FileName,
      fileSize: version.DV_FileSize,
      contentType: version.DV_FileType === 'pdf' ? 'application/pdf' : 'application/octet-stream'
    };
  }

  async bulkDownload(docIds: string[], tenantId: string, res: Response) {
    if (!archiver) {
      throw new BadRequestException("Fonctionnalité d'archive non disponible. Installez 'archiver'.");
    }

    const documents = await this.prisma.document.findMany({
      where: { 
        DOC_Id: { in: docIds }, 
        tenantId,
        DOC_IsArchived: false,
        DOC_IsActive: true
      },
      include: {
        DOC_Versions: {
          where: { DV_Status: DocStatus.APPROUVE },
          orderBy: { DV_VersionNumber: 'desc' },
          take: 1
        }
      }
    });

    if (documents.length === 0) {
      throw new BadRequestException("Aucun document valide trouvé.");
    }

    const archive = archiver('zip', { zlib: { level: 9 } });
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="export_ged_${format(new Date(), 'yyyy-MM-dd')}.zip"`);
    
    archive.pipe(res);

    for (const doc of documents) {
      const version = doc.DOC_Versions[0];
      if (version && existsSync(version.DV_FileUrl)) {
        const ext = version.DV_FileType || 'pdf';
        const fileName = `${doc.DOC_Reference || doc.DOC_Id}_v${version.DV_VersionNumber}.${ext}`;
        archive.file(version.DV_FileUrl, { name: fileName });
      }
    }

    await archive.finalize();
  }

  async archive(id: string, tenantId: string, userId: string) {
    const doc = await this.findOne(id, tenantId);
    
    if (doc.DOC_OwnerId !== userId) {
      throw new ForbiddenException("Seul le propriétaire peut archiver ce document.");
    }

    return this.prisma.document.update({
      where: { DOC_Id: id },
      data: { 
        DOC_IsArchived: true, 
        DOC_Status: DocStatus.ARCHIVE,
        DOC_ArchivedAt: new Date(),
        DOC_ArchivedById: userId,
        DOC_UpdatedAt: new Date()
      }
    });
  }

  private async generateReference(category: DocCategory, tenantId: string): Promise<string> {
    const prefixMap = {
      [DocCategory.PROCEDURE]: 'PR',
      [DocCategory.MANUEL]: 'MA',
      [DocCategory.ENREGISTREMENT]: 'RE',
      [DocCategory.CONSIGNE]: 'CS',
      [DocCategory.RAPPORT]: 'RP',
      [DocCategory.FORMULAIRE]: 'FO',
      [DocCategory.AUTRE]: 'DO'
    };
    
    const prefix = prefixMap[category] || 'DO';
    
    const count = await this.prisma.document.count({
      where: { tenantId, DOC_Category: category }
    });
    
    const number = (count + 1).toString().padStart(3, '0');
    return `${prefix}-${number}-A`;
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || 'unknown';
  }
}