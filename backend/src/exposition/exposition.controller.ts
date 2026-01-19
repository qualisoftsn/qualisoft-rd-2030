import { Controller, Get, Param, Res, UseGuards, Request, Query } from '@nestjs/common';
import { Response } from 'express';
import { ExpositionService } from './exposition.service';
import { ExpositionPdfService } from './exposition-pdf.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('SSE - Exposition Professionnelle')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('exposition')
export class ExpositionController {
  constructor(
    private readonly expositionService: ExpositionService,
    private readonly pdfService: ExpositionPdfService
  ) {}

  /**
   * 📊 MATRICE GLOBALE : Vision par Unité Organique
   */
  @Get('matrix')
  @ApiOperation({ summary: 'Récupérer la matrice d\'exposition globale du tenant' })
  async getGlobalMatrix(@Request() req: any) {
    return this.expositionService.getGlobalExpositionMatrix(req.user.tenantId);
  }

  /**
   * 🔍 DÉTAILS INDIVIDUELS : Exposition d'un collaborateur
   */
  @Get('collaborateur/:userId')
  @ApiOperation({ summary: 'Détails des risques par collaborateur' })
  async getUserExposition(@Param('userId') userId: string, @Request() req: any) {
    return this.expositionService.getCollaborateurExposition(userId, req.user.tenantId);
  }

  /**
   * 📄 EXPORT PDF : Génération de la fiche individuelle officielle
   */
  @Get('export-fiche/:userId')
  @ApiOperation({ summary: 'Générer la fiche d\'exposition individuelle (PDF)' })
  async exportFiche(@Param('userId') userId: string, @Request() req: any, @Res() res: Response) {
    const pdfBuffer = await this.pdfService.generateFicheExposition(userId, req.user.tenantId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=Fiche_Exposition_${userId}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    return res.send(pdfBuffer);
  }

  /**
   * 🏢 EXPORT GROUPÉ : Génération des fiches pour toute une Unité Organique
   */
  @Get('export-unite/:orgUnitId')
  @ApiOperation({ summary: 'Export groupé des fiches d\'exposition pour un service' })
  async exportOrgUnitFiches(@Param('orgUnitId') orgUnitId: string, @Request() req: any) {
    // Cette méthode peut être étendue pour générer un fichier ZIP contenant tous les PDF
    // Pour l'instant, elle renvoie la liste des collaborateurs pour sélection
    return this.expositionService.getGlobalExpositionMatrix(req.user.tenantId);
  }
}