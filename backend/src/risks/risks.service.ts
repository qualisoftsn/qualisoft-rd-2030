import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RiskStatus, ActionOrigin, ActionType, ActionStatus, Priority } from '@prisma/client';
import { CreateRiskDto } from './dto/create-risk.dto';

@Injectable()
export class RisksService {
  constructor(private prisma: PrismaService) {}

  /**
   * ISO 9001:2015 §6.1 - Actions pour traiter les risques et opportunités
   * Création d'un risque avec calcul automatique du score et génération d'actions
   */
  async create(dto: CreateRiskDto, tenantId: string, creatorId: string) {
    // 1. Validations de base (Processus et Type)
    const processus = await this.prisma.processus.findFirst({
      where: { PR_Id: dto.RS_ProcessusId, tenantId }
    });
    if (!processus) throw new BadRequestException('Processus non valide pour ce tenant');

    const riskType = await this.prisma.riskType.findFirst({
      where: { RT_Id: dto.RS_TypeId, tenantId }
    });
    if (!riskType) throw new BadRequestException('Type de risque non valide pour ce tenant');

    // 2. Calcul du score P x G x M
    const p = dto.RS_Probabilite || 1;
    const g = dto.RS_Gravite || 1;
    const m = dto.RS_Maitrise || 1;
    const score = p * g * m;

    // 3. Détermination du statut selon le score
    let status: RiskStatus = RiskStatus.IDENTIFIE;
    if (score >= 20) status = RiskStatus.CRITIQUE;
    else if (score >= 12) status = RiskStatus.SURVEILLE;
    else if (score >= 5) status = RiskStatus.EVALUE;

    return await this.prisma.$transaction(async (tx) => {
      // 4. Création du risque avec tous les champs ISO 9001
      const risk = await tx.risk.create({
        data: {
          RS_Libelle: dto.RS_Libelle,
          RS_Activite: dto.RS_Activite,
          RS_Tache: dto.RS_Tache,
          RS_Causes: dto.RS_Causes,
          RS_Description: dto.RS_Description,
          RS_Probabilite: p,
          RS_Gravite: g,
          RS_Maitrise: m,
          RS_Score: score,
          RS_Status: status,
          RS_Mesures: dto.RS_Mesures,
          RS_Acteurs: dto.RS_Acteurs,
          RS_NextReview: dto.RS_NextReview,
          RS_Contexte: dto.RS_Contexte, 
          RS_PartiesInteressees: dto.RS_PartiesInteressees,
          RS_ExigencesLegales: dto.RS_ExigencesLegales,
          RS_Opportunite: dto.RS_Opportunite,
          tenant: { connect: { T_Id: tenantId } },
          RS_Processus: { connect: { PR_Id: dto.RS_ProcessusId } },
          RS_Type: { connect: { RT_Id: dto.RS_TypeId } },
        },
        include: { RS_Processus: true, RS_Type: true }
      });

      // 5. ISO 9001 §6.1.2 - Gestion des Actions (Correctif PAQ inclus)
      // On cherche le PAQ par défaut du processus si non spécifié
      const defaultPaq = await tx.pAQ.findFirst({
        where: { PAQ_ProcessusId: dto.RS_ProcessusId, tenantId, PAQ_IsActive: true }
      });

      if (dto.actions && dto.actions.length > 0) {
        for (const actionDto of dto.actions) {
          const targetPaqId = actionDto.ACT_PAQId || defaultPaq?.PAQ_Id;
          if (!targetPaqId) throw new BadRequestException(`Un PAQ est requis pour l'action : ${actionDto.ACT_Title}`);

          await tx.action.create({
            data: {
              ACT_Title: actionDto.ACT_Title,
              ACT_Description: actionDto.ACT_Description || `Action pour le risque: ${risk.RS_Libelle}`,
              ACT_Origin: ActionOrigin.RISQUE,
              ACT_Type: (actionDto.ACT_Type as ActionType) || ActionType.PREVENTIVE,
              ACT_Status: ActionStatus.A_FAIRE,
              ACT_Priority: score >= 20 ? Priority.CRITICAL : score >= 12 ? Priority.HIGH : Priority.MEDIUM,
              ACT_Deadline: actionDto.ACT_Deadline,
              ACT_ResponsableId: actionDto.ACT_ResponsableId || processus.PR_PiloteId,
              ACT_CreatorId: creatorId,
              ACT_RiskId: risk.RS_Id,
              ACT_PAQId: targetPaqId, // ✅ FIX : Relation PAQ obligatoire établie
              tenantId
            }
          });
        }
      } else if (score >= 12 && defaultPaq) {
        // Création d'une action de mitigation automatique si score élevé
        await tx.action.create({
          data: {
            ACT_Title: `Mitigation auto : ${risk.RS_Libelle}`,
            ACT_PAQId: defaultPaq.PAQ_Id, // ✅ FIX
            ACT_Description: `Action générée automatiquement suite à un score de risque de ${score}`,
            ACT_Origin: ActionOrigin.RISQUE,
            ACT_Type: score >= 20 ? ActionType.CORRECTIVE : ActionType.AMELIORATION,
            ACT_Status: ActionStatus.A_FAIRE,
            ACT_Priority: score >= 20 ? Priority.CRITICAL : Priority.HIGH,
            ACT_ResponsableId: processus.PR_PiloteId,
            ACT_CreatorId: creatorId,
            ACT_RiskId: risk.RS_Id,
            tenantId
          }
        });
      }

      // 6. ISO 9001 §7.5 - Tracement dans la revue de processus
      await tx.processReview.upsert({
        where: { 
          PRV_ProcessusId_PRV_Month_PRV_Year_tenantId: {
            PRV_ProcessusId: dto.RS_ProcessusId,
            PRV_Month: new Date().getMonth() + 1,
            PRV_Year: new Date().getFullYear(),
            tenantId
          }
        },
        update: {
          PRV_RiskAnalysis: { set: `Risque : ${risk.RS_Libelle} (Score: ${score})` }
        },
        create: {
          PRV_Month: new Date().getMonth() + 1,
          PRV_Year: new Date().getFullYear(),
          PRV_Status: 'BROUILLON',
          PRV_RiskAnalysis: `Nouveau risque : ${risk.RS_Libelle} (Score: ${score})`,
          PRV_ProcessusId: dto.RS_ProcessusId,
          tenantId
        }
      });

      return risk;
    });
  }

  /**
   * Mise à jour d'un risque avec recalcul du score
   */
  async update(id: string, tenantId: string, dto: any) {
    const existingRisk = await this.prisma.risk.findFirst({
      where: { RS_Id: id, tenantId }
    });
    if (!existingRisk) throw new NotFoundException('Risque non trouvé');

    const p = dto.RS_Probabilite || existingRisk.RS_Probabilite;
    const g = dto.RS_Gravite || existingRisk.RS_Gravite;
    const m = dto.RS_Maitrise || existingRisk.RS_Maitrise;
    const score = p * g * m;

    let status: RiskStatus = existingRisk.RS_Status;
    if (score >= 20) status = RiskStatus.CRITIQUE;
    else if (score >= 12) status = RiskStatus.SURVEILLE;
    else if (score >= 5) status = RiskStatus.EVALUE;

    return this.prisma.risk.update({
      where: { RS_Id: id },
      data: {
        ...dto,
        RS_Score: score,
        RS_Status: dto.RS_Status || status,
      },
      include: { RS_Processus: true, RS_Type: true, RS_Actions: true }
    });
  }

  /**
   * ISO 9001 §9.1.3 - Analyse et évaluation des risques (Heatmap)
   */
  async getHeatmapData(tenantId: string, processusId?: string) {
    return this.prisma.risk.findMany({
      where: { 
        tenantId, 
        ...(processusId && { RS_ProcessusId: processusId }),
        RS_IsActive: true
      },
      include: { 
        RS_Processus: { select: { PR_Libelle: true, PR_Code: true, PR_Pilote: true } }, 
        RS_Type: true,
        RS_Actions: { where: { ACT_IsActive: true } }
      },
      orderBy: { RS_Score: 'desc' }
    });
  }

  /**
   * ISO 9001 §10.2 - Amélioration continue (Stats)
   */
  async getRiskStats(tenantId: string) {
    const risks = await this.prisma.risk.findMany({
      where: { tenantId, RS_IsActive: true }
    });

    return {
      total: risks.length,
      critical: risks.filter(r => r.RS_Score >= 20).length,
      surveillance: risks.filter(r => r.RS_Score >= 12 && r.RS_Score < 20).length,
      byStatus: risks.reduce((acc, r) => {
        acc[r.RS_Status] = (acc[r.RS_Status] || 0) + 1;
        return acc;
      }, {})
    };
  }

  /**
   * Suppression logique (Soft Delete)
   */
  async remove(id: string, tenantId: string) {
    const risk = await this.prisma.risk.findFirst({ where: { RS_Id: id, tenantId } });
    if (!risk) throw new NotFoundException('Risque non trouvé');

    return this.prisma.risk.update({
      where: { RS_Id: id },
      data: { RS_IsActive: false, RS_Status: RiskStatus.ANNULE }
    });
  }

  /**
   * ISO 9001 §9.3 - Revue de direction (Rapport Périodique)
   */
  async generateReviewReport(tenantId: string, period: 'MONTH' | 'QUARTER' | 'YEAR') {
    const risks = await this.getHeatmapData(tenantId);
    return {
      generatedAt: new Date(),
      period,
      risks: risks.map(r => ({
        label: r.RS_Libelle,
        score: r.RS_Score,
        status: r.RS_Status,
        actions: r.RS_Actions.length
      }))
    };
  }
}