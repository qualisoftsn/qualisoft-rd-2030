import { Module } from '@nestjs/common';
import { PdfService } from '../common/services/pdf.service'; // ✅ AJOUT : Requis pour les rapports
import { PrismaModule } from '../prisma/prisma.module';
import { AuditsController } from './audits.controller';
import { AuditsService } from './audits.service';
import { NcController } from './nc.controller';
import { NcService } from './nc.service';
import { PreuvesController } from './preuves.controller';
import { PreuvesService } from './preuves.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    AuditsController,
    NcController,
    PreuvesController
  ],
  providers: [
    AuditsService,
    NcService,
    PreuvesService,
    PdfService // ✅ AJOUT : Résout l'erreur "can't resolve dependencies of AuditsController"
  ],
  exports: [NcService, AuditsService]
})
export class AuditsModule {}