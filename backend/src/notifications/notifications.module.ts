/**
 * 🛰️ MODULE : notifications.module.ts
 * -------------------------------------------------------------------------
 * RÉVISION : 03 Mars 2026 | 23:20 GMT
 */

import { Module, Global } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { SurveillanceScheduler } from './surveillance.scheduler';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [
    PrismaModule,
    JwtModule.register({ 
      secret: process.env.JWT_SECRET || 'QUALISOFT_SDE_2026' 
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway, SurveillanceScheduler],
  exports: [NotificationsService],
})
export class NotificationsModule {}