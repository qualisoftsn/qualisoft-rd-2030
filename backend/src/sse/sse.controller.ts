import { Body, Controller, Delete, Get, Param, Post, Request, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SseExportService } from './sse-export.service';
import { SseService } from './sse.service';

@ApiTags('SSE - Santé Sécurité Environnement')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sse')
export class SseController {
  constructor(
    private readonly sseService: SseService,
    private readonly sseExportService: SseExportService // ✅ Injection du service d'exportation PDF
  ) {}

  @Get()
  @ApiOperation({ summary: 'Consulter le registre SSE complet (Accidents, Incidents)' })
  async findAll(@Request() req: any) {
    return this.sseService.findAll(req.user.tenantId);
  }

  @Get('risks')
  @ApiOperation({ summary: 'Consulter la matrice des Risques Professionnels (DUER)' })
  async findAllRisks(@Request() req: any) {
    return this.sseService.findAllRisks(req.user.tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Signaler un événement SSE (Accident, Situation dangereuse)' })
  async create(@Body() data: any, @Request() req: any) {
    // Utilisation de U_Id conformément à ton schéma User
    return this.sseService.create(data, req.user.tenantId, req.user.U_Id);
  }

  /**
   * 📄 EXPORT PDF : Fiche Individuelle d'Exposition
   * Endpoint critique pour la conformité MASE / ISO 45001
   */
  @Get('export-exposition/:userId')
  @ApiOperation({ summary: 'Générer la fiche d\'exposition individuelle en PDF' })
  async exportExposition(
    @Param('userId') userId: string, 
    @Request() req: any, 
    @Res() res: Response
  ) {
    const pdfBuffer = await this.sseExportService.generateExpositionPDF(userId, req.user.tenantId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=Fiche_Exposition_${userId}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    return res.send(pdfBuffer);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un événement du registre SSE' })
  async remove(@Param('id') id: string, @Request() req: any) {
    // Appel de la méthode delete() du service (mise en conformité avec sse.service.ts)
    return this.sseService.delete(id, req.user.tenantId);
  }
}