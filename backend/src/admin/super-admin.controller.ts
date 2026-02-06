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

  @Post('activate-tenant')
  @HttpCode(HttpStatus.CREATED)
  async activateTenant(@Body() data: { companyName: string; adminEmail: string; domain: string }) {
    if (!data.companyName || !data.adminEmail) {
      throw new BadRequestException("Données incomplètes.");
    }
    try {
      return await this.provisioningService.initializeNewClient({
        companyName: data.companyName,
        adminEmail: data.adminEmail,
        domain: data.domain,
        defaultPassword: "qs@20252030"
      });
    } catch (error: any) {
      this.logger.error(`Échec du déploiement [${data.companyName}]: ${error.message}`);
      throw new HttpException(
        error.message || "Erreur provisioning", 
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