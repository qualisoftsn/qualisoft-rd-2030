import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RisksService {
  private readonly logger = new Logger(RisksService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * ✅ CRÉATION CONFORME ISO 31000 (PxGxM)
   * Calcule le score et génère une action automatique si le score est critique (>12)
   */
  async create(dto: any, tenantId: string) {
    const p = parseInt(dto.RS_Probabilite) || 1;
    const g = parseInt(dto.RS_Gravite) || 1;
    const m = parseInt(dto.RS_Maitrise) || 1;
    const score = p * g * m;

    return await this.prisma.$transaction(async (tx) => {
      const risk = await tx.risk.create({
        data: {
          RS_Libelle: dto.RS_Libelle,
          RS_Activite: dto.RS_Activite || "",
          RS_Tache: dto.RS_Tache || "",
          RS_Causes: dto.RS_Causes || "",
          RS_Description: dto.RS_Description || "",
          RS_Probabilite: p,
          RS_Gravite: g,
          RS_Maitrise: m,
          RS_Score: score,
          RS_Status: score > 12 ? "CRITIQUE" : "IDENTIFIE",
          RS_Mesures: dto.RS_Mesures || "",
          RS_Acteurs: dto.RS_Acteurs || "",
          RS_NextReview: dto.RS_NextReview ? new Date(dto.RS_NextReview) : null,
          
          tenant: { connect: { T_Id: tenantId } },
          RS_Processus: { connect: { PR_Id: dto.RS_ProcessusId } },
          RS_Type: { connect: { RT_Id: dto.RS_TypeId } },
        },
        include: { RS_Processus: true, RS_Type: true }
      });

      // 🚨 LOGIQUE ÉLITE : Création automatique d'action si le risque est critique
      if (score > 12) {
        const paq = await tx.pAQ.findFirst({ 
          where: { PAQ_ProcessusId: dto.RS_ProcessusId, tenantId } 
        });

        if (paq) {
          await tx.action.create({
            data: {
              ACT_Title: `Mitigation Risque : ${risk.RS_Libelle}`,
              ACT_Description: `Action automatique suite à détection de risque critique (Score: ${score})`,
              ACT_Origin: 'RISQUE',
              ACT_Type: 'PREVENTIVE',
              ACT_Status: 'A_FAIRE',
              ACT_PAQId: paq.PAQ_Id,
              tenantId: tenantId,
              ACT_ResponsableId: risk.RS_Processus.PR_PiloteId,
              ACT_CreatorId: risk.RS_Processus.PR_PiloteId // Par défaut le pilote
            }
          });
        }
      }

      return risk;
    });
  }

  /**
   * ✅ RÉCUPÉRATION HEATMAP
   */
  async getHeatmapData(tenantId: string, processusId?: string) {
    return this.prisma.risk.findMany({
      where: { 
        tenantId, 
        ...(processusId && { RS_ProcessusId: processusId }) 
      },
      include: { 
        RS_Processus: { select: { PR_Libelle: true, PR_Code: true } },
        RS_Type: { select: { RT_Label: true } }
      },
      orderBy: { RS_Score: 'desc' },
    });
  }

  /**
   * ✅ MISE À JOUR & RECALCUL
   */
  async update(id: string, tenantId: string, dto: any) {
    const p = parseInt(dto.RS_Probabilite) || 1;
    const g = parseInt(dto.RS_Gravite) || 1;
    const m = parseInt(dto.RS_Maitrise) || 1;

    return this.prisma.risk.update({
      where: { RS_Id: id, tenantId },
      data: {
        RS_Libelle: dto.RS_Libelle,
        RS_Probabilite: p,
        RS_Gravite: g,
        RS_Maitrise: m,
        RS_Score: p * g * m,
        RS_Status: dto.RS_Status,
        RS_Mesures: dto.RS_Mesures,
        RS_NextReview: dto.RS_NextReview ? new Date(dto.RS_NextReview) : null,
        ...(dto.RS_TypeId && { RS_Type: { connect: { RT_Id: dto.RS_TypeId } } }),
      }
    });
  }

  async remove(id: string, tenantId: string) {
    return this.prisma.risk.delete({ where: { RS_Id: id, tenantId } });
  }
}