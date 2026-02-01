import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SenegalLegalController } from './senegal-legal.controller';
import { SenegalLegalService } from './senegal-legal.service';

@Module({
  controllers: [SenegalLegalController],
  providers: [SenegalLegalService, PrismaService],
})
export class SenegalLegalModule {}