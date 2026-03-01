/**
 * 🛰️ MODULE : MATRIX CONTROLLER
 * -------------------------------------------------------------------------
 * CHEMIN : /backend/src/matrix/matrix.controller.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Points d'entrée API du Noyau Souverain.
 * DATE : 01 Mars 2026 | HEURE : 23:45 (GMT)
 * -------------------------------------------------------------------------
 */

import { Controller, Get, Param, Logger } from '@nestjs/common';
import { MatrixService } from './matrix.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller() 
export class MatrixController {
  private readonly logger = new Logger(MatrixController.name);

  constructor(private readonly matrixService: MatrixService) {}

  // ==========================================
  // 🌍 ROUTES PUBLIQUES (SANS TOKEN)
  // ==========================================

  @Public()
  @Get('public/tenants')
  async findPublicTenants() {
    this.logger.log('🔓 Extraction du registre public des instances');
    return await this.matrixService.findPublicTenants();
  }

  @Public()
  @Get('public/tenants/:tenantId/users')
  async findPublicUsers(@Param('tenantId') tenantId: string) {
    return await this.matrixService.findPublicUsersByTenant(tenantId);
  }


  // ==========================================
  // 🛡️ ROUTES PROTÉGÉES (CONSOLE MASTER)
  // ==========================================

  @Get('matrix/tenants')
  async findAll() {
    return await this.matrixService.findAllTenants();
  }

  @Get('matrix/details/:id')
  async findOne(@Param('id') id: string) {
    return await this.matrixService.getTenantDetails(id);
  }
}