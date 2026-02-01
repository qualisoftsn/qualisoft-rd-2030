import { Controller, Get, Post, Body, Patch, Param, Query, Delete, UseGuards, Req } from '@nestjs/common';
import { SseService } from './sse.service';
import { CreateSseEventDto } from './dto/create-sse-event.dto';
import { UpdateSseEventDto } from './dto/update-sse-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('SSE - Health, Safety & Environment')
@Controller('sse')
@UseGuards(JwtAuthGuard)
export class SseController {
  constructor(private readonly sseService: SseService) {}

  @Post()
  @ApiOperation({ summary: 'Déclarer un nouvel événement SSE' })
  create(@Body() createDto: CreateSseEventDto, @Req() req: any) {
    return this.sseService.create(createDto, req.user.tenantId, req.user.U_Id);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les événements SSE du tenant' })
  findAll(@Req() req: any) {
    return this.sseService.findAll(req.user.tenantId);
  }

  @Get('environmental')
  @ApiOperation({ summary: 'Filtrer uniquement les incidents environnementaux' })
  findEnvironmental(@Req() req: any) {
    return this.sseService.findEnvironmental(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un événement SSE par son ID' })
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.sseService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un événement SSE' })
  update(
    @Param('id') id: string, 
    @Body() updateDto: UpdateSseEventDto, 
    @Req() req: any
  ) {
    // ✅ Correction : Ajout de @Req() et passage du tenantId au service
    return this.sseService.update(id, updateDto, req.user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un événement SSE' })
  remove(@Param('id') id: string, @Req() req: any) {
    // ✅ Correction : Ajout de @Req() et passage du tenantId au service
    return this.sseService.remove(id, req.user.tenantId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtenir les statistiques SSE (Heatmap/Fréquence)' })
  getStats(
    @Req() req: any, 
    @Query('period') period: "YEAR" | "MONTH" | "QUARTER"
  ) {
    // ✅ Typage strict de "period" pour éviter l'erreur TS2345
    return this.sseService.getStats(req.user.tenantId, period); 
  }
}