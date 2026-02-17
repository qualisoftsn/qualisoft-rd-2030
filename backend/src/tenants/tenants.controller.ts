/**
 * 🛰️ TENANTS CONTROLLER - QUALISOFT ELITE
 * RÔLE : Point d'accès souverain pour la gestion des instances.
 */

import { 
  Controller, Get, Post, Body, Patch, Param, Delete, Query 
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  /** * 🔍 RESOLUTION DE NŒUD (CRITIQUE)
   * Appelée par le TenantProvider du Frontend pour charger l'identité du client.
   * Route : GET /tenants/config/:slug
   */
  @Get('config/:slug')
  async getConfig(@Param('slug') slug: string) {
    return this.tenantsService.getConfigBySlug(slug);
  }

  /** 📈 Statistiques Globales Matrix */
  @Get('stats')
  getGlobalStats() {
    return this.tenantsService.getGlobalStats();
  }

  /** 📊 Métriques SMI individuelles (§9.1) */
  @Get(':id/statistics')
  getTenantStats(@Param('id') id: string) {
    return this.tenantsService.getTenantStats(id);
  }

  /** 📋 Liste exhaustive des instances de la Fédération */
  @Get()
  findAll(@Query('all') all: string) {
    return this.tenantsService.findAll(all === 'true');
  }

  /** ✅ Phase 1 : Création du Tenant (Scellage) */
  @Post()
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  /** 📝 Mise à jour des propriétés (§8.4) */
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.update(id, dto);
  }

  /** 📁 Archivage (Rétention des données garantie) */
  @Delete(':id')
  archive(@Param('id') id: string) {
    return this.tenantsService.archive(id);
  }
}