/**
 * 🛰️ MODULE : ActionsService
 * -------------------------------------------------------------------------
 * RÔLE : Logique métier des actions CAPA et gestion des PAQ liés.
 * RÉVISION : 03 Mars 2026 | 05:55 GMT
 */

import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Action, ActionStatus, ActionOrigin, ActionType, Priority } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';

@Injectable()
export class ActionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * ✅ CRÉATION D'ACTION AVEC AUTO-PROVISIONING DE PAQ
   */
  async create(dto: CreateActionDto, T_Id: string, U_Id: string): Promise<Action> {
    try {
      // 1. Recherche ou Création d'un Plan d'Actions (PAQ) pour le processus
      let paq = await this.prisma.pAQ.findFirst({
        where: { PAQ_ProcessusId: dto.PAQ_ProcessusId, tenantId: T_Id, PAQ_IsActive: true }
      });

      if (!paq) {
        paq = await this.prisma.pAQ.create({
          data: {
            PAQ_Year: new Date().getFullYear(),
            PAQ_Title: `PLAN D'ACTIONS AUTO-GÉNÉRÉ ${new Date().getFullYear()}`,
            PAQ_QualityManagerId: U_Id,
            PAQ_ProcessusId: dto.PAQ_ProcessusId,
            tenantId: T_Id,
          }
        });
      }

      // 2. Création de l'action scellée
      return await this.prisma.action.create({
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
    } catch (error) {
      throw new InternalServerErrorException("Erreur lors de la création de l'action Matrix.");
    }
  }

  async findAll(T_Id: string) {
    return this.prisma.action.findMany({
      where: { tenantId: T_Id, ACT_IsActive: true },
      include: {
        ACT_Responsable: { select: { U_FirstName: true, U_LastName: true } },
        ACT_PAQ: { include: { PAQ_Processus: true } },
        ACT_Preuves: true
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
      },
      include: { ACT_Responsable: true }
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
    const rec = await this.prisma.reclamation.findUnique({ where: { REC_Id, tenantId: T_Id } });
    if (!rec) throw new NotFoundException("Réclamation introuvable");

    let paq = await this.prisma.pAQ.findFirst({ where: { tenantId: T_Id, PAQ_IsActive: true } });

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