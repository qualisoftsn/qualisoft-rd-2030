import { 
  Controller, Get, Post, Param, Body, UseGuards, 
  HttpStatus, HttpCode, Logger 
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MasterGuard } from '../auth/guards/master.guard';
import { AdminService } from './admin.service'; 
import { ProvisioningService } from './provisioning.service';
import { ProvisioningDto } from './dto/provisioning.dto';

@Controller('admin/matrix')
@UseGuards(JwtAuthGuard, MasterGuard)
export class AdminMatrixController {
  private readonly logger = new Logger(AdminMatrixController.name);

  constructor(
    private readonly adminService: AdminService,
    private readonly provisioningService: ProvisioningService
  ) {}

  /**
   * 🛰️ ROUTE RACINE (Correction 404)
   * Répond à GET /admin/matrix
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getMatrixRoot() {
    return await this.adminService.findAllTenants();
  }

  /**
   * Récupération du registre typé (Alias tenants)
   */
  @Get('tenants')
  @HttpCode(HttpStatus.OK)
  async getMatrixTenants() {
    return await this.adminService.findAllTenants();
  }

  /**
   * Détails d'un nœud spécifique
   */
  @Get('details/:tenantId')
  @HttpCode(HttpStatus.OK)
  async getTenantDetails(@Param('tenantId') tenantId: string) {
    return await this.provisioningService.getTenantDetails(tenantId);
  }

  /**
   * Enrôlement d'un nouveau collaborateur dans un nœud
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
   * Protocole d'incarnation (Prise de contrôle souveraine)
   */
  @Post('impersonate/:tenantId')
  @HttpCode(HttpStatus.OK)
  async impersonate(@Param('tenantId') tenantId: string) {
    return await this.provisioningService.generateImpersonationToken(tenantId);
  }

  /**
   * Initialisation d'un nouveau nœud (Provisioning)
   */
  @Post('initialize')
  @HttpCode(HttpStatus.CREATED)
  async initialize(@Body() payload: ProvisioningDto) {
    return await this.provisioningService.initializeNewClient(payload);
  }
}