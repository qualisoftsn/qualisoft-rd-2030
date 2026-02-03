import { Injectable, NotFoundException } from '@nestjs/common';
import { Action, ActionStatus, ActionOrigin, ActionType, Priority } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';

@Injectable()
export class ActionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateActionDto, T_Id: string, U_Id: string): Promise<Action> {
    // 1. Chercher le PAQ lié au processus
    let paq = await this.prisma.pAQ.findFirst({
      where: { PAQ_ProcessusId: dto.PAQ_ProcessusId, tenantId: T_Id }
    });

    // 2. Correction TS2322 : Ajout des champs obligatoires PAQ_Title et PAQ_QualityManagerId
    if (!paq) {
      paq = await this.prisma.pAQ.create({
        data: {
          PAQ_Year: new Date().getFullYear(),
          PAQ_Title: `PLAN D'ACTION GÉNÉRÉ - ${new Date().getFullYear()}`, // ✅ Requis
          PAQ_QualityManagerId: U_Id, // ✅ Requis (On affecte au créateur par défaut)
          PAQ_ProcessusId: dto.PAQ_ProcessusId,
          tenantId: T_Id,
        }
      });
    }

    // 3. Création de l'action
    return this.prisma.action.create({
      data: {
        ACT_Title: dto.ACT_Title.toUpperCase(),
        ACT_Description: dto.ACT_Description || "",
        ACT_Origin: dto.ACT_Origin || ActionOrigin.AUTRE,
        ACT_Type: dto.ACT_Type || ActionType.CORRECTIVE,
        ACT_Status: dto.ACT_Status || ActionStatus.A_FAIRE,
        ACT_Priority: dto.ACT_Priority || Priority.MEDIUM,
        ACT_Deadline: new Date(dto.ACT_Deadline),
        tenantId: T_Id,
        ACT_CreatorId: U_Id,
        ACT_ResponsableId: dto.ACT_ResponsableId,
        ACT_PAQId: paq.PAQ_Id,
      }
    });
  }

  async findAll(T_Id: string) {
    return this.prisma.action.findMany({
      where: { tenantId: T_Id, ACT_IsActive: true },
      include: {
        ACT_Responsable: { select: { U_FirstName: true, U_LastName: true } },
        ACT_PAQ: { include: { PAQ_Processus: true } }
      },
      orderBy: { ACT_CreatedAt: 'desc' }
    });
  }

  async findMyActions(U_Id: string, T_Id: string) {
    return this.prisma.action.findMany({
      where: { 
        tenantId: T_Id, 
        ACT_ResponsableId: U_Id, 
        ACT_IsActive: true,
        ACT_Status: { notIn: [ActionStatus.TERMINEE, ActionStatus.ANNULEE] }
      },
      include: { ACT_PAQ: { include: { PAQ_Processus: true } } }
    });
  }

  async findOverdue(T_Id: string) {
    return this.prisma.action.findMany({
      where: {
        tenantId: T_Id,
        ACT_Deadline: { lt: new Date() },
        ACT_Status: { notIn: [ActionStatus.TERMINEE, ActionStatus.ANNULEE] }
      }
    });
  }

  async update(id: string, dto: UpdateActionDto, T_Id: string) {
    return this.prisma.action.update({
      where: { ACT_Id: id, tenantId: T_Id },
      data: {
        ...dto,
        ACT_Deadline: dto.ACT_Deadline ? new Date(dto.ACT_Deadline) : undefined
      }
    });
  }

  async updateStatus(id: string, status: ActionStatus, T_Id: string) {
    return this.prisma.action.update({
      where: { ACT_Id: id, tenantId: T_Id },
      data: { 
        ACT_Status: status, 
        ACT_CompletedAt: status === ActionStatus.TERMINEE ? new Date() : null 
      }
    });
  }

  async updateDeadline(id: string, T_Id: string, newDeadline: Date) {
    return this.prisma.action.update({
      where: { ACT_Id: id, tenantId: T_Id },
      data: { ACT_Deadline: newDeadline }
    });
  }

  async createFromReclamation(REC_Id: string, T_Id: string, U_Id: string) {
    const rec = await this.prisma.reclamation.findUnique({ where: { REC_Id } });
    if (!rec) throw new NotFoundException("Réclamation introuvable");

    let paq = await this.prisma.pAQ.findFirst({ where: { tenantId: T_Id } });

    return this.prisma.action.create({
      data: {
        ACT_Title: `SUITE RÉCLAMATION: ${rec.REC_Reference}`,
        ACT_Origin: ActionOrigin.RECLAMATION,
        tenantId: T_Id,
        ACT_CreatorId: U_Id,
        ACT_ResponsableId: U_Id,
        ACT_PAQId: paq?.PAQ_Id || "",
        ACT_Deadline: new Date(),
        ACT_ReclamationId: REC_Id
      }
    });
  }
}