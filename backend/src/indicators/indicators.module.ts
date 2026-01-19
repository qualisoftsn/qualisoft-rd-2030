import { Module } from '@nestjs/common';
import { PdfService } from '../common/services/pdf.service';
import { PkiService } from '../pki/pki.service'; // ✅ AJOUT : Requis pour IndicatorsService
import { PrismaModule } from '../prisma/prisma.module'; // ✅ Utiliser le module global
import { ExportService } from './export.service';
import { IndicatorsController } from './indicators.controller';
import { IndicatorsService } from './indicators.service';

@Module({
  imports: [PrismaModule], // ✅ Importe la connexion DB de façon centralisée
  controllers: [IndicatorsController],
  providers: [
    IndicatorsService, 
    ExportService, 
    PdfService, 
    PkiService // ✅ AJOUT : Résout l'erreur "can't resolve dependencies"
  ],
  exports: [IndicatorsService, ExportService],
})
export class IndicatorsModule {}