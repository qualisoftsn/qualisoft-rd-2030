import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
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
   * Strictement aligné sur le model Notification du schema.prisma
   */
  async createNotification(targetUserId: string, title: string, message: string, type: string, tenantId: string) {
    // Conversion sécurisée du type (fallback sur INFO si invalide)
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
        // CLÉS ÉTRANGÈRES EXACTES DU SCHÉMA :
        userId: targetUserId,   // Correspond à `userId String` dans le model Notification
        tenantId: tenantId      // Correspond à `tenantId String` dans le model Notification
      }
    });
  }

  /**
   * ✅ LISTE : RÉCUPÉRATION DES ALERTES ACTIVES
   * Filtrage sur `userId` et `tenantId` (champs exacts)
   */
  async getMyNotifications(userId: string, tenantId?: string) {
    const whereClause: any = {
      userId: userId,     // Champ exact du schéma
      N_IsRead: false,
      N_IsActive: true
    };

    if (tenantId) {
      whereClause.tenantId = tenantId; // Champ exact du schéma
    }

    return this.prisma.notification.findMany({
      where: whereClause,
      orderBy: { N_CreatedAt: 'desc' },
      take: 50
    });
  }

  // ======================================================
  // 🛠️ ZONE 2 : ADMINISTRATION (ACQUITTEMENT)
  // ======================================================

  /**
   * ✅ ACQUITTEMENT UNITAIRE
   */
  async markAsRead(notificationId: string, userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { 
        N_Id: notificationId, 
        userId: userId // Sécurité : seul le propriétaire peut lire
      },
      data: { N_IsRead: true }
    });

    if (result.count === 0) {
      throw new NotFoundException(`Alerte introuvable ou accès refusé.`);
    }

    return { success: true, id: notificationId };
  }

  /**
   * ✅ ACQUITTEMENT MASSIF
   */
  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { 
        userId: userId,
        N_IsRead: false
      },
      data: { N_IsRead: true }
    });

    this.logger.log(`[FLUX] L'utilisateur ${userId} a nettoyé ${result.count} alertes.`);
    return result;
  }

  // ======================================================
  // ⏰ ZONE 3 : SURVEILLANCE AUTOMATIQUE (REAL DATA)
  // ======================================================

  /**
   * 🛡️ SCAN GLOBAL : VÉRIFICATION RÉELLE SUR LA BDD
   * Cette fonction interroge les tables Action et UserHabilitation
   */
  async runGlobalSurveillance(tenantId: string) {
    const today = new Date();
    const alertThreshold = new Date();
    alertThreshold.setDate(today.getDate() + 30); // J+30 pour les préavis

    this.logger.log(`[SURVEILLANCE] Scan lancé pour le tenant ${tenantId}`);

    // --- 1. SCAN DES ACTIONS EN RETARD ---
    const delayedActions = await this.prisma.action.findMany({
      where: { 
        tenantId: tenantId, // Champ exact du schéma Action
        ACT_Status: { notIn: ['TERMINEE', 'ANNULEE'] }, // Enum ActionStatus
        ACT_Deadline: { lt: today }
      }
    });

    let countActions = 0;
    for (const action of delayedActions) {
      // On notifie le responsable de l'action
      if (action.ACT_ResponsableId) {
        // On évite de spammer si une alerte similaire existe déjà aujourd'hui (Optionnel mais recommandé)
        const exists = await this.prisma.notification.findFirst({
          where: {
            userId: action.ACT_ResponsableId,
            N_Title: "⚠️ ACTION EN RETARD",
            N_Message: { contains: action.ACT_Title },
            N_IsRead: false
          }
        });

        if (!exists) {
            await this.createNotification(
              action.ACT_ResponsableId,
              "⚠️ ACTION EN RETARD",
              `L'action "${action.ACT_Title}" est arrivée à échéance le ${action.ACT_Deadline?.toLocaleDateString()}.`,
              NotificationType.DEADLINE_ALERT, // Ou DANGER selon ton choix
              tenantId
            );
            countActions++;
        }
      }
    }

    // --- 2. SCAN DES HABILITATIONS (SSE) ---
    const expiringHabs = await this.prisma.userHabilitation.findMany({
      where: { 
        tenantId: tenantId, // Champ exact du schéma UserHabilitation
        UH_Status: 'ACTIVE', // Enum HabStatus
        UH_ExpiryDate: { lte: alertThreshold, gte: today } 
      }
    });

    let countHabs = 0;
    for (const hab of expiringHabs) {
      if (hab.userId) {
          // On vérifie les doublons
          const exists = await this.prisma.notification.findFirst({
            where: {
                userId: hab.userId,
                N_Title: "🛡️ EXPIRATION HABILITATION",
                N_Message: { contains: hab.UH_Label },
                N_IsRead: false
            }
          });

          if (!exists) {
            await this.createNotification(
              hab.userId,
              "🛡️ EXPIRATION HABILITATION",
              `notre habilitation "${hab.UH_Label}" expire le ${hab.UH_ExpiryDate?.toLocaleDateString()}.`,
              NotificationType.WARNING,
              tenantId
            );
            countHabs++;
          }
      }
    }

    this.logger.log(`[SURVEILLANCE] Résultat : ${countActions} actions en retard notifiées, ${countHabs} habilitations expirantes notifiées.`);
    
    return { actions: countActions, habilitations: countHabs };
  }
}