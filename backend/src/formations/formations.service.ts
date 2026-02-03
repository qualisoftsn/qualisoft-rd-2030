import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFormationDto } from './dto/create-formation.dto';
import { UpdateFormationDto } from './dto/update-formation.dto';

@Injectable()
export class FormationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.formation.findMany({
      where: { tenantId, FOR_IsActive: true },
      include: {
        FOR_User: {
          select: { U_FirstName: true, U_LastName: true, U_Role: true }
        }
      },
      orderBy: { FOR_Date: 'desc' }
    });
  }

  async create(tenantId: string, creatorId: string, dto: CreateFormationDto) {
    const sessionDate = new Date(dto.FOR_Date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (sessionDate < today) {
      throw new BadRequestException("LA DATE DE FORMATION NE PEUT PAS ÊTRE DANS LE PASSÉ");
    }

    // On s'assure que l'objet data correspond exactement au schéma Prisma
    return this.prisma.formation.create({
      data: {
        FOR_Title: dto.FOR_Title.toUpperCase(),
        FOR_Date: sessionDate,
        FOR_Expiry: dto.FOR_Expiry ? new Date(dto.FOR_Expiry) : null,
        FOR_Provider: dto.FOR_Provider || "INTERNE",
        FOR_Status: dto.FOR_Status || 'PLANIFIE',
        FOR_UserId: dto.FOR_UserId,
        tenantId: tenantId,
        FOR_IsActive: true
      }
    });
  }

  async update(tenantId: string, id: string, dto: UpdateFormationDto) {
    const exists = await this.prisma.formation.findFirst({
      where: { FOR_Id: id, tenantId }
    });

    if (!exists) throw new NotFoundException("Instance introuvable");

    const updateData: any = { ...dto };
    if (dto.FOR_Date) updateData.FOR_Date = new Date(dto.FOR_Date);
    if (dto.FOR_Expiry) updateData.FOR_Expiry = new Date(dto.FOR_Expiry);

    return this.prisma.formation.update({
      where: { FOR_Id: id },
      data: updateData
    });
  }

  async remove(tenantId: string, id: string) {
    return this.prisma.formation.updateMany({
      where: { FOR_Id: id, tenantId },
      data: { FOR_IsActive: false }
    });
  }

  async getAlerts(tenantId: string) {
    const threshold = new Date();
    threshold.setMonth(threshold.getMonth() + 1);

    return this.prisma.formation.findMany({
      where: {
        tenantId,
        FOR_Expiry: { lte: threshold, not: null },
        FOR_IsActive: true,
        FOR_Status: 'TERMINE'
      },
      include: { FOR_User: true }
    });
  }
}