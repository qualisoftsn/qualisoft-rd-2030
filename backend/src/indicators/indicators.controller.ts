import { Controller, Get, Post, Delete, Body, UseGuards, Req, Query, Param, ForbiddenException, Res, Logger } from '@nestjs/common';
import { IndicatorsService } from './indicators.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IVStatus, Role } from '@prisma/client';

@Controller('indicators')
@UseGuards(JwtAuthGuard)
export class IndicatorsController {
  constructor(private readonly indicatorsService: IndicatorsService) {}

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