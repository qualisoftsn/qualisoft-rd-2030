import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConsumptionDto } from './dto/create-consumption.dto';
import { UpdateConsumptionDto } from './dto/update-consumption.dto';

// Interface pour typer les alertes et éviter l'erreur "never"
export interface Alert {
  type: 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

@Injectable()
export class ConsumptionsService { // ✅ CORRIGÉ : Nom de classe correct
  constructor(private prisma: PrismaService) {}

  // --- FONCTIONS CRUD ---

  async create(createDto: CreateConsumptionDto, tenantId: string) {
    const site = await this.prisma.site.findFirst({ where: { S_Id: createDto.CON_SiteId, tenantId } });
    if (!site) throw new BadRequestException('Site non valide');

    return this.prisma.consumption.create({
      data: {
        CON_Type: createDto.CON_Type!,
        CON_Value: createDto.CON_Value!,
        CON_Unit: createDto.CON_Unit!,
        CON_Month: createDto.CON_Month!,
        CON_Year: createDto.CON_Year!,
        CON_Cost: createDto.CON_Cost,
        CON_SiteId: createDto.CON_SiteId!,
        tenantId,
        CON_IsActive: true
      }
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.consumption.findMany({
      where: { tenantId, CON_IsActive: true },
      include: { CON_Site: true },
      orderBy: { CON_CreatedAt: 'desc' }
    });
  }

  async findOne(id: string, tenantId: string) {
    const consumption = await this.prisma.consumption.findFirst({
      where: { CON_Id: id, tenantId, CON_IsActive: true },
      include: { CON_Site: true }
    });
    if (!consumption) throw new NotFoundException('Consommation non trouvée');
    return consumption;
  }

  async update(id: string, updateDto: UpdateConsumptionDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.consumption.update({
      where: { CON_Id: id },
      data: updateDto
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.consumption.update({
      where: { CON_Id: id },
      data: { CON_IsActive: false }
    });
  }

  // --- FONCTIONS ANALYTIQUES ---

  async getDashboardData(tenantId: string) {
    const [consumptions, wastes, incidents] = await Promise.all([
      this.prisma.consumption.findMany({ where: { tenantId, CON_IsActive: true }, orderBy: { CON_CreatedAt: 'desc' }, take: 10 }),
      this.prisma.waste.findMany({ where: { tenantId, WAS_IsActive: true }, orderBy: { WAS_CreatedAt: 'desc' }, take: 10 }),
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

    const energyTarget = 10000;
    const waterTarget = 500;
    const wasteTarget = 5000;
    const recyclingTarget = 75;

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const monthlyCons = await this.prisma.consumption.findMany({
      where: { tenantId, CON_Month: currentMonth, CON_Year: currentYear, CON_IsActive: true }
    });
    
    const monthlyWastes = await this.prisma.waste.findMany({
      where: { tenantId, WAS_Month: currentMonth, WAS_Year: currentYear, WAS_IsActive: true }
    });

    const energyVal = monthlyCons.filter(c => c.CON_Type.toLowerCase().includes('ener') || c.CON_Type.toLowerCase().includes('electr')).reduce((sum, c) => sum + c.CON_Value, 0);
    const waterVal = monthlyCons.filter(c => c.CON_Type.toLowerCase().includes('eau') || c.CON_Type.toLowerCase().includes('water')).reduce((sum, c) => sum + c.CON_Value, 0);
    const totalW = monthlyWastes.reduce((sum, w) => sum + w.WAS_Weight, 0);
    const recW = monthlyWastes.filter(w => w.WAS_Treatment.toLowerCase().includes('recycl') || w.WAS_Type.toLowerCase().includes('recycl')).reduce((sum, w) => sum + w.WAS_Weight, 0);
    
    const recyclingRate = totalW > 0 ? (recW / totalW) * 100 : 0;
    const criticalIncidents = incidents.filter(i => i.SSE_AvecArret).length;
    const hazardousWaste = wastes.filter(w => w.WAS_Type.toLowerCase().includes('dangereux')).reduce((sum, w) => sum + w.WAS_Weight, 0);

    return {
      consumptions, wastes, incidents,
      stats: {
        energyConsumption: Math.round(energyVal),
        waterConsumption: Math.round(waterVal),
        totalWaste: Math.round(totalW),
        recyclingRate: Math.round(recyclingRate),
        criticalIncidents,
        hazardousWaste: Math.round(hazardousWaste)
      },
      targets: { energyTarget, waterTarget, wasteTarget, recyclingTarget },
      alerts: {
        energyOverTarget: energyVal > energyTarget * 0.9,
        waterOverTarget: waterVal > waterTarget * 0.9,
        wasteOverTarget: totalW > wasteTarget * 0.9,
        recyclingBelowTarget: recyclingRate < recyclingTarget,
        criticalIncidents: criticalIncidents > 0,
        hazardousWaste: hazardousWaste > 0
      }
    };
  }

  async getStats(tenantId: string, period: 'MONTH' | 'QUARTER' | 'YEAR') {
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
    const alerts: Alert[] = []; // ✅ CORRIGÉ : Typage explicite pour éviter l'erreur "never"

    if (dashboard.alerts.energyOverTarget) {
      alerts.push({ type: 'WARNING', title: 'Énergie Élevée', message: `Consommation: ${dashboard.stats.energyConsumption} kWh`, priority: 'HIGH' });
    }
    if (dashboard.alerts.waterOverTarget) {
      alerts.push({ type: 'WARNING', title: 'Eau Élevée', message: `Consommation: ${dashboard.stats.waterConsumption} m³`, priority: 'MEDIUM' });
    }
    if (dashboard.alerts.recyclingBelowTarget) {
      alerts.push({ type: 'WARNING', title: 'Recyclage Faible', message: `Taux: ${dashboard.stats.recyclingRate}%`, priority: 'MEDIUM' });
    }
    if (dashboard.alerts.criticalIncidents) {
      alerts.push({ type: 'CRITICAL', title: 'Incidents Critiques', message: `${dashboard.stats.criticalIncidents} incident(s) actif(s)`, priority: 'CRITICAL' });
    }
    if (dashboard.alerts.hazardousWaste) {
      alerts.push({ type: 'CRITICAL', title: 'Déchets Dangereux', message: `${dashboard.stats.hazardousWaste} kg détectés`, priority: 'HIGH' });
    }

    return alerts;
  }
}