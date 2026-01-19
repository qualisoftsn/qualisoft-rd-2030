import { Module } from '@nestjs/common';
import { ExpositionService } from './exposition.service';
import { ExpositionPdfService } from './exposition-pdf.service';
import { ExpositionController } from './exposition.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ExpositionService, ExpositionPdfService],
  controllers: [ExpositionController],
  exports: [ExpositionService] // Exporté pour les audits et revues de direction
})
export class ExpositionModule {}