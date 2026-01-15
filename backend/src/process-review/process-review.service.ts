import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProcessReviewService {
  constructor(private prisma: PrismaService) {}

  /**
   * INITIALISATION & SCAN DES DONNÉES SMI
   */
  async initializeReview(processId: string, month: number, year: number, tenantId: string, docRef?: string) {
    const processus = await this.prisma.processus.findFirst({
      where: { PR_Id: processId, tenantId: tenantId },
    });

    if (!processus) throw new NotFoundException(`Processus ${processId} introuvable.`);

    const indicators = await this.prisma.indicator.findMany({
      where: { IND_ProcessusId: processId, tenantId: tenantId },
      include: { 
        IND_Values: { where: { IV_Month: month, IV_Year: year, IV_Status: 'VALIDE' } } 
      }
    });

    const perfText = indicators.length > 0 
      ? indicators.map(ind => {
          const v = ind.IND_Values[0];
          const st = v ? (v.IV_Actual >= ind.IND_Cible ? '✅' : '⚠️') : '❌';
          return `${st} ${ind.IND_Code}: ${v?.IV_Actual ?? 'N/A'} (Cible: ${ind.IND_Cible}${ind.IND_Unite || ''})`;
        }).join('\n')
      : "Aucun indicateur paramétré.";

    const ncs = await this.prisma.nonConformite.findMany({
      where: { 
        NC_Audit: { AU_ProcessusId: processId }, 
        NC_Statut: { notIn: ['TRAITEE', 'CLOTUREE'] }, 
        tenantId: tenantId 
      }
    });
    const auditText = ncs.length > 0 
      ? ncs.map(n => `• [${n.NC_Gravite}] ${n.NC_Libelle} (Réf: ${n.NC_Id.substring(0, 8)})`).join('\n') 
      : "Néant.";

    const risks = await this.prisma.risk.findMany({
      where: { RS_ProcessusId: processId, tenantId: tenantId, RS_Score: { gte: 10 } }
    });
    const riskText = risks.length > 0 ? risks.map(r => `• ${r.RS_Libelle} (Score: ${r.RS_Score})`).join('\n') : "Risques sous contrôle.";

    return this.prisma.processReview.upsert({
      where: {
        PRV_ProcessusId_PRV_Month_PRV_Year_tenantId: {
          PRV_ProcessusId: processId, PRV_Month: month, PRV_Year: year, tenantId: tenantId
        },
      },
      update: { PRV_DocRef: docRef },
      create: {
        PRV_ProcessusId: processId,
        PRV_Month: month,
        PRV_Year: year,
        tenantId: tenantId,
        PRV_DocRef: docRef || "F-QLT-011",
        PRV_PerformanceAnalysis: `--- SYNTHÈSE KPI ---\n${perfText}`,
        PRV_AuditAnalysis: `--- SYNTHÈSE AUDITS & NC ---\n${auditText}`,
        PRV_RiskAnalysis: `--- SYNTHÈSE RISQUES ---\n${riskText}`,
        PRV_Status: 'BROUILLON',
      },
      include: { PRV_Processus: true }
    });
  }

  /**
   * RÉCUPÉRATION DES STATISTIQUES ET TREND (Correction erreur 'never')
   */
  async getReviewAnalytics(tenantId: string) {
    const reviewActions = await this.prisma.action.findMany({
      where: { tenantId: tenantId, ACT_Origin: 'COPIL' }
    });

    const total = reviewActions.length;
    const completed = reviewActions.filter(a => ['CLOTUREE', 'TERMINEE'].includes(a.ACT_Status)).length;
    const inProgress = reviewActions.filter(a => a.ACT_Status === 'EN_COURS').length;
    
    // Typage explicite pour éviter l'erreur TS2345 (parameter of type 'never')
    const monthlyTrend: Array<{ period: string; rate: number; count: number }> = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();

      const monthActions = reviewActions.filter(a => a.ACT_Title.includes(`[REVUE ${m}/${y}]`));
      const mTotal = monthActions.length;
      const mDone = monthActions.filter(a => ['CLOTUREE', 'TERMINEE'].includes(a.ACT_Status)).length;
      
      monthlyTrend.push({
        period: `${m}/${y}`,
        rate: mTotal > 0 ? Math.round((mDone / mTotal) * 100) : 0,
        count: mTotal
      });
    }

    const reviews = await this.prisma.processReview.findMany({ where: { tenantId: tenantId } });

    return {
      actions: {
        total,
        completed,
        inProgress,
        pending: total - (completed + inProgress),
        executionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      },
      reviews: {
        total: reviews.length,
        validated: reviews.filter(r => r.PRV_Status === 'VALIDEE').length
      },
      trend: monthlyTrend
    };
  }

  /**
   * SIGNATURE & AUTOMATISATION PAQ
   */
  async signReview(id: string, userId: string, role: string) {
    const review = await this.prisma.processReview.findUnique({ 
      where: { PRV_Id: id },
      include: { PRV_Processus: true }
    });

    if (!review) throw new NotFoundException("Revue introuvable.");

    const updateData: any = {};
    if (role === 'PILOTE' || role === 'COPILOTE') updateData.PRV_PiloteSigned = true;
    else if (role === 'ADMIN') updateData.PRV_RQSigned = true;

    const updated = await this.prisma.processReview.update({
      where: { PRV_Id: id },
      data: updateData,
      include: { PRV_Processus: true }
    });

    if (updated.PRV_PiloteSigned && updated.PRV_RQSigned) {
      await this.prisma.processReview.update({ where: { PRV_Id: id }, data: { PRV_Status: 'VALIDEE' } });

      if (updated.PRV_Decisions) {
        const lines = updated.PRV_Decisions.split('\n').filter(l => l.trim().length > 3);
        const paq = await this.prisma.pAQ.findFirst({
          where: { PAQ_ProcessusId: updated.PRV_ProcessusId, PAQ_Year: updated.PRV_Year }
        });

        if (paq && updated.PRV_Processus) {
          for (const line of lines) {
            await this.prisma.action.create({
              data: {
                ACT_Title: `[REVUE ${updated.PRV_Month}/${updated.PRV_Year}] ${line.substring(0, 50).trim()}...`,
                ACT_Description: line,
                ACT_Origin: 'COPIL',
                ACT_Status: 'A_FAIRE',
                ACT_ResponsableId: updated.PRV_Processus.PR_PiloteId,
                ACT_CreatorId: userId,
                ACT_PAQId: paq.PAQ_Id,
                tenantId: updated.tenantId
              }
            });
          }
        }
      }
    }
    return updated;
  }

  async findOne(id: string) {
    const res = await this.prisma.processReview.findUnique({ where: { PRV_Id: id }, include: { PRV_Processus: true } });
    if (!res) throw new NotFoundException("Revue introuvable.");
    return res;
  }

  /**
   * MISE À JOUR (Correction erreur 'possibly null')
   */
  async updateReview(id: string, dto: any, userRole: string) {
    const review = await this.prisma.processReview.findUnique({ where: { PRV_Id: id } });
    
    // Blindage contre le null (TS18047)
    if (!review) throw new NotFoundException("Revue introuvable.");
    
    if (review.PRV_Status === 'VALIDEE' && userRole !== 'ADMIN') {
        throw new ForbiddenException("Document scellé.");
    }

    return this.prisma.processReview.update({
      where: { PRV_Id: id },
      data: {
        PRV_PerformanceAnalysis: dto.performance,
        PRV_AuditAnalysis: dto.audit,
        PRV_RiskAnalysis: dto.risk,
        PRV_ResourcesAnalysis: dto.resources,
        PRV_Decisions: dto.decisions,
        PRV_Status: 'EN_COURS'
      }
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.processReview.findMany({
      where: { tenantId: tenantId },
      include: { PRV_Processus: true },
      orderBy: [{ PRV_Year: 'desc' }, { PRV_Month: 'desc' }]
    });
  }
}