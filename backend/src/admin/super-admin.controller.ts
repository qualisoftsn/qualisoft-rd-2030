import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  Logger, 
  HttpStatus, 
  HttpCode, 
  HttpException, 
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException 
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MasterGuard } from '../auth/guards/master.guard';
import { ProvisioningService } from './provisioning.service';
import { AdminService } from './admin.service';
import { UpdateTenantDto } from './dto/update-tenant.dto';

/**
 * 🏛️ SUPER ADMIN CONTROLLER
 * Centre de commandement souverain pour la Matrix Qualisoft RD-2030.
 * Ce contrôleur pilote l'intégralité des instances (Tenants).
 */
@Controller('admin/super-admin')
@UseGuards(JwtAuthGuard, MasterGuard)
export class SuperAdminController {
  private readonly logger = new Logger(SuperAdminController.name);

  constructor(
    private readonly provisioningService: ProvisioningService,
    private readonly adminService: AdminService
  ) {}

  /**
   * 📡 SYSTEM HEALTH
   */
  @Get('health-check')
  async checkSystem() {
    return { 
      status: 'Elite Sovereign Engine Online', 
      timestamp: new Date().toISOString(),
      node: 'Dakar-Alpha' 
    };
  }

  /**
   * 📊 MATRIX SYNC : Récupère tous les tenants du cluster
   */
  @Get('tenants')
  async getAllTenants() {
    try {
      this.logger.log('Extraction de la Matrix des instances...');
      return await this.adminService.findAllTenants();
    } catch (error) {
      this.logger.error(`Erreur lors de la lecture des tenants: ${error.message}`);
      throw new InternalServerErrorException("Impossible de synchroniser la Matrix.");
    }
  }

  /**
   * 🏗️ PROVISIONING : Déploiement d'une nouvelle instance (ex: SAGAM)
   * Correction des lignes 52 et 53 : Alignement strict sur l'interface du service.
   */
  @Post('activate-tenant')
  @HttpCode(HttpStatus.CREATED)
  async activateTenant(@Body() data: { companyName: string; adminEmail: string; domain: string }) {
    if (!data.companyName || !data.adminEmail) {
      throw new BadRequestException("Le protocole d'activation requiert un nom et un email valides.");
    }

    try {
      this.logger.log(`🚀 Lancement du provisioning pour : ${data.companyName}`);
      
      // ✅ APPEL NOM ABSOLU : initializeNewClient
      // On passe l'objet complet attendu par le service
      return await this.provisioningService.initializeNewClient({
        companyName: data.companyName,
        adminEmail: data.adminEmail,
        domain: data.domain,          // Ligne 52 : Corrigée
        defaultPassword: "qs@20252030" // Ligne 53 : Corrigée
      });
    } catch (error) {
      this.logger.error(`Échec du déploiement [${data.companyName}]: ${error.message}`);
      throw new HttpException(
        error.message || "Erreur lors du provisioning de l'instance", 
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * ✍️ UPDATE : Modification d'une instance existante
   */
  @Patch('tenants/:id')
  async updateTenant(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    try {
      this.logger.log(`Mise à jour des protocoles pour le tenant ID : ${id}`);
      return await this.adminService.updateTenant(id, dto);
    } catch (error) {
      this.logger.error(`Erreur update tenant ${id}: ${error.message}`);
      throw new NotFoundException("Instance introuvable ou mise à jour impossible.");
    }
  }

  /**
   * 🗑️ PURGE : Suppression définitive d'un tenant et de ses nœuds
   */
  @Delete('tenants/:id')
  async deleteTenant(@Param('id') id: string) {
    try {
      this.logger.warn(`⚠️ PURGE SYSTÈME lancée pour le tenant ID : ${id}`);
      await this.adminService.deleteTenant(id);
      return { 
        success: true, 
        message: "Instance et données associées purgées avec succès." 
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la purge du tenant ${id}: ${error.message}`);
      throw new InternalServerErrorException("Échec de la purge de l'instance.");
    }
  }

  /**
   * 🔐 IMPERSONATION : Autorité souveraine sur un tenant
   * Permet d'accéder à l'interface client pour support technique.
   */
  @Post('impersonate/:tenantId')
  async impersonate(@Param('tenantId') tenantId: string) {
    this.logger.warn(`🔑 Transfert d'autorité vers le tenant : ${tenantId}`);
    try {
      // ✅ APPEL NOM ABSOLU : generateImpersonationToken
      return await this.provisioningService.generateImpersonationToken(tenantId);
    } catch (error) {
      this.logger.error(`Échec de l'impersonation : ${error.message}`);
      throw new UnauthorizedException("Autorité souveraine refusée pour cette instance.");
    }
  }
}