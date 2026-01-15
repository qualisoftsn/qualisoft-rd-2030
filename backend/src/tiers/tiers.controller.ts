import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { TiersService } from './tiers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tiers')
@UseGuards(JwtAuthGuard)
export class TiersController {
  constructor(private readonly tiersService: TiersService) {}

  /**
   * ✅ RÉCUPÉRATION DE TOUS LES TIERS
   */
  @Get()
  async findAll(@Req() req: any, @Query('type') type?: string) {
    return this.tiersService.findAll(req.user.tenantId, type);
  }

  /**
   * ✅ NOUVEAU : RÉCUPÉRATION D'UN TIERS SPÉCIFIQUE (VUE 360°)
   * C'est cette route qui manquait et causait l'erreur au clic
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.tiersService.findOne(id, req.user.tenantId);
  }

  /**
   * ✅ CRÉATION
   */
  @Post()
  async create(@Body() data: any, @Req() req: any) {
    return this.tiersService.create(data, req.user.tenantId);
  }

  /**
   * ✅ MISE À JOUR
   */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    return this.tiersService.update(id, req.user.tenantId, data);
  }

  /**
   * ✅ SUPPRESSION
   */
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.tiersService.remove(id, req.user.tenantId);
  }
}