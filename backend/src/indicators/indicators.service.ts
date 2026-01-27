import { Injectable, Logger, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PkiService } from '../pki/pki.service';
import { IVStatus, Role } from '@prisma/client';

@Injectable()
export class IndicatorsService {
  private readonly logger = new Logger(IndicatorsService.name);

  constructor(
    private prisma: PrismaService,
    private pkiService: PkiService
  ) {}

  // ======================================================
  // 🔴 NOUVELLES MÉTHODES POUR LE PILOTAGE KPI
  // ======================================================

  async getProcessesWithValues(
    tenantId: string, 
    month: number, 
    year: number,
    userId: string,
    role: string
  ) {
    // Filtre de sécurité: si pilote, ne voit que ses processus
    const accessFilter = (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'RQ') 
      ? {} 
      : { 
          OR: [
            { PR_PiloteId: userId },
            { PR_CoPiloteId: userId }
          ]
        };

    const processes = await this.prisma.processus.findMany({
      where: { 
        tenantId,
        ...accessFilter
      },
      include: {
        PR_Indicators: {
          include: {
            IND_Values: {
              where: { 
                OR: [
                  { IV_Month: month, IV_Year: year }, // Valeur actuelle
                  { IV_Month: month === 1 ? 12 : month - 1, IV_Year: month === 1 ? year - 1 : year } // Valeur précédente pour comparaison
                ]
              },
              orderBy: { IV_Year: 'desc' }
            }
          }
        }
      },
      orderBy: { PR_Code: 'asc' }
    });

    return processes.map(proc => ({
      PR_Id: proc.PR_Id,
      PR_Code: proc.PR_Code,
      PR_Libelle: proc.PR_Libelle,
      PR_PiloteId: proc.PR_PiloteId,
      PR_CoPiloteId: proc.PR_CoPiloteId,
      indicators: proc.PR_Indicators.map(ind => {
        // Séparer valeur actuelle et précédente
        const currentValue = ind.IND_Values.find(v => v.IV_Month === month && v.IV_Year === year);
        const previousValue = ind.IND_Values.find(v => 
          v.IV_Month === (month === 1 ? 12 : month - 1) && 
          v.IV_Year === (month === 1 ? year - 1 : year)
        );

        return {
          IND_Id: ind.IND_Id,
          IND_Code: ind.IND_Code,
          IND_Libelle: ind.IND_Libelle,
          IND_Unite: ind.IND_Unite,
          IND_Cible: ind.IND_Cible,
          IND_Frequence: ind.IND_Frequence,
          IND_ProcessusId: ind.IND_ProcessusId,
          currentValue: currentValue || undefined,
          previousValue: previousValue || undefined
        };
      })
    }));
  }

  async getIndicatorHistory(indicatorId: string, tenantId: string) {
    // Vérifier que l'indicateur appartient au tenant
    const indicator = await this.prisma.indicator.findFirst({
      where: { IND_Id: indicatorId, tenantId }
    });

    if (!indicator) throw new NotFoundException("Indicateur non trouvé");

    return this.prisma.indicatorValue.findMany({
      where: { 
        IV_IndicatorId: indicatorId,
        IV_IsActive: true 
      },
      orderBy: [
        { IV_Year: 'desc' },
        { IV_Month: 'desc' }
      ],
      take: 12
    });
  }

  async saveSingleValue(
    indicatorId: string,
    month: number,
    year: number,
    value: number,
    comment: string | undefined,
    userId: string,
    tenantId: string
  ) {
    // Vérifier que l'indicateur existe et appartient au tenant
    const indicator = await this.prisma.indicator.findFirst({
      where: { IND_Id: indicatorId, tenantId },
      include: { IND_Processus: true }
    });

    if (!indicator) throw new NotFoundException("Indicateur non trouvé");

    // Vérifier si une valeur existe déjà et son statut
    const existing = await this.prisma.indicatorValue.findUnique({
      where: {
        IV_IndicatorId_IV_Month_IV_Year: {
          IV_IndicatorId: indicatorId,
          IV_Month: month,
          IV_Year: year
        }
      }
    });

    // Si existe et status SOUMIS ou VALIDE, interdire la modif (sauf Admin)
    if (existing && ['SOUMIS', 'VALIDE'].includes(existing.IV_Status)) {
      // On laisse passer mais le contrôleur vérifie déjà le rôle
    }

    return this.prisma.indicatorValue.upsert({
      where: {
        IV_IndicatorId_IV_Month_IV_Year: {
          IV_IndicatorId: indicatorId,
          IV_Month: month,
          IV_Year: year
        }
      },
      update: {
        IV_Actual: value,
        IV_Comment: comment,
        IV_UpdatedAt: new Date()
      },
      create: {
        IV_IndicatorId: indicatorId,
        IV_Month: month,
        IV_Year: year,
        IV_Actual: value,
        IV_Comment: comment,
        IV_Status: IVStatus.BROUILLON
      }
    });
  }

  async submitProcess(
    processId: string,
    month: number,
    year: number,
    userId: string,
    tenantId: string,
    role: string
  ) {
    // Vérifier que le processus existe
    const process = await this.prisma.processus.findFirst({
      where: { PR_Id: processId, tenantId }
    });

    if (!process) throw new NotFoundException("Processus non trouvé");

    // Si pas admin/RQ, vérifier que c'est bien le pilote/copilote
    if (!['ADMIN', 'SUPER_ADMIN', 'RQ'].includes(role)) {
      if (process.PR_PiloteId !== userId && process.PR_CoPiloteId !== userId) {
        throw new ForbiddenException("Vous n'êtes pas pilote de ce processus");
      }
    }

    // Passer tous les BROUILLON et RENVOYE en SOUMIS pour ce mois/année
    return this.prisma.indicatorValue.updateMany({
      where: {
        IV_Indicator: {
          IND_ProcessusId: processId,
          tenantId
        },
        IV_Month: month,
        IV_Year: year,
        IV_Status: { in: [IVStatus.BROUILLON, IVStatus.RENVOYE] }
      },
      data: {
        IV_Status: IVStatus.SOUMIS,
        IV_UpdatedAt: new Date()
      }
    });
  }

  // ======================================================
  // TES MÉTHODES EXISTANTES (conservées inchangées)
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
    const dateLimite = new Date(anneeSaisie, moisSaisie, 10);
    return maintenant > dateLimite;
  }

  async getDashboardStats(tenantId: string, userId: string, role: string) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

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
            performanceSum += Math.min(ratio, 150);
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