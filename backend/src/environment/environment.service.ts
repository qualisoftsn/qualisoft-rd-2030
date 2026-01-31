import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnvironmentService {
  constructor(private prisma: PrismaService) {}

  async getDashboardData(tenantId: string) {
    const [consumptions, wastes, incidents] = await Promise.all([
      this.prisma.consumption.findMany({
        where: { tenantId, CON_IsActive: true },
        orderBy: { CON_CreatedAt: 'desc' },
        take: 10
      }),
      this.prisma.waste.findMany({
        where: { tenantId, WAS_IsActive: true },
        orderBy: { WAS_CreatedAt: 'desc' },
        take: 10
      }),
      this.prisma.sSEEvent.findMany({
        where: { 
          tenantId, 
          SSE_IsActive: true,
          OR: [
            { SSE_Type: 'DOMMAGE_MATERIEL' },
            { SSE_Description: { contains: 'environnement', mode: 'insensitive' } },
            { SSE_Description: { contains: 'pollution', mode: 'insensitive' } },
            { SSE_Description: { contains: 'déversement', mode: 'insensitive' } }
          ]
        },
        orderBy: { SSE_CreatedAt: 'desc' },
        take: 10
      })
    ]);

    // Calcul des alertes
    const criticalIncidents = incidents.filter(i => i.SSE_AvecArret).length;
    const hazardousWaste = wastes.filter(w => 
      w.WAS_Type.toLowerCase().includes('dangereux') ||
      w.WAS_Type.toLowerCase().includes('toxique')
    ).reduce((sum, w) => sum + w.WAS_Weight, 0);

    // Objectifs ISO 14001 (à personnaliser par tenant)
    const energyTarget = 10000;
    const waterTarget = 500;
    const wasteTarget = 5000;
    const recyclingTarget = 75;

    // Stats mensuelles
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const monthlyConsumptions = await this.prisma.consumption.findMany({
      where: { tenantId, CON_Month: currentMonth, CON_Year: currentYear, CON_IsActive: true }
    });
    
    const monthlyWastes = await this.prisma.waste.findMany({
      where: { tenantId, WAS_Month: currentMonth, WAS_Year: currentYear, WAS_IsActive: true }
    });

    const energyConsumption = monthlyConsumptions
      .filter(c => c.CON_Type.toLowerCase().includes('electric') || c.CON_Type.toLowerCase().includes('énergie'))
      .reduce((sum, c) => sum + c.CON_Value, 0);
    
    const waterConsumption = monthlyConsumptions
      .filter(c => c.CON_Type.toLowerCase().includes('eau') || c.CON_Type.toLowerCase().includes('water'))
      .reduce((sum, c) => sum + c.CON_Value, 0);
    
    const totalWaste = monthlyWastes.reduce((sum, w) => sum + w.WAS_Weight, 0);
    const recyclableWaste = monthlyWastes
      .filter(w => w.WAS_Treatment.toLowerCase().includes('recycl') || w.WAS_Type.toLowerCase().includes('recycl'))
      .reduce((sum, w) => sum + w.WAS_Weight, 0);
    
    const recyclingRate = totalWaste > 0 ? (recyclableWaste / totalWaste) * 100 : 0;

    return {
      consumptions,
      wastes,
      incidents,
      stats: {
        energyConsumption: Math.round(energyConsumption),
        waterConsumption: Math.round(waterConsumption),
        totalWaste: Math.round(totalWaste),
        recyclingRate: Math.round(recyclingRate),
        criticalIncidents,
        hazardousWaste: Math.round(hazardousWaste)
      },
      targets: {
        energyTarget,
        waterTarget,
        wasteTarget,
        recyclingTarget
      },
      alerts: {
        energyOverTarget: energyConsumption > energyTarget * 0.9,
        waterOverTarget: waterConsumption > waterTarget * 0.9,
        wasteOverTarget: totalWaste > wasteTarget * 0.9,
        recyclingBelowTarget: recyclingRate < recyclingTarget,
        criticalIncidents: criticalIncidents > 0,
        hazardousWaste: hazardousWaste > 0
      }
    };
  }

  async getStats(tenantId: string) {
    // Stats globales pour le tenant
    const [totalConsumptions, totalWastes, totalIncidents] = await Promise.all([
      this.prisma.consumption.count({ where: { tenantId, CON_IsActive: true } }),
      this.prisma.waste.count({ where: { tenantId, WAS_IsActive: true } }),
      this.prisma.sSEEvent.count({
        where: { 
          tenantId, 
          SSE_IsActive: true,
          OR: [
            { SSE_Type: 'DOMMAGE_MATERIEL' },
            { SSE_Description: { contains: 'environnement', mode: 'insensitive' } }
          ]
        }
      })
    ]);

    return { totalConsumptions, totalWastes, totalIncidents };
  }

  async getAlerts(tenantId: string) {
    const dashboard = await this.getDashboardData(tenantId);
    const alerts: Array<{ type: string; title: string; message: string; priority: string }> = [];

    if (dashboard.alerts.energyOverTarget) {
      alerts.push({
        type: 'WARNING',
        title: 'Consommation Énergétique Élevée',
        message: `La consommation dépasse 90% de l'objectif mensuel (${dashboard.stats.energyConsumption} kWh / ${dashboard.targets.energyTarget} kWh)`,
        priority: 'HIGH'
      });
    }

    if (dashboard.alerts.waterOverTarget) {
      alerts.push({
        type: 'WARNING',
        title: 'Consommation Eau Élevée',
        message: `La consommation dépasse 90% de l'objectif mensuel (${dashboard.stats.waterConsumption} m³ / ${dashboard.targets.waterTarget} m³)`,
        priority: 'MEDIUM'
      });
    }

    if (dashboard.alerts.recyclingBelowTarget) {
      alerts.push({
        type: 'WARNING',
        title: 'Taux de Recyclage Insuffisant',
        message: `Le taux de recyclage est en dessous de l'objectif de ${dashboard.targets.recyclingTarget}% (${dashboard.stats.recyclingRate}%)`,
        priority: 'MEDIUM'
      });
    }

    if (dashboard.alerts.criticalIncidents) {
      alerts.push({
        type: 'CRITICAL',
        title: 'Incidents Environnementaux Critiques',
        message: `${dashboard.stats.criticalIncidents} incident${dashboard.stats.criticalIncidents > 1 ? 's' : ''} nécessite${dashboard.stats.criticalIncidents > 1 ? 'nt' : ''} une action immédiate`,
        priority: 'CRITICAL'
      });
    }

    if (dashboard.alerts.hazardousWaste) {
      alerts.push({
        type: 'CRITICAL',
        title: 'Déchets Dangereux Détectés',
        message: `${dashboard.stats.hazardousWaste} kg de déchets dangereux nécessitent un traitement spécial`,
        priority: 'HIGH'
      });
    }

    return alerts;
  }
}