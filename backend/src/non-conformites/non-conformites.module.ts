import { Module } from '@nestjs/common';
import { NonConformiteService } from './non-conformites.service';
import { NonConformiteController } from './non-conformites.controller';
import { PrismaModule } from '../prisma/prisma.module';
// 👇 IMPORT CRUCIAL
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    PrismaModule, 
    NotificationsModule // ✅ C'est ce qui permet d'injecter le service de notification
  ],
  controllers: [NonConformiteController],
  providers: [NonConformiteService],
  exports: [NonConformiteService],
})
export class NonConformiteModule {}