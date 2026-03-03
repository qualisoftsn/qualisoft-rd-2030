import { Module } from '@nestjs/common';
import { PdfService } from '../common/services/pdf.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditsController } from './audits.controller';
import { AuditsService } from './audits.service';
import { PreuvesService } from './preuves.service';

@Module({
  imports: [PrismaModule],
  controllers: [AuditsController],
  providers: [AuditsService, PreuvesService, PdfService],
  exports: [AuditsService]
})
export class AuditsModule {}