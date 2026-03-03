/**
 * 🛰️ MODULE : NotificationsService
 * -------------------------------------------------------------------------
 * RÔLE : Moteur de surveillance proactive et gestion des alertes.
 * RÉVISION : 03 Mars 2026 | 23:15 GMT
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NotificationType, NCStatus, ActionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 🔔 GÉNÉRATION D'ALERTE SCELLÉE
   */
  async createNotification(targetUserId: string, title: string, message: string, type: string, tenantId: string) {
    const validType = Object.values(NotificationType).includes(type as NotificationType)
      ? (type as NotificationType)
      : NotificationType.INFO;

    return this.prisma.notification.create({
      data: {
        N_Title: title,
        N_Message: message,
        N_Type: validType,
        N_IsRead: false,
        N_IsActive: true,
        userId: targetUserId,
        tenantId: tenantId
      }
    });
  }

  /**
   * 📥 LECTURE DU FLUX (Multi-Tenancy Strict)
   */
  async getMyNotifications(userId: string, tenantId: string) {
    return this.prisma.notification.findMany({
      where: { 
        userId, 
        tenantId, 
        N_IsRead: false, 
        N_IsActive: true 
      },
      orderBy: { N_CreatedAt: 'desc' },
      take: 50
    });
  }

  /**
   * ✅ ACQUITTEMENT UNITAIRE AVEC VÉRIFICATION DE PROPRIÉTÉ
   */
  async markAsRead(notificationId: string, userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { N_Id: notificationId, userId: userId },
      data: { N_IsRead: true }
    });

    if (result.count === 0) throw new NotFoundException("Alerte introuvable.");
    return { success: true };
  }

  /**
   * ✅ NETTOYAGE GLOBAL
   */
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, N_IsRead: false },
      data: { N_IsRead: true }
    });
  }

  /**
   * 🛡️ SCAN DE SURVEILLANCE RÉGALIEN (QHSE-E)
   * Analyse les retards d'actions et les expirations d'habilitations.
   */
  async runGlobalSurveillance(tenantId: string) {
    const today = new Date();
    const alertThreshold = new Date();
    alertThreshold.setDate(today.getDate() + 30); // Seuil de 30 jours

    this.logger.log(`[SURVEILLANCE] Scan Matrix lancé pour le tenant ID: ${tenantId}`);

    // --- 1. SCAN DES ACTIONS EN RETARD (ISO 9001) ---
    const delayedActions = await this.prisma.action.findMany({
      where: { 
        tenantId, 
        ACT_Status: { notIn: [ActionStatus.TERMINEE, ActionStatus.ANNULEE] },
        ACT_Deadline: { lt: today }
      }
    });

    let countActions = 0;
    for (const action of delayedActions) {
      if (!action.ACT_ResponsableId) continue;

      // Anti-Spam : Une seule notification par action non lue
      const exists = await this.prisma.notification.findFirst({
        where: { userId: action.ACT_ResponsableId, N_Title: "⚠️ ACTION EN RETARD", N_Message: { contains: action.ACT_Title }, N_IsRead: false }
      });

      if (!exists) {
        await this.createNotification(
          action.ACT_ResponsableId,
          "⚠️ ACTION EN RETARD",
          `L'action "${action.ACT_Title}" a dépassé son échéance (${action.ACT_Deadline?.toLocaleDateString()}).`,
          NotificationType.DEADLINE_ALERT,
          tenantId
        );
        countActions++;
      }
    }

    // --- 2. SCAN DES HABILITATIONS SSE (ISO 45001) ---
    const expiringHabs = await this.prisma.userHabilitation.findMany({
      where: { 
        tenantId, 
        UH_Status: 'ACTIVE', 
        UH_ExpiryDate: { lte: alertThreshold, gte: today } 
      }
    });

    let countHabs = 0;
    for (const hab of expiringHabs) {
      if (!hab.userId) continue;

      const exists = await this.prisma.notification.findFirst({
        where: { userId: hab.userId, N_Title: "🛡️ EXPIRATION HABILITATION", N_Message: { contains: hab.UH_Label }, N_IsRead: false }
      });

      if (!exists) {
        await this.createNotification(
          hab.userId,
          "🛡️ EXPIRATION HABILITATION",
          `Votre habilitation "${hab.UH_Label}" expire prochainement le ${hab.UH_ExpiryDate?.toLocaleDateString()}.`,
          NotificationType.WARNING,
          tenantId
        );
        countHabs++;
      }
    }

    return { actions: countActions, habilitations: countHabs };
  }
}