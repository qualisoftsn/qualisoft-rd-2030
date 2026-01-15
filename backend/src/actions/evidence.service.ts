import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Preuve } from '@prisma/client';

@Injectable()
export class EvidenceService {
  private readonly logger = new Logger(EvidenceService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 🛡️ CRÉATION D'UNE PREUVE (Robuste & Typée)
   */
  async create(tenantId: string, data: any): Promise<Preuve> {
    this.logger.log(`[CREATE] Enregistrement preuve pour Tenant: ${tenantId}`);

    // Validation stricte des fichiers obligatoires
    if (!data.PV_FileUrl || !data.PV_FileName) {
      throw new BadRequestException("Le justificatif (URL et Nom) est obligatoire pour la traçabilité.");
    }

    try {
      return await this.prisma.preuve.create({
        data: {
          PV_FileUrl: data.PV_FileUrl,
          PV_FileName: data.PV_FileName,
          PV_Commentaire: data.PV_Commentaire || null,
          tenantId: tenantId,
          
          // Liaisons dynamiques selon le workflow
          PV_NCId: data.PV_NCId || null,
          PV_ActionId: data.PV_ActionId || null,
          PV_AuditId: data.PV_AuditId || null,
          PV_DocumentId: data.PV_DocumentId || null,
        },
      });
    } catch (error) {
      // ✅ Correction de l'erreur TS18046 (Type Guarding)
      const message = error instanceof Error ? error.message : "Erreur base de données inconnue";
      this.logger.error(`[ERROR] Échec création preuve: ${message}`);
      throw new BadRequestException(`Erreur lors de l'enregistrement : ${message}`);
    }
  }

  /**
   * 📂 RÉCUPÉRATION GÉNÉRALE (Multi-Tenant)
   */
  async findAllByTenant(tenantId: string): Promise<Preuve[]> {
    return this.prisma.preuve.findMany({
      where: { tenantId: tenantId },
      include: {
        PV_NonConformite: { select: { NC_Libelle: true, NC_Statut: true } },
        PV_Action: { select: { ACT_Title: true, ACT_Status: true } },
        PV_Audit: { select: { AU_Reference: true } },
      },
      orderBy: { PV_CreatedAt: 'desc' },
    });
  }

  /**
   * 🔍 RÉCUPÉRATION UNITAIRE SÉCURISÉE
   */
  async findOne(tenantId: string, id: string): Promise<Preuve> {
    const preuve = await this.prisma.preuve.findFirst({
      where: { PV_Id: id, tenantId: tenantId }
    });
    if (!preuve) throw new NotFoundException("Preuve introuvable.");
    return preuve;
  }
}