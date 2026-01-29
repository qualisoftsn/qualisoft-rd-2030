// File: backend/src/formations/formations.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { FormationsService } from './formations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('formations')
@UseGuards(JwtAuthGuard)
export class FormationsController {
  constructor(private readonly formationsService: FormationsService) {}

  @Get()
  async getAll(@Req() req: any) {
    return this.formationsService.findAll(req.user.tenantId);
  }

  @Get('alerts')
  async getAlerts(@Req() req: any) {
    return this.formationsService.getAlerts(req.user.tenantId);
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    return this.formationsService.create(req.user.tenantId, req.user.U_Id, body);
  }

  @Patch(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.formationsService.update(req.user.tenantId, id, body);
  }

  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    return this.formationsService.remove(req.user.tenantId, id);
  }
}