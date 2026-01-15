import { 
  Controller, Get, Post, Delete, Body, 
  UseGuards, Req, Query, Param, ForbiddenException, Res, Logger 
} from '@nestjs/common';
import { Response } from 'express';
import { IndicatorsService } from './indicators.service';
import { ExportService } from './export.service'; 
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IVStatus } from '@prisma/client';

@Controller('indicators')
@UseGuards(JwtAuthGuard)
export class IndicatorsController {
  private readonly logger = new Logger(IndicatorsController.name);

  constructor(
    private readonly indicatorsService: IndicatorsService,
    private readonly exportService: ExportService, 
  ) {}

  // ======================================================
  // 📊 ZONE 1 : PERFORMANCE & DASHBOARD (COCKPIT)
  // ======================================================

  @Get('dashboard-stats')
  async getDashboardStats(@Req() req: any) {
    return this.indicatorsService.getDashboardStats(
      req.user.tenantId, 
      req.user.U_Id, 
      req.user.U_Role
    );
  }

  @Get('monthly-grid')
  async getGrid(@Req() req: any, @Query('month') month: string, @Query('year') year: string) {
    return this.indicatorsService.getMonthlyDashboard(
      req.user.tenantId, 
      parseInt(month), 
      parseInt(year)
    );
  }

  @Get('annual-matrix')
  async getAnnual(@Req() req: any, @Query('year') year: string) {
    return this.indicatorsService.getAnnualMatrix(req.user.tenantId, parseInt(year));
  }

  // ======================================================
  // 📑 ZONE 2 : EXPORTATION ÉLITE (REVUE DE DIRECTION PDF)
  // ======================================================

  @Get('export/pdf')
  async exportPdf(
    @Req() req: any, 
    @Query('month') month: string, 
    @Query('year') year: string,
    @Res() res: Response
  ) {
    try {
      this.logger.log(`📄 Demande d'export PDF Elite - Tenant: ${req.user.tenantId} (${req.user.U_Email})`);
      
      const buffer = await this.exportService.generateManagementReviewPDF(
        req.user.tenantId, 
        parseInt(month), 
        parseInt(year)
      );

      // ✅ Configuration des headers pour le flux binaire
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=Revue_Direction_Qualisoft_${month}_${year}.pdf`,
        'Content-Length': buffer.length,
      });

      // ✅ On utilise .send() pour envoyer le buffer proprement
      return res.send(buffer);

    } catch (error: any) { 
      // ✅ Correction TS18046 : Typage 'any' pour accéder à .message
      this.logger.error(`❌ ERREUR CRITIQUE EXPORT PDF : ${error.message}`);
      return res.status(500).json({ 
        message: "Une erreur interne est survenue lors de la génération du rapport PDF.",
        error: error.message 
      });
    }
  }

  // ======================================================
  // ⚙️ ZONE 3 : WORKFLOW & SAISIE OPÉRATIONNELLE
  // ======================================================

  @Post('bulk-save')
  async bulkSave(@Body() body: any, @Req() req: any) {
    const { values, month, year } = body;
    return this.indicatorsService.saveBulkValues(
      values, 
      parseInt(month), 
      parseInt(year), 
      req.user.U_Role
    );
  }

  @Post('submit/:processId')
  async submit(@Param('processId') processId: string, @Body() body: any) {
    return this.indicatorsService.updateStatus(
      processId, 
      parseInt(body.month), 
      parseInt(body.year), 
      IVStatus.BROUILLON, 
      IVStatus.SOUMIS
    );
  }

  @Post('validate/:processId')
  async validate(@Param('processId') processId: string, @Body() body: any, @Req() req: any) {
    // Seul un ADMIN (comme Pierre Ndiaye) peut valider les données
    if (req.user.U_Role !== 'ADMIN') {
      throw new ForbiddenException("Droits insuffisants. Validation réservée au Responsable Qualité (RQ).");
    }
    return this.indicatorsService.updateStatus(
      processId, 
      parseInt(body.month), 
      parseInt(body.year), 
      IVStatus.SOUMIS, 
      IVStatus.VALIDE
    );
  }

  @Post('reject/:processId')
  async reject(@Param('processId') processId: string, @Body() body: any, @Req() req: any) {
    if (req.user.U_Role !== 'ADMIN') {
      throw new ForbiddenException("Droits insuffisants. Le rejet est réservé au Responsable Qualité (RQ).");
    }
    return this.indicatorsService.updateStatus(
      processId, 
      parseInt(body.month), 
      parseInt(body.year), 
      IVStatus.SOUMIS, 
      IVStatus.BROUILLON
    );
  }

  // ======================================================
  // 🛠️ ZONE 4 : RÉFÉRENTIEL (MODIFICATIONS STRUCTURELLES)
  // ======================================================

  @Post()
  async create(@Body() dto: any, @Req() req: any) {
    if (req.user.U_Role !== 'ADMIN') {
      throw new ForbiddenException("La création d'indicateurs est réservée à l'administrateur de l'instance.");
    }
    return this.indicatorsService.createIndicator(dto, req.user.tenantId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    if (req.user.U_Role !== 'ADMIN') {
      throw new ForbiddenException("La suppression d'indicateurs est réservée à l'administrateur de l'instance.");
    }
    return this.indicatorsService.deleteIndicator(id);
  }
}