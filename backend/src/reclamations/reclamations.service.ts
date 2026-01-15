import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Reclamation, ReclamationStatus } from '@prisma/client';

@Injectable()
export class ReclamationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 📋 RÉCUPÉRATION DU REGISTRE
   * Filtre par Tenant (SaaS) et optionnellement par Processus
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
        tenant: { select: { T_Name: true } }
      },
      orderBy: { REC_CreatedAt: 'desc' }
    });

    // Aplatissement pour le frontend
    return recs.map(r => ({
      ...r,
      tenantName: r.tenant?.T_Name || "QUALISOFT CLIENT",
      processusLibelle: r.REC_Processus?.PR_Libelle || "NON ASSIGNÉ",
      processusCode: r.REC_Processus?.PR_Code || "SMI",
      tierName: r.REC_Tier?.TR_Name || "Client Inconnu",
      ownerName: `${r.REC_Owner?.U_FirstName} ${r.REC_Owner?.U_LastName}`
    }));
  }

  /**
   * ✅ CRÉATION INITIALE (Statut: NOUVELLE)
   * Génère une référence de type REC-2026-0001
   */
  async create(data: any, tenantId: string, userId: string) {
    const year = new Date().getFullYear();
    const count = await this.prisma.reclamation.count({ 
      where: { tenantId: tenantId } 
    });
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
      }
    });
  }

  /**
   * 🔄 MISE À JOUR & WORKFLOW (Preuves, Clôture, Rejet)
   * 🛡️ Nettoyage des relations pour éviter les erreurs Prisma Client
   */
  async update(id: string, data: any) {
    const { 
      REC_Tier, REC_Processus, REC_Owner, REC_Tenant, REC_Actions,
      REC_CreatedAt, REC_Id, tenantName, processusLibelle, processusCode, 
      tierName, ownerName, ...cleanData 
    } = data;

    // 🚩 LOGIQUE MÉTIER : Clôture automatique si preuves fournies
    if (cleanData.REC_SolutionProposed && cleanData.REC_Status === 'ACTION_EN_COURS') {
        cleanData.REC_Status = 'TRAITEE';
    }

    return this.prisma.reclamation.update({
      where: { REC_Id: id },
      data: {
        ...cleanData,
        REC_DateReceipt: data.REC_DateReceipt ? new Date(data.REC_DateReceipt) : undefined,
        REC_DateTransmitted: data.REC_DateTransmitted ? new Date(data.REC_DateTransmitted) : undefined,
        REC_Deadline: data.REC_Deadline ? new Date(data.REC_Deadline) : undefined,
        REC_UpdatedAt: new Date()
      }
    });
  }

  /**
   * 🔗 TRANSMISSION AU PROCESSUS (Informer le responsable)
   * Crée l'action dans le PAQ et bascule le statut en EN COURS
   */
  async linkToPAQ(recId: string, userId: string, tenantId: string) {
    const rec = await this.prisma.reclamation.findUnique({ 
        where: { REC_Id: recId },
        include: { REC_Processus: true }
    });
    
    if (!rec || !rec.REC_ProcessusId) {
      throw new BadRequestException("Action impossible : un processus responsable doit être assigné par le RQ.");
    }

    // Récupération du PAQ en cours pour le processus cible
    const paq = await this.prisma.pAQ.findFirst({
      where: { 
          PAQ_ProcessusId: rec.REC_ProcessusId, 
          tenantId: tenantId 
      },
      orderBy: { PAQ_Year: 'desc' }
    });

    if (!paq) throw new BadRequestException(`Aucun PAQ ouvert trouvé pour le processus ${rec.REC_Processus?.PR_Code}.`);

    // 1. Création de l'action corrective liée à la réclamation
    await this.prisma.action.create({
      data: {
        ACT_Title: `[RÉCLAMATION] ${rec.REC_Object}`,
        ACT_Description: `Traitement de la réclamation client réf: ${rec.REC_Reference}`,
        ACT_Origin: 'RECLAMATION',
        ACT_Status: 'A_FAIRE',
        ACT_PAQId: paq.PAQ_Id,
        ACT_ReclamationId: rec.REC_Id,
        ACT_ResponsableId: userId,
        ACT_CreatorId: userId,
        tenantId: tenantId,
      }
    });

    // 2. Mise à jour de la réclamation (Statut + Date de transmission)
    return this.prisma.reclamation.update({
      where: { REC_Id: recId },
      data: { 
        REC_Status: 'ACTION_EN_COURS' as ReclamationStatus,
        REC_DateTransmitted: new Date()
      }
    });
  }

  /**
   * ❌ SUPPRESSION
   */
  async remove(id: string) {
    const rec = await this.prisma.reclamation.findUnique({ where: { REC_Id: id } });
    if (!rec) throw new NotFoundException();
    
    return this.prisma.reclamation.delete({ where: { REC_Id: id } });
  }
}