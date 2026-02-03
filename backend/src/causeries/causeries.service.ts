import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCauserieDto } from './dto/create-causerie.dto';
import { UpdateCauserieDto } from './dto/update-causerie.dto';

@Injectable()
export class CauseriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCauserieDto, tenantId: string, currentUserId: string) {
    // L'ID de l'animateur est soit celui choisi dans le DTO, soit celui qui crée
    const finalAnimateurId = dto.CS_AnimateurId || currentUserId;

    if (!finalAnimateurId) {
      throw new BadRequestException("L'identifiant de l'animateur est introuvable.");
    }

    return this.prisma.causerie.create({
      data: {
        CS_Theme: dto.CS_Theme.toUpperCase(),
        CS_Date: new Date(dto.CS_Date),
        CS_CompteRendu: dto.CS_CompteRendu,
        CS_IsActive: dto.CS_IsActive ?? true,
        tenantId,
        // Correction ici : on passe directement le champ scalaire
        CS_AnimateurId: finalAnimateurId,
        CS_Participants: {
          connect: dto.participantIds.map((id) => ({ U_Id: id })),
        },
      },
      include: { 
        CS_Animateur: { select: { U_FirstName: true, U_LastName: true } }, 
        CS_Participants: { select: { U_Id: true, U_FirstName: true, U_LastName: true } } 
      },
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
      include: { 
        CS_Animateur: true, 
        CS_Participants: true 
      },
    });
    if (!causerie) throw new NotFoundException('Causerie introuvable dans ce périmètre.');
    return causerie;
  }

  async update(id: string, dto: UpdateCauserieDto, tenantId: string) {
    await this.findOne(id, tenantId);
    
    return this.prisma.causerie.update({
      where: { CS_Id: id },
      data: {
        CS_Theme: dto.CS_Theme?.toUpperCase(),
        CS_Date: dto.CS_Date ? new Date(dto.CS_Date) : undefined,
        CS_CompteRendu: dto.CS_CompteRendu,
        CS_IsActive: dto.CS_IsActive,
        // Mise à jour optionnelle de l'animateur
        ...(dto.CS_AnimateurId && { CS_AnimateurId: dto.CS_AnimateurId }),
        // Mise à jour des participants si nécessaire
        ...(dto.participantIds && {
          CS_Participants: {
            set: dto.participantIds.map(id => ({ U_Id: id }))
          }
        })
      },
    });
  }

  async getStats(tenantId: string) {
    const total = await this.prisma.causerie.count({ 
      where: { tenantId, CS_IsActive: true } 
    });
    
    const envThemes = await this.prisma.causerie.count({
      where: {
        tenantId,
        CS_IsActive: true,
        OR: [
          { CS_Theme: { contains: 'ENVIRONNEMENT', mode: 'insensitive' } },
          { CS_Theme: { contains: 'DECHET', mode: 'insensitive' } },
          { CS_Theme: { contains: 'EAU', mode: 'insensitive' } },
          { CS_Theme: { contains: 'ENERGIE', mode: 'insensitive' } },
        ],
      },
    });

    return {
      total,
      monthCount: total > 0 ? total : 0, // Idéalement filtrer par date ici
      envRatio: total > 0 ? Math.round((envThemes / total) * 100) : 0,
    };
  }

  async remove(id: string, tenantId: string) {
    // Suppression logique pour auditabilité
    return this.prisma.causerie.update({
      where: { CS_Id: id },
      data: { CS_IsActive: false },
    });
  }
}