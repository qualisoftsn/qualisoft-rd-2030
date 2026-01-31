import { Module } from '@nestjs/common';
import { ConsumptionsService } from './consumptions.service';
import { ConsumptionsController } from './consumptions.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ConsumptionsController],
  providers: [ConsumptionsService, PrismaService],
})
export class ConsumptionsModule {}