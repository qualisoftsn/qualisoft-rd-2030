import { 
  Controller, Get, Post, Patch, Delete, Body, 
  Param, UseGuards, Req, Query 
} from '@nestjs/common';
import { GouvernanceService } from './gouvernance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GovernanceType } from '@prisma/client';
import { Request } from 'express';

// Interface pour supprimer le "any" de la requête
interface AuthenticatedRequest extends Request {
  user: {
    tenantId: string;
    U_Email: string;
    U_Id: string;
  };
}

@Controller('gouvernance')
@UseGuards(JwtAuthGuard)
export class GouvernanceController {
  constructor(private readonly govService: GouvernanceService) {}

  @Get('performance')
  async getPerformance(@Req() req: AuthenticatedRequest) {
    // ✅ Corrigé : Utilise govService défini dans le constructeur
    return this.govService.getPerformance(req.user.tenantId);
  }

  @Get('planning')
  async getPlanning(
    @Req() req: AuthenticatedRequest, 
    @Query('type') type?: GovernanceType,
    @Query('processId') processId?: string
  ) {
    // ✅ Corrigé : Ordre des arguments aligné sur le service
    return this.govService.getPlanning(req.user.tenantId, type, processId);
  }

  @Get('auditors')
  async getAuditors(@Req() req: AuthenticatedRequest) {
    return this.govService.getAvailableAuditors(req.user.tenantId);
  }

  @Post('planning')
  async create(@Req() req: AuthenticatedRequest, @Body() dto: any) {
    return this.govService.createActivity(req.user.tenantId, dto);
  }

  @Patch('planning/:id')
  async update(
    @Param('id') id: string, 
    @Req() req: AuthenticatedRequest, 
    @Body() dto: any
  ) {
    return this.govService.updateActivity(id, req.user.tenantId, dto);
  }

  @Delete('planning/:id')
  async delete(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.govService.deleteActivity(id, req.user.tenantId);
  }
}