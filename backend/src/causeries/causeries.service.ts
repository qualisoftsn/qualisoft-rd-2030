import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCauserieDto } from './dto/create-causerie.dto';
import { UpdateCauserieDto } from './dto/update-causerie.dto';

@Injectable()
export class CauseriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCauserieDto, tenantId: string, animateurId: string) {
    return this.prisma.causerie.create({
      data: {
        CS_Theme: dto.CS_Theme.toUpperCase(),
        CS_Date: new Date(dto.CS_Date),
        CS_CompteRendu: dto.CS_CompteRendu,
        CS_AnimateurId: animateurId,
        tenantId,
        CS_Participants: {
          connect: dto.participantIds.map((id) => ({ U_Id: id })),
        },
      },
      include: { CS_Animateur: true, CS_Participants: true },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.causerie.findMany({
      where: { tenantId, CS_IsActive: true },
      include: {
        CS_Animateur: { select: { U_FirstName: true, U_LastName: true } },
        _count: { select: { CS_Participants: true } },
      },
      orderBy: { CS_Date: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const causerie = await this.prisma.causerie.findFirst({
      where: { CS_Id: id, tenantId },
      include: { CS_Animateur: true, CS_Participants: true },
    });
    if (!causerie) throw new NotFoundException('Causerie introuvable');
    return causerie;
  }

  async update(id: string, dto: UpdateCauserieDto, tenantId: string) {
    await this.findOne(id, tenantId); // Vérification existence et tenant
    return this.prisma.causerie.update({
      where: { CS_Id: id },
      data: {
        CS_Theme: dto.CS_Theme?.toUpperCase(),
        CS_Date: dto.CS_Date ? new Date(dto.CS_Date) : undefined,
        CS_CompteRendu: dto.CS_CompteRendu,
      },
    });
  }

  async getStats(tenantId: string) {
    const total = await this.prisma.causerie.count({ where: { tenantId, CS_IsActive: true } });
    const envThemes = await this.prisma.causerie.count({
      where: {
        tenantId,
        CS_IsActive: true,
        OR: [
          { CS_Theme: { contains: 'ENVIRONNEMENT', mode: 'insensitive' } },
          { CS_Theme: { contains: 'DECHET', mode: 'insensitive' } },
        ],
      },
    });
    return {
      total,
      envRatio: total > 0 ? Math.round((envThemes / total) * 100) : 0,
    };
  }

  async remove(id: string, tenantId: string) {
    return this.prisma.causerie.update({
      where: { CS_Id: id },
      data: { CS_IsActive: false },
    });
  }
}