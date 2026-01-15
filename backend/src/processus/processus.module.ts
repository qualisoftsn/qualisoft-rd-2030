import { Module } from '@nestjs/common';
import { ProcessusService } from './processus.service';
import { ProcessusController } from './processus.controller';
import { ProcessTypeService } from './process-type.service';
import { ProcessTypeController } from './process-type.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [PrismaModule, SubscriptionsModule, CommonModule],
  controllers: [ProcessusController, ProcessTypeController],
  providers: [ProcessusService, ProcessTypeService],
  exports: [ProcessusService],
})
export class ProcessusModule {}