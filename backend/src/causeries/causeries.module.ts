import { Module } from '@nestjs/common';
import { CauseriesService } from './causeries.service';
import { CauseriesController } from './causeries.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CauseriesController],
  providers: [CauseriesService, PrismaService],
  exports: [CauseriesService], // Exporté pour être utilisé par les rapports HSE ou les audits
})
export class CauseriesModule {}