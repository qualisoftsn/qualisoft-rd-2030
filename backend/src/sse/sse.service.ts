import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSseEventDto } from './dto/create-sse-event.dto';
import { UpdateSseEventDto } from './dto/update-sse-event.dto';

@Injectable()
export class SseService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateSseEventDto, tenantId: string, creatorId: string) {
    const site = await this.prisma.site.findFirst({
      where: { S_Id: createDto.SSE_SiteId, tenantId }
    });
    if (!site) throw new BadRequestException('Site non valide pour ce tenant');

    return this.prisma.sSEEvent.create({
      data: {
        ...createDto,
        SSE_DateEvent: new Date(createDto.SSE_DateEvent),
        SSE_ReporterId: creatorId, // ✅ Correction nom champ
        tenantId,
        SSE_IsActive: true
      },
      include: {
        SSE_Site: true,
        SSE_Reporter: true,
        SSE_Victim: true,
        SSE_Processus: true
      }
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.sSEEvent.findMany({
      where: { tenantId, SSE_IsActive: true },
      include: {
        SSE_Site: true,
        SSE_Reporter: true,
        SSE_Victim: true,
        SSE_Processus: true
      },
      orderBy: { SSE_DateEvent: 'desc' }
    });
  }

  async findEnvironmental(tenantId: string) {
    return this.prisma.sSEEvent.findMany({
      where: {
        tenantId,
        SSE_IsActive: true,
        OR: [
          { SSE_Type: 'DOMMAGE_MATERIEL' },
          { SSE_Description: { contains: 'environnement', mode: 'insensitive' } },
          { SSE_Description: { contains: 'pollution', mode: 'insensitive' } },
          { SSE_Description: { contains: 'déversement', mode: 'insensitive' } },
          { SSE_Description: { contains: 'contamination', mode: 'insensitive' } }
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

  async findOne(id: string, tenantId: string) {
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

  async update(id: string, updateDto: UpdateSseEventDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.sSEEvent.update({
      where: { SSE_Id: id },
      data: updateDto, // ✅ Correction : data: updateDto
      include: {
        SSE_Site: true,
        SSE_Reporter: true,
        SSE_Victim: true,
        SSE_Processus: true
      }
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.sSEEvent.update({
      where: { SSE_Id: id },
      data: { SSE_IsActive: false } // ✅ Correction : data: { ... }
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

    const environmentalIncidents = await this.prisma.sSEEvent.findMany({
      where: {
        tenantId,
        SSE_IsActive: true,
        SSE_DateEvent: { gte: startDate, lte: new Date() },
        OR: [
          { SSE_Type: 'DOMMAGE_MATERIEL' },
          { SSE_Description: { contains: 'environnement', mode: 'insensitive' } },
          { SSE_Description: { contains: 'pollution', mode: 'insensitive' } }
        ]
      }
    });

    return {
      totalIncidents: environmentalIncidents.length,
      criticalIncidents: environmentalIncidents.filter(i => i.SSE_AvecArret).length,
      withInjuries: environmentalIncidents.filter(i => (i.SSE_NbJoursArret || 0) > 0).length
    };
  }
}