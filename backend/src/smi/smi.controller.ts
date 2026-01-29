import { Controller, Get, UseGuards, Request, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SovereignGuard } from '../common/guards/sovereign.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('SMI - Gouvernance & Stratégie')
@Controller('smi')
@UseGuards(JwtAuthGuard, SovereignGuard) // 🛡️ Protection souveraine activée
export class SmiController {
  private readonly logger = new Logger(SmiController.name);

  /** 📊 ISO 9001 §9.3 : Données pour la Revue de Direction */
  @Get('management-review/data')
  @ApiOperation({ summary: 'Extraction des données consolidées pour la revue de direction' })
  async getReviewData(@Request() req) {
    const { tenantId, U_Role } = req.user;
    this.logger.log(`📊 [STRATÉGIE] Extraction pour le Tenant : ${tenantId} par ${U_Role}`);
    
    // Simulation des données consolidées (À lier plus tard à tes services de calcul réels)
    return {
      period: "Année 2026 - Q1",
      globalPerformance: 94,
      processCount: 8,
      criticalRisks: 2,
      kpiStatus: { compliant: 15, warning: 3, critical: 1 },
      summary: "La performance globale du SMI est en progression de 2% par rapport au trimestre précédent. Le déploiement de Qualisoft Elite a optimisé le suivi des plans d'actions conformément au chapitre 9.1."
    };
  }
}