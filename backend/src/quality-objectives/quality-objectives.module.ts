import { Module } from '@nestjs/common';
import { QualityObjectivesService } from './quality-objectives.service';
import { QualityObjectivesController } from './quality-objectives.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [QualityObjectivesController],
  providers: [QualityObjectivesService],
  exports: [QualityObjectivesService],
})
export class QualityObjectivesModule {}