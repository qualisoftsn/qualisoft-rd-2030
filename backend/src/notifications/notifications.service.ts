import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

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
  async createNotification(userId: string, title: string, message: string, type: NotificationType, tenantId: string) {
    this.logger.log(`[NOTIF] Création alerte pour ${userId}: ${title}`);
    
    // ✅ Alignement strict sur les préfixes N_ et les relations du schéma
    return this.prisma.notification.create({
      data: {
        N_Title: title,
        N_Message: message,
        N_Type: type,
        N_IsRead: false,
        user: { connect: { U_Id: userId } },
        tenant: { connect: { T_Id: tenantId } }
      }
    });
  }

  /**
   * ✅ LISTE : RÉCUPÉRATION DES ALERTES ACTIVES
   */
  async getMyNotifications(userId: string, tenantId: string) {
    return this.prisma.notification.findMany({
      where: { 
        userId: userId, 
        tenantId: tenantId, 
        N_IsRead: false 
      },
      orderBy: { N_CreatedAt: 'desc' },
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
    alertThreshold.setDate(today.getDate() + 30); 

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
        'DANGER', // ✅ DANGER est une valeur valide de ton Enum NotificationType
        tenantId
      );
    }

    // 2. Habilitations SSE (CACES, Élec) arrivant à expiration
    const expiringHabs = await this.prisma.userHabilitation.findMany({
      where: { 
        tenantId, 
        UH_ExpiryDate: { lte: alertThreshold, gte: today } 
      }
    });

    for (const hab of expiringHabs) {
      await this.createNotification(
        hab.userId,
        "🛡️ EXPIRATION HABILITATION",
        `Votre habilitation expire le ${hab.UH_ExpiryDate?.toLocaleDateString()}.`,
        'WARNING',
        tenantId
      );
    }
  }

  // ======================================================
  // 🛠️ ZONE 3 : ADMINISTRATION (ACQUITTEMENT)
  // ======================================================

  /**
   * ✅ ACQUITTEMENT : MARQUER COMME LU
   */
  async markAsRead(notificationId: string, userId: string) {
    // Utilisation de updateMany pour sécuriser par userId (évite qu'un utilisateur acquitte la notif d'un autre)
    const result = await this.prisma.notification.updateMany({
      where: { 
        N_Id: notificationId, 
        userId: userId 
      },
      data: { N_IsRead: true }
    });

    if (result.count === 0) {
      throw new NotFoundException(`Notification introuvable ou déjà traitée.`);
    }

    return result;
  }
}