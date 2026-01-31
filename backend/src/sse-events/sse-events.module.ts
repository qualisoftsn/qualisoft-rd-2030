import { Module } from '@nestjs/common';
import { SSEEventsService } from './sse-events.service';
import { SSEEventsController } from './sse-events.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SSEEventsController],
  providers: [SSEEventsService, PrismaService],
})
export class SSEEventsModule {}