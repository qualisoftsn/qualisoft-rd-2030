import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ActionStatus, SSEType, Priority } from '@prisma/client';

@Injectable()
export class KpiService {
  constructor(private prisma: PrismaService) {}

  /**
   * Synthèse globale pour le Dashboard de Direction
   * Pilotage ISO 9001, MASE et 27001
   */
  async getGlobalStats(tenantId: string) {
    if (!tenantId) throw new ForbiddenException("Isolation de données : Tenant ID manquant.");

    // Utilisation des agrégations Prisma pour la performance (Architecture Propre)
    const [actionsStats, sseStats, risksStats] = await Promise.all([
      // 1. PERFORMANCE QUALITÉ (ISO 9001)
      this.prisma.action.groupBy({
        by: ['ACT_Status'],
        where: { tenantId: tenantId },
        _count: { ACT_Id: true },
      }),

      // 2. PERFORMANCE SÉCURITÉ (MASE / ISO 45001)
      this.prisma.sSEEvent.groupBy({
        by: ['SSE_Type'],
        where: { tenantId: tenantId },
        _count: { SSE_Id: true },
      }),

      // 3. GESTION DES RISQUES (ISO 27001 / 9001)
      this.prisma.risk.count({
        where: { 
          tenantId: tenantId,
          RS_Score: { gte: 12 } // Risques critiques (Score >= 12)
        }
      })
    ]);

    return {
      quality: this.formatActionStats(actionsStats),
      safety: this.formatSSEStats(sseStats),
      security: { criticalRisks: risksStats },
      updatedAt: new Date()
    };
  }

  private formatActionStats(stats: any[]) {
    const total = stats.reduce((acc, curr) => acc + curr._count.ACT_Id, 0);
    const completed = stats.find(s => s.ACT_Status === ActionStatus.TERMINEE)?._count.ACT_Id || 0;
    
    return {
      totalActions: total,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      byStatus: stats
    };
  }

  private formatSSEStats(stats: any[]) {
    const accidents = stats.find(s => s.SSE_Type === SSEType.ACCIDENT_TRAVAIL)?._count.SSE_Id || 0;
    const nearMiss = stats.find(s => s.SSE_Type === SSEType.PRESQU_ACCIDENT)?._count.SSE_Id || 0;
    
    return {
      accidentsCount: accidents,
      nearMissCount: nearMiss,
      safetyTriangleRatio: accidents > 0 ? (nearMiss / accidents).toFixed(1) : '0'
    };
  }
}