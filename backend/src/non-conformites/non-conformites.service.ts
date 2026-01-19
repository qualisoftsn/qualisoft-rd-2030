import { BadRequestException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NCSource } from '@prisma/client';

@Injectable()
export class NonConformiteService {
  private readonly logger = new Logger(NonConformiteService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * ✅ LISTE : Vue filtrable par processus pour le Dashboard Qualité
   */
  async findAll(tenantId: string, processusId?: string) {
    return this.prisma.nonConformite.findMany({
      where: { 
        tenantId: tenantId,
        ...(processusId && { NC_ProcessusId: processusId })
      },
      include: {
        NC_Processus: { select: { PR_Libelle: true, PR_Code: true } },
        NC_Detector: { select: { U_FirstName: true, U_LastName: true } },
        NC_Actions: { select: { ACT_Title: true, ACT_Status: true } },
        NC_Reclamation: { select: { REC_Reference: true } },
        NC_Audit: { select: { AU_Reference: true } }
      },
      orderBy: { NC_CreatedAt: 'desc' }
    });
  }

  /**
   * ✅ CRÉATION : Déclaration d'un écart (Interne, Audit, Client, SSE)
   */
  async create(data: any, tenantId: string) {
    return this.prisma.nonConformite.create({
      data: {
        NC_Libelle: data.NC_Libelle,
        NC_Description: data.NC_Description,
        NC_Diagnostic: data.NC_Diagnostic || "",
        NC_Gravite: data.NC_Gravite || "MINEURE",
        NC_Statut: data.NC_Statut || "DETECTION",
        NC_Source: (data.NC_Source as NCSource) || NCSource.INTERNAL_AUDIT,
        tenantId: tenantId,
        NC_ProcessusId: data.NC_ProcessusId,
        NC_DetectorId: data.NC_DetectorId,
        NC_AuditId: data.NC_AuditId || null,
        NC_ReclamationId: data.NC_ReclamationId || null,
      }
    });
  }

  /**
   * ✅ MISE À JOUR : Analyse des causes et suivi du traitement
   */
  async update(id: string, tenantId: string, data: any) {
    const existing = await this.prisma.nonConformite.findFirst({
      where: { NC_Id: id, tenantId: tenantId }
    });
    if (!existing) throw new NotFoundException("Non-Conformité introuvable.");

    return this.prisma.nonConformite.update({
      where: { NC_Id: id },
      data: {
        NC_Libelle: data.NC_Libelle,
        NC_Description: data.NC_Description,
        NC_Diagnostic: data.NC_Diagnostic, // Champ pour l'analyse des causes (5 Pourquoi)
        NC_Gravite: data.NC_Gravite,
        NC_Statut: data.NC_Statut, // Passage de DETECTION à ANALYSE ou SOLDE
      }
    });
  }

  /**
   * ✅ SUPPRESSION SÉCURISÉE
   */
  async remove(id: string, tenantId: string) {
    // On utilise deleteMany pour l'isolation multi-tenant
    return this.prisma.nonConformite.deleteMany({ 
      where: { NC_Id: id, tenantId: tenantId } 
    });
  }

  /**
   * 🚀 LIAISON PAQ & CAPA (Corrective and Preventive Action)
   * Génère automatiquement une action dans le plan d'action annuel
   */
  async linkToPAQ(ncId: string, userId: string, tenantId: string) {
    const nc = await this.prisma.nonConformite.findFirst({ 
      where: { NC_Id: ncId, tenantId: tenantId } 
    });
    
    if (!nc) throw new NotFoundException("NC introuvable.");
    
    if (!nc.NC_ProcessusId) {
      throw new BadRequestException("Liaison impossible : Rattachez d'abord la NC à un processus.");
    }

    // Récupération du PAQ actif pour le processus concerné
    const paq = await this.prisma.pAQ.findFirst({
      where: { 
        tenantId: tenantId,
        PAQ_ProcessusId: nc.NC_ProcessusId,
      },
      orderBy: { PAQ_Year: 'desc' }
    });

    if (!paq) throw new BadRequestException("Aucun Plan d'Actions (PAQ) ouvert pour ce processus.");

    return this.prisma.action.create({
      data: {
        ACT_Title: `[CAPA] Correction écart : ${nc.NC_Libelle}`,
        ACT_Description: `Action corrective suite à NC détectée le ${nc.NC_CreatedAt.toLocaleDateString()}. \nDescription : ${nc.NC_Description}`,
        ACT_Origin: 'NON_CONFORMITE',
        ACT_Status: 'A_FAIRE',
        ACT_PAQId: paq.PAQ_Id,
        ACT_NCId: nc.NC_Id,
        ACT_ResponsableId: userId,
        ACT_CreatorId: userId,
        tenantId: tenantId,
      }
    });
  }
}