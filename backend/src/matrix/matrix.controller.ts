/**
 * CHEMIN ABSOLU : /backend/src/matrix/matrix.controller.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Pilotage administratif du Cockpit Master et accès publics.
 */

import { Controller, Get, Post, Body, Param, Logger } from '@nestjs/common';
import { MatrixService } from './matrix.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('admin/matrix')
export class MatrixController {
  private readonly logger = new Logger(MatrixController.name);

  constructor(private readonly matrixService: MatrixService) {}

  /**
   * 📋 RÉCUPÉRATION GLOBALE (COCKPIT MASTER)
   */
  @Get('tenants')
  async findAll() {
    this.logger.log("📡 Accès au registre global des nœuds Matrix.");
    return await this.matrixService.findAllTenants();
  }

  /**
   * 🔍 DÉTAILS D'UN NŒUD SPÉCIFIQUE
   */
  @Get('details/:id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`🔍 Consultation du nœud : ${id}`);
    return await this.matrixService.getTenantDetails(id);
  }

  /**
   * 🎭 PONT D'INCARNATION (PRISE DE CONTRÔLE)
   * ✅ NOUVEAU : Rétablit le lien rompu.
   */
  @Post(':id/impersonate')
  async impersonate(@Param('id') id: string) {
    this.logger.warn(`🎭 Tentative d'incarnation sur le nœud : ${id}`);
    return await this.matrixService.impersonate(id);
  }

  /**
   * 👤 ENRÔLEMENT COLLABORATEUR DEPUIS LE COCKPIT
   * ✅ NOUVEAU : Permet de sceller un utilisateur dans un tenant spécifique.
   */
  @Post('tenants/:tenantId/users')
  async createUser(@Param('tenantId') tenantId: string, @Body() userData: any) {
    this.logger.log(`👤 Nouvel enrôlement requis pour le tenant : ${tenantId}`);
    return await this.matrixService.createUserForTenant(tenantId, userData);
  }

  /**
   * 🔓 ROUTES PUBLIQUES (Login Cascade)
   */
  @Public()
  @Get('public/tenants')
  async findPublicTenants() {
    this.logger.log("🔓 Accès public au registre des organisations.");
    return await this.matrixService.findPublicTenants();
  }

  @Public()
  @Get('public/tenants/:tenantId/users')
  async findPublicUsers(@Param('tenantId') tenantId: string) {
    this.logger.log(`🔓 Accès public aux citoyens du nœud : ${tenantId}`);
    return await this.matrixService.findPublicUsersByTenant(tenantId);
  }
}