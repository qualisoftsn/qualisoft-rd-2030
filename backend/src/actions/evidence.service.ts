import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Preuve } from '@prisma/client';

@Injectable()
export class EvidenceService {
  private readonly logger = new Logger(EvidenceService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * ✅ CRÉATION UNIFIÉE (Absorbe Evidence & Preuves)
   */
  async create(tenantId: string, data: any): Promise<Preuve> {
    // Support des deux formats d'entrée pour éviter les régressions front
    const fileUrl = data.PV_FileUrl || data.fileUrl;
    const fileName = data.PV_FileName || data.fileName;

    if (!fileUrl || !fileName) {
      throw new BadRequestException("Les métadonnées du fichier (URL et Nom) sont obligatoires.");
    }

    try {
      return await this.prisma.preuve.create({
        data: {
          PV_FileUrl: fileUrl,
          PV_FileName: fileName,
          PV_Commentaire: data.PV_Commentaire || data.commentaire || null,
          tenantId: tenantId,
          // Relations de contexte (Liaisons polyvalentes)
          PV_NCId: data.PV_NCId || data.ncId || null,
          PV_ActionId: data.PV_ActionId || data.actionId || null,
          PV_AuditId: data.PV_AuditId || data.auditId || null,
          PV_DocumentId: data.PV_DocumentId || data.documentId || null,
        },
      });
    } catch (error: any) {
      const message = error instanceof Error ? error.message : "Erreur inconnue";
      throw new BadRequestException(`Échec de l'enregistrement de la preuve : ${message}`);
    }
  }

  /**
   * ✅ RÉCUPÉRATION PAR TENANT
   */
  async findAllByTenant(tenantId: string): Promise<Preuve[]> {
    return this.prisma.preuve.findMany({
      where: { tenantId },
      include: {
        PV_NonConformite: { select: { NC_Libelle: true, NC_Statut: true } },
        PV_Action: { select: { ACT_Title: true, ACT_Status: true } },
        PV_Audit: { select: { AU_Reference: true } },
        PV_Document: true
      },
      orderBy: { PV_CreatedAt: 'desc' },
    });
  }

  /**
   * 🔍 FILTRE PAR AUDIT (Fonctionnalité récupérée de PreuvesService)
   */
  async findByAudit(auditId: string, tenantId: string) {
    return this.prisma.preuve.findMany({
      where: { PV_AuditId: auditId, tenantId: tenantId },
      include: { PV_Document: true, PV_NonConformite: true },
      orderBy: { PV_CreatedAt: 'desc' }
    });
  }

  async findOne(tenantId: string, id: string): Promise<Preuve> {
    const preuve = await this.prisma.preuve.findFirst({ where: { PV_Id: id, tenantId } });
    if (!preuve) throw new NotFoundException("Preuve introuvable.");
    return preuve;
  }
}