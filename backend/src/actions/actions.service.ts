import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Action, ActionStatus } from '@prisma/client';

@Injectable()
export class ActionsService {
  constructor(private prisma: PrismaService) {}

  /** 🔍 Liste toutes les actions du Tenant */
  async findAll(T_Id: string): Promise<Action[]> {
    return this.prisma.action.findMany({
      where: { tenantId: T_Id },
      include: {
        ACT_Responsable: { select: { U_FirstName: true, U_LastName: true } },
        ACT_Reclamation: { select: { REC_Reference: true } },
      },
      orderBy: { ACT_CreatedAt: 'desc' }
    });
  }

  /** ➕ Méthode 'create' manquante signalée par l'erreur */
  async create(data: any, T_Id: string, U_Id: string): Promise<Action> {
    return this.prisma.action.create({
      data: {
        ACT_Title: data.ACT_Title,
        ACT_Description: data.ACT_Description,
        ACT_Status: 'A_FAIRE',
        ACT_Priority: data.ACT_Priority || 'MEDIUM',
        ACT_Origin: data.ACT_Origin || 'AUTRE',
        ACT_Deadline: data.ACT_Deadline ? new Date(data.ACT_Deadline) : null,
        tenantId: T_Id,
        ACT_CreatorId: U_Id,
        ACT_ResponsableId: data.ACT_ResponsableId || U_Id,
        ACT_PAQId: data.ACT_PAQId,
      },
    });
  }

  /** ⚡ Transaction : Création depuis Réclamation */
  async createFromReclamation(REC_Id: string, T_Id: string, U_Id: string): Promise<Action> {
    const rec = await this.prisma.reclamation.findFirst({
      where: { REC_Id, tenantId: T_Id },
    });

    if (!rec) throw new NotFoundException("Réclamation introuvable.");

    const paq = await this.prisma.pAQ.findFirst({
      where: { tenantId: T_Id },
      orderBy: { PAQ_Year: 'desc' }
    });

    return this.prisma.$transaction(async (tx) => {
      const action = await tx.action.create({
        data: {
          ACT_Title: `AC - ${rec.REC_Reference}`,
          ACT_Description: `Suite à plainte : ${rec.REC_Object}`,
          ACT_Status: 'A_FAIRE',
          ACT_Priority: rec.REC_Gravity,
          ACT_Origin: 'RECLAMATION',
          tenantId: T_Id,
          ACT_CreatorId: U_Id,
          ACT_ResponsableId: U_Id,
          ACT_PAQId: paq?.PAQ_Id || "",
          ACT_ReclamationId: REC_Id,
        },
      });

      await tx.reclamation.update({
        where: { REC_Id },
        data: { REC_Status: 'ACTION_EN_COURS' },
      });

      return action;
    });
  }

  /** ✅ Méthode 'updateStatus' manquante signalée par l'erreur */
  async updateStatus(id: string, status: string, T_Id: string): Promise<Action> {
    return this.prisma.action.update({
      where: { ACT_Id: id, tenantId: T_Id },
      data: { 
        ACT_Status: status as ActionStatus,
        ACT_CompletedAt: status === 'TERMINEE' ? new Date() : null
      }
    });
  }
}