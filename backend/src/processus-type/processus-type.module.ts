import { Module } from '@nestjs/common';
import { ProcessusTypeController } from './processus-type.controller';
import { ProcessusTypeService } from './processus-type.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProcessusTypeController], // NestJS va maintenant trouver le décorateur
  providers: [ProcessusTypeService],
  exports: [ProcessusTypeService]
})
export class ProcessusTypeModule {}