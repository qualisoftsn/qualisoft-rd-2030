import { Module } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { ActionsController } from './actions.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    ActionsController,
    // Ajoute les autres contrôleurs SEULEMENT si les fichiers existent
  ],
  providers: [
    ActionsService,
  ],
  exports: [ActionsService]
})
export class ActionsModule {}