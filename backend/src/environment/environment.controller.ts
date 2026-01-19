import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EnvironmentService } from './environment.service';

@Controller('environment')
@UseGuards(JwtAuthGuard)
export class EnvironmentController {
  constructor(private readonly envService: EnvironmentService) {}

  @Post('consumption')
  async addConso(@Body() data: any, @Req() req: any) {
    return this.envService.createConsumption(data, req.user.tenantId, req.user.U_Id);
  }

  @Post('waste')
  async addWaste(@Body() data: any, @Req() req: any) {
    return this.envService.createWaste(data, req.user.tenantId);
  }

  @Get('impact')
  async getImpact(@Req() req: any, @Query('month') m: string, @Query('year') y: string) {
    return this.envService.getEnvironmentalImpact(req.user.tenantId, parseInt(m), parseInt(y));
  }

  @Post('validate/:month/:year')
  async validate(@Param('month') m: string, @Param('year') y: string, @Req() req: any) {
    return this.envService.validateMonth(req.user.tenantId, parseInt(m), parseInt(y), req.user.U_Id);
  }
}