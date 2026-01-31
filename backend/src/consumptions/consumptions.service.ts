import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConsumptionDto } from './dto/create-consumption.dto';
import { UpdateConsumptionDto } from './dto/update-consumption.dto';

@Injectable()
export class ConsumptionsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateConsumptionDto, tenantId: string) {
    // Vérifier site appartient au tenant
    const site = await this.prisma.site.findFirst({
      where: { S_Id: createDto.CON_SiteId, tenantId }
    });
    if (!site) throw new BadRequestException('Site non valide pour ce tenant');

    // Validate required fields are present
    const {
      CON_Type,
      CON_Value,
      CON_Unit,
      CON_Month,
      CON_Year,
      CON_Cost,
      CON_SiteId
    } = createDto;

    if (
      CON_Type === undefined ||
      CON_Value === undefined ||
      CON_Unit === undefined ||
      CON_Month === undefined ||
      CON_Year === undefined ||
      CON_SiteId === undefined
    ) {
      throw new BadRequestException('Tous les champs requis doivent être renseignés');
    }

    return this.prisma.consumption.create({
      data: {
        CON_Type,
        CON_Value,
        CON_Unit,
        CON_Month,
        CON_Year,
        CON_Cost,
        CON_SiteId,
        tenantId,
        CON_IsActive: true
      }
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.consumption.findMany({
      where: { tenantId, CON_IsActive: true },
      include: { CON_Site: true, CON_Creator: true },
      orderBy: { CON_CreatedAt: 'desc' }
    });
  }

  async findOne(id: string, tenantId: string) {
    const consumption = await this.prisma.consumption.findFirst({
      where: { CON_Id: id, tenantId, CON_IsActive: true },
      include: { CON_Site: true, CON_Creator: true }
    });
    if (!consumption) throw new NotFoundException('Consommation non trouvée');
    return consumption;
  }

  async update(id: string, updateDto: UpdateConsumptionDto, tenantId: string) {
    await this.findOne(id, tenantId); // Vérifie existence et ownership
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

  async getStats(tenantId: string, period: 'MONTH' | 'QUARTER' | 'YEAR') {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    let startDate: Date;
    if (period === 'MONTH') {
      startDate = new Date(currentYear, currentMonth - 1, 1);
    } else if (period === 'QUARTER') {
      const quarterStartMonth = Math.floor((currentMonth - 1) / 3) * 3;
      startDate = new Date(currentYear, quarterStartMonth, 1);
    } else {
      startDate = new Date(currentYear, 0, 1);
    }

    const stats = await this.prisma.consumption.groupBy({
      by: ['CON_Type'],
      where: {
        tenantId,
        CON_IsActive: true,
        CON_Year: currentYear,
        CON_Month: period === 'MONTH' 
          ? currentMonth 
          : period === 'QUARTER'
          ? { gte: startDate.getMonth() + 1, lte: startDate.getMonth() + 3 }
          : undefined
      },
      _sum: { CON_Value: true, CON_Cost: true },
      _count: true
    });

    return {
      totalEnergy: stats
        .filter(s => s.CON_Type.toLowerCase().includes('electric') || s.CON_Type.toLowerCase().includes('énergie'))
        .reduce((sum, s) => sum + (s._sum.CON_Value || 0), 0),
      totalWater: stats
        .filter(s => s.CON_Type.toLowerCase().includes('eau') || s.CON_Type.toLowerCase().includes('water'))
        .reduce((sum, s) => sum + (s._sum.CON_Value || 0), 0),
      totalCost: stats.reduce((sum, s) => sum + (s._sum.CON_Cost || 0), 0),
      totalCount: stats.reduce((sum, s) => sum + s._count, 0)
    };
  }
}