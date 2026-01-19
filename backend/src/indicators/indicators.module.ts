import { Module } from '@nestjs/common';
import { IndicatorsService } from './indicators.service';
import { ExportService } from './export.service';
import { IndicatorsController } from './indicators.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from '../common/services/pdf.service';

@Module({
  controllers: [IndicatorsController],
  providers: [
    IndicatorsService, 
    ExportService, 
    PdfService, 
    PrismaService
  ],
  exports: [IndicatorsService, ExportService],
})
export class IndicatorsModule {}