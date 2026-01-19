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
  // 🛡️ UTILITAIRES DE CONFORMITÉ
  // ======================================================

  private estEcheanceActive(frequence: string, mois: number): boolean {
    const freq = frequence.toUpperCase();
    if (freq === 'MENSUEL') return true;
    if (freq === 'TRIMESTRIEL') return [3, 6, 9, 12].includes(mois);
    if (freq === 'SEMESTRIEL') return [6, 12].includes(mois);
    if (freq === 'ANNUEL') return mois === 12;
    return false;
  }

  private estDelaiDepasse(moisSaisie: number, anneeSaisie: number): boolean {
    const maintenant = new Date();
    const dateLimite = new Date(anneeSaisie, moisSaisie, 10); // Bloqué après le 10 du mois suivant
    return maintenant > dateLimite;
  }

  // ======================================================
  // 📈 ZONE 1 : PERFORMANCE & DASHBOARD (COCKPIT)
  // ======================================================

  async getDashboardStats(tenantId: string, userId: string, role: string) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Filtre de sécurité : Les pilotes ne voient que leurs processus
    const accessFilter = (role === 'ADMIN' || role === 'SUPER_ADMIN') ? {} : { PR_PiloteId: userId };

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
            performanceSum += Math.min(ratio, 150); // Plafond à 150% pour ne pas fausser la moyenne
            perfCount++;
            
            if (chartData.length < 6) {
              chartData.push({
                label: ind.IND_Code,
                actual: val.IV_Actual,
                target: ind.IND_Cible,
                status: val.IV_Status
              });
            }
          }
        }
      });
    });

    return {
      period: `${month}/${year}`,
      completion: totalExpected > 0 ? Math.round((saisiInd / totalExpected) * 100) : 0,
      globalScore: perfCount > 0 ? Math.round(performanceSum / perfCount) : 0,
      chartData
    };
  }

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

    return processes.map(proc => ({
      processId: proc.PR_Id,
      processCode: proc.PR_Code,
      indicators: proc.PR_Indicators.map(ind => ({
        id: ind.IND_Id,
        code: ind.IND_Code,
        label: ind.IND_Libelle,
        target: ind.IND_Cible,
        unit: ind.IND_Unite,
        isExpected: this.estEcheanceActive(ind.IND_Frequence, month),
        entry: ind.IND_Values[0] || { IV_Actual: null, IV_Status: IVStatus.BROUILLON }
      }))
    }));
  }

  // ======================================================
  // ⚙️ ZONE 2 : WORKFLOW & PKI
  // ======================================================

  async saveBulkValues(values: { indicatorId: string, value: number }[], month: number, year: number, role: string) {
    if (role !== 'ADMIN' && this.estDelaiDepasse(month, year)) {
      throw new ForbiddenException("Période de saisie clôturée.");
    }

    return this.prisma.$transaction(async (tx) => {
      for (const item of values) {
        await tx.indicatorValue.upsert({
          where: { 
            IV_IndicatorId_IV_Month_IV_Year: { 
              IV_IndicatorId: item.indicatorId, 
              IV_Month: month, 
              IV_Year: year 
            } 
          },
          update: { IV_Actual: item.value, IV_UpdatedAt: new Date() },
          create: { 
            IV_IndicatorId: item.indicatorId, 
            IV_Actual: item.value, 
            IV_Month: month, 
            IV_Year: year, 
            IV_Status: IVStatus.BROUILLON 
          }
        });
      }
      return { success: true };
    });
  }

  async updateStatus(processId: string, month: number, year: number, toStatus: IVStatus, userId: string, tenantId: string) {
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.indicatorValue.updateMany({
        where: { 
          IV_Indicator: { IND_ProcessusId: processId }, 
          IV_Month: month, 
          IV_Year: year 
        },
        data: { IV_Status: toStatus }
      });

      if (toStatus === IVStatus.VALIDE) {
        const sigId = `PERF-${processId}-${month}-${year}`;
        await this.pkiService.sign(sigId, 'PROCESS_PERFORMANCE', userId, tenantId);
      }

      return result;
    });
  }

  // ======================================================
  // 🛠️ ZONE 3 : RÉFÉRENTIEL
  // ======================================================

  async createIndicator(dto: any, tenantId: string) {
    return this.prisma.indicator.create({
      data: {
        IND_Code: dto.IND_Code.toUpperCase(),
        IND_Libelle: dto.IND_Libelle,
        IND_Unite: dto.IND_Unite,
        IND_Cible: parseFloat(dto.IND_Cible),
        IND_Frequence: dto.IND_Frequence,
        IND_ProcessusId: dto.IND_ProcessusId,
        tenantId: tenantId,
      }
    });
  }
}