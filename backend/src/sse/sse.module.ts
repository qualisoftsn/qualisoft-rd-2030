import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; 
import { SseController } from './sse.controller';
import { FormationsController } from './formations.controller';
import { CompetencesController } from './competences.controller';
import { SseService } from './sse.service';
import { SseExportService } from './sse-export.service'; // ✅ Ajout du service d'exportation PDF
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule
  ],
  controllers: [
    SseController, 
    FormationsController, 
    CompetencesController
  ],
  providers: [
    SseService, 
    SseExportService, // ✅ Déclaré pour permettre l'injection dans SseController
    PrismaService
  ],
  exports: [
    SseService,
    SseExportService // ✅ Exporté pour être utilisé par d'autres modules (ex: RH ou Management)
  ],
})
export class SseModule {}