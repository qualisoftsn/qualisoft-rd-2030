import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActionStatus } from '@prisma/client';

@Injectable()
export class ActionsTabService {
  constructor(private prisma: PrismaService) {}

  /**
   * Vue Tabulaire Globale (§9.1.3 ISO 9001)
   * Agrégation des actions par Processus et Tenant
   */
  async getActionsDashboard(tenantId: string, processId?: string) {
    return this.prisma.action.findMany({
      where: {
        tenantId,
        ACT_IsActive: true,
        // Filtrage dynamique par processus via le PAQ rattaché
        ...(processId && processId !== 'ALL' ? { 
          ACT_PAQ: { PAQ_ProcessusId: processId } 
        } : {}),
      },
      include: {
        ACT_Responsable: { select: { U_FirstName: true, U_LastName: true, U_Role: true } },
        ACT_PAQ: { 
          include: { 
            PAQ_Processus: { select: { PR_Libelle: true, PR_Code: true, PR_Id: true } } 
          } 
        },
        ACT_NC: { select: { NC_Libelle: true, NC_Id: true } },
        ACT_Audit: { select: { AU_Reference: true, AU_Id: true } }
      },
      orderBy: { ACT_UpdatedAt: 'desc' },
    });
  }

  /**
   * Évolution opérationnelle de l'action
   */
  async evolveAction(tenantId: string, actionId: string, status: ActionStatus) {
    const action = await this.prisma.action.findFirst({
      where: { ACT_Id: actionId, tenantId },
    });

    if (!action) throw new NotFoundException("Action introuvable dans le périmètre actif");

    return this.prisma.action.update({
      where: { ACT_Id: actionId },
      data: { 
        ACT_Status: status,
        ACT_CompletedAt: status === ActionStatus.TERMINEE ? new Date() : null,
      },
    });
  }

  /**
   * Archivage Souverain (§7.5.3 ISO 9001)
   * Seul le RQ ou SuperAdmin peut sceller une action
   */
  async sealAction(tenantId: string, actionId: string, userRole: string) {
    if (!['RQ', 'SUPER_ADMIN'].includes(userRole)) {
      throw new ForbiddenException("Privilège de scellage (Archivage) réservé au Responsable Qualité");
    }

    const action = await this.prisma.action.findFirst({
      where: { ACT_Id: actionId, tenantId },
    });

    if (!action) throw new NotFoundException("Action introuvable");

    return this.prisma.action.update({
      where: { ACT_Id: actionId },
      data: { ACT_IsActive: false },
    });
  }
}