import { 
  Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards 
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  /** ✅ Phase 1 : Création du Tenant seul */
  @Post()
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  /** 📈 Statistiques Globales (Supprime le 404 du dashboard) */
  @Get('stats')
  getGlobalStats() {
    return this.tenantsService.getGlobalStats();
  }

  /** 📋 Liste exhaustive (Inclusion des compteurs) */
  @Get()
  findAll(@Query('all') all: string) {
    return this.tenantsService.findAll(all === 'true');
  }

  /** 📊 Métriques SMI individuelles (Pour le dépliage des cartes) */
  @Get(':id/statistics')
  getTenantStats(@Param('id') id: string) {
    return this.tenantsService.getTenantStats(id);
  }

  /** 📝 Mise à jour des propriétés (§8.4) */
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.update(id, dto);
  }

  /** 📁 Archivage de l'instance (Zéro suppression physique) */
  @Delete(':id')
  archive(@Param('id') id: string) {
    return this.tenantsService.archive(id);
  }
}