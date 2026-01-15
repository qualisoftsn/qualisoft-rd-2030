import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private prisma: PrismaService) {}

  // --- TYPES D'UNITÉS ---
  @Get('org-unit-types')
  getUnitTypes(@Request() req) {
    return this.prisma.orgUnitType.findMany({ where: { tenantId: req.user.tenantId } });
  }

  @Post('org-unit-types')
  createUnitType(@Request() req, @Body() dto: any) {
    return this.prisma.orgUnitType.create({
      data: {
        OUT_Label: dto.OUT_Label,
        tenantId: req.user.tenantId,
      },
    });
  }

  // --- TYPES DE PROCESSUS ---
  @Get('process-types')
  getProcessTypes(@Request() req) {
    return this.prisma.processType.findMany({ where: { tenantId: req.user.tenantId } });
  }

  @Post('process-types')
  createProcessType(@Request() req, @Body() dto: any) {
    return this.prisma.processType.create({
      data: {
        PT_Label: dto.PT_Label,
        PT_Color: dto.PT_Color || '#2563eb',
        tenantId: req.user.tenantId,
      },
    });
  }

  // --- TYPES DE RISQUES ---
  @Get('risk-types')
  getRiskTypes(@Request() req) {
    return this.prisma.riskType.findMany({ where: { tenantId: req.user.tenantId } });
  }

  @Post('risk-types')
  createRiskType(@Request() req, @Body() dto: any) {
    return this.prisma.riskType.create({
      data: {
        RT_Label: dto.RT_Label,
        tenantId: req.user.tenantId,
      },
    });
  }
}