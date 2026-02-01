import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ConsumptionsService } from './consumptions.service';
import { CreateConsumptionDto } from './dto/create-consumption.dto';
import { UpdateConsumptionDto } from './dto/update-consumption.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Environment - Consumptions')
@Controller('consumptions')
@UseGuards(JwtAuthGuard)
export class ConsumptionsController {
  constructor(private readonly consumptionsService: ConsumptionsService) {}

  @Post()
  create(@Body() createDto: CreateConsumptionDto, @Req() req: any) {
    return this.consumptionsService.create(createDto, req.user.tenantId);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.consumptionsService.findAll(req.user.tenantId);
  }

  @Get('dashboard')
  getDashboard(@Req() req: any) {
    return this.consumptionsService.getDashboardData(req.user.tenantId);
  }

  @Get('alerts')
  getAlerts(@Req() req: any) {
    return this.consumptionsService.getAlerts(req.user.tenantId);
  }

  @Get('stats/:period')
  getStats(@Param('period') period: string, @Req() req: any) {
    const validPeriod = period.toUpperCase() as 'MONTH' | 'QUARTER' | 'YEAR';
    return this.consumptionsService.getStats(req.user.tenantId, validPeriod);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.consumptionsService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateConsumptionDto, @Req() req: any) {
    return this.consumptionsService.update(id, updateDto, req.user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.consumptionsService.remove(id, req.user.tenantId);
  }
}