import { Module } from '@nestjs/common';
import { IndicatorsService } from './indicators.service';
import { ExportService } from './export.service'; // ✅ Import du service PDF
import { IndicatorsController } from './indicators.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [IndicatorsController],
  providers: [
    IndicatorsService, 
    ExportService, // ✅ Enregistrement du service pour l'injection
    PrismaService
  ],
  exports: [
    IndicatorsService,
    ExportService // ✅ Optionnel : permet à d'autres modules d'utiliser l'export si besoin
  ],
})
export class IndicatorsModule {}