import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * 📂 MODULE GED (§7.5)
 * Ce module orchestre la gestion, la validation et le stockage 
 * de l'information documentée au sein du SMI Qualisoft.
 */
@Module({
  imports: [
    PrismaModule,
    // Configuration de base pour le traitement des fichiers
    // Note : Le stockage précis est géré dynamiquement dans le contrôleur via diskStorage
    MulterModule.register({
      dest: './uploads/documents',
    }),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService], // Exporté pour permettre des liens avec les Processus ou les Audits
})
export class DocumentsModule {}