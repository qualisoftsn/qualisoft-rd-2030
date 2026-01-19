import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReclamationStatus } from '@prisma/client';

@Injectable()
export class ReclamationsService {
  private readonly logger = new Logger(ReclamationsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 📋 RÉCUPÉRATION DU REGISTRE
   * Aplatit les données pour une consommation directe par le frontend
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
   * ✅ CRÉATION INITIALE : GÉNÉRATION RÉFÉRENCE REC-YYYY-XXXX
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
      }
    });
  }

  /**
   * 🔄 MISE À JOUR & LOGIQUE DE CLÔTURE AUTOMATIQUE
   */
  async update(id: string, tenantId: string, data: any) {
    // Vérification de propriété (Multi-tenancy)
    const existing = await this.prisma.reclamation.findFirst({ where: { REC_Id: id, tenantId } });
    if (!existing) throw new NotFoundException("Réclamation introuvable.");

    const { 
      REC_Tier, REC_Processus, REC_Owner, REC_Tenant, REC_Actions,
      REC_CreatedAt, REC_Id, tenantName, processusLibelle, processusCode, 
      tierName, ownerName, ...cleanData 
    } = data;

    // Clôture si solution proposée
    if (cleanData.REC_SolutionProposed && cleanData.REC_Status === 'ACTION_EN_COURS') {
        cleanData.REC_Status = 'TRAITEE';
    }

    return this.prisma.reclamation.update({
      where: { REC_Id: id },
      data: {
        ...cleanData,
        REC_DateReceipt: data.REC_DateReceipt ? new Date(data.REC_DateReceipt) : undefined,
        REC_Deadline: data.REC_Deadline ? new Date(data.REC_Deadline) : undefined,
        REC_UpdatedAt: new Date()
      }
    });
  }

  /**
   * 🔗 TRANSMISSION AU PAQ : CRÉATION D'ACTION CORRECTIVE LIEE
   */
  async linkToPAQ(recId: string, userId: string, tenantId: string) {
    const rec = await this.prisma.reclamation.findUnique({ 
        where: { REC_Id: recId },
        include: { REC_Processus: true }
    });
    
    if (!rec || rec.tenantId !== tenantId) throw new NotFoundException("Réclamation introuvable.");
    if (!rec.REC_ProcessusId) throw new BadRequestException("Processus responsable requis.");

    const paq = await this.prisma.pAQ.findFirst({
      where: { PAQ_ProcessusId: rec.REC_ProcessusId, tenantId },
      orderBy: { PAQ_Year: 'desc' }
    });

    if (!paq) throw new BadRequestException("Aucun PAQ trouvé pour ce processus.");

    return this.prisma.$transaction(async (tx) => {
      await tx.action.create({
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

      return tx.reclamation.update({
        where: { REC_Id: recId },
        data: { 
          REC_Status: 'ACTION_EN_COURS' as ReclamationStatus,
          REC_DateTransmitted: new Date()
        }
      });
    });
  }

  /**
   * 🗑️ SUPPRESSION SÉCURISÉE
   */
  async remove(id: string, tenantId: string) {
    const existing = await this.prisma.reclamation.findFirst({ where: { REC_Id: id, tenantId } });
    if (!existing) throw new NotFoundException("Réclamation introuvable.");
    
    return this.prisma.reclamation.delete({ where: { REC_Id: id } });
  }
}