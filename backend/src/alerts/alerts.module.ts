import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Importation propre
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule
  ],
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService] // Pour que le PAQ ou les Audits puissent générer des alertes
})
export class AlertsModule {}