import { Module } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service'; // ✅ Importe le service manquant
import { PrismaModule } from '../prisma/prisma.module';
import { AnalysesController } from './analyses.controller';
import { AnalysesService } from './analyses.service';

@Module({
  imports: [PrismaModule], // ✅ Toujours utiliser PrismaModule au lieu de PrismaService seul
  controllers: [AnalysesController],
  providers: [
    AnalysesService, 
    NotificationsService // ✅ AJOUT : Permet d'injecter les notifications pour les analyses SWOT/Risques
  ],
  exports: [AnalysesService],
})
export class AnalysesModule {}