import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Action, ActionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActionsService {
  private readonly logger = new Logger(ActionsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 🔍 LISTE GLOBALE : Toutes les actions du Tenant
   * Incorpore le calcul dynamique du statut EN_RETARD
   */
  async findAll(T_Id: string): Promise<any[]> {
    const actions = await this.prisma.action.findMany({
      where: { tenantId: T_Id },
      include: {
        ACT_Responsable: { select: { U_FirstName: true, U_LastName: true, U_Email: true } },
        ACT_Creator: { select: { U_FirstName: true, U_LastName: true } },
        ACT_Reclamation: { select: { REC_Reference: true, REC_Object: true } },
        ACT_NC: { select: { NC_Libelle: true } },
        ACT_Audit: { select: { AU_Reference: true } },
        ACT_Preuves: true // Conservé pour la visibilité des justificatifs (Evidence)
      },
      orderBy: { ACT_CreatedAt: 'desc' }
    });

    const now = new Date();
    return actions.map(action => {
      let status = action.ACT_Status;
      const isOverdue = action.ACT_Deadline && new Date(action.ACT_Deadline) < now;
      const isNotClosed = action.ACT_Status !== ActionStatus.TERMINEE && action.ACT_Status !== ActionStatus.ANNULEE;

      if (isOverdue && isNotClosed) {
        status = ActionStatus.EN_RETARD;
      }
      return { ...action, ACT_Status: status };
    });
  }

  /**
   * ➕ CRÉATION UNIFIÉE (Absorbe ActionItem, ActionTime et ActionPlan)
   */
  async create(data: any, T_Id: string, U_Id: string): Promise<Action> {
    return this.prisma.action.create({
      data: {
        ACT_Title: data.ACT_Title,
        ACT_Description: data.ACT_Description,
        ACT_Status: data.ACT_Status || ActionStatus.A_FAIRE,
        ACT_Priority: data.ACT_Priority || 'MEDIUM',
        ACT_Origin: data.ACT_Origin || (data.ACT_NCId ? 'NON_CONFORMITE' : 'AUTRE'),
        ACT_Deadline: data.ACT_Deadline ? new Date(data.ACT_Deadline) : null,
        tenantId: T_Id,
        ACT_CreatorId: U_Id,
        ACT_ResponsableId: data.ACT_ResponsableId || U_Id,
        ACT_PAQId: data.ACT_PAQId,
        // Liaisons dynamiques (ISO compliance)
        ACT_NCId: data.ACT_NCId || null,
        ACT_AuditId: data.ACT_AuditId || null,
        ACT_SSEEventId: data.ACT_SSEEventId || null,
        ACT_ReclamationId: data.ACT_ReclamationId || null,
      },
    });
  }

  /**
   * ⚡ TRANSACTION : Création depuis Réclamation (Dernière version corrigée)
   */
  async createFromReclamation(REC_Id: string, T_Id: string, U_Id: string): Promise<Action> {
    const rec = await this.prisma.reclamation.findFirst({ where: { REC_Id, tenantId: T_Id } });
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
          ACT_Status: ActionStatus.A_FAIRE,
          ACT_Priority: rec.REC_Gravity,
          ACT_Origin: 'RECLAMATION',
          tenantId: T_Id,
          ACT_CreatorId: U_Id,
          ACT_ResponsableId: U_Id,
          ACT_PAQId: paq?.PAQ_Id || "",
          ACT_ReclamationId: REC_Id,
        },
      });
      await tx.reclamation.update({ where: { REC_Id }, data: { REC_Status: 'ACTION_EN_COURS' } });
      return action;
    });
  }

  /**
   * 🕒 GESTION DES RETARDS (Ex ActionTimeService)
   */
  async findOverdue(T_Id: string): Promise<Action[]> {
    return this.prisma.action.findMany({
      where: {
        tenantId: T_Id,
        ACT_Deadline: { lt: new Date() },
        ACT_Status: { notIn: [ActionStatus.TERMINEE, ActionStatus.ANNULEE] },
      },
    });
  }

  async updateDeadline(id: string, T_Id: string, newDeadline: Date): Promise<Action> {
    const item = await this.prisma.action.findFirst({ where: { ACT_Id: id, tenantId: T_Id } });
    if (!item) throw new NotFoundException("Action introuvable");
    return this.prisma.action.update({ 
      where: { ACT_Id: id }, 
      data: { ACT_Deadline: new Date(newDeadline) } 
    });
  }

  /**
   * 🎯 VUES SPÉCIFIQUES (Plan d'Action NC / Mes Actions)
   */
  async findAllNCActions(T_Id: string): Promise<Action[]> {
    return this.prisma.action.findMany({
      where: { tenantId: T_Id, ACT_NCId: { not: null } },
      include: { ACT_NC: true, ACT_Responsable: true },
      orderBy: { ACT_CreatedAt: 'desc' }
    });
  }

  async findMyActions(U_Id: string, T_Id: string): Promise<any[]> {
    return this.prisma.action.findMany({
      where: { 
        tenantId: T_Id, 
        ACT_ResponsableId: U_Id,
        ACT_Status: { notIn: [ActionStatus.TERMINEE, ActionStatus.ANNULEE] }
      },
      include: { ACT_NC: true, ACT_Audit: true },
      orderBy: { ACT_Deadline: 'asc' }
    });
  }

  /**
   * ✅ WORKFLOW : Statut et complétion
   */
  async updateStatus(id: string, status: string, T_Id: string): Promise<Action> {
    return this.prisma.action.update({
      where: { ACT_Id: id, tenantId: T_Id },
      data: { 
        ACT_Status: status as ActionStatus,
        ACT_CompletedAt: status === ActionStatus.TERMINEE ? new Date() : null
      }
    });
  }
}