import { Module } from '@nestjs/common';
import { WastesService } from './wastes.service';
import { WastesController } from './wastes.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [WastesController],
  providers: [WastesService, PrismaService],
})
export class WastesModule {}