import { Module } from '@nestjs/common';
import { SseModule } from '../sse/sse.module'; // Correction : SseModule
import { AnalysesService } from './analyses.service';
import { AnalysesController } from './analyses.controller';

@Module({
  imports: [SseModule],
  controllers: [AnalysesController],
  providers: [AnalysesService],
})
export class AnalysesModule {}