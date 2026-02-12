import { Module } from '@nestjs/common';
import { SseService } from './sse.service';
import { SseExportService } from './sse-export.service';
import { SseController } from './sse.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SseController],
  providers: [SseService, SseExportService],
  exports: [SseService],
})
export class SseModule {}