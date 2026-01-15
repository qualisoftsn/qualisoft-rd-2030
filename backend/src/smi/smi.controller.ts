import { Controller, Get, UseGuards, Request, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Vérifie bien le chemin de ton guard

@Controller('smi')
export class SmiController {
  private readonly logger = new Logger(SmiController.name);

  @UseGuards(JwtAuthGuard)
  @Get('management-review/data')
  async getReviewData(@Request() req) {
    const tenantId = req.user.tenantId;
    this.logger.log(`📊 Extraction des données stratégiques pour le Tenant : ${tenantId}`);
    
    // Simulation des données consolidées pour SAGAM Electronics
    return {
      period: "Année 2026 - Q1",
      globalPerformance: 94,
      processCount: 8,
      criticalRisks: 2,
      kpiStatus: { compliant: 15, warning: 3, critical: 1 },
      summary: "La performance globale du SMI est en progression de 2% par rapport au trimestre précédent. Le déploiement de Qualisoft Elite a optimisé le suivi des plans d'actions."
    };
  }
}