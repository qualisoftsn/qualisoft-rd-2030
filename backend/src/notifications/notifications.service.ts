import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  // ======================================================
  // 📢 ZONE 1 : ENVOI ET FLUX TEMPS RÉEL
  // ======================================================

  /**
   * ✅ NOTIFIER : CRÉATION D'UNE ALERTE DANS LE SYSTÈME
   * Utilisé pour la visibilité immédiate des événements critiques
   */
  async createNotification(userId: string, title: string, message: string, type: 'INFO' | 'WARNING' | 'CRITICAL', tenantId: string) {
    this.logger.log(`[NOTIF] Création alerte pour ${userId}: ${title}`);
    
    return this.prisma.notification.create({
      data: {
        NT_UserId: userId,
        NT_Title: title,
        NT_Message: message,
        NT_Type: type,
        tenantId: tenantId,
        NT_IsRead: false
      }
    });
  }

  /**
   * ✅ LISTE : RÉCUPÉRATION DES ALERTES ACTIVES
   */
  async getMyNotifications(userId: string, tenantId: string) {
    return this.prisma.notification.findMany({
      where: { NT_UserId: userId, tenantId, NT_IsRead: false },
      orderBy: { NT_CreatedAt: 'desc' },
      take: 20
    });
  }

  // ======================================================
  // ⏰ ZONE 2 : AUTOMATISATION & SURVEILLANCE (BATCHS)
  // ======================================================

  /**
   * 🛡️ SCAN GLOBAL : DÉTECTION PROACTIVE DES DÉRIVES
   * Surveille les retards du PAQ et les expirations d'habilitations SSE
   */
  async runGlobalSurveillance(tenantId: string) {
    const today = new Date();
    const alertThreshold = new Date();
    alertThreshold.setDate(today.getDate() + 30); // Anticipation 30 jours

    // 1. Actions du PAQ hors délais
    const delayedActions = await this.prisma.action.findMany({
      where: { 
        tenantId, 
        ACT_Status: { notIn: ['TERMINEE', 'ANNULEE'] },
        ACT_Deadline: { lt: today }
      },
      include: { ACT_Responsable: true }
    });

    for (const action of delayedActions) {
      await this.createNotification(
        action.ACT_ResponsableId,
        "⚠️ ACTION EN RETARD",
        `L'action "${action.ACT_Title}" est en retard depuis le ${action.ACT_Deadline?.toLocaleDateString()}.`,
        'CRITICAL',
        tenantId
      );
    }

    // 2. Habilitations SSE (CACES, Élec) arrivant à expiration
    const expiringHabs = await this.prisma.userHabilitation.findMany({
      where: { tenantId, UH_ExpiryDate: { lte: alertThreshold, gte: today } }
    });

    for (const hab of expiringHabs) {
      await this.createNotification(
        hab.UH_UserId,
        "🛡️ EXPIRATION HABILITATION",
        `Votre habilitation expire le ${hab.UH_ExpiryDate.toLocaleDateString()}.`,
        'WARNING',
        tenantId
      );
    }
  }

  /**
   * ✅ ACQUITTEMENT : MARQUER COMME LU
   */
  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { NT_Id: notificationId, NT_UserId: userId },
      data: { NT_IsRead: true }
    });
  }
}