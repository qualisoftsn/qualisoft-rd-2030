import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Logger, 
  HttpCode, 
  HttpStatus, 
  InternalServerErrorException, 
  HttpException 
} from '@nestjs/common';
import { ProvisioningService } from './provisioning.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MasterGuard } from '../auth/guards/master.guard';

/**
 * 🛰️ PROVISIONING CONTROLLER : Qualisoft Elite RD 2030
 * Interface de haute autorité pour le déploiement atomique de Tenants.
 * Route : /api/super-admin/provisioning
 */
@Controller('super-admin/provisioning')
export class ProvisioningController {
  private readonly logger = new Logger(ProvisioningController.name);

  constructor(private readonly provisioningService: ProvisioningService) {}

  /**
   * 🚀 DEPLOY NEW INSTANCE
   * Déclenche la création atomique : Tenant + Site + 2 Admins.
   * Typage strict des entrées pour garantir l'intégrité du scellage.
   */
  @UseGuards(JwtAuthGuard, MasterGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('deploy')
  async deployNewInstance(
    @Body() data: { 
      companyName: string; 
      domain: string; 
      admin1Email: string; 
      admin2Email: string;
      defaultPassword?: string;
    }
  ): Promise<{ success: boolean; tenantId: string; domain: string; message: string }> {
    
    this.logger.log(`--------------------------------------------------------`);
    this.logger.log(`🛰️  REQUÊTE DÉPLOIEMENT : [${data.companyName.toUpperCase()}]`);
    this.logger.log(`🌐 DOMAINE CIBLE       : ${data.domain.toLowerCase()}.qualisoft.sn`);
    this.logger.log(`--------------------------------------------------------`);

    try {
      // Appel au service de provisioning régalien
      const result = await this.provisioningService.initializeNewClient(data);
      
      this.logger.log(`✅ DÉPLOIEMENT RÉUSSI : ID ${result.tenantId}`);
      return result;

    } catch (error: unknown) {
      // Extraction sécurisée du message d'erreur sans 'any'
      const errorMessage = error instanceof Error ? error.message : 'Erreur système inconnue';
      
      this.logger.error(`🚨 ÉCHEC DÉPLOIEMENT : ${errorMessage}`);
      
      // On laisse passer les exceptions HTTP NestJS (Conflict, BadRequest, etc.)
      if (error instanceof HttpException) {
        throw error;
      }
      
      // Erreur générique pour les plantages d'infrastructure
      throw new InternalServerErrorException(
        `Erreur critique lors du provisioning du nœud ${data.companyName}`
      );
    }
  }
}