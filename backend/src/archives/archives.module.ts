// File: backend/src/archives/archives.module.ts
import { Module } from '@nestjs/common';
import { ArchivesService } from './archives.service';
import { ArchivesController } from './archives.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ArchivesController],
  providers: [ArchivesService],
  exports: [ArchivesService], // Exporté au cas où d'autres modules en auraient besoin
})
export class ArchivesModule {}