import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSseEventDto } from './dto/create-sse-event.dto';
import { UpdateSseEventDto } from './dto/update-sse-event.dto';

@Injectable()
export class SseService {
  private readonly logger = new Logger(SseService.name);

  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateSseEventDto, tenantId: string, creatorId: string) {
    const site = await this.prisma.site.findFirst({
      where: { S_Id: createDto.SSE_SiteId, tenantId }
    });
    if (!site) throw new BadRequestException('Localisation (Site) non valide pour ce tenant.');

    return this.prisma.sSEEvent.create({
      data: {
        ...createDto,
        SSE_DateEvent: new Date(createDto.SSE_DateEvent),
        SSE_CreatorId: creatorId, 
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
          { SSE_Type: 'INCIDENT_ENVIRONNEMENTAL' },
          { SSE_Description: { contains: 'pollution', mode: 'insensitive' } },
          { SSE_Description: { contains: 'fuite', mode: 'insensitive' } },
          { SSE_Description: { contains: 'déchet', mode: 'insensitive' } }
        ]
      },
      include: { SSE_Site: true, SSE_Processus: true },
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
        SSE_Actions: { include: { ACT_Responsable: true } }
      }
    });
    if (!incident) throw new NotFoundException('Événement SSE introuvable.');
    return incident;
  }

  async update(id: string, updateDto: UpdateSseEventDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.sSEEvent.update({
      where: { SSE_Id: id },
      data: {
        ...updateDto,
        SSE_DateEvent: updateDto.SSE_DateEvent ? new Date(updateDto.SSE_DateEvent) : undefined,
      },
      include: { SSE_Site: true, SSE_Victim: true }
    });
  }

  async remove(id: string, tenantId: string) {
    return this.prisma.sSEEvent.updateMany({
      where: { SSE_Id: id, tenantId },
      data: { SSE_IsActive: false }
    });
  }

  /**
   * 📊 STATS GLOBAL POUR ANALYTICS
   */
  async getGlobalStats(tenantId: string) {
    const stats = await this.prisma.sSEStats.findMany({
      where: { tenantId, ST_IsActive: true },
      orderBy: [{ ST_Annee: 'desc' }, { ST_Mois: 'desc' }]
    });

    // On calcule les sommes pour les KPIs
    const totalAccidents = stats.reduce((acc, curr) => acc + curr.ST_NbAccidents, 0);
    
    return {
      history: stats,
      totalAccidents
    };
  }
}