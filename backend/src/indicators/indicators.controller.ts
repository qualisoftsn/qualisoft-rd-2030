import { Controller, Get, Post, Body, UseGuards, Req, Query, Param, ForbiddenException, BadRequestException } from '@nestjs/common';
import { IndicatorsService } from './indicators.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IVStatus, Role } from '@prisma/client';

@Controller('indicators')
@UseGuards(JwtAuthGuard)
export class IndicatorsController {
  constructor(private readonly indicatorsService: IndicatorsService) {}

  // 🔴 ENDPOINT MANQUANT - Utilisé par la nouvelle page
  @Get('processes-with-values')
  async getProcessesWithValues(
    @Req() req: any, 
    @Query('month') month: string, 
    @Query('year') year: string
  ) {
    return this.indicatorsService.getProcessesWithValues(
      req.user.tenantId, 
      parseInt(month), 
      parseInt(year),
      req.user.U_Id,
      req.user.U_Role
    );
  }

  // 🔴 ENDPOINT MANQUANT - Historique d'un indicateur
  @Get(':id/history')
  async getIndicatorHistory(
    @Param('id') id: string,
    @Req() req: any
  ) {
    return this.indicatorsService.getIndicatorHistory(id, req.user.tenantId);
  }

  // 🔴 ENDPOINT MANQUANT - Sauvegarde individuelle
  @Post('save-value')
  async saveValue(
    @Body() body: { 
      indicatorId: string; 
      month: number; 
      year: number; 
      value: number; 
      comment?: 
      string; 
    }, 
    @Req() req: any
  ) {
    // Vérification des droits et délais
    if (req.user.U_Role !== Role.ADMIN && req.user.U_Role !== Role.SUPER_ADMIN) {
      const today = new Date();
      const currentDay = today.getDate();
      if (currentDay > 10) {
        throw new ForbiddenException("Période de saisie close (du 1er au 10 uniquement)");
      }
    }
    
    return this.indicatorsService.saveSingleValue(
      body.indicatorId,
      parseInt(body.month as any),
      parseInt(body.year as any),
      body.value,
      body.comment,
      req.user.U_Id,
      req.user.tenantId
    );
  }

  // 🔴 ENDPOINT MANQUANT - Soumission processus (nouvelle route pour compatibilité frontend)
  @Post('submit-process/:processId')
  async submitProcess(
    @Param('processId') processId: string,
    @Body() body: { month: number; year: number },
    @Req() req: any
  ) {
    // Vérification: seul le pilote/copilote ou admin peut soumettre
    return this.indicatorsService.submitProcess(
      processId,
      parseInt(body.month as any),
      parseInt(body.year as any),
      req.user.U_Id,
      req.user.tenantId,
      req.user.U_Role
    );
  }

  // === TES ENDPOINTS EXISTANTS (conservés) ===

  @Get('dashboard-stats')
  async getDashboardStats(@Req() req: any) {
    return this.indicatorsService.getDashboardStats(req.user.tenantId, req.user.U_Id, req.user.U_Role);
  }

  @Get('monthly-grid')
  async getGrid(@Req() req: any, @Query('month') m: string, @Query('year') y: string) {
    return this.indicatorsService.getMonthlyDashboard(req.user.tenantId, parseInt(m), parseInt(y));
  }

  @Post('bulk-save')
  async bulkSave(@Body() body: any, @Req() req: any) {
    return this.indicatorsService.saveBulkValues(body.values, parseInt(body.month), parseInt(body.year), req.user.U_Role);
  }

  @Post('submit/:processId')
  async submit(@Param('processId') processId: string, @Body() body: any, @Req() req: any) {
    return this.indicatorsService.updateStatus(processId, parseInt(body.month), parseInt(body.year), IVStatus.SOUMIS, req.user.U_Id, req.user.tenantId);
  }

  @Post('validate/:processId')
  async validate(@Param('processId') processId: string, @Body() body: any, @Req() req: any) {
    if (req.user.U_Role !== Role.ADMIN && req.user.U_Role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException("Validation réservée au Responsable Qualité.");
    }
    return this.indicatorsService.updateStatus(processId, parseInt(body.month), parseInt(body.year), IVStatus.VALIDE, req.user.U_Id, req.user.tenantId);
  }

  @Post()
  async create(@Body() dto: any, @Req() req: any) {
    if (req.user.U_Role !== Role.ADMIN) throw new ForbiddenException("Droits insuffisants.");
    return this.indicatorsService.createIndicator(dto, req.user.tenantId);
  }
}