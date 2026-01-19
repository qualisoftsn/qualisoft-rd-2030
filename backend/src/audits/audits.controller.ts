import { 
  Controller, Get, Post, Body, UseGuards, Req, Res,
  BadRequestException, Param, Patch, InternalServerErrorException, Logger
} from '@nestjs/common';
import { Response } from 'express';
import { AuditsService } from './audits.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PdfService } from '../common/services/pdf.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Qualité - Audits Internes')
@Controller('audits')
@UseGuards(JwtAuthGuard)
export class AuditsController {
  private readonly logger = new Logger(AuditsController.name);

  constructor(
    private readonly auditsService: AuditsService,
    private readonly pdfService: PdfService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Liste tous les audits du programme annuel' })
  async findAll(@Req() req: any) {
    return this.auditsService.findAll(req.user.tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Planifier un nouvel audit' })
  async create(@Body() data: any, @Req() req: any) {
    if (!data.AU_Title || !data.AU_ProcessusId || !data.AU_SiteId || !data.AU_LeadId) {
      throw new BadRequestException("Les champs Titre, Processus, Site et Auditeur Lead sont obligatoires.");
    }
    return this.auditsService.create(data, req.user.tenantId);
  }

  @Patch(':id/sign-acceptance')
  @ApiOperation({ summary: 'Signature de l\'ordre de mission par le pilote' })
  async sign(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    if (!body.signatureHash) {
      throw new BadRequestException("La signature électronique (hash) est requise.");
    }
    return this.auditsService.signAcceptance(
      id, 
      req.user.U_Id, 
      req.user.tenantId, 
      body.signatureHash
    );
  }

  @Post(':id/submit-report')
  @ApiOperation({ summary: 'Clôturer l\'audit et soumettre le rapport de constats' })
  async submitReport(@Param('id') id: string, @Body() reportData: any, @Req() req: any) {
    return this.auditsService.closeAuditWithReport(
      id, 
      reportData, 
      req.user.tenantId, 
      req.user.U_Id
    );
  }

  @Get(':id/export-pdf')
  @ApiOperation({ summary: 'Générer le rapport d\'audit officiel en PDF' })
  async exportPdf(@Param('id') id: string, @Req() req: any, @Res() res: Response) {
    try {
      const audit = await this.auditsService.findOne(id, req.user.tenantId);
      
      const pdfBuffer = await this.pdfService.generateAuditReport(audit);
      const fileName = `Rapport_Audit_${audit.AU_Reference || id}.pdf`;

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${fileName}`,
        'Content-Length': pdfBuffer.length,
      });

      return res.send(pdfBuffer);
      
    } catch (error: any) {
      this.logger.error(`Erreur export PDF Audit ${id}: ${error.message}`);
      throw new InternalServerErrorException(
        `Erreur lors de la génération du rapport PDF : ${error.message}`
      );
    }
  }
}