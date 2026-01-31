import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSSEEventDto } from './dto/create-sse-event.dto';
import { UpdateSSEEventDto } from './dto/update-sse-event.dto';

@Injectable()
export class SSEEventsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateSSEEventDto, tenantId: string, creatorId: string) {
    // Validation site
    const site = await this.prisma.site.findFirst({
      where: { S_Id: createDto.SSE_SiteId, tenantId }
    });
    if (!site) throw new BadRequestException('Site non valide pour ce tenant');

    // Création de l'incident
    return this.prisma.sSEEvent.create({
      data: {
        ...createDto,
        SSE_DateEvent: new Date(createDto.SSE_DateEvent),
        tenantId,
        SSE_IsActive: true,
        SSE_CreatorId: creatorId
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

  async findOne(id: string) {
    const incident = await this.prisma.sSEEvent.findFirst({
      where: { SSE_Id: id, SSE_IsActive: true },
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

  async update(id: string, updateDto: UpdateSSEEventDto) {
    await this.findOne(id); // Vérifie existence
    return this.prisma.sSEEvent.update({
      where: { SSE_Id: id },
      data: updateDto,
      include: {
        SSE_Site: true,
        SSE_Reporter: true,
        SSE_Victim: true,
        SSE_Processus: true
      }
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.sSEEvent.update({
      where: { SSE_Id: id },
      data: { SSE_IsActive: false }
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
        SSE_DateEvent: {
          gte: startDate,
          lte: new Date()
        },
        OR: [
          { SSE_Type: 'DOMMAGE_MATERIEL' },
          { SSE_Description: { contains: 'environnement', mode: 'insensitive' } },
          { SSE_Description: { contains: 'pollution', mode: 'insensitive' } }
        ]
      }
    });

    const criticalIncidents = environmentalIncidents.filter(i => i.SSE_AvecArret).length;
    const withInjuries = environmentalIncidents.filter(i => i.SSE_NbJoursArret > 0).length;

    return {
      totalIncidents: environmentalIncidents.length,
      criticalIncidents,
      withInjuries,
      trend: environmentalIncidents.length > 0 ? `+${environmentalIncidents.length}` : '0'
    };
  }
}