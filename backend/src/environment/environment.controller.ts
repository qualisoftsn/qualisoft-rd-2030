import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { EnvironmentService } from './environment.service';
import { CreateEnvironmentIncidentDto } from './dto/create-environment-incident.dto';
import { UpdateEnvironmentIncidentDto } from './dto/update-environment-incident.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from 'src/prisma/prisma.service';

@ApiTags('Environment - ISO 14001 Management')
@Controller('environment')
@UseGuards(JwtAuthGuard)
export class EnvironmentController {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly prisma: PrismaService,
  ) {}

  // ========================================
  // INCIDENTS ENVIRONNEMENTAUX
  // ========================================

  @Post('incidents')
  @ApiOperation({ summary: 'Créer un incident environnemental' })
  @ApiResponse({ status: 201, description: 'Incident créé avec succès' })
  createIncident(
    @Body() createDto: CreateEnvironmentIncidentDto, 
    @Req() req: any
  ) {
    return this.environmentService.createEnvironmentIncident(
      createDto, 
      req.user.tenantId, 
      req.user.U_Id
    );
  }

  @Get('incidents')
  @ApiOperation({ summary: 'Lister les incidents environnementaux du tenant' })
  @ApiResponse({ status: 200, description: 'Liste des incidents' })
  findIncidents(@Req() req: any) {
    return this.environmentService.findEnvironmentalIncidents(req.user.tenantId);
  }

  @Get('incidents/:id')
  @ApiOperation({ summary: 'Récupérer un incident environnemental par ID' })
  @ApiResponse({ status: 200, description: 'Incident trouvé' })
  findOneIncident(@Param('id') id: string, @Req() req: any) {
    // ✅ CORRECTION : Remplacement de null par le tenantId réel
    return this.environmentService.findOneIncident(id, req.user.tenantId);
  }

  @Patch('incidents/:id')
  @ApiOperation({ summary: 'Mettre à jour un incident environnemental' })
  @ApiResponse({ status: 200, description: 'Incident mis à jour' })
  updateIncident(
    @Param('id') id: string, 
    @Body() updateDto: UpdateEnvironmentIncidentDto,
    @Req() req: any
  ) {
    // ✅ CORRECTION : Remplacement de null par le tenantId réel
    return this.environmentService.updateIncident(id, updateDto, req.user.tenantId);
  }

  @Delete('incidents/:id')
  @ApiOperation({ summary: 'Supprimer un incident environnemental (soft delete)' })
  @ApiResponse({ status: 200, description: 'Incident supprimé' })
  removeIncident(@Param('id') id: string, @Req() req: any) {
    // ✅ CORRECTION : Remplacement de null par le tenantId réel
    return this.environmentService.removeIncident(id, req.user.tenantId);
  }

  // ========================================
  // STATISTIQUES & DASHBOARD
  // ========================================

  @Get('stats/:period')
  @ApiOperation({ summary: 'Obtenir les statistiques environnementales' })
  @ApiResponse({ status: 200, description: 'Statistiques par période (MONTH/QUARTER/YEAR)' })
  getStats(@Param('period') period: 'MONTH' | 'QUARTER' | 'YEAR', @Req() req: any) {
    return this.environmentService.getEnvironmentalStats(req.user.tenantId, period);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Obtenir les données du dashboard environnemental complet' })
  @ApiResponse({ status: 200, description: 'Données dashboard ISO 14001' })
  getDashboard(@Req() req: any) {
    return this.environmentService.getDashboardData(req.user.tenantId);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Obtenir les alertes environnementales actives' })
  @ApiResponse({ status: 200, description: 'Liste des alertes critiques et warnings' })
  getAlerts(@Req() req: any) {
    return this.environmentService.getEnvironmentalStats(req.user.tenantId, 'MONTH')
      .then(stats => stats.alerts);
  }

  // ========================================
  // CONSOMMATIONS & DÉCHETS
  // ========================================

  @Get('consumptions')
  @ApiOperation({ summary: 'Lister les consommations (énergie, eau)' })
  @ApiResponse({ status: 200, description: 'Liste des consommations' })
  getConsumptions(@Req() req: any) {
    return this.prisma.consumption.findMany({
      where: { tenantId: req.user.tenantId, CON_IsActive: true },
      include: { CON_Site: true },
      orderBy: { CON_CreatedAt: 'desc' }
    });
  }

  @Get('wastes')
  @ApiOperation({ summary: 'Lister les déchets' })
  @ApiResponse({ status: 200, description: 'Liste des déchets' })
  getWastes(@Req() req: any) {
    return this.prisma.waste.findMany({
      where: { tenantId: req.user.tenantId, WAS_IsActive: true },
      include: { WAS_Site: true },
      orderBy: { WAS_CreatedAt: 'desc' }
    });
  }
}