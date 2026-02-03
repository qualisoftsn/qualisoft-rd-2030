import { Module } from '@nestjs/common';
import { IncidentsService } from './incidents.service'; // ✅ Correction du nom
import { IncidentsController } from './incidents.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IncidentsController],
  providers: [IncidentsService], // ✅ Correction ici aussi
})
export class IncidentsModule {}