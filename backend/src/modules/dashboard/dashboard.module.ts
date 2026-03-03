/**
 * 🛰️ MODULE : DashboardModule
 * -------------------------------------------------------------------------
 * RÔLE : Orchestration des flux de données pour le tableau de bord global.
 * RÉVISION : 03 Mars 2026 | 21:55 GMT
 */

import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService]
})
export class DashboardModule {}