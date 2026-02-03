import { Module } from '@nestjs/common';
import { SenegalLegalController } from './senegal-legal.controller';
import { SenegalLegalService } from './senegal-legal.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SenegalLegalController],
  providers: [SenegalLegalService],
  exports: [SenegalLegalService],
})
export class SenegalLegalModule {}