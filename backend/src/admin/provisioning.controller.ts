import { 
  Controller, 
  Post, 
  Get,
  Body, 
  UseGuards, 
  Logger, 
  HttpCode, 
  HttpStatus, 
  InternalServerErrorException,
  HttpException
} from '@nestjs/common';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ProvisioningService } from './provisioning.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MasterGuard } from '../auth/guards/master.guard';
import { Plan } from '@prisma/client';

class ProvisioningDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  domain!: string;

  @IsEmail()
  @IsNotEmpty()
  adminEmail!: string;

  @IsEnum(Plan)
  plan!: Plan;
}

@Controller('super-admin/provisioning')
@UseGuards(JwtAuthGuard, MasterGuard)
export class ProvisioningController {
  private readonly logger = new Logger(ProvisioningController.name);

  constructor(private readonly provisioningService: ProvisioningService) {}

  /**
   * LISTER TOUTES LES INSTANCES (MONITORING)
   */
  @Get('tenants')
  async listAllInstances() {
    this.logger.log("🕵️ Super Admin : Consultation de la liste des instances.");
    return this.provisioningService.findAllTenants();
  }

  /**
   * DÉPLOYER UNE NOUVELLE INSTANCE
   */
  @Post('deploy')
  @HttpCode(HttpStatus.CREATED)
  async deployNewInstance(@Body() data: ProvisioningDto) {
    try {
      const result = await this.provisioningService.initializeNewClient(data);
      return { message: "Déploiement réussi.", data: result };
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      const msg = error instanceof Error ? error.message : "Erreur inconnue";
      this.logger.error(`❌ Échec Déploiement : ${msg}`);
      throw new InternalServerErrorException("Erreur lors du provisioning.");
    }
  }
}