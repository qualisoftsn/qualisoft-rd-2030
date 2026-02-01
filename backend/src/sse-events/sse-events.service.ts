import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSSEEventDto } from './dto/create-sse-event.dto';
import { UpdateSSEEventDto } from './dto/update-sse-event.dto';

@Injectable()
export class SSEEventsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Créer un incident SSE (ISO 14001 / 45001)
   */
  async create(createDto: CreateSSEEventDto, tenantId: string, creatorId: string) {
    // Validation site : l'utilisateur ne peut déclarer que sur un site de son organisation
    const site = await this.prisma.site.findFirst({
      where: { S_Id: createDto.SSE_SiteId, tenantId }
    });
    if (!site) throw new BadRequestException('Site non valide pour ce tenant');

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

  /**
   * Lister tous les incidents du tenant
   */
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

  /**
   * Filtrer uniquement les incidents environnementaux (ISO 14001)
   */
  async findEnvironmental(tenantId: string) {
    return this.prisma.sSEEvent.findMany({
      where: {
        tenantId,
        SSE_IsActive: true,
        OR: [
          { SSE_Type: 'INCIDENT_ENVIRONNEMENTAL' }, // Utilisation de l'enum correct
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

  /**
   * Récupérer un incident spécifique avec isolation multi-tenant
   * ✅ FIX : Ajout de tenantId dans les arguments
   */
  async findOne(id: string, tenantId: string) {
    const incident = await this.prisma.sSEEvent.findFirst({
      where: { 
        SSE_Id: id, 
        tenantId, // Sécurité : on ne peut pas lire l'incident d'un autre tenant
        SSE_IsActive: true 
      },
      include: {
        SSE_Site: true,
        SSE_Reporter: true,
        SSE_Victim: true,
        SSE_Processus: true,
        SSE_Actions: true
      }
    });
    
    if (!incident) throw new NotFoundException('Incident non trouvé ou accès refusé');
    return incident;
  }

  /**
   * Mettre à jour un incident
   * ✅ FIX : Ajout de tenantId dans les arguments
   */
  async update(id: string, updateDto: UpdateSSEEventDto, tenantId: string) {
    await this.findOne(id, tenantId); // Vérifie existence et propriété

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

  /**
   * Suppression logique (Soft Delete)
   * ✅ FIX : Ajout de tenantId dans les arguments
   */
  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId); // Vérifie existence et propriété
    
    return this.prisma.sSEEvent.update({
      where: { SSE_Id: id },
      data: { SSE_IsActive: false }
    });
  }

  /**
   * Calcul des indicateurs SSE (Taux de fréquence/gravité)
   */
  async getStats(tenantId: string, period: 'MONTH' | 'QUARTER' | 'YEAR') {
    const now = new Date();
    let startDate: Date;

    if (period === 'MONTH') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'QUARTER') {
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const incidents = await this.prisma.sSEEvent.findMany({
      where: {
        tenantId,
        SSE_IsActive: true,
        SSE_DateEvent: { gte: startDate }
      }
    });

    return {
      totalIncidents: incidents.length,
      criticalIncidents: incidents.filter(i => i.SSE_AvecArret).length,
      withInjuries: incidents.filter(i => i.SSE_NbJoursArret > 0).length,
      trend: incidents.length > 0 ? `+${incidents.length}` : '0'
    };
  }
}