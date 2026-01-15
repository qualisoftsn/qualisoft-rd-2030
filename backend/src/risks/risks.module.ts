// src/risks/risks.module.ts
import { Module } from '@nestjs/common';
import { RisksService } from './risks.service';
import { RisksController } from './risks.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RisksController],
  providers: [RisksService],
})
export class RisksModule {}