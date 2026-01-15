import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; 
import { SseController } from './sse.controller';
import { FormationsController } from './formations.controller';
import { CompetencesController } from './competences.controller';
import { SseService } from './sse.service';

@Module({
  controllers: [
    SseController, 
    FormationsController, 
    CompetencesController
  ],
  providers: [
    SseService, 
    PrismaService
  ],
  exports: [SseService],
})
export class SseModule {}