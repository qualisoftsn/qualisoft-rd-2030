/**
 * 🛰️ MODULE : AdminMatrixController (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage souverain des nœuds territoriaux.
 * SÉCURITÉ : SUPER_ADMIN Only | JWT Guard (Zéro NextAuth).
 * RÉVISION : 04 Mars 2026 | 18:00 GMT
 * -------------------------------------------------------------------------
 */

import { 
  Controller, Get, Post, Patch, Param, Body, UseGuards, 
  HttpStatus, HttpCode, Logger 
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard'; 
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

import { AdminMatrixService } from './admin-matrix.service'; 
import { MatrixProvisioningService } from './matrix-provisioning.service';
import { ProvisioningDto } from './dto/provisioning.dto';

@Controller('admin/matrix')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
export class AdminMatrixController {
  private readonly logger = new Logger(AdminMatrixController.name);

  constructor(
    private readonly adminService: AdminMatrixService,
    private readonly provisioningService: MatrixProvisioningService
  ) {}

  @Get('tenants')
  async getAllTenants() {
    return this.adminService.findAllTenants();
  }

  @Get('tenants/:tenantId')
  async getDetails(@Param('tenantId') tenantId: string) {
    return this.adminService.getTenantFullDetails(tenantId);
  }

  @Post('provisioning/initialize')
  @HttpCode(HttpStatus.CREATED)
  async initialize(@Body() payload: ProvisioningDto) {
    this.logger.log(`🚀 [MATRIX] Initialisation de nœud demandée.`);
    return this.provisioningService.initializeNewTenant(payload);
  }

  @Post('tenants/:tenantId/impersonate')
  async impersonate(@Param('tenantId') tenantId: string) {
    this.logger.log(`🎭 [SOUVERAINETÉ] Entrée dans le nœud : ${tenantId}`);
    return this.adminService.generateImpersonationToken(tenantId);
  }

  @Patch('users/:userId')
  async updateSovereign(@Param('userId') userId: string, @Body() payload: any) {
    return this.adminService.updateUserSovereign(userId, payload);
  }
}