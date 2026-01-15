import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { GouvernanceService } from './gouvernance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GovernanceType } from '@prisma/client';

@Controller('gouvernance')
@UseGuards(JwtAuthGuard)
export class GouvernanceController {
  constructor(private readonly service: GouvernanceService) {}

  @Get('planning')
  async getPlanning(@Req() req: any, @Query('type') type?: GovernanceType) {
    // ✅ Correspond maintenant à la signature (tenantId, processId, type)
    return this.service.getPlanning(req.user.tenantId, undefined, type);
  }

  @Get('auditors')
  async getAuditors(@Req() req: any) {
    return this.service.getAvailableAuditors(req.user.tenantId);
  }

  @Post('activities')
  async create(@Req() req: any, @Body() dto: any) {
    return this.service.createActivity(req.user.tenantId, dto);
  }

  @Patch('activities/:id')
  async update(@Param('id') id: string, @Req() req: any, @Body() dto: any) {
    return this.service.updateActivity(id, req.user.tenantId, dto);
  }
}