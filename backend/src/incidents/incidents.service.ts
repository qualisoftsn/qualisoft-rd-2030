import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncidentDto } from './dto/create-incident.dto';

@Injectable()
export class IncidentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateIncidentDto, tenantId: string) {
    // ✅ Utilisation du mode "Unchecked" pour une stabilité maximale
    return this.prisma.sSEEvent.create({
      data: {
        SSE_Type: dto.SSE_Type,
        SSE_DateEvent: new Date(dto.SSE_DateEvent),
        SSE_Lieu: dto.SSE_Lieu.toUpperCase(),
        SSE_Description: dto.SSE_Description,
        SSE_AvecArret: dto.SSE_AvecArret ?? false,
        SSE_NbJoursArret: Number(dto.SSE_NbJoursArret) || 0,
        tenantId: tenantId,
        
        // On utilise directement les IDs scalaires du DTO
        SSE_SiteId: dto.SSE_SiteId,
        SSE_ReporterId: dto.SSE_ReporterId,
        SSE_VictimId: dto.SSE_VictimId || null,
        SSE_ProcessusId: dto.SSE_ProcessusId || null,
        
        // Par défaut
        SSE_IsActive: true,
      },
      include: {
        SSE_Site: { select: { S_Name: true } },
        SSE_Reporter: { select: { U_FirstName: true, U_LastName: true } },
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.sSEEvent.findMany({
      where: { 
        tenantId,
        SSE_IsActive: true // On ne montre que les incidents actifs
      },
      include: {
        SSE_Site: { select: { S_Name: true } },
        SSE_Reporter: { select: { U_FirstName: true, U_LastName: true } },
        SSE_Victim: { select: { U_FirstName: true, U_LastName: true } },
      },
      orderBy: { SSE_DateEvent: 'desc' },
    });
  }

  async remove(id: string, tenantId: string) {
    // Suppression logique pour auditabilité ISO 14001
    const incident = await this.prisma.sSEEvent.findFirst({
      where: { SSE_Id: id, tenantId }
    });

    if (!incident) throw new NotFoundException("INCIDENT INTROUVABLE DANS CE TENANT");

    return this.prisma.sSEEvent.update({
      where: { SSE_Id: id },
      data: { SSE_IsActive: false }
    });
  }
}