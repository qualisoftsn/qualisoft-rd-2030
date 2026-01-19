import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  UseGuards, 
  Req, 
  Res,
  BadRequestException, 
  Param, 
  Patch,
  InternalServerErrorException
} from '@nestjs/common';
import { Response } from 'express';
import { AuditsService } from './audits.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PdfService } from '../common/services/pdf.service';

@Controller('audits')
@UseGuards(JwtAuthGuard)
export class AuditsController {
  constructor(
    private readonly auditsService: AuditsService,
    private readonly pdfService: PdfService
  ) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.auditsService.findAll(req.user.tenantId);
  }

  @Post()
  async create(@Body() data: any, @Req() req: any) {
    if (!data.AU_Title || !data.AU_ProcessusId || !data.AU_SiteId || !data.AU_LeadId) {
      throw new BadRequestException(
        "Validation échouée : Titre, Processus, Site et Auditeur Lead sont requis."
      );
    }
    return this.auditsService.create(data, req.user.tenantId);
  }

  @Patch(':id/sign-acceptance')
  async sign(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    if (!body.signatureHash) {
      throw new BadRequestException("Le hash de signature est requis.");
    }
    return this.auditsService.signAcceptance(
      id, 
      req.user.U_Id, 
      req.user.tenantId, 
      body.signatureHash
    );
  }

  @Post(':id/submit-report')
  async submitReport(@Param('id') id: string, @Body() reportData: any, @Req() req: any) {
    return this.auditsService.closeAuditWithReport(
      id, 
      reportData, 
      req.user.tenantId, 
      req.user.U_Id
    );
  }

  @Get(':id/export-pdf')
  async exportPdf(@Param('id') id: string, @Req() req: any, @Res() res: Response) {
    try {
      // 1. On force le type à 'any' ici pour contourner l'erreur de détection de Prisma
      const audit = await this.auditsService.findOne(id, req.user.tenantId) as any;
      
      // Ligne 86 : Correction du test de vérité
      if (!audit) {
        throw new BadRequestException("Audit introuvable ou accès refusé.");
      }

      const pdfBuffer = await this.pdfService.generateAuditReport(audit);

      // Ligne 96 : Accès sécurisé à AU_Reference
      const fileName = audit.AU_Reference ? `Audit_${audit.AU_Reference}.pdf` : `Audit_${id}.pdf`;

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${fileName}`,
        'Content-Length': pdfBuffer.length,
      });

      return res.send(pdfBuffer);
      
    } catch (error: any) { // Ligne 106 : Typage explicite de l'erreur
      throw new InternalServerErrorException(
        `Erreur lors de la génération du PDF : ${error.message}`
      );
    }
  }
}