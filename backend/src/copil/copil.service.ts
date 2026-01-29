import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IVStatus, RiskStatus, NCStatus } from '@prisma/client';

@Injectable()
export class CopilService {
  constructor(private prisma: PrismaService) {}

  async getCopilAnalysis(tenantId: string, month: number, year: number) {
    // 1. PERFORMANCE (Filtrage par le parent Indicator qui possède le tenantId)
    const indicators = await this.prisma.indicatorValue.findMany({
      where: {
        IV_Month: month,
        IV_Year: year,
        IV_Status: IVStatus.VALIDE,
        IV_Indicator: { tenantId } // ✅ Correction : On filtre via la relation
      },
      include: { 
        IV_Indicator: true // ✅ Obligatoire pour accéder à IND_Cible plus bas
      }
    });

    const successCount = indicators.filter(iv => iv.IV_Actual >= iv.IV_Indicator.IND_Cible).length;
    const processScore = indicators.length > 0 ? (successCount / indicators.length) * 100 : 0;

    // 2. RISQUES
    const risks = await this.prisma.risk.findMany({ where: { tenantId } });
    const treatedRisks = risks.filter(r => r.RS_Status === RiskStatus.TRAITE).length;
    const riskCoverage = risks.length > 0 ? (treatedRisks / risks.length) * 100 : 0;

    // 3. CONFORMITÉ
    const openNC = await this.prisma.nonConformite.count({
      where: { tenantId, NC_Statut: { not: NCStatus.CLOTURE } }
    });

    // 4. PAQ
    const actions = await this.prisma.action.findMany({ where: { tenantId } });
    const completed = actions.filter(a => a.ACT_Status === "TERMINEE").length;
    const paqProgress = actions.length > 0 ? (completed / actions.length) * 100 : 0;

    // 5. POINTS DE VIGILANCE (Typage explicite de l'array)
    const criticalPoints: { cat: string; label: string; val: string | number }[] = []; 
    
    if (processScore < 80) {
      criticalPoints.push({ cat: 'PERF', label: 'Efficacité Processus < 80%', val: `${Math.round(processScore)}%` });
    }
    if (openNC > 5) {
      criticalPoints.push({ cat: 'CONF', label: 'Volume NC Critiques', val: openNC });
    }

    return {
      stats: {
        processScore: Math.round(processScore),
        riskCoverage: Math.round(riskCoverage),
        openNC,
        paqProgress: Math.round(paqProgress)
      },
      criticalPoints,
      period: { month, year }
    };
  }
}