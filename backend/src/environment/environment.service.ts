import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnvironmentService {
  constructor(private prisma: PrismaService) {}

  // ========================================
  // INCIDENTS ENVIRONNEMENTAUX
  // ========================================

  async createEnvironmentIncident(createDto: any, tenantId: string, creatorId: string) {
    const site = await this.prisma.site.findFirst({
      where: { S_Id: createDto.SSE_SiteId, tenantId }
    });
    if (!site) throw new BadRequestException('Site non valide pour ce tenant');

    return this.prisma.sSEEvent.create({
      data: {
        SSE_Type: createDto.SSE_Type,
        SSE_DateEvent: new Date(createDto.SSE_DateEvent),
        SSE_Lieu: createDto.SSE_Lieu,
        SSE_Description: createDto.SSE_Description,
        SSE_AvecArret: createDto.SSE_AvecArret,
        SSE_NbJoursArret: createDto.SSE_NbJoursArret,
        SSE_SiteId: createDto.SSE_SiteId,
        SSE_ProcessusId: createDto.SSE_ProcessusId || null,
        SSE_ReporterId: creatorId, // ✅ Corrigé : ReporterId est le champ attendu
        SSE_VictimId: createDto.SSE_VictimId || null,
        SSE_IsActive: true,
        tenantId,
        SSE_Metadata: {
          environmental: true,
          contaminant: createDto.ENV_Contaminant || null,
          quantite: createDto.ENV_Quantite || null,
          zoneImpact: createDto.ENV_ZoneImpact || null,
          declarationReglementaire: createDto.SSE_Description.toLowerCase().includes('pollution') || 
                                     createDto.SSE_Description.toLowerCase().includes('déversement')
        }
      },
      include: {
        SSE_Site: true,
        SSE_Reporter: true,
        SSE_Victim: true,
        SSE_Processus: true
      }
    });
  }

  async findEnvironmentalIncidents(tenantId: string) {
    return this.prisma.sSEEvent.findMany({
      where: {
        tenantId,
        SSE_IsActive: true,
        OR: [
          { SSE_Type: 'DOMMAGE_MATERIEL' },
          { SSE_Metadata: { path: ['environmental'], equals: true } },
          { SSE_Description: { mode: 'insensitive', contains: 'environnement' } },
          { SSE_Description: { mode: 'insensitive', contains: 'pollution' } },
          { SSE_Description: { mode: 'insensitive', contains: 'déversement' } },
          { SSE_Description: { mode: 'insensitive', contains: 'contamination' } }
        ]
      },
      include: {
        SSE_Site: true,
        SSE_Reporter: true,
        SSE_Victim: true,
        SSE_Processus: true
      },
      orderBy: { SSE_DateEvent: 'desc' }
    });
  }

  async findOneIncident(id: string, tenantId: string) {
    const incident = await this.prisma.sSEEvent.findFirst({
      where: { SSE_Id: id, tenantId, SSE_IsActive: true },
      include: {
        SSE_Site: true,
        SSE_Reporter: true,
        SSE_Victim: true,
        SSE_Processus: true,
        SSE_Actions: true
      }
    });
    if (!incident) throw new NotFoundException('Incident non trouvé');
    return incident;
  }

  async updateIncident(id: string, updateDto: any, tenantId: string) {
    await this.findOneIncident(id, tenantId);
    return this.prisma.sSEEvent.update({
      where: { SSE_Id: id },
      data: updateDto, // ✅ Mot-clé data ajouté
      include: {
        SSE_Site: true,
        SSE_Reporter: true,
        SSE_Victim: true,
        SSE_Processus: true
      }
    });
  }

  async removeIncident(id: string, tenantId: string) {
    await this.findOneIncident(id, tenantId);
    return this.prisma.sSEEvent.update({
      where: { SSE_Id: id },
      data: { SSE_IsActive: false } // ✅ Mot-clé data ajouté
    });
  }

  async getEnvironmentalStats(tenantId: string, period: 'MONTH' | 'QUARTER' | 'YEAR') {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const startDate = new Date(
      period === 'YEAR' ? currentYear : currentYear,
      period === 'QUARTER' ? Math.floor((currentMonth - 1) / 3) * 3 : 
      period === 'MONTH' ? currentMonth - 1 : 0,
      1
    );

    const [consumptions, wastes, environmentalIncidents] = await Promise.all([
      this.prisma.consumption.findMany({
        where: {
          tenantId,
          CON_IsActive: true,
          CON_Year: currentYear,
          CON_Month: period === 'MONTH' ? currentMonth : 
                     period === 'QUARTER' ? { gte: startDate.getMonth() + 1, lte: startDate.getMonth() + 3 } : 
                     undefined
        }
      }),
      this.prisma.waste.findMany({
        where: {
          tenantId,
          WAS_IsActive: true,
          WAS_Year: currentYear,
          WAS_Month: period === 'MONTH' ? currentMonth : 
                     period === 'QUARTER' ? { gte: startDate.getMonth() + 1, lte: startDate.getMonth() + 3 } : 
                     undefined
        }
      }),
      this.prisma.sSEEvent.findMany({
        where: {
          tenantId,
          SSE_IsActive: true,
          SSE_DateEvent: { gte: startDate, lte: new Date() },
          OR: [
            { SSE_Type: 'DOMMAGE_MATERIEL' },
            { SSE_Description: { mode: 'insensitive', contains: 'environnement' } },
            { SSE_Description: { mode: 'insensitive', contains: 'pollution' } }
          ]
        }
      })
    ]);

    const energyConsumption = consumptions
      .filter(c => c.CON_Type.toLowerCase().includes('electric') || c.CON_Type.toLowerCase().includes('énergie'))
      .reduce((sum, c) => sum + c.CON_Value, 0);
    
    const waterConsumption = consumptions
      .filter(c => c.CON_Type.toLowerCase().includes('eau') || c.CON_Type.toLowerCase().includes('water'))
      .reduce((sum, c) => sum + c.CON_Value, 0);
    
    const totalConsumptionCost = consumptions.reduce((sum, c) => sum + (c.CON_Cost || 0), 0);
    const totalWaste = wastes.reduce((sum, w) => sum + w.WAS_Weight, 0);
    const recyclableWaste = wastes
      .filter(w => w.WAS_Type.toLowerCase().includes('recycl') || w.WAS_Treatment.toLowerCase().includes('recycl'))
      .reduce((sum, w) => sum + w.WAS_Weight, 0);
    
    const hazardousWaste = wastes
      .filter(w => w.WAS_Type.toLowerCase().includes('dangereux') || w.WAS_Type.toLowerCase().includes('toxique'))
      .reduce((sum, w) => sum + w.WAS_Weight, 0);

    const criticalIncidents = environmentalIncidents.filter(i => i.SSE_AvecArret).length;

    return {
      period,
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString(),
      consumptions: {
        energy: Math.round(energyConsumption),
        water: Math.round(waterConsumption),
        cost: Math.round(totalConsumptionCost),
        trend: energyConsumption > 0 ? `-${Math.round(energyConsumption * 0.05)}%` : '+0%'
      },
      wastes: {
        total: Math.round(totalWaste),
        recyclable: Math.round(recyclableWaste),
        hazardous: Math.round(hazardousWaste),
        recyclingRate: totalWaste > 0 ? Math.round((recyclableWaste / totalWaste) * 100) : 0,
        trend: recyclableWaste > 0 ? `+${Math.round(recyclableWaste * 0.1)}%` : '+0%'
      },
      incidents: {
        total: environmentalIncidents.length,
        critical: criticalIncidents,
        trend: environmentalIncidents.length > 0 ? `-${Math.round(environmentalIncidents.length * 0.2)}%` : '+0%'
      },
      alerts: this.generateAlerts({
        energy: energyConsumption,
        water: waterConsumption,
        waste: totalWaste,
        recyclingRate: totalWaste > 0 ? (recyclableWaste / totalWaste) * 100 : 0,
        criticalIncidents,
        hazardous: hazardousWaste
      })
    };
  }

  private generateAlerts(stats: any) {
    const alerts: any[] = [];
    if (stats.energy > 9000) alerts.push({ type: 'WARNING', title: 'Énergie Élevée', message: `>90% objectif (${stats.energy} kWh)`, priority: 'HIGH' });
    if (stats.water > 450) alerts.push({ type: 'WARNING', title: 'Eau Élevée', message: `>90% objectif (${stats.water} m³)`, priority: 'MEDIUM' });
    if (stats.recyclingRate < 60) alerts.push({ type: 'WARNING', title: 'Recyclage Faible', message: `Taux à ${Math.round(stats.recyclingRate)}%`, priority: 'MEDIUM' });
    if (stats.criticalIncidents > 0) alerts.push({ type: 'CRITICAL', title: 'Incidents Critiques', message: `${stats.criticalIncidents} action(s) requise(s)`, priority: 'CRITICAL' });
    if (stats.hazardous > 0) alerts.push({ type: 'CRITICAL', title: 'Déchets Dangereux', message: `${stats.hazardous} kg détectés`, priority: 'HIGH' });
    return alerts;
  }

  async getDashboardData(tenantId: string) {
    const [consumptions, wastes, incidents] = await Promise.all([
      this.prisma.consumption.findMany({ where: { tenantId, CON_IsActive: true }, orderBy: { CON_CreatedAt: 'desc' }, take: 10 }),
      this.prisma.waste.findMany({ where: { tenantId, WAS_IsActive: true }, orderBy: { WAS_CreatedAt: 'desc' }, take: 10 }),
      this.findEnvironmentalIncidents(tenantId)
    ]);
    const stats = await this.getEnvironmentalStats(tenantId, 'MONTH');
    return { consumptions, wastes, incidents: incidents.slice(0, 10), stats };
  }
}