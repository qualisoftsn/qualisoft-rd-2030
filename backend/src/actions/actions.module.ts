import { Module } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { ActionsController } from './actions.controller'; // Le seul contrôleur nécessaire
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ActionsController], // On a retiré ActionItemController et ActionPlanController
  providers: [
    ActionsService, 
    PrismaService
  ],
  exports: [ActionsService],
})
export class ActionsModule {}