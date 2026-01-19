import { Controller, Get, Post, Body, UseGuards, Req, Param, Patch } from '@nestjs/common';
import { PaqService } from './paq.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Amélioration - Plans d\'Actions (PAQ)')
@Controller('paq')
@UseGuards(JwtAuthGuard)
export class PaqController {
  constructor(private readonly paqService: PaqService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Indicateurs de performance du plan d\'actions global' })
  async getDashboard(@Req() req: any) {
    return this.paqService.getDashboard(req.user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Liste de tous les PAQ par processus' })
  async findAll(@Req() req: any) {
    return this.paqService.findAll(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un PAQ et de ses actions' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.paqService.findOne(id, req.user.tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Ouvrir un nouveau PAQ annuel pour un processus' })
  async create(@Body() data: any, @Req() req: any) {
    return this.paqService.create(data, req.user.tenantId);
  }

  @Patch('action/:id')
  @ApiOperation({ summary: 'Mettre à jour le statut ou les détails d\'une action' })
  async updateAction(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    return this.paqService.updateAction(id, req.user.tenantId, data);
  }
}