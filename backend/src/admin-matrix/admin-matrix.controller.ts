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

  /**
   * 📋 VUE D'ENSEMBLE (REGISTRE GLOBAL)
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getMatrixRoot() {
    return await this.adminService.findAllTenants();
  }

  /**
   * 🔍 DÉTAILS D'UN NŒUD (COCKPIT)
   */
  @Get('details/:tenantId')
  @HttpCode(HttpStatus.OK)
  async getTenantDetails(@Param('tenantId') tenantId: string) {
    return await this.adminService.getTenantFullDetails(tenantId);
  }

  /**
   * 🚀 INITIALISATION NŒUD (BIG BANG)
   * Scellage d'un nouveau tenant avec Site et Admin.
   */
  @Post('initialize')
  @HttpCode(HttpStatus.CREATED)
  async initialize(@Body() payload: ProvisioningDto) {
    this.logger.log(`🚀 [MATRIX] Initialisation nœud : ${payload.companyName}`);
    return await this.provisioningService.initializeNewTenant(payload);
  }

  /**
   * 🎭 IMPERSONATION (TUNNEL D'INCARNATION)
   * Permet au Super Admin de devenir Admin d'un tenant.
   */
  @Post('impersonate/:tenantId')
  @HttpCode(HttpStatus.OK)
  async impersonate(@Param('tenantId') tenantId: string) {
    return await this.adminService.generateImpersonationToken(tenantId);
  }

  /**
   * 👤 ENRÔLEMENT EXTERNE (CRÉATION DIRECTE)
   * Ajout d'un utilisateur dans un tenant spécifique depuis le Cockpit.
   */
  @Post('tenants/:tenantId/users')
  @HttpCode(HttpStatus.CREATED)
  async createCollaborator(@Param('tenantId') tenantId: string, @Body() userData: any) {
    return await this.adminService.createExternalUser(tenantId, userData);
  }

  /**
   * 🔐 ÉDITION SOUVERAINE (UPDATE UTILISATEUR)
   * C'est cette fonction qui manquait pour corriger ton erreur 404/400.
   * Elle permet de modifier le Rôle, l'Email ou le Statut d'un citoyen.
   */
  @Patch('users/:userId')
  @HttpCode(HttpStatus.OK)
  async updateUserSovereign(
    @Param('userId') userId: string, 
    @Body() payload: any,
    @Req() req: any
  ) {
    this.logger.log(`⚡ Modification souveraine sur l'utilisateur ${userId}`);
    // On passe req.user (l'admin connecté) pour vérifier les droits dans le service
    return await this.adminService.updateUserSovereign(userId, payload, req.user);
  }
}