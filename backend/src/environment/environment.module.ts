import { Module } from '@nestjs/common';
import { EnvironmentService } from './environment.service';
import { EnvironmentController } from './environment.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [EnvironmentController],
  providers: [EnvironmentService, PrismaService],
  exports: [EnvironmentService], // Pour utilisation par d'autres modules si nécessaire
})
export class EnvironmentModule {}