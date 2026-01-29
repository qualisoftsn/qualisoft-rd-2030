import { Module } from '@nestjs/common';
import { CopilService } from './copil.service';
import { CopilController } from './copil.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CopilController],
  providers: [CopilService],
  exports: [CopilService]
})
export class CopilModule {}