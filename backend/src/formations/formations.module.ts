// File: backend/src/formations/formations.module.ts
import { Module } from '@nestjs/common';
import { FormationsService } from './formations.service';
import { FormationsController } from './formations.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FormationsController],
  providers: [FormationsService],
  exports: [FormationsService]
})
export class FormationsModule {}