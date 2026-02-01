import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  Req, 
  Query,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { RisksService } from './risks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRiskDto } from './dto/create-risk.dto';
import { UpdateRiskDto } from './dto/update-risk.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Risks - ISO 9001:2015 Risk Management')
@Controller('risks')
@UseGuards(JwtAuthGuard)
export class RisksController {
  constructor(private readonly risksService: RisksService) {}

  /**
   * 📊 ISO 9001 §9.1.3 - Récupération de la matrice des risques (heatmap)
   */
  @Get('heatmap')
  @ApiOperation({ 
    summary: 'Obtenir la matrice des risques (heatmap)',
    description: 'Retourne tous les risques avec leur score PxGxM et actions associées'
  })
  @ApiQuery({ name: 'processusId', required: false, description: 'Filtrer par processus' })
  @ApiResponse({ status: 200, description: 'Matrice des risques récupérée avec succès' })
  async getHeatmap(
    @Req() req: any, 
    @Query('processusId') processusId?: string
  ) {
    return this.risksService.getHeatmapData(req.user.tenantId, processusId);
  }

  /**
   * 📈 ISO 9001 §9.1.3 - Statistiques globales des risques
   */
  @Get('stats')
  @ApiOperation({ 
    summary: 'Obtenir les statistiques globales des risques',
    description: 'Indicateurs clés: répartition par statut, criticité, évolution'
  })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées avec succès' })
  async getStats(@Req() req: any) {
    return this.risksService.getRiskStats(req.user.tenantId);
  }

  /**
   * 📄 ISO 9001 §9.3 - Génération du rapport de revue de direction
   */
  @Get('report')
  @ApiOperation({ 
    summary: 'Générer le rapport de revue des risques',
    description: 'Rapport complet pour la revue de direction (période: MONTH/QUARTER/YEAR)'
  })
  @ApiQuery({ name: 'period', enum: ['MONTH', 'QUARTER', 'YEAR'], required: true })
  @ApiResponse({ status: 200, description: 'Rapport généré avec succès' })
  async generateReport(
    @Req() req: any,
    @Query('period') period: 'MONTH' | 'QUARTER' | 'YEAR'
  ) {
    return this.risksService.generateReviewReport(req.user.tenantId, period);
  }

  /**
   * ➕ ISO 9001 §6.1 - Création d'un risque avec actions associées
   */
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ 
    summary: 'Créer un nouveau risque',
    description: 'Crée un risque avec calcul automatique du score et génération d\'actions'
  })
  @ApiResponse({ status: 201, description: 'Risque créé avec succès' })
  async create(
    @Body() createRiskDto: CreateRiskDto, 
    @Req() req: any
  ) {
    return this.risksService.create(createRiskDto, req.user.tenantId, req.user.U_Id);
  }

  /**
   * ✏️ Mise à jour d'un risque existant
   */
  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Mettre à jour un risque' })
  @ApiResponse({ status: 200, description: 'Risque mis à jour avec succès' })
  async update(
    @Param('id') id: string, 
    @Body() updateRiskDto: UpdateRiskDto, 
    @Req() req: any
  ) {
    return this.risksService.update(id, req.user.tenantId, updateRiskDto);
  }

  /**
   * 🗑️ Suppression logique d'un risque (soft delete)
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un risque (soft delete)' })
  @ApiResponse({ status: 200, description: 'Risque archivé avec succès' })
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.risksService.remove(id, req.user.tenantId);
  }
}