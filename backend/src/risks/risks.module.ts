import { Module } from '@nestjs/common';
import { RisksService } from './risks.service';
import { RisksController } from './risks.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [RisksController],
  providers: [RisksService, PrismaService],
  exports: [RisksService],
})
export class RisksModule {}