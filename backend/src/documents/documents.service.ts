import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * ✅ LISTE : Tous les documents actifs (Non archivés)
   */
  async findAll(T_Id: string) {
    return this.prisma.document.findMany({
      where: { 
        tenantId: T_Id,
        DOC_IsArchived: false 
      },
      include: {
        DOC_Versions: {
          orderBy: { DV_VersionNumber: 'desc' },
          take: 1 
        },
        DOC_Processus: { select: { PR_Libelle: true } },
        DOC_Site: { select: { S_Name: true } }
      },
      orderBy: { DOC_UpdatedAt: 'desc' }
    });
  }

  /**
   * ✅ CRÉATION INITIALE (Document + V1)
   */
  async create(data: any, T_Id: string, U_Id: string) {
    return this.prisma.document.create({
      data: {
        DOC_Title: data.DOC_Title,
        DOC_Description: data.DOC_Description,
        DOC_Category: data.DOC_Category || 'PROCEDURE',
        DOC_Status: 'BROUILLON',
        tenantId: T_Id,
        DOC_ProcessusId: data.DOC_ProcessusId || null,
        DOC_SiteId: data.DOC_SiteId || null,
        
        DOC_Versions: {
          create: {
            DV_VersionNumber: 1,
            DV_FileUrl: data.DV_FileUrl,
            DV_FileName: data.DV_FileName,
            DV_FileSize: data.DV_FileSize || 0,
            DV_CreatedById: U_Id,
            DV_Status: 'BROUILLON'
          }
        }
      },
      include: { DOC_Versions: true }
    });
  }

  /**
   * ✅ RÉVISION (Version v2, v3...)
   * Automatise l'incrémentation de version sans supprimer l'historique
   */
  async createNewVersion(docId: string, data: any, T_Id: string, U_Id: string) {
    const doc = await this.prisma.document.findFirst({
      where: { DOC_Id: docId, tenantId: T_Id },
      include: { DOC_Versions: { orderBy: { DV_VersionNumber: 'desc' }, take: 1 } }
    });

    if (!doc) throw new NotFoundException("Document introuvable");

    const lastVersionNumber = doc.DOC_Versions[0]?.DV_VersionNumber || 1;

    return this.prisma.documentVersion.create({
      data: {
        DV_VersionNumber: lastVersionNumber + 1,
        DV_FileUrl: data.DV_FileUrl,
        DV_FileName: data.DV_FileName,
        DV_FileSize: data.DV_FileSize,
        DV_CreatedById: U_Id,
        DV_DocumentId: docId,
        DV_Status: 'BROUILLON'
      }
    });
  }

  /**
   * ✅ WORKFLOW : Approbation du document
   */
  async approveVersion(versionId: string, T_Id: string) {
    // 1. On passe la version en 'DIFFUSE' (ou APPROUVE)
    const version = await this.prisma.documentVersion.update({
      where: { DV_Id: versionId },
      data: { DV_Status: 'APPROUVE' }
    });

    // 2. On met à jour le statut global du document
    await this.prisma.document.update({
      where: { DOC_Id: version.DV_DocumentId },
      data: { DOC_Status: 'APPROUVE' }
    });

    return version;
  }

  async findOne(id: string, T_Id: string) {
    const doc = await this.prisma.document.findFirst({
      where: { DOC_Id: id, tenantId: T_Id },
      include: {
        DOC_Versions: { orderBy: { DV_VersionNumber: 'desc' } },
        DOC_Processus: true,
        DOC_Site: true
      }
    });
    if (!doc) throw new NotFoundException("Document introuvable");
    return doc;
  }

  async archive(id: string, T_Id: string) {
    return this.prisma.document.updateMany({
      where: { DOC_Id: id, tenantId: T_Id },
      data: { DOC_IsArchived: true, DOC_Status: 'ARCHIVE' }
    });
  }
}