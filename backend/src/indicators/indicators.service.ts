import { Injectable, Logger, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IVStatus } from '@prisma/client';

@Injectable()
export class IndicatorsService {
  private readonly logger = new Logger(IndicatorsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * ✅ LOGIQUE MÉTIER : VÉRIFICATION DE LA PÉRIODICITÉ
   */
  private estEcheanceActive(frequence: string, mois: number): boolean {
    const freq = frequence.toUpperCase();
    if (freq === 'MENSUEL') return true;
    if (freq === 'TRIMESTRIEL') return [3, 6, 9, 12].includes(mois);
    if (freq === 'SEMESTRIEL') return [6, 12].includes(mois);
    if (freq === 'ANNUEL') return mois === 12;
    return false;
  }

  /**
   * ✅ LOGIQUE MÉTIER : DÉLAI DE GRÂCE (10 DU MOIS SUIVANT)
   */
  private estDelaiDepasse(moisSaisie: number, anneeSaisie: number): boolean {
    const maintenant = new Date();
    // Date limite fixée au 10 du mois suivant la période de saisie
    const dateLimite = new Date(anneeSaisie, moisSaisie, 10); 
    return maintenant > dateLimite;
  }

  /**
   * ✅ STATISTIQUES DASHBOARD (GRAPHES & KPIs)
   * Isolation Tenant + Filtrage par Rôle (Admin vs Pilote)
   */
  async getDashboardStats(tenantId: string, userId: string, role: string) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Isolation SaaS : ADMIN voit tout, Pilote voit ses processus
    const accessFilter = role === 'ADMIN' ? {} : { PR_PiloteId: userId };

    const processes = await this.prisma.processus.findMany({
      where: { 
        tenantId: tenantId,
        ...accessFilter 
      },
      include: {
        PR_Indicators: {
          include: {
            IND_Values: { where: { IV_Month: month, IV_Year: year } }
          }
        }
      }
    });

    let totalInd = 0;
    let saisiInd = 0;
    let performanceSum = 0;
    let perfCount = 0;
    const chartData: any[] = []; // ✅ Typé proprement pour éviter l'erreur "never"

    processes.forEach(p => {
      p.PR_Indicators.forEach(ind => {
        totalInd++;
        const val = ind.IND_Values[0];
        
        if (val && val.IV_Actual !== null) {
          saisiInd++;
          // Calcul de la performance (Réalisé / Cible)
          const ratio = (val.IV_Actual / ind.IND_Cible) * 100;
          performanceSum += Math.min(ratio, 150); // Capé à 150% pour les moyennes
          perfCount++;
          
          if (chartData.length < 6) {
            chartData.push({
              label: ind.IND_Code,
              value: val.IV_Actual,
              target: ind.IND_Cible
            });
          }
        }
      });
    });

    return {
      month,
      year,
      stats: {
        completionRate: totalInd > 0 ? Math.round((saisiInd / totalInd) * 100) : 0,
        globalPerformance: perfCount > 0 ? Math.round(performanceSum / perfCount) : 0,
        totalProcessus: processes.length,
        totalIndicators: totalInd
      },
      chartData
    };
  }

  /**
   * ✅ GRILLE DE SAISIE MENSUELLE
   */
  async getMonthlyDashboard(tenantId: string, month: number, year: number) {
    const processes = await this.prisma.processus.findMany({
      where: { tenantId: tenantId },
      include: {
        PR_Indicators: {
          include: { 
            IND_Values: { where: { IV_Month: month, IV_Year: year } } 
          }
        }
      },
      orderBy: { PR_Code: 'asc' }
    });

    const delaiDepasse = this.estDelaiDepasse(month, year);

    return processes.map(proc => ({
      processId: proc.PR_Id,
      processCode: proc.PR_Code,
      processLabel: proc.PR_Libelle,
      isDeadlineExceeded: delaiDepasse,
      indicators: proc.PR_Indicators.map(ind => ({
        id: ind.IND_Id,
        code: ind.IND_Code,
        label: ind.IND_Libelle,
        target: ind.IND_Cible,
        unit: ind.IND_Unite,
        frequence: ind.IND_Frequence,
        doitEtreSaisi: this.estEcheanceActive(ind.IND_Frequence, month),
        entry: ind.IND_Values[0] || { IV_Actual: null, IV_Status: IVStatus.BROUILLON }
      }))
    }));
  }

  /**
   * ✅ ENREGISTREMENT MASSIF (BULK SAVE)
   */
  async saveBulkValues(values: { indicatorId: string, value: number }[], month: number, year: number, userRole: string) {
    // Vérification du délai de grâce
    if (userRole !== 'ADMIN' && this.estDelaiDepasse(month, year)) {
      throw new ForbiddenException("Délai de saisie expiré (Max le 10 du mois M+1).");
    }

    for (const item of values) {
      const existing = await this.prisma.indicatorValue.findUnique({
        where: { IV_IndicatorId_IV_Month_IV_Year: { IV_IndicatorId: item.indicatorId, IV_Month: month, IV_Year: year } }
      });

      // Sécurité Workflow : Seul ADMIN peut modifier après soumission/validation
      if (existing && existing.IV_Status !== IVStatus.BROUILLON && userRole !== 'ADMIN') {
        throw new ForbiddenException(`L'indicateur ${item.indicatorId} est verrouillé en cours de validation.`);
      }

      await this.prisma.indicatorValue.upsert({
        where: { IV_IndicatorId_IV_Month_IV_Year: { IV_IndicatorId: item.indicatorId, IV_Month: month, IV_Year: year } },
        update: { IV_Actual: item.value, IV_Status: IVStatus.BROUILLON },
        create: { IV_IndicatorId: item.indicatorId, IV_Actual: item.value, IV_Month: month, IV_Year: year, IV_Status: IVStatus.BROUILLON }
      });
    }
    return { success: true };
  }

  /**
   * ✅ MISE À JOUR DU STATUT (WORKFLOW)
   */
  async updateStatus(processId: string, month: number, year: number, fromStatus: IVStatus, toStatus: IVStatus) {
    return this.prisma.indicatorValue.updateMany({
      where: { 
        IV_Indicator: { IND_ProcessusId: processId }, 
        IV_Month: month, 
        IV_Year: year, 
        IV_Status: fromStatus 
      },
      data: { IV_Status: toStatus }
    });
  }

  /**
   * ✅ RÉFÉRENTIEL : CRÉATION INDICATEUR
   */
  async createIndicator(dto: any, tenantId: string) {
    return this.prisma.indicator.create({
      data: {
        IND_Code: dto.IND_Code.trim().toUpperCase(),
        IND_Libelle: dto.IND_Libelle,
        IND_Unite: dto.IND_Unite,
        IND_Cible: parseFloat(dto.IND_Cible),
        IND_Frequence: dto.IND_Frequence,
        tenantId: tenantId,
        IND_ProcessusId: dto.IND_ProcessusId
      }
    });
  }

  /**
   * ✅ RÉFÉRENTIEL : SUPPRESSION
   */
  async deleteIndicator(id: string) {
    const checkValues = await this.prisma.indicatorValue.count({ where: { IV_IndicatorId: id } });
    if (checkValues > 0) throw new BadRequestException("Impossible de supprimer : historique de données existant.");
    return this.prisma.indicator.delete({ where: { IND_Id: id } });
  }

  /**
   * ✅ MATRICE ANNUELLE
   */
  async getAnnualMatrix(tenantId: string, year: number) {
    return this.prisma.processus.findMany({
      where: { tenantId: tenantId },
      include: { 
        PR_Indicators: { 
          include: { 
            IND_Values: { 
              where: { IV_Year: year }, 
              orderBy: { IV_Month: 'asc' } 
            } 
          } 
        } 
      }
    });
  }
}