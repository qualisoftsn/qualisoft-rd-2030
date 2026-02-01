import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ActionOrigin, ActionStatus, ActionType, Priority, Role } from '@prisma/client';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(private prisma: PrismaService) {}

  // ===========================================================================
  // 1. AUTOMATISATION (CRON JOBS)
  // ===========================================================================

  @Cron(CronExpression.EVERY_HOUR)
  async generateAutomaticAlerts() {
    this.logger.log('Début de la génération automatique des alertes...');
    const now = new Date();
    
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // 1. Alertes échéances réglementaires à 7 jours
    await this.createDeadlineAlerts(nextWeek, 'REMINDER', 'MEDIUM');
    
    // 2. Alertes échéances réglementaires à 1 jour
    await this.createDeadlineAlerts(tomorrow, 'DEADLINE', 'HIGH');
    
    // 3. Alertes échéances réglementaires dépassées
    await this.createOverdueAlerts(now);
    
    // 4. Alertes audits à venir
    await this.createAuditAlerts(tomorrow, 'REMINDER', 'MEDIUM');
    
    // 5. Alertes formations expirées
    await this.createFormationAlerts();
  }

  // ===========================================================================
  // 2. LOGIQUE MÉTIER DE GÉNÉRATION DES ALERTES
  // ===========================================================================

  private async createDeadlineAlerts(dateLimit: Date, type: string, priority: string) {
    const startOfDay = new Date(dateLimit); startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(dateLimit); endOfDay.setHours(23,59,59,999);

    const requirements = await this.prisma.regulatoryRequirement.findMany({
      where: {
        RR_DueDate: { gte: startOfDay, lte: endOfDay },
        RR_Status: 'PENDING',
        RR_IsActive: true
      },
      include: { tenant: true }
    });

    for (const req of requirements) {
      const existing = await this.prisma.alert.findFirst({
        where: {
          AL_RequirementId: req.RR_Id,
          AL_Type: type,
          AL_Status: { in: ['UNREAD', 'READ', 'NEW'] }
        }
      });

      if (!existing) {
        await this.createAlert({
          AL_Title: `Échéance proche : ${req.RR_Title}`,
          AL_Message: `L'exigence "${req.RR_Title}" arrive à échéance le ${new Date(req.RR_DueDate).toLocaleDateString('fr-FR')}. Réf: ${req.RR_Reference}`,
          AL_Type: type,
          AL_Priority: priority,
          AL_DueDate: req.RR_DueDate,
          AL_RequirementId: req.RR_Id,
          sendPush: true,
          sendEmail: true
        }, req.tenantId);
      }
    }
  }

  private async createOverdueAlerts(now: Date) {
    const requirements = await this.prisma.regulatoryRequirement.findMany({
      where: {
        RR_DueDate: { lt: now },
        RR_Status: 'PENDING',
        RR_IsActive: true
      },
      include: { tenant: true }
    });

    for (const req of requirements) {
      const existing = await this.prisma.alert.findFirst({
        where: { AL_RequirementId: req.RR_Id, AL_Type: 'OVERDUE' }
      });

      if (!existing) {
        await this.createAlert({
          AL_Title: `RETARD CRITIQUE : ${req.RR_Title}`,
          AL_Message: `⚠️ L'exigence "${req.RR_Title}" est en retard depuis le ${new Date(req.RR_DueDate).toLocaleDateString('fr-FR')}. Action immédiate requise !`,
          AL_Type: 'OVERDUE',
          AL_Priority: 'CRITICAL',
          AL_DueDate: req.RR_DueDate,
          AL_RequirementId: req.RR_Id,
          sendPush: true,
          sendEmail: true,
          sendSms: true
        }, req.tenantId);
      }
    }
  }

  private async createAuditAlerts(targetDate: Date, type: string, priority: string) {
    const startOfDay = new Date(targetDate); startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(targetDate); endOfDay.setHours(23,59,59,999);

    const audits = await this.prisma.audit.findMany({
      where: {
        AU_DateAudit: { gte: startOfDay, lte: endOfDay },
        AU_Status: 'PLANIFIE'
      }
    });

    for (const audit of audits) {
      const existing = await this.prisma.alert.findFirst({
        where: { AL_AuditId: audit.AU_Id, AL_Type: type }
      });

      if (!existing) {
        await this.createAlert({
          AL_Title: `Rappel Audit : ${audit.AU_Reference}`,
          AL_Message: `L'audit prévu le ${audit.AU_DateAudit.toLocaleDateString()} arrive demain. Préparez les documents.`,
          AL_Type: type,
          AL_Priority: priority,
          AL_DueDate: audit.AU_DateAudit,
          AL_AuditId: audit.AU_Id,
          sendPush: true,
          sendEmail: true
        }, audit.tenantId);
      }
    }
  }

  private async createFormationAlerts() {
    return;
  }

  // ===========================================================================
  // 3. CRUD & ACTIONS
  // ===========================================================================

  async createAlert(dto: CreateAlertDto & { tenantId?: string }, tenantId?: string) {
    const finalTenantId = tenantId || dto.tenantId;
    if (!finalTenantId) throw new BadRequestException("TenantID manquant pour la création de l'alerte");

    const alert = await this.prisma.alert.create({
      data: {
        AL_Title: dto.AL_Title,
        AL_Message: dto.AL_Message,
        AL_Type: dto.AL_Type,
        AL_Priority: dto.AL_Priority,
        AL_DueDate: dto.AL_DueDate,
        AL_RequirementId: dto.AL_RequirementId ?? null,
        AL_AuditId: dto.AL_AuditId ?? null,
        AL_ActionId: dto.AL_ActionId ?? null,
        AL_Status: 'NEW',
        tenantId: finalTenantId // ✅ FIX: Utilisation de la clé scalaire tenantId au lieu de l'objet connect
      }
    });

    const recipients = await this.prisma.user.findMany({
      where: {
        tenantId: finalTenantId,
        U_Role: { in: [Role.ADMIN, Role.RQ, Role.DIRECTION, Role.HSE] },
        U_IsActive: true
      }
    });

    if (recipients.length > 0) {
      await this.prisma.alertRecipient.createMany({
        data: recipients.map(user => ({
          AR_AlertId: alert.AL_Id,
          AR_UserId: user.U_Id,
          AR_Status: 'UNREAD'
        }))
      });

      if (dto.sendPush) await this.sendPushNotification(alert, recipients);
      if (dto.sendEmail) await this.sendEmailNotification(alert, recipients);
      if (dto.sendSms) await this.sendSmsNotification(alert, recipients);
    }

    return alert;
  }

  async getAlerts(tenantId: string, filters?: { status?: string; priority?: string; type?: string }) {
    const where: any = { tenantId, AL_IsActive: true };
    if (filters?.status) where.AL_Status = filters.status;
    if (filters?.priority) where.AL_Priority = filters.priority;
    if (filters?.type) where.AL_Type = filters.type;

    return this.prisma.alert.findMany({
      where,
      include: {
        AL_Requirement: true,
        AL_Audit: true,
        AL_Action: true,
        AL_Recipients: {
          include: { user: { select: { U_FirstName: true, U_LastName: true, U_Email: true } } }
        }
      },
      orderBy: { AL_DueDate: 'asc' }
    });
  }

  async markAsRead(alertId: string, userId: string) {
    await this.prisma.alertRecipient.updateMany({
      where: { AR_AlertId: alertId, AR_UserId: userId },
      data: { AR_ReadAt: new Date(), AR_Status: 'READ' }
    });

    const unreadCount = await this.prisma.alertRecipient.count({
      where: { AR_AlertId: alertId, AR_Status: { not: 'READ' } }
    });

    if (unreadCount === 0) {
      await this.prisma.alert.update({
        where: { AL_Id: alertId },
        data: { AL_Status: 'READ' }
      });
    }

    return { success: true };
  }

  async acknowledgeAlert(alertId: string, userId: string, comment?: string) {
    const alert = await this.prisma.alert.update({
      where: { AL_Id: alertId },
      data: { AL_Status: 'ACKNOWLEDGED', AL_ResolveDate: new Date() }
    });

    if (alert.AL_RequirementId) {
      const defaultPaq = await this.prisma.pAQ.findFirst({
        where: { tenantId: alert.tenantId, PAQ_IsActive: true }
      });

      if (defaultPaq) {
        await this.prisma.action.create({
          data: {
            ACT_Title: `Traitement alerte : ${alert.AL_Title}`,
            ACT_Description: comment || alert.AL_Message,
            ACT_Type: ActionType.CORRECTIVE,
            ACT_Status: ActionStatus.A_FAIRE,
            ACT_Priority: alert.AL_Priority === 'CRITICAL' ? Priority.CRITICAL : Priority.HIGH,
            ACT_Deadline: alert.AL_DueDate,
            ACT_ResponsableId: userId,
            ACT_CreatorId: userId,
            ACT_Origin: ActionOrigin.ALERTE,
            ACT_PAQId: defaultPaq.PAQ_Id,
            tenantId: alert.tenantId
          }
        });
      }
    }

    return { success: true };
  }

  // ===========================================================================
  // 4. NOTIFICATIONS & STATS
  // ===========================================================================

  private async sendPushNotification(alert: any, recipients: any[]) {}
  private async sendEmailNotification(alert: any, recipients: any[]) {}
  private async sendSmsNotification(alert: any, recipients: any[]) {}

  async getAlertStats(tenantId: string) {
    const alerts = await this.prisma.alert.findMany({
      where: { tenantId, AL_IsActive: true },
      select: { AL_Status: true, AL_Priority: true, AL_Type: true }
    });

    return {
      total: alerts.length,
      unread: alerts.filter(a => a.AL_Status === 'UNREAD' || a.AL_Status === 'NEW').length,
      critical: alerts.filter(a => a.AL_Priority === 'CRITICAL').length,
      overdue: alerts.filter(a => a.AL_Type === 'OVERDUE').length,
      byStatus: this.groupBy(alerts, 'AL_Status'),
      byPriority: this.groupBy(alerts, 'AL_Priority'),
      byType: this.groupBy(alerts, 'AL_Type')
    };
  }

  private groupBy(array: any[], key: string) {
    return array.reduce((acc, obj) => {
      const group = obj[key];
      acc[group] = (acc[group] || 0) + 1;
      return acc;
    }, {});
  }
}