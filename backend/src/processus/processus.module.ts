import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ProcessusSchedulerService } from '../processus/processus-scheduler.service';
import { ProcessTypeController } from './process-type.controller';
import { ProcessTypeService } from './process-type.service';
import { ProcessusController } from './processus.controller';
import { ProcessusService } from './processus.service';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [ProcessusController, ProcessTypeController],
  providers: [ProcessusService, ProcessTypeService, ProcessusSchedulerService],
  exports: [ProcessusService],
})
export class ProcessusModule {}