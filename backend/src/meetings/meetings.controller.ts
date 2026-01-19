import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request, Res } from '@nestjs/common';
import { Response } from 'express';
import { MeetingsService } from './meetings.service';
import { MeetingsExportService } from './meetings-export.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Gouvernance - COPIL & Revues')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('meetings')
export class MeetingsController {
  constructor(
    private readonly meetingsService: MeetingsService,
    private readonly exportService: MeetingsExportService // ✅ Injection du service d'exportation
  ) {}

  /**
   * ✅ PLANIFICATION : Créer une instance de gouvernance (COPIL, Revue de Direction)
   */
  @Post()
  @ApiOperation({ summary: 'Planifier une nouvelle instance (COPIL/Revue)' })
  async create(@Body() data: any, @Request() req: any) {
    return this.meetingsService.create(data, req.user.tenantId);
  }

  /**
   * ✅ RÉCUPÉRATION : Calendrier complet des instances du Tenant
   */
  @Get()
  @ApiOperation({ summary: 'Récupérer le calendrier des instances' })
  async findAll(@Request() req: any) {
    return this.meetingsService.findAll(req.user.tenantId);
  }

  /**
   * ✅ CLÔTURE : Enregistrer le PV et déclencher la génération automatique des actions PAQ
   */
  @Patch(':id/close')
  @ApiOperation({ summary: 'Enregistrer le compte-rendu et clôturer l\'instance' })
  async close(
    @Param('id') id: string, 
    @Body() data: { report: string, actions?: any[] }, 
    @Request() req: any
  ) {
    return this.meetingsService.closeMeeting(id, data, req.user.tenantId, req.user.U_Id);
  }

  /**
   * 📄 EXPORTATION : Générer le Procès-Verbal officiel en PDF avec signature PKI
   */
  @Get(':id/export-pv')
  @ApiOperation({ summary: 'Générer le Procès-Verbal officiel en PDF' })
  async exportPV(@Param('id') id: string, @Request() req: any, @Res() res: Response) {
    const pdfBuffer = await this.exportService.generateMeetingPDF(id, req.user.tenantId);
    
    // Configuration des headers pour le téléchargement direct du PDF
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=PV_Reunion_${id}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    return res.send(pdfBuffer);
  }
}