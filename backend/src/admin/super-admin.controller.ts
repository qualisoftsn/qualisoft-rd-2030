import { Body, Controller, Post, UseGuards, Logger, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ProvisioningService } from './provisioning.service';

@Controller('super-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SuperAdminController {
  private readonly logger = new Logger(SuperAdminController.name);

  constructor(private readonly provisioningService: ProvisioningService) {}

  /**
   * ⚡ ACTIVATION D'UNE INSTANCE CLIENT
   * Déclenche le provisioning (Tenant, Site, Admin)
   */
  @Post('activate-tenant')
  @Roles('SUPER_ADMIN') // Uniquement pour Abdoulaye (Qualisoft Master)
  async activateTenant(@Body() data: { companyName: string; adminEmail: string; domain: string }) {
    this.logger.log(`🏗️ Activation manuelle de l'instance : ${data.companyName}`);
    return this.provisioningService.initializeNewClient({
      ...data,
      defaultPassword: "qs@20252030" // Mot de passe par défaut pour le premier accès
    });
  }

  @Get('health-check')
  @Roles('SUPER_ADMIN')
  async checkSystem() {
    return { status: 'Elite System Online', timestamp: new Date().toISOString() };
  }
}