import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 🛡️ LISTE : Tous les documents actifs d'un Tenant
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
          take: 1 // On prend la version la plus récente pour l'affichage
        },
        DOC_Processus: { select: { PR_Libelle: true } },
        DOC_Site: { select: { S_Name: true } }
      },
      orderBy: { DOC_UpdatedAt: 'desc' }
    });
  }

  /**
   * 🛡️ CRÉATION + VERSION 1 : On crée la fiche ET la première version
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
        
        // Création immédiate de la V1
        DOC_Versions: {
          create: {
            DV_VersionNumber: 1,
            DV_FileUrl: data.DV_FileUrl || "temp_url",
            DV_FileName: data.DV_FileName || data.DOC_Title,
            DV_FileSize: data.DV_FileSize || 0,
            //DV_: data.DV_Checksum || "init_hash",
            DV_CreatedById: U_Id,
            DV_Status: 'BROUILLON'
          }
        }
      },
      include: { DOC_Versions: true }
    });
  }

  /**
   * 🔍 ONE : Détails d'un document avec tout son historique de versions
   */
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

  /**
   * 📂 ARCHIVAGE : Ne supprime pas, mais bascule le flag IsArchived
   */
  async archive(id: string, T_Id: string) {
    return this.prisma.document.updateMany({
      where: { DOC_Id: id, tenantId: T_Id },
      data: { DOC_IsArchived: true, DOC_Status: 'ARCHIVE' }
    });
  }
}