import { Module, Global } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule'; // ✅ Import requis
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { SurveillanceScheduler } from './surveillance.scheduler'; // ✅ Nouveau

@Global()
@Module({
  imports: [
    ScheduleModule.forRoot() // ✅ Active le moteur de tâches planifiées
  ],
  providers: [NotificationsService, SurveillanceScheduler],
  controllers: [NotificationsController],
  exports: [NotificationsService]
})
export class NotificationsModule {}