/**
 * CHEMIN : /backend/src/admin-matrix/admin-matrix.controller.ts
 * RÔLE : Contrôleur Souverain pour la gestion des Tenants (Matrix).
 */
import { 
  Controller, Get, Post, Param, Body, UseGuards, 
  HttpStatus, HttpCode, Logger 
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// Assure-toi que ce Guard existe et fonctionne, sinon utilise RolesGuard
import { RolesGuard } from '../auth/guards/roles.guard'; 
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service'; 
import { ProvisioningService } from './provisioning.service';
import { ProvisioningDto } from './dto/provisioning.dto';

@Controller('admin/matrix')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN) // Sécurité renforcée
export class AdminMatrixController {
  private readonly logger = new Logger(AdminMatrixController.name);

  constructor(
    private readonly adminService: AdminService,
    private readonly provisioningService: ProvisioningService
  ) {}

  /**
   * 🛰️ ROUTE RACINE : LISTE DES TENANTS
   * GET /api/admin/matrix
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getMatrixRoot() {
    this.logger.log("🔍 [MATRIX] Lecture du registre global");
    return await this.adminService.findAllTenants();
  }

  /**
   * DÉTAILS D'UN NŒUD SPÉCIFIQUE
   * GET /api/admin/matrix/details/:tenantId
   */
  @Get('details/:tenantId')
  @HttpCode(HttpStatus.OK)
  async getTenantDetails(@Param('tenantId') tenantId: string) {
    return await this.provisioningService.getTenantDetails(tenantId);
  }

  /**
   * ENRÔLEMENT D'UN NOUVEAU COLLABORATEUR
   * POST /api/admin/matrix/tenants/:tenantId/users
   */
  @Post('tenants/:tenantId/users')
  @HttpCode(HttpStatus.CREATED)
  async createCollaborator(
    @Param('tenantId') tenantId: string, 
    @Body() userData: { 
      email: string; 
      firstName: string; 
      lastName: string; 
      role?: string; 
      password?: string 
    }
  ) {
    return await this.provisioningService.createUser(tenantId, userData);
  }

  /**
   * PROTOCOLE D'INCARNATION (IMPERSONATION)
   * POST /api/admin/matrix/impersonate/:tenantId
   */
  @Post('impersonate/:tenantId')
  @HttpCode(HttpStatus.OK)
  async impersonate(@Param('tenantId') tenantId: string) {
    return await this.provisioningService.generateImpersonationToken(tenantId);
  }

  /**
   * INITIALISATION D'UN NOUVEAU NŒUD (DEPLOY)
   * POST /api/admin/matrix/initialize
   */
  @Post('initialize')
  @HttpCode(HttpStatus.CREATED)
  async initialize(@Body() payload: ProvisioningDto) {
    this.logger.log(`🚀 [MATRIX] Initialisation nœud : ${payload.companyName}`);
    return await this.provisioningService.initializeNewClient(payload);
  }
}