/**
 * 🛰️ MODULE : AuditsController
 * -------------------------------------------------------------------------
 * RÔLE : Gestion du programme d'audit et des ordres de mission.
 * SÉCURITÉ : JwtAuthGuard + SovereignGuard (Isolation Tenant).
 * RÉVISION : 04 Mars 2026 | 14:45 GMT
 */

import { 
  Controller, Get, Post, Body, UseGuards, Req, Res, 
  BadRequestException, Param, Patch, InternalServerErrorException, Logger 
} from '@nestjs/common';
import { Response } from 'express';
import { AuditsService } from './audits.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SovereignGuard } from '../common/guards/sovereign.guard';
import { PdfService } from '../common/services/pdf.service';

@Controller('audits')
@UseGuards(JwtAuthGuard, SovereignGuard)
export class AuditsController {
  private readonly logger = new Logger(AuditsController.name);

  constructor(
    private readonly auditsService: AuditsService,
    private readonly pdfService: PdfService
  ) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.auditsService.findAll(req.user.tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.auditsService.findOne(id, req.user.tenantId);
  }

  @Post()
  async create(@Body() data: any, @Req() req: any) {
    if (!data.AU_Title || !data.AU_ProcessusId || !data.AU_LeadId) {
      throw new BadRequestException("Les métadonnées d'audit (Titre, Processus, Auditeur) sont incomplètes.");
    }
    return this.auditsService.create(data, req.user.tenantId);
  }

  @Patch(':id/sign-acceptance')
  async sign(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    if (!body.signatureHash) throw new BadRequestException("Hash de signature manquant.");
    return this.auditsService.signAcceptance(id, req.user.U_Id, req.user.tenantId, body.signatureHash);
  }

  @Post(':id/submit-report')
  async submitReport(@Param('id') id: string, @Body() reportData: any, @Req() req: any) {
    return this.auditsService.closeAuditWithReport(id, reportData, req.user.tenantId, req.user.U_Id);
  }

  @Get(':id/export-pdf')
  async exportPdf(@Param('id') id: string, @Req() req: any, @Res() res: Response) {
    try {
      const audit = await this.auditsService.findOne(id, req.user.tenantId);
      const pdfBuffer = await this.pdfService.generateAuditReport(audit);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=RAPPORT_AUDIT_${audit.AU_Reference}.pdf`,
        'Content-Length': pdfBuffer.length,
      });

      return res.send(pdfBuffer);
    } catch (error) {
      this.logger.error(`❌ [PDF-ERROR] Audit ${id} : ${error.message}`);
      throw new InternalServerErrorException("Échec de la génération du rapport souverain.");
    }
  }
}