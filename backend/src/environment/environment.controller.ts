import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EnvironmentService } from './environment.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Environnement - Suivi ISO 14001')
@Controller('environment')
@UseGuards(JwtAuthGuard)
export class EnvironmentController {
  constructor(private readonly envService: EnvironmentService) {}

  @Post('consumption')
  @ApiOperation({ summary: 'Enregistrer une consommation (Eau, Elec, etc.)' })
  async addConso(@Body() data: any, @Req() req: any) {
    return this.envService.createConsumption(data, req.user.tenantId, req.user.U_Id);
  }

  @Post('waste')
  @ApiOperation({ summary: 'Enregistrer une pesée de déchets' })
  async addWaste(@Body() data: any, @Req() req: any) {
    return this.envService.createWaste(data, req.user.tenantId);
  }

  @Get('impact')
  @ApiOperation({ summary: 'Obtenir le bilan d\'impact mensuel' })
  async getImpact(@Req() req: any, @Query('month') m: string, @Query('year') y: string) {
    return this.envService.getEnvironmentalImpact(req.user.tenantId, parseInt(m), parseInt(y));
  }

  @Post('validate/:month/:year')
  @ApiOperation({ summary: 'Signer officiellement les données du mois (PKI)' })
  async validate(@Param('month') m: string, @Param('year') y: string, @Req() req: any) {
    return this.envService.validateMonth(req.user.tenantId, parseInt(m), parseInt(y), req.user.U_Id);
  }
}