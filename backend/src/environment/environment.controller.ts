import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { EnvironmentService } from './environment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Environment - Dashboard')
@Controller('environment')
@UseGuards(JwtAuthGuard)
export class EnvironmentController {
  constructor(private readonly environmentService: EnvironmentService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Obtenir les données du dashboard environnemental' })
  @ApiResponse({ status: 200, description: 'Données du dashboard' })
  getDashboardData(@Req() req: any) {
    return this.environmentService.getDashboardData(req.user.tenantId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtenir les statistiques environnementales globales' })
  @ApiResponse({ status: 200, description: 'Statistiques globales' })
  getStats(@Req() req: any) {
    return this.environmentService.getStats(req.user.tenantId);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Obtenir les alertes environnementales actives' })
  @ApiResponse({ status: 200, description: 'Liste des alertes' })
  getAlerts(@Req() req: any) {
    return this.environmentService.getAlerts(req.user.tenantId);
  }
}