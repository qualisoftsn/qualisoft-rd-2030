import { Module } from '@nestjs/common';
import { EnvironmentService } from './environment.service';
import { EnvironmentController } from './environment.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [EnvironmentController],
  providers: [EnvironmentService, PrismaService],
})
export class EnvironmentModule {}