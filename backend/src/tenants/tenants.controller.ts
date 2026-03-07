/**
 * 🛰️ MODULE : TENANTS CONTROLLER (QUALISOFT ELITE)
 * -------------------------------------------------------------------------
 * RÔLE : Point d'accès souverain pour la gestion des instances.
 * FIX : Ajout de la route 'public/list' pour le SAS Login Frontend.
 * RÉVISION : 07 Mars 2026 | 23:00 GMT
 * -------------------------------------------------------------------------
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

  /**
   * 🔓 ROUTE PUBLIQUE : ALIMENTATION DU LOGIN (CRITIQUE)
   * Route : GET /tenants/public/list
   * Rôle : Renvoie uniquement les données non-sensibles pour la liste déroulante.
   * Note : Si tu as un Guard global, ajoute ton décorateur @Public() ici.
   */
  @Get('public/list')
  getPublicTenants() {
    return this.tenantsService.getPublicTenants();
  }

  /** * 🔍 RESOLUTION DE NŒUD
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

  /** 📋 Liste exhaustive des instances (Zone Privée) */
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