/**
 * 🛰️ CONTROLEUR MATRIX - QUALISOFT ELITE RD 2030
 * RÔLE : Pilotage souverain des nœuds territoriaux et des identités.
 * VERSION : 3.1.0 (Intégration Update Souverain)
 */

import { 
  Controller, Get, Post, Patch, Param, Body, UseGuards, 
  HttpStatus, HttpCode, Logger, Req 
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard'; 
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

import { AdminService } from './admin.service'; 
import { MatrixProvisioningService } from './matrix-provisioning.service';
import { ProvisioningDto } from './dto/provisioning.dto';

@Controller('admin/matrix')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
export class AdminMatrixController {
  private readonly logger = new Logger(AdminMatrixController.name);

  constructor(
    private readonly adminService: AdminService,
    private readonly provisioningService: MatrixProvisioningService
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getMatrixRoot() {
    return await this.adminService.findAllTenants();
  }

  @Get('details/:tenantId')
  @HttpCode(HttpStatus.OK)
  async getTenantDetails(@Param('tenantId') tenantId: string) {
    return await this.adminService.getTenantFullDetails(tenantId);
  }

  @Post('initialize')
  @HttpCode(HttpStatus.CREATED)
  async initialize(@Body() payload: ProvisioningDto) {
    this.logger.log(`🚀 [MATRIX] Initialisation nœud : ${payload.companyName}`);
    return await this.provisioningService.initializeNewTenant(payload);
  }

  @Post('impersonate/:tenantId')
  @HttpCode(HttpStatus.OK)
  async impersonate(@Param('tenantId') tenantId: string) {
    return await this.adminService.generateImpersonationToken(tenantId);
  }

  @Post('tenants/:tenantId/users')
  @HttpCode(HttpStatus.CREATED)
  async createCollaborator(@Param('tenantId') tenantId: string, @Body() userData: any) {
    return await this.adminService.createExternalUser(tenantId, userData);
  }

  @Patch('users/:userId')
  @HttpCode(HttpStatus.OK)
  async updateUserSovereign(
    @Param('userId') userId: string, 
    @Body() payload: any,
    @Req() req: any
  ) {
    this.logger.log(`⚡ Modification souveraine sur l'utilisateur ${userId}`);
    return await this.adminService.updateUserSovereign(userId, payload, req.user);
  }
}