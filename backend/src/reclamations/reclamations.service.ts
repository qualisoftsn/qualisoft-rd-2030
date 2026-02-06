import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReclamationDto } from './dto/create-reclamation.dto';
import { UpdateReclamationDto } from './dto/update-reclamation.dto';

@Injectable()
export class ReclamationsService {
  private readonly logger = new Logger(ReclamationsService.name);
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, REC_ProcessusId?: string) {
    const data = await this.prisma.reclamation.findMany({
      where: { tenantId, ...(REC_ProcessusId && { REC_ProcessusId }) },
      include: {
        REC_Tier: { select: { TR_Name: true } },
        REC_Processus: { select: { PR_Libelle: true, PR_Code: true } },
        REC_Owner: { select: { U_FirstName: true, U_LastName: true } },
      },
      orderBy: { REC_CreatedAt: 'desc' }
    });
    return { data };
  }

  async create(dto: CreateReclamationDto, tenantId: string, userId: string) {
    const year = new Date().getFullYear();
    const count = await this.prisma.reclamation.count({ where: { tenantId } });
    
    return this.prisma.reclamation.create({
      data: {
        ...dto,
        REC_Reference: `REC-${year}-${(count + 1).toString().padStart(4, '0')}`,
        REC_OwnerId: userId,
        tenantId,
        REC_Status: 'NOUVELLE',
        REC_DateReceipt: new Date(),
      },
      include: { REC_Tier: true, REC_Processus: true }
    });
  }

  async update(id: string, tenantId: string, dto: UpdateReclamationDto) {
    const existing = await this.prisma.reclamation.findFirst({ where: { REC_Id: id, tenantId } });
    if (!existing) throw new NotFoundException("Réclamation introuvable.");

    // Transition automatique vers TRAITEE si une solution est apportée
    const status = (dto.REC_SolutionProposed && existing.REC_Status === 'ACTION_EN_COURS') 
                   ? 'TRAITEE' : dto.REC_Status;

    return this.prisma.reclamation.update({
      where: { REC_Id: id },
      data: { ...dto, REC_Status: status },
      include: { REC_Tier: true, REC_Processus: true }
    });
  }

  async linkToPAQ(recId: string, userId: string, tenantId: string) {
    const rec = await this.prisma.reclamation.findFirst({ 
        where: { REC_Id: recId, tenantId },
        include: { REC_Processus: true }
    });
    
    if (!rec?.REC_ProcessusId) throw new BadRequestException("Processus requis pour liaison PAQ.");

    const paq = await this.prisma.pAQ.findFirst({
      where: { PAQ_ProcessusId: rec.REC_ProcessusId, tenantId, PAQ_Year: new Date().getFullYear() }
    });

    if (!paq) throw new BadRequestException(`Aucun PAQ ${new Date().getFullYear()} trouvé pour ce processus.`);

    return this.prisma.$transaction(async (tx) => {
      const action = await tx.action.create({
        data: {
          ACT_Title: `[REC] ${rec.REC_Reference} : ${rec.REC_Object}`,
          ACT_Description: rec.REC_Description,
          ACT_Origin: 'RECLAMATION',
          ACT_Status: 'A_FAIRE',
          ACT_PAQId: paq.PAQ_Id,
          ACT_ReclamationId: rec.REC_Id,
          ACT_ResponsableId: userId,
          ACT_CreatorId: userId,
          tenantId,
        }
      });

      await tx.reclamation.update({
        where: { REC_Id: recId },
        data: { REC_Status: 'ACTION_EN_COURS', REC_DateTransmitted: new Date() }
      });

      return action;
    });
  }

  async remove(id: string, tenantId: string) {
    await this.prisma.reclamation.deleteMany({ where: { REC_Id: id, tenantId } });
    return { success: true };
  }
}