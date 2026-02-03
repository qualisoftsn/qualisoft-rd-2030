import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { FormationsService } from './formations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateFormationDto } from './dto/create-formation.dto';
import { UpdateFormationDto } from './dto/update-formation.dto';

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
  async create(@Req() req: any, @Body() dto: CreateFormationDto) {
    // On passe le tenantId et l'U_Id (créateur) au service
    return this.formationsService.create(req.user.tenantId, req.user.U_Id, dto);
  }

  @Patch(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateFormationDto) {
    return this.formationsService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    return this.formationsService.remove(req.user.tenantId, id);
  }
}