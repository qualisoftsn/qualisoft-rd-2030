import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { RisksService } from './risks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('risks')
@UseGuards(JwtAuthGuard)
export class RisksController {
  constructor(private readonly risksService: RisksService) {}

  @Get('heatmap')
  async getHeatmap(@Req() req: any, @Query('processusId') pid?: string) {
    return this.risksService.getHeatmapData(req.user.tenantId, pid);
  }

  @Post()
  async create(@Body() data: any, @Req() req: any) {
    return this.risksService.create(data, req.user.tenantId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    return this.risksService.update(id, req.user.tenantId, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.risksService.remove(id, req.user.tenantId);
  }
}