import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PaqController } from './paq.controller';
import { PaqService } from './paq.service';

@Module({
  imports: [PrismaModule],
  controllers: [PaqController],
  providers: [PaqService],
  exports: [PaqService],
})
export class PaqModule {}