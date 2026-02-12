import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProcessusController } from './processus.controller';
import { ProcessusService } from './processus.service';
import { ProcessTypeService } from './process-type.service';
import { ProcessTypeController } from './process-type.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    ProcessusController, 
    ProcessTypeController
  ],
  providers: [
    ProcessusService, 
    ProcessTypeService
  ],
  exports: [ProcessusService],
})
export class ProcessusModule {}