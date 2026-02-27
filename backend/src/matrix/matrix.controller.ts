/**
 * CHEMIN : /backend/src/matrix/matrix.controller.ts
 * RÔLE : Alignement des routes publiques et administratives.
 */

import { Controller, Get, Post, Body, Param, Logger } from '@nestjs/common';
import { MatrixService } from './matrix.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller() // 🚀 On laisse vide ici pour gérer les préfixes manuellement par groupe de routes
export class MatrixController {
  private readonly logger = new Logger(MatrixController.name);

  constructor(private readonly matrixService: MatrixService) {}

  // ==========================================
  // 🔓 ROUTES PUBLIQUES (Appelées par le Frontend Elite)
  // Chemin final : /api/public/...
  // ==========================================

  @Public()
  @Get('public/tenants')
  async findPublicTenants() {
    this.logger.log("🔓 Accès public au registre des organisations.");
    return await this.matrixService.findPublicTenants();
  }

  @Public()
  @Get('public/tenants/:tenantId/users')
  async findPublicUsers(@Param('tenantId') tenantId: string) {
    this.logger.log(`🔓 Accès public aux utilisateurs du nœud : ${tenantId}`);
    return await this.matrixService.findPublicUsersByTenant(tenantId);
  }

  // ==========================================
  // 🛡️ ROUTES MATRIX ADMIN (Protégées)
  // Chemin final : /api/matrix/...
  // ==========================================

  @Get('matrix/tenants')
  async findAll() {
    this.logger.log("📡 Accès admin au registre global Matrix.");
    return await this.matrixService.findAllTenants();
  }

  @Get('matrix/details/:id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`🔍 Consultation admin du nœud : ${id}`);
    return await this.matrixService.getTenantDetails(id);
  }

  @Post('matrix/:id/impersonate')
  async impersonate(@Param('id') id: string) {
    this.logger.warn(`🎭 Tentative d'incarnation sur le nœud : ${id}`);
    return await this.matrixService.impersonate(id);
  }

  @Post('matrix/tenants/:tenantId/users')
  async createUser(@Param('tenantId') tenantId: string, @Body() userData: any) {
    this.logger.log(`👤 Création admin d'un utilisateur pour le tenant : ${tenantId}`);
    return await this.matrixService.createUserForTenant(tenantId, userData);
  }
}