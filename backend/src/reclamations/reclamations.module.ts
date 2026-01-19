import { Module } from '@nestjs/common';
import { ReclamationsController } from './reclamations.controller';
import { ReclamationsService } from './reclamations.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReclamationsController],
  providers: [ReclamationsService],
  exports: [ReclamationsService]
})
export class ReclamationsModule {}