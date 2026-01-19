import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

@Injectable()
export class SurveillanceScheduler {
  private readonly logger = new Logger(SurveillanceScheduler.name);

  constructor(
    private prisma: PrismaService,
    private notifService: NotificationsService
  ) {}

  /**
   * ⏰ SCAN QUOTIDIEN QHSE-E (08h00 AM)
   * Déclenche la surveillance proactive pour TOUS les tenants du système
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleDailySurveillance() {
    this.logger.log('🚀 DÉMARRAGE DU SCAN GLOBAL DE SURVEILLANCE...');

    try {
      // 1. Récupérer tous les tenants actifs
      const tenants = await this.prisma.tenant.findMany({
        select: { T_Id: true, T_Name: true }
      });

      this.logger.log(`🔍 Analyse de ${tenants.length} entreprises en cours...`);

      // 2. Exécuter le scan pour chaque entreprise
      for (const tenant of tenants) {
        this.logger.debug(`--- Scan pour : ${tenant.T_Name} ---`);
        await this.notifService.runGlobalSurveillance(tenant.T_Id);
      }

      this.logger.log('✅ SCAN GLOBAL TERMINÉ AVEC SUCCÈS.');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`❌ ÉCHEC DU SCAN DE SURVEILLANCE : ${msg}`);
    }
  }
}