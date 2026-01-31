import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReclamationDto } from './dto/create-reclamation.dto';
import { UpdateReclamationDto } from './dto/update-reclamation.dto';

@Injectable()
export class ReclamationsService {
  private readonly logger = new Logger(ReclamationsService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, REC_ProcessusId?: string) {
    const recs = await this.prisma.reclamation.findMany({
      where: { 
        tenantId, 
        ...(REC_ProcessusId && { REC_ProcessusId }) 
      },
      include: {
        REC_Tier: { select: { TR_Name: true } },
        REC_Processus: { select: { PR_Libelle: true, PR_Code: true } },
        REC_Owner: { select: { U_FirstName: true, U_LastName: true } },
      },
      orderBy: { REC_CreatedAt: 'desc' }
    });

    return recs.map(r => ({
      ...r,
      processusLibelle: r.REC_Processus?.PR_Libelle || "NON ASSIGNÉ",
      processusCode: r.REC_Processus?.PR_Code || "SMI",
      tierName: r.REC_Tier?.TR_Name || "Client Inconnu",
      ownerName: r.REC_Owner ? `${r.REC_Owner.U_FirstName} ${r.REC_Owner.U_LastName}` : "Non assigné"
    }));
  }

  async create(dto: CreateReclamationDto, tenantId: string, userId: string) {
    const year = new Date().getFullYear();
    const count = await this.prisma.reclamation.count({ where: { tenantId } });
    const reference = `REC-${year}-${(count + 1).toString().padStart(4, '0')}`;

    return this.prisma.reclamation.create({
      data: {
        REC_Reference: reference,
        REC_Object: dto.REC_Object,
        REC_Description: dto.REC_Description,
        REC_Source: dto.REC_Source || 'DIRECT',
        REC_Gravity: dto.REC_Gravity || 'MEDIUM',
        REC_TierId: dto.REC_TierId,
        REC_ProcessusId: dto.REC_ProcessusId || null,
        REC_OwnerId: userId,
        tenantId: tenantId,
        REC_Status: 'NOUVELLE',
        REC_DateReceipt: new Date(),
        REC_Deadline: dto.REC_Deadline ? new Date(dto.REC_Deadline) : null,
      }
    });
  }

  async update(id: string, tenantId: string, dto: UpdateReclamationDto) {
    const existing = await this.prisma.reclamation.findFirst({ where: { REC_Id: id, tenantId } });
    if (!existing) throw new NotFoundException("Réclamation introuvable.");

    const data: any = { ...dto };
    if (data.REC_Deadline) data.REC_Deadline = new Date(data.REC_Deadline);
    
    // Logique métier : Passage en TRAITEE si une solution est saisie
    if (data.REC_SolutionProposed && existing.REC_Status === 'ACTION_EN_COURS') {
      data.REC_Status = 'TRAITEE';
    }

    return this.prisma.reclamation.update({
      where: { REC_Id: id },
      data: {
        ...data,
        REC_UpdatedAt: new Date()
      },
      include: { REC_Tier: true, REC_Processus: true }
    });
  }

  async linkToPAQ(recId: string, userId: string, tenantId: string) {
    const rec = await this.prisma.reclamation.findUnique({ where: { REC_Id: recId } });
    if (!rec || rec.tenantId !== tenantId) throw new NotFoundException("Réclamation introuvable.");
    if (!rec.REC_ProcessusId) throw new BadRequestException("Veuillez assigner un processus.");

    const paq = await this.prisma.pAQ.findFirst({
      where: { PAQ_ProcessusId: rec.REC_ProcessusId, tenantId, PAQ_Year: new Date().getFullYear() },
      orderBy: { PAQ_Year: 'desc' }
    });

    if (!paq) throw new BadRequestException("Aucun PAQ ouvert pour ce processus.");

    return this.prisma.$transaction(async (tx) => {
      const action = await tx.action.create({
        data: {
          ACT_Title: `[RECLAMATION] ${rec.REC_Reference} : ${rec.REC_Object}`,
          ACT_Description: rec.REC_Description,
          ACT_Origin: 'RECLAMATION',
          ACT_Status: 'A_FAIRE',
          ACT_PAQId: paq.PAQ_Id,
          ACT_ReclamationId: rec.REC_Id,
          ACT_ResponsableId: userId,
          ACT_CreatorId: userId,
          tenantId: tenantId,
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
    const existing = await this.prisma.reclamation.findFirst({ where: { REC_Id: id, tenantId } });
    if (!existing) throw new NotFoundException("Réclamation introuvable.");
    return this.prisma.reclamation.delete({ where: { REC_Id: id } });
  }
}