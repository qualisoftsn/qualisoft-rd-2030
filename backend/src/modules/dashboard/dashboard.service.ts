/**
 * 🛰️ MODULE : DashboardService
 * -------------------------------------------------------------------------
 * RÔLE : Agrégation multi-flux et calcul des KPI Flash (SMI).
 * LOGIQUE : Lecture concurrente (Promise.all) avec isolation TenantId.
 * RÉVISION : 03 Mars 2026 | 22:15 GMT
 * -------------------------------------------------------------------------
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NCStatus, ActionStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 📡 FLUX D'ACTIVITÉ GLOBAL (Journal de Bord)
   * Fusionne les 5 derniers événements de chaque module souverain.
   */
  async getGlobalActivity(tenantId: string) {
    const limit = 5;

    try {
      const [docs, ncs, audits, actions, sses] = await Promise.all([
        this.prisma.document.findMany({
          where: { tenantId, DOC_IsActive: true },
          orderBy: { DOC_CreatedAt: 'desc' },
          take: limit,
        }),
        this.prisma.nonConformite.findMany({
          where: { tenantId, NC_IsActive: true },
          orderBy: { NC_CreatedAt: 'desc' },
          take: limit,
        }),
        this.prisma.audit.findMany({
          where: { tenantId, AU_IsActive: true },
          orderBy: { AU_CreatedAt: 'desc' },
          take: limit,
        }),
        this.prisma.action.findMany({
          where: { tenantId, ACT_IsActive: true },
          orderBy: { ACT_CreatedAt: 'desc' },
          take: limit,
        }),
        this.prisma.sSEEvent.findMany({
          where: { tenantId, SSE_IsActive: true },
          orderBy: { SSE_CreatedAt: 'desc' },
          take: limit,
        }),
      ]);

      // 🔗 MAPPING UNIFIÉ SDE-MATRIX
      const unifiedFeed = [
        ...docs.map(d => ({
          id: d.DOC_Id,
          type: 'DOCUMENT',
          title: d.DOC_Title,
          description: `Référence : ${d.DOC_Reference || 'Sans réf.'} | Statut : ${d.DOC_Status}`,
          createdAt: d.DOC_CreatedAt,
        })),
        ...ncs.map(nc => ({
          id: nc.NC_Id,
          type: 'NON_CONFORMITE',
          title: nc.NC_Libelle,
          description: `Gravité : ${nc.NC_Gravite} | Statut : ${nc.NC_Statut}`,
          createdAt: nc.NC_CreatedAt,
        })),
        ...audits.map(a => ({
          id: a.AU_Id,
          type: 'AUDIT',
          title: a.AU_Title,
          description: `Audit ${a.AU_Type} - Réf : ${a.AU_Reference}`,
          createdAt: a.AU_CreatedAt,
        })),
        ...actions.map(act => ({
          id: act.ACT_Id,
          type: 'ACTION',
          title: act.ACT_Title,
          description: `Priorité : ${act.ACT_Priority} | Statut : ${act.ACT_Status}`,
          createdAt: act.ACT_CreatedAt,
        })),
        ...sses.map(sse => ({
          id: sse.SSE_Id,
          type: 'SSE',
          title: `Événement ${sse.SSE_Type}`,
          description: sse.SSE_Description.substring(0, 100) + '...',
          createdAt: sse.SSE_CreatedAt,
        })),
      ];

      // 🏁 TRI CHRONOLOGIQUE ABSOLU
      return unifiedFeed
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 15);

    } catch (error) {
      this.logger.error(`❌ ÉCHEC TÉLÉMÉTRIE [Tenant: ${tenantId}] : ${error.message}`);
      return [];
    }
  }

  /**
   * 📊 INDICATEURS FLASH (KPI EXPRESS)
   * Calcul des compteurs critiques pour les blocs du dashboard.
   */
  async getFlashStats(tenantId: string) {
    try {
      const [ncOpen, ncClosed, actionsPending] = await Promise.all([
        this.prisma.nonConformite.count({ 
          where: { tenantId, NC_Statut: { not: NCStatus.CLOTURE }, NC_IsActive: true } 
        }),
        this.prisma.nonConformite.count({ 
          where: { tenantId, NC_Statut: NCStatus.CLOTURE, NC_IsActive: true } 
        }),
        this.prisma.action.count({ 
          where: { tenantId, ACT_Status: { not: ActionStatus.TERMINEE }, ACT_IsActive: true } 
        }),
      ]);

      const totalNC = ncOpen + ncClosed;
      const complianceRate = totalNC > 0 ? Math.round((ncClosed / totalNC) * 100) : 100;

      return {
        ncOpen,
        ncClosed,
        actionsPending,
        complianceRate
      };
    } catch (error) {
      this.logger.error(`❌ ÉCHEC KPI FLASH [Tenant: ${tenantId}]`);
      return { ncOpen: 0, ncClosed: 0, actionsPending: 0, complianceRate: 0 };
    }
  }
}