import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MeetingStatus, ActionOrigin, ActionType, ActionStatus } from '@prisma/client';

@Injectable()
export class MeetingsService {
  private readonly logger = new Logger(MeetingsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * ✅ PLANIFICATION : Création d'une instance avec participants
   */
  async create(data: any, T_Id: string) {
    return this.prisma.meeting.create({
      data: {
        MG_Title: data.MG_Title,
        MG_Date: new Date(data.MG_Date),
        MG_Status: (data.MG_Status as MeetingStatus) || MeetingStatus.PLANIFIE,
        tenantId: T_Id,
        MG_ProcessId: data.MG_ProcessId,
        // Liaison des participants via la table de jointure MeetingAttendee
        MG_Attendees: {
          create: data.attendeeIds?.map((userId: string) => ({
            MA_UserId: userId,
            MA_Present: false
          })) || []
        }
      },
      include: { MG_Attendees: true, MG_Processus: true }
    });
  }

  /**
   * ✅ RÉCUPÉRATION : Calendrier complet avec détails processus et participants
   */
  async findAll(T_Id: string) {
    return this.prisma.meeting.findMany({
      where: { tenantId: T_Id },
      include: { 
        MG_Processus: { select: { PR_Libelle: true, PR_Code: true } },
        MG_Attendees: { include: { MA_User: { select: { U_FirstName: true, U_LastName: true } } } },
        MG_Actions: true
      },
      orderBy: { MG_Date: 'asc' }
    });
  }

  /**
   * ✅ CLÔTURE & ACTIONS : Enregistrement PV et génération auto d'actions PAQ
   * Correction ligne 80 : Vérification du Processus ID pour éviter l'erreur de type null
   */
  async closeMeeting(MG_Id: string, reportData: any, T_Id: string, creatorId: string) {
    const { report, actions } = reportData;

    return await this.prisma.$transaction(async (tx) => {
      const meeting = await tx.meeting.findUnique({ 
        where: { MG_Id },
        include: { MG_Processus: true }
      });

      if (!meeting || meeting.tenantId !== T_Id) {
        throw new NotFoundException("Instance introuvable.");
      }

      // 1. Mise à jour du compte-rendu (MG_Report) et statut
      const updatedMeeting = await tx.meeting.update({
        where: { MG_Id },
        data: {
          MG_Status: MeetingStatus.TERMINE,
          MG_Report: report
        }
      });

      // 2. Génération des actions décidées vers le PAQ
      if (actions && actions.length > 0) {
        // ✅ CORRECTION SÉCURISÉE : On s'assure que MG_ProcessId n'est pas null
        if (!meeting.MG_ProcessId) {
          throw new BadRequestException("Impossible de lier des actions : aucun processus n'est rattaché à cette réunion.");
        }

        const targetProcessId: string = meeting.MG_ProcessId; // Cast sécurisé après vérification

        for (const action of actions) {
          const paq = await tx.pAQ.findFirst({
            where: { PAQ_ProcessusId: targetProcessId, tenantId: T_Id },
            orderBy: { PAQ_Year: 'desc' }
          });

          if (paq) {
            await tx.action.create({
              data: {
                ACT_Title: `[DÉCISION ${meeting.MG_Title}] ${action.title}`,
                ACT_Description: action.description,
                ACT_Origin: ActionOrigin.COPIL,
                ACT_Type: ActionType.AMELIORATION,
                ACT_Status: ActionStatus.A_FAIRE,
                ACT_PAQId: paq.PAQ_Id,
                ACT_MeetingId: MG_Id,
                tenantId: T_Id,
                ACT_ResponsableId: action.responsibleId || meeting.MG_Processus?.PR_PiloteId || creatorId,
                ACT_CreatorId: creatorId,
                ACT_Deadline: action.deadline ? new Date(action.deadline) : null
              }
            });
          }
        }
      }

      return updatedMeeting;
    });
  }
}