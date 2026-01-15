import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PreuvesService {
  private readonly logger = new Logger(PreuvesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * ✅ CRÉATION DE PREUVE D'AUDIT / NC
   */
  async create(data: any, T_Id: string) {
    this.logger.log(`[CREATE] Ajout preuve Audit/NC pour Tenant: ${T_Id}`);

    if (!data.fileUrl || !data.fileName) {
      throw new BadRequestException("Les métadonnées du fichier sont requises.");
    }

    try {
      return await this.prisma.preuve.create({
        data: {
          PV_FileUrl: data.fileUrl,
          PV_FileName: data.fileName,
          PV_Commentaire: data.commentaire || null,
          tenantId: T_Id,

          // Relations de contexte
          PV_AuditId: data.auditId || null,
          PV_NCId: data.ncId || null,
          PV_ActionId: data.actionId || null,
          PV_DocumentId: data.documentId || null,
        }
      });
    } catch (error) {
      // ✅ Correction de l'erreur TS18046 (Type Guarding)
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      this.logger.error(`Erreur création preuve: ${errorMessage}`);
      throw new BadRequestException(`Impossible d'enregistrer la preuve : ${errorMessage}`);
    }
  }

  /**
   * 🔍 FILTRE PAR AUDIT
   */
  async findByAudit(auditId: string, T_Id: string) {
    return this.prisma.preuve.findMany({
      where: { PV_AuditId: auditId, tenantId: T_Id },
      include: { PV_Document: true, PV_NonConformite: true },
      orderBy: { PV_CreatedAt: 'desc' }
    });
  }
}