import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { WastesService } from './wastes.service';
import { CreateWasteDto } from './dto/create-waste.dto';
import { UpdateWasteDto } from './dto/update-waste.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Environment - Wastes')
@Controller('wastes')
@UseGuards(JwtAuthGuard)
export class WastesController {
  constructor(private readonly wastesService: WastesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouvel enregistrement de déchet' })
  @ApiResponse({ status: 201, description: 'Déchet créé avec succès' })
  create(@Body() createWasteDto: CreateWasteDto, @Req() req: any) {
    return this.wastesService.create(createWasteDto, req.user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les déchets du tenant' })
  @ApiResponse({ status: 200, description: 'Liste des déchets' })
  findAll(@Req() req: any) {
    return this.wastesService.findAll(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un déchet par ID' })
  @ApiResponse({ status: 200, description: 'Déchet trouvé' })
  findOne(@Param('id') id: string) {
    return this.wastesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un déchet' })
  @ApiResponse({ status: 200, description: 'Déchet mis à jour' })
  update(@Param('id') id: string, @Body() updateWasteDto: UpdateWasteDto) {
    return this.wastesService.update(id, updateWasteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un déchet' })
  @ApiResponse({ status: 200, description: 'Déchet supprimé' })
  remove(@Param('id') id: string) {
    return this.wastesService.remove(id);
  }

  @Get('stats/:period')
  @ApiOperation({ summary: 'Obtenir les statistiques de déchets' })
  @ApiResponse({ status: 200, description: 'Statistiques de déchets' })
  getStats(@Param('period') period: string, @Req() req: any) {
    return this.wastesService.getStats(req.user.tenantId, period);
  }
}