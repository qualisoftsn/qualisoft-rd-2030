import { Controller, Get, Post, Body, Patch, Param, Query, Delete, UseGuards, Req, Res } from '@nestjs/common';
import { SseService } from './sse.service';
import { SseExportService } from './sse-export.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response } from 'express';

@Controller('sse')
@UseGuards(JwtAuthGuard)
export class SseController {
  constructor(
    private readonly sseService: SseService,
    private readonly exportService: SseExportService
  ) {}

  @Post()
  create(@Body() createDto: any, @Req() req: any) {
    return this.sseService.create(createDto, req.user.tenantId, req.user.U_Id);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.sseService.findAll(req.user.tenantId);
  }

  @Get('stats/global')
  getGlobalStats(@Req() req: any) {
    return this.sseService.getGlobalStats(req.user.tenantId);
  }

  @Get('export/exposition/:userId')
  async exportExposition(@Param('userId') userId: string, @Req() req: any, @Res() res: Response) {
    const buffer = await this.exportService.generateExpositionPDF(userId, req.user.tenantId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=Exposition_${userId}.pdf`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.sseService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any, @Req() req: any) {
    return this.sseService.update(id, updateDto, req.user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.sseService.remove(id, req.user.tenantId);
  }
}