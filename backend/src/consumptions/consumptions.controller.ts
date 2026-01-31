import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ConsumptionsService } from './consumptions.service';
import { CreateConsumptionDto } from './dto/create-consumption.dto';
import { UpdateConsumptionDto } from './dto/update-consumption.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Environment - Consumptions')
@Controller('consumptions')
@UseGuards(JwtAuthGuard)
export class ConsumptionsController {
  constructor(private readonly consumptionsService: ConsumptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle consommation' })
  @ApiResponse({ status: 201, description: 'Consommation créée avec succès' })
  create(@Body() createConsumptionDto: CreateConsumptionDto, @Req() req: any) {
    return this.consumptionsService.create(createConsumptionDto, req.user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les consommations du tenant' })
  @ApiResponse({ status: 200, description: 'Liste des consommations' })
  findAll(@Req() req: any) {
    return this.consumptionsService.findAll(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une consommation par ID' })
  @ApiResponse({ status: 200, description: 'Consommation trouvée' })
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.consumptionsService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une consommation' })
  @ApiResponse({ status: 200, description: 'Consommation mise à jour' })
  update(@Param('id') id: string, @Body() updateConsumptionDto: UpdateConsumptionDto) {
    return this.consumptionsService.update(id, updateConsumptionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une consommation' })
  @ApiResponse({ status: 200, description: 'Consommation supprimée' })
  remove(@Param('id') id: string) {
    return this.consumptionsService.remove(id);
  }

  @Get('stats/:period')
  @ApiOperation({ summary: 'Obtenir les statistiques de consommation' })
  @ApiResponse({ status: 200, description: 'Statistiques de consommation' })
  getStats(@Param('period') period: string, @Req() req: any) {
    return this.consumptionsService.getStats(req.user.tenantId, period);
  }
}