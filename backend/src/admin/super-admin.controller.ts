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
import { ProvisioningDto } from '../admin-matrix/dto/provisioning.dto';

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
   * INITIALISATION D'UN NOUVEAU CLIENT
   * ✅ CORRECTIF : Aligné sur le nouveau ProvisioningDto pour éviter l'erreur de build TS2345
   */
  @Post('activate-tenant')
  @HttpCode(HttpStatus.CREATED)
  async activateTenant(@Body() data: any) {
    // 1. Validation de base pour éviter les crashs
    if (!data.companyName || (!data.admin1Email && !data.email)) {
      throw new BadRequestException("Données minimales manquantes (Nom entreprise ou Email).");
    }

    try {
      this.logger.log(`🚀 Redirection du provisioning vers le nouveau moteur pour : ${data.companyName}`);
      
      /**
       * 🔄 MAPPAGE DE SÉCURITÉ
       * On transforme les données entrantes (anciennes ou nouvelles) 
       * pour satisfaire les exigences du ProvisioningDto.
       */
      const alignedData: ProvisioningDto = {
        companyName: data.companyName,
        ceoName: data.ceoName || "Direction Générale",
        email: data.admin1Email || data.email, // Gère l'ancien champ admin1Email
        adminFirstName: data.adminFirstName || "Admin",
        adminLastName: data.adminLastName || "Principal",
        phone: data.phone || "000000000",
        address: data.address || "Dakar, SN",
        password: data.defaultPassword || data.password || "qs@20252030"
      };

      return await this.provisioningService.initializeNewClient(alignedData);
    } catch (error: any) {
      this.logger.error(`❌ Échec du déploiement [${data.companyName}]: ${error.message}`);
      throw new HttpException(
        error.message || "Erreur lors de la phase de scellage", 
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