import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common';
import { ProvisioningService } from '../admin-matrix/provisioning.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MasterGuard } from '../auth/guards/master.guard';
import { AdminService } from './admin.service';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Controller('admin/super-admin')
@UseGuards(JwtAuthGuard, MasterGuard)
export class SuperAdminController {
  private readonly logger = new Logger(SuperAdminController.name);

  constructor(
    private readonly provisioningService: ProvisioningService,
    private readonly adminService: AdminService
  ) {}

  @Get('health-check')
  async checkSystem() {
    return { status: 'Elite System Online', timestamp: new Date().toISOString() };
  }

  @Get('tenants')
  async getAllTenants() {
    try {
      return await this.adminService.findAllTenants();
    } catch (error: any) {
      this.logger.error(`Erreur lors de la lecture des tenants: ${error.message}`);
      throw new InternalServerErrorException("Erreur Matrix.");
    }
  }

  /**
   * INITIALISATION D'UN NOUVEAU CLIENT (EX: SAGAM)
   * Mise à jour conforme au schéma multi-admin Qualisoft RD 2030
   */
  @Post('activate-tenant')
  @HttpCode(HttpStatus.CREATED)
  async activateTenant(@Body() data: { 
    companyName: string; 
    admin1Email: string; 
    admin2Email: string; 
    domain: string 
  }) {
    // Validation stricte des données de provisioning
    if (!data.companyName || !data.admin1Email || !data.admin2Email || !data.domain) {
      throw new BadRequestException("Données de provisioning incomplètes (Emails ou Domaine manquants).");
    }

    try {
      this.logger.log(`🚀 Lancement du déploiement pour le domaine : ${data.domain}`);
      
      return await this.provisioningService.initializeNewClient({
        companyName: data.companyName,
        admin1Email: data.admin1Email,
        admin2Email: data.admin2Email,
        domain: data.domain,
        defaultPassword: "qs@20252030" // Mot de passe d'initialisation par défaut
      });
    } catch (error: any) {
      this.logger.error(`❌ Échec du déploiement [${data.companyName}]: ${error.message}`);
      throw new HttpException(
        error.message || "Erreur lors de la phase de provisioning", 
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Patch('tenants/:id')
  async updateTenant(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    try {
      return await this.adminService.updateTenant(id, dto);
    } catch (error: any) {
      this.logger.error(`Erreur update tenant ${id}: ${error.message}`);
      throw new NotFoundException("Instance introuvable.");
    }
  }

  @Delete('tenants/:id')
  async deleteTenant(@Param('id') id: string) {
    try {
      await this.adminService.deleteTenant(id);
      return { success: true };
    } catch (error: any) {
      this.logger.error(`Erreur lors de la purge du tenant ${id}: ${error.message}`);
      throw new InternalServerErrorException("Échec purge.");
    }
  }

  @Post('impersonate/:tenantId')
  async impersonate(@Param('tenantId') tenantId: string) {
    try {
      return await this.provisioningService.generateImpersonationToken(tenantId);
    } catch (error: any) {
      this.logger.error(`Échec de l'impersonation : ${error.message}`);
      throw new UnauthorizedException("Autorité refusée.");
    }
  }
}