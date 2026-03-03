/**
 * 🛰️ MODULE : DashboardController
 * -------------------------------------------------------------------------
 * RÔLE : Point d'accès unique pour la télémétrie du Dashboard (SMI).
 * SÉCURITÉ : Scellé par JwtAuthGuard (Zéro NextAuth).
 * RÉVISION : 03 Mars 2026 | 22:45 GMT
 * -------------------------------------------------------------------------
 */

import { Controller, Get, UseGuards, Req, Logger } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * 📡 FLUX D'ACTIVITÉS (Timeline)
   * @route GET /api/dashboard/activities
   * @desc  Récupère les 15 derniers événements multi-modules du Tenant.
   */
  @Get('activities')
  async getActivities(@Req() req) {
    // Le tenantId est extrait du jeton JWT décodé par le JwtAuthGuard
    const tenantId = req.user.tenantId;
    
    this.logger.log(`[TELEMETRY] Requête Activités - Tenant: ${tenantId}`);
    return this.dashboardService.getGlobalActivity(tenantId);
  }

  /**
   * 📊 STATISTIQUES FLASH (KPI)
   * @route GET /api/dashboard/stats/flash
   * @desc  Récupère les compteurs critiques (NC, Actions, Conformité).
   */
  @Get('stats/flash')
  async getFlashStats(@Req() req) {
    const tenantId = req.user.tenantId;
    
    this.logger.log(`[TELEMETRY] Requête FlashStats - Tenant: ${tenantId}`);
    return this.dashboardService.getFlashStats(tenantId);
  }
}