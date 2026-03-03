/**
 * ⏰ MODULE : SurveillanceScheduler
 * -------------------------------------------------------------------------
 * RÔLE : Exécution cyclique de la surveillance QHSE globale.
 */

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

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleDailySurveillance() {
    this.logger.log('🚀 DÉMARRAGE DU SCAN DE SURVEILLANCE GLOBAL...');

    try {
      const tenants = await this.prisma.tenant.findMany({
        where: { T_IsActive: true },
        select: { T_Id: true, T_Name: true }
      });

      for (const tenant of tenants) {
        this.logger.debug(`--- Scan Nœud : ${tenant.T_Name} ---`);
        await this.notifService.runGlobalSurveillance(tenant.T_Id);
      }

      this.logger.log('✅ SCAN GLOBAL ACHEVÉ.');
    } catch (error) {
       this.logger.error(`Erreur : ${error instanceof Error ? error.message : 'Erreur Inconnue'}`);
    }
  }
}