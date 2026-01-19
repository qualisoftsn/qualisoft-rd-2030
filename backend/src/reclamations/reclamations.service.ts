import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReclamationStatus } from '@prisma/client';

@Injectable()
export class ReclamationsService {
  private readonly logger = new Logger(ReclamationsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 📋 RÉCUPÉRATION DU REGISTRE
   * Consolidation : Protection des jointures nulles et typage strict
   */
  async findAll(tenantId: string, processusId?: string) {
    const recs = await this.prisma.reclamation.findMany({
      where: { 
        tenantId: tenantId, 
        ...(processusId && { REC_ProcessusId: processusId }) 
      },
      include: {
        REC_Tier: { select: { TR_Name: true } },
        REC_Processus: { select: { PR_Libelle: true, PR_Code: true } },
        REC_Owner: { select: { U_FirstName: true, U_LastName: true } },
      },
      orderBy: { REC_CreatedAt: 'desc' }
    });

    return recs.map(r => ({
      ...r,
      processusLibelle: r.REC_Processus?.PR_Libelle || "NON ASSIGNÉ",
      processusCode: r.REC_Processus?.PR_Code || "SMI",
      tierName: r.REC_Tier?.TR_Name || "Client Inconnu",
      ownerName: r.REC_Owner ? `${r.REC_Owner.U_FirstName} ${r.REC_Owner.U_LastName}` : "Non assigné"
    }));
  }

  /**
   * ✅ CRÉATION INITIALE
   * Automatisation de la référence chronologique
   */
  async create(data: any, tenantId: string, userId: string) {
    const year = new Date().getFullYear();
    const count = await this.prisma.reclamation.count({ where: { tenantId } });
    const reference = `REC-${year}-${(count + 1).toString().padStart(4, '0')}`;

    return this.prisma.reclamation.create({
      data: {
        REC_Reference: reference,
        REC_Object: data.REC_Object,
        REC_Description: data.REC_Description,
        REC_Source: data.REC_Source || 'Non spécifiée',
        REC_DateReceipt: data.REC_DateReceipt ? new Date(data.REC_DateReceipt) : new Date(),
        REC_TierId: data.REC_TierId,
        REC_OwnerId: userId,
        tenantId: tenantId,
        REC_Status: 'NOUVELLE',
        REC_Gravity: data.REC_Gravity || 'MEDIUM',
        REC_Deadline: data.REC_Deadline ? new Date(data.REC_Deadline) : null,
        REC_ProcessusId: data.REC_ProcessusId || null,
      }
    });
  }

  /**
   * 🔄 MISE À JOUR & LOGIQUE MÉTIER
   * Consolidation : Nettoyage strict des objets de relation pour éviter les erreurs Prisma
   */
  async update(id: string, tenantId: string, data: any) {
    const existing = await this.prisma.reclamation.findFirst({ where: { REC_Id: id, tenantId } });
    if (!existing) throw new NotFoundException("Réclamation introuvable.");

    // Extraction des champs de données propres pour l'update
    const { 
      REC_Tier, REC_Processus, REC_Owner, REC_Actions, REC_NonConformites,
      REC_CreatedAt, REC_Id, tenant, ...updateData 
    } = data;

    // Logique de clôture automatique
    if (updateData.REC_SolutionProposed && existing.REC_Status === 'ACTION_EN_COURS') {
        updateData.REC_Status = 'TRAITEE';
    }

    return this.prisma.reclamation.update({
      where: { REC_Id: id },
      data: {
        ...updateData,
        REC_DateReceipt: data.REC_DateReceipt ? new Date(data.REC_DateReceipt) : undefined,
        REC_Deadline: data.REC_Deadline ? new Date(data.REC_Deadline) : undefined,
        REC_DateTransmitted: data.REC_DateTransmitted ? new Date(data.REC_DateTransmitted) : undefined,
        REC_UpdatedAt: new Date()
      }
    });
  }

  /**
   * 🔗 TRANSMISSION AU PAQ (ISO 9001)
   * Consolidation : Transactionnelle pour garantir le changement de statut
   */
  async linkToPAQ(recId: string, userId: string, tenantId: string) {
    const rec = await this.prisma.reclamation.findUnique({ 
        where: { REC_Id: recId },
        include: { REC_Processus: true }
    });
    
    if (!rec || rec.tenantId !== tenantId) throw new NotFoundException("Réclamation introuvable.");
    if (!rec.REC_ProcessusId) throw new BadRequestException("Veuillez affecter un processus responsable avant la liaison PAQ.");

    const paq = await this.prisma.pAQ.findFirst({
      where: { 
        PAQ_ProcessusId: rec.REC_ProcessusId, 
        tenantId,
        PAQ_Year: new Date().getFullYear() // Liaison au PAQ de l'année en cours
      },
      orderBy: { PAQ_Year: 'desc' }
    });

    if (!paq) throw new BadRequestException("Aucun PAQ (Plan d'Actions Qualité) n'est ouvert pour ce processus.");

    return this.prisma.$transaction(async (tx) => {
      const action = await tx.action.create({
        data: {
          ACT_Title: `[CLIENT] ${rec.REC_Reference} : ${rec.REC_Object}`,
          ACT_Description: `Traitement de réclamation. Description initiale : ${rec.REC_Description}`,
          ACT_Origin: 'RECLAMATION',
          ACT_Status: 'A_FAIRE',
          ACT_PAQId: paq.PAQ_Id,
          ACT_ReclamationId: rec.REC_Id,
          ACT_ResponsableId: userId,
          ACT_CreatorId: userId,
          tenantId: tenantId,
        }
      });

      await tx.reclamation.update({
        where: { REC_Id: recId },
        data: { 
          REC_Status: 'ACTION_EN_COURS',
          REC_DateTransmitted: new Date()
        }
      });

      return action;
    });
  }

  async remove(id: string, tenantId: string) {
    const existing = await this.prisma.reclamation.findFirst({ where: { REC_Id: id, tenantId } });
    if (!existing) throw new NotFoundException("Réclamation introuvable.");
    return this.prisma.reclamation.delete({ where: { REC_Id: id } });
  }
}