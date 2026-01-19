import { Injectable, Logger, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PkiService } from '../pki/pki.service';
import { IVStatus } from '@prisma/client';

@Injectable()
export class IndicatorsService {
  private readonly logger = new Logger(IndicatorsService.name);

  constructor(
    private prisma: PrismaService,
    private pkiService: PkiService
  ) {}

  // ======================================================
  // 🛡️ UTILITAIRES DE CONFORMITÉ (PÉRIODE & DÉLAIS)
  // ======================================================

  /**
   * ✅ VALIDÉ : VÉRIFICATION DE LA PÉRIODICITÉ ISO
   * Détermine si un indicateur doit être saisi pour le mois donné
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
   * ✅ VALIDÉ : DÉLAI DE GRÂCE (LIMITE AU 10 DU MOIS SUIVANT)
   * Verrouille la saisie pour garantir l'intégrité des rapports
   */
  private estDelaiDepasse(moisSaisie: number, anneeSaisie: number): boolean {
    const maintenant = new Date();
    const dateLimite = new Date(anneeSaisie, moisSaisie, 10); 
    return maintenant > dateLimite;
  }

  // ======================================================
  // 📈 ZONE 1 : PERFORMANCE & DASHBOARD (COCKPIT)
  // ======================================================

  /**
   * 📊 STATISTIQUES DASHBOARD : CALCUL PRÉCIS DES ATTENDUS VS SAISIS
   * Génère les données pour les graphiques et le taux de complétion global
   */
  async getDashboardStats(tenantId: string, userId: string, role: string) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const accessFilter = role === 'ADMIN' ? {} : { PR_PiloteId: userId };

    const processes = await this.prisma.processus.findMany({
      where: { tenantId, ...accessFilter },
      include: {
        PR_Indicators: {
          include: {
            IND_Values: { where: { IV_Month: month, IV_Year: year } }
          }
        }
      }
    });

    let totalExpected = 0;
    let saisiInd = 0;
    let performanceSum = 0;
    let perfCount = 0;
    const chartData: any[] = [];

    processes.forEach(p => {
      p.PR_Indicators.forEach(ind => {
        if (this.estEcheanceActive(ind.IND_Frequence, month)) {
          totalExpected++;
          const val = ind.IND_Values[0];
          
          if (val && val.IV_Actual !== null) {
            saisiInd++;
            const ratio = (val.IV_Actual / ind.IND_Cible) * 100;
            performanceSum += Math.min(ratio, 150); // Capé à 150% pour la cohérence globale
            perfCount++;
            
            if (chartData.length < 6) {
              chartData.push({
                label: ind.IND_Code,
                value: val.IV_Actual,
                target: ind.IND_Cible
              });
            }
          }
        }
      });
    });

    return {
      month, year,
      stats: {
        completionRate: totalExpected > 0 ? Math.round((saisiInd / totalExpected) * 100) : 0,
        globalPerformance: perfCount > 0 ? Math.round(performanceSum / perfCount) : 0,
        totalProcessus: processes.length,
        totalIndicatorsExpected: totalExpected
      },
      chartData
    };
  }

  /**
   * 📋 RÉCUPÉRATION DE LA GRILLE MENSUELLE
   * Mappe les données pour l'affichage dynamique avec indicateurs de statut
   */
  async getMonthlyDashboard(tenantId: string, month: number, year: number) {
    const processes = await this.prisma.processus.findMany({
      where: { tenantId },
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

  // ======================================================
  // ⚙️ ZONE 2 : WORKFLOW & VALIDATION PKI
  // ======================================================

  /**
   * ⚡ ENREGISTREMENT MASSIF : SAISIE EN VRAC (BULK SAVE)
   * Utilise une transaction pour garantir l'intégrité des données saisies
   */
  async saveBulkValues(values: { indicatorId: string, value: number }[], month: number, year: number, userRole: string) {
    if (userRole !== 'ADMIN' && this.estDelaiDepasse(month, year)) {
      throw new ForbiddenException("Délai de saisie expiré (Max le 10 du mois M+1).");
    }

    return this.prisma.$transaction(async (tx) => {
      for (const item of values) {
        const existing = await tx.indicatorValue.findUnique({
          where: { IV_IndicatorId_IV_Month_IV_Year: { IV_IndicatorId: item.indicatorId, IV_Month: month, IV_Year: year } }
        });

        if (existing && existing.IV_Status !== IVStatus.BROUILLON && userRole !== 'ADMIN') {
          throw new ForbiddenException(`L'indicateur ${item.indicatorId} est verrouillé.`);
        }

        await tx.indicatorValue.upsert({
          where: { IV_IndicatorId_IV_Month_IV_Year: { IV_IndicatorId: item.indicatorId, IV_Month: month, IV_Year: year } },
          update: { IV_Actual: item.value, IV_Status: IVStatus.BROUILLON },
          create: { IV_IndicatorId: item.indicatorId, IV_Actual: item.value, IV_Month: month, IV_Year: year, IV_Status: IVStatus.BROUILLON }
        });
      }
      return { success: true };
    });
  }

  /**
   * ✅ MISE À JOUR DU STATUT (WORKFLOW INTERMÉDIAIRE)
   * Permet le passage de BROUILLON à SOUMIS par le Pilote
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
   * 🖋️ VALIDATION OFFICIELLE : PASSAGE AU STATUT VALIDE + SIGNATURE PKI
   * Verrouille officiellement la performance avec une preuve cryptographique
   */
  async validateProcessIndicators(processId: string, month: number, year: number, userId: string, tenantId: string) {
    return this.prisma.$transaction(async (tx) => {
      const updateResult = await tx.indicatorValue.updateMany({
        where: { 
          IV_Indicator: { IND_ProcessusId: processId }, 
          IV_Month: month, 
          IV_Year: year, 
          IV_Status: IVStatus.SOUMIS 
        },
        data: { IV_Status: IVStatus.VALIDE }
      });

      if (updateResult.count === 0) throw new NotFoundException("Aucun indicateur soumis trouvé.");

      // Création de la signature électronique ELITE
      const entityId = `PERF-${processId}-${month}-${year}`;
      await this.pkiService.sign(entityId, 'PROCESS_PERFORMANCE', userId, tenantId);
      
      return { success: true, count: updateResult.count };
    });
  }

  // ======================================================
  // 🛠️ ZONE 3 : RÉFÉRENTIEL & ANALYSE ANNUELLE
  // ======================================================

  /**
   * ✅ RÉFÉRENTIEL : CRÉATION D'UN NOUVEL INDICATEUR
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
   * ✅ RÉFÉRENTIEL : SUPPRESSION SÉCURISÉE (SANS HISTORIQUE)
   */
  async deleteIndicator(id: string) {
    const checkValues = await this.prisma.indicatorValue.count({ where: { IV_IndicatorId: id } });
    if (checkValues > 0) throw new BadRequestException("Suppression impossible : historique de données existant.");
    return this.prisma.indicator.delete({ where: { IND_Id: id } });
  }

  /**
   * 📅 MATRICE ANNUELLE : RÉCUPÉRATION DES 12 MOIS
   */
  async getAnnualMatrix(tenantId: string, year: number) {
    return this.prisma.processus.findMany({
      where: { tenantId },
      include: { 
        PR_Indicators: { 
          include: { 
            IND_Values: { where: { IV_Year: year }, orderBy: { IV_Month: 'asc' } } 
          } 
        } 
      }
    });
  }
}