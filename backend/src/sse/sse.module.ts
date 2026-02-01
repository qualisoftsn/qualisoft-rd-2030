import { Module } from '@nestjs/common';
import { SseService } from './sse.service';
import { SseController } from './sse.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SseController],
  providers: [SseService, PrismaService],
})
export class SseModule {}