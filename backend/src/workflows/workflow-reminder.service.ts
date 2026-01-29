import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkflowStatus, NotificationType } from '@prisma/client';

@Injectable()
export class WorkflowReminderService {
  private readonly logger = new Logger(WorkflowReminderService.name);

  constructor(private prisma: PrismaService) {}

  async checkAndNotifyLateSteps() {
    this.logger.log('Lancement de la Sentinelle de Relance Qualisoft...');

    // On définit le seuil de criticité (48 heures)
    const fortyEightHoursAgo = new Date();
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

    // 1. Identification des étapes "EN_ATTENTE" créées il y a plus de 48h
    const lateSteps = await this.prisma.approvalWorkflow.findMany({
      where: {
        AW_Status: WorkflowStatus.EN_ATTENTE,
        AW_CreatedAt: { lt: fortyEightHoursAgo },
      },
      include: {
        tenant: true,
        AW_Approver: true, // Pour savoir qui relancer
      },
    });

    if (lateSteps.length === 0) {
      this.logger.log('Aucun retard détecté. Fluidité SMI optimale.');
      return;
    }

    // 2. Traitement des relances
    for (const step of lateSteps) {
      await this.prisma.$transaction([
        // Création d'une notification système (ISO §7.4 Communication)
        this.prisma.notification.create({
          data: {
            tenantId: step.tenantId,
            userId: step.AW_ApproverId,
            N_Title: '⚠️ RELANCE CRITIQUE : Workflow Stagnant',
            N_Message: `L'étape "${step.AW_Comment}" pour l'entité ${step.AW_EntityType} attend votre validation depuis plus de 48h.`,
            N_Type: NotificationType.DEADLINE_ALERT,
          },
        }),
        // Optionnel : Envoi Email (Logique à connecter à ton provider SMTP/SendGrid)
        // await this.mailService.sendRelance(step.AW_Approver.U_Email, step);
      ]);

      this.logger.warn(`Relance envoyée à ${step.AW_Approver.U_Email} pour l'étape ${step.AW_Id}`);
    }
  }
}