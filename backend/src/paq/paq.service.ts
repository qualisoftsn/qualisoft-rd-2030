import { 
  Injectable, UnauthorizedException, ConflictException, 
  NotFoundException, InternalServerErrorException, BadRequestException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ActionStatus, NotificationType } from '@prisma/client';

@Injectable()
export class PaqService {
  constructor(
    private prisma: PrismaService,
    private notifService: NotificationsService
  ) {}

  async getDashboard(T_Id: string) {
    if (!T_Id) throw new UnauthorizedException("Identifiant entreprise manquant.");
    const today = new Date();
    
    const actions = await this.prisma.action.findMany({
      where: { tenantId: T_Id },
      include: { 
        ACT_Responsable: { select: { U_FirstName: true, U_LastName: true } },
      },
    });

    const enRetard = actions.filter(a => 
      a.ACT_Status !== 'TERMINEE' && 
      a.ACT_Deadline && 
      new Date(a.ACT_Deadline) < today
    );

    const cloturees = actions.filter(a => a.ACT_Status === 'TERMINEE');

    const chargeMap = new Map<string, number>();
    actions.filter(a => a.ACT_Status !== 'TERMINEE').forEach(a => {
      if (a.ACT_Responsable) {
        const name = `${a.ACT_Responsable.U_FirstName?.[0] || ''}. ${a.ACT_Responsable.U_LastName || 'INCONNU'}`.toUpperCase();
        chargeMap.set(name, (chargeMap.get(name) || 0) + 1);
      }
    });

    return {
      total: actions.length,
      enRetard: enRetard,
      clotureesCount: cloturees.length,
      chargeTravail: Array.from(chargeMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      tauxEfficacite: actions.length > 0 ? Math.round((cloturees.length / actions.length) * 100) : 0
    };
  }

  async findAll(T_Id: string) {
    return this.prisma.pAQ.findMany({
      where: { tenantId: T_Id },
      include: {
        PAQ_Processus: { select: { PR_Libelle: true, PR_Code: true } },
        PAQ_QualityManager: { select: { U_FirstName: true, U_LastName: true } },
        _count: { select: { PAQ_Actions: true } }
      },
      orderBy: { PAQ_Year: 'desc' }
    });
  }

  async findOne(id: string, T_Id: string) {
    const paq = await this.prisma.pAQ.findFirst({
      where: { PAQ_Id: id, tenantId: T_Id },
      include: {
        PAQ_Actions: { 
          include: { 
            ACT_Responsable: { select: { U_FirstName: true, U_LastName: true } },
            ACT_Creator: { select: { U_FirstName: true, U_LastName: true } }
          } 
        },
        PAQ_Processus: true,
      }
    });
    if (!paq) throw new NotFoundException("PAQ introuvable.");
    return paq;
  }

  async create(data: any, T_Id: string) {
    const year = parseInt(data.PAQ_Year) || new Date().getFullYear();
    try {
      return await this.prisma.pAQ.create({
        data: {
          PAQ_Title: data.PAQ_Title,
          PAQ_Description: data.PAQ_Description || "",
          PAQ_Year: year,
          tenantId: T_Id,
          PAQ_ProcessusId: data.PAQ_ProcessusId,
          PAQ_QualityManagerId: data.PAQ_QualityManagerId,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') throw new ConflictException(`Un PAQ existe déjà pour ce processus en ${year}.`);
      throw new InternalServerErrorException("Erreur lors de la création du PAQ.");
    }
  }

  async updateAction(id: string, T_Id: string, data: any) {
    const existing = await this.prisma.action.findFirst({
      where: { ACT_Id: id, tenantId: T_Id }
    });
    if (!existing) throw new NotFoundException("Action introuvable.");

    const updatedAction = await this.prisma.action.update({
      where: { ACT_Id: id },
      data: {
        ACT_Title: data.ACT_Title,
        ACT_Description: data.ACT_Description,
        ACT_Status: data.ACT_Status as ActionStatus,
        ACT_Priority: data.ACT_Priority,
        ACT_Deadline: data.ACT_Deadline ? new Date(data.ACT_Deadline) : undefined,
        ACT_CompletedAt: data.ACT_Status === 'TERMINEE' ? new Date() : null
      }
    });

    // Notification si clôture
    if (data.ACT_Status === 'TERMINEE') {
        await this.notifService.createNotification(
            existing.ACT_CreatorId,
            "✅ ACTION CLÔTURÉE",
            `L'action "${existing.ACT_Title}" a été marquée comme terminée.`,
            NotificationType.SUCCESS,
            T_Id
        );
    }

    return updatedAction;
  }
}