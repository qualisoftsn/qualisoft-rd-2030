import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionStatus } from '@prisma/client';

@Injectable()
export class ExpirationTaskService {
  private readonly logger = new Logger(ExpirationTaskService.name);

  constructor(private prisma: PrismaService) {}

  // 🛡️ Exécution chaque nuit à minuit
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleTrialExpirations() {
    this.logger.log('🚀 Lancement du scan nocturne des expirations Qualisoft...');

    const now = new Date();

    // 1. Trouver tous les tenants actifs dont la date est dépassée
    const expiredTenants = await this.prisma.tenant.findMany({
      where: {
        T_SubscriptionStatus: SubscriptionStatus.ACTIVE,
        T_SubscriptionEndDate: { lt: now },
        T_IsActive: true,
      },
    });

    if (expiredTenants.length === 0) {
      this.logger.log('✅ Aucune instance à expirer ce soir.');
      return;
    }

    // 2. Désactivation massive (Mode Lecture Seule)
    for (const tenant of expiredTenants) {
      await this.prisma.tenant.update({
        where: { T_Id: tenant.T_Id },
        data: { 
            T_IsActive: false, // Bloque les écritures via le Guard
            // On peut garder le status ACTIVE mais T_IsActive à false déclenche le verrou
        },
      });
      
      this.logger.warn(`🔒 Instance [${tenant.T_Name}] verrouillée pour expiration.`);
      
      // Optionnel : Envoyer un mail automatique de rupture d'accès ici
    }

    this.logger.log(`📊 Fin du scan : ${expiredTenants.length} instances traitées.`);
  }
}