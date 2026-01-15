import { Module } from '@nestjs/common';
import { AuditsService } from './audits.service';
import { AuditsController } from './audits.controller';
import { NcController } from './nc.controller';
import { NcService } from './nc.service';
import { PreuvesService } from './preuves.service';
import { PreuvesController } from './preuves.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    AuditsController, // Corrigé : Pluriel
    NcController,
    PreuvesController
  ],
  providers: [
    AuditsService,  // Corrigé : Pluriel
    NcService,
    PreuvesService,
    PrismaService
  ],
  exports: [NcService, AuditsService] // Exporté pour la collaboration entre modules (ISO 9001)
})
export class AuditsModule {}