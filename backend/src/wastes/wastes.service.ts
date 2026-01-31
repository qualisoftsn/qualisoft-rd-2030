import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWasteDto } from './dto/create-waste.dto';
import { UpdateWasteDto } from './dto/update-waste.dto';

@Injectable()
export class WastesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateWasteDto, tenantId: string) {
    const site = await this.prisma.site.findFirst({
      where: { S_Id: createDto.WAS_SiteId, tenantId }
    });
    if (!site) throw new BadRequestException('Site non valide pour ce tenant');

    return this.prisma.waste.create({
      data: {
        ...createDto,
        tenantId,
        WAS_IsActive: true
      }
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.waste.findMany({
      where: { tenantId, WAS_IsActive: true },
      include: { WAS_Site: true },
      orderBy: { WAS_CreatedAt: 'desc' }
    });
  }

  async findOne(id: string, tenantId: string) {
    const waste = await this.prisma.waste.findFirst({
      where: { WAS_Id: id, tenantId, WAS_IsActive: true },
      include: { WAS_Site: true }
    });
    if (!waste) throw new NotFoundException('Déchet non trouvé');
    return waste;
  }

  async update(id: string, updateDto: UpdateWasteDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.waste.update({
      where: { WAS_Id: id },
      data: updateDto
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.waste.update({
      where: { WAS_Id: id },
      data: { WAS_IsActive: false }
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

    const stats = await this.prisma.waste.groupBy({
      by: ['WAS_Type', 'WAS_Treatment'],
      where: {
        tenantId,
        WAS_IsActive: true,
        WAS_Year: currentYear,
        WAS_Month: period === 'MONTH' 
          ? currentMonth 
          : period === 'QUARTER'
          ? { gte: startDate.getMonth() + 1, lte: startDate.getMonth() + 3 }
          : undefined
      },
      _sum: { WAS_Weight: true },
      _count: true
    });

    const totalWaste = stats.reduce((sum, s) => sum + (s._sum.WAS_Weight || 0), 0);
    const recyclableWaste = stats
      .filter(s => s.WAS_Treatment.toLowerCase().includes('recycl') || s.WAS_Type.toLowerCase().includes('recycl'))
      .reduce((sum, s) => sum + (s._sum.WAS_Weight || 0), 0);
    const hazardousWaste = stats
      .filter(s => s.WAS_Type.toLowerCase().includes('dangereux') || s.WAS_Type.toLowerCase().includes('toxique'))
      .reduce((sum, s) => sum + (s._sum.WAS_Weight || 0), 0);

    return {
      totalWaste,
      recyclableWaste,
      hazardousWaste,
      recyclingRate: totalWaste > 0 ? (recyclableWaste / totalWaste) * 100 : 0,
      totalCount: stats.reduce((sum, s) => sum + s._count, 0)
    };
  }
}