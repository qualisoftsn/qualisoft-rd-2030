import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PrismaModule } from '../prisma/prisma.module'; // 👈 INDISPENSABLE

@Module({
  imports: [PrismaModule], // ✅ Permet d'injecter PrismaService dans NotificationsService
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService], // ✅ Permet aux modules (Action, NC, Audit) d'envoyer des alertes
})
export class NotificationsModule {}