import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { SSEEventsService } from './sse-events.service';
import { CreateSSEEventDto } from './dto/create-sse-event.dto';
import { UpdateSSEEventDto } from './dto/update-sse-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Environment - SSE Events (Incidents)')
@Controller('sse-events')
@UseGuards(JwtAuthGuard)
export class SSEEventsController {
  constructor(private readonly sseEventsService: SSEEventsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouvel incident environnemental' })
  @ApiResponse({ status: 201, description: 'Incident créé avec succès' })
  create(@Body() createDto: CreateSSEEventDto, @Req() req: any) {
    return this.sseEventsService.create(createDto, req.user.tenantId, req.user.U_Id);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les incidents du tenant' })
  @ApiResponse({ status: 200, description: 'Liste des incidents' })
  findAll(@Req() req: any) {
    return this.sseEventsService.findAll(req.user.tenantId);
  }

  @Get('environmental')
  @ApiOperation({ summary: 'Récupérer uniquement les incidents environnementaux' })
  @ApiResponse({ status: 200, description: 'Liste des incidents environnementaux' })
  findEnvironmental(@Req() req: any) {
    return this.sseEventsService.findEnvironmental(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un incident par ID' })
  @ApiResponse({ status: 200, description: 'Incident trouvé' })
  findOne(@Param('id') id: string) {
    return this.sseEventsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un incident' })
  @ApiResponse({ status: 200, description: 'Incident mis à jour' })
  update(@Param('id') id: string, @Body() updateDto: UpdateSSEEventDto) {
    return this.sseEventsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un incident (soft delete)' })
  @ApiResponse({ status: 200, description: 'Incident supprimé' })
  remove(@Param('id') id: string) {
    return this.sseEventsService.remove(id);
  }

  @Get('stats/:period')
  @ApiOperation({ summary: 'Obtenir les statistiques d\'incidents' })
  @ApiResponse({ status: 200, description: 'Statistiques d\'incidents' })
  getStats(@Param('period') period: string, @Req() req: any) {
    return this.sseEventsService.getStats(req.user.tenantId, period);
  }
}