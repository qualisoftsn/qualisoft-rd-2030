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

@Controller('super-admin/provisioning')
// ✅ CETTE CLASSE DOIT EXISTER DANS CE FICHIER
export class ProvisioningController {
  private readonly logger = new Logger(ProvisioningController.name);

  constructor(private readonly provisioningService: ProvisioningService) {}

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post('deploy')
  @HttpCode(HttpStatus.CREATED)
  async deployNewInstance(@Body() data: any) {
    this.logger.log(`🚀 Tentative de déploiement : ${data.domain}`);
    try {
      return await this.provisioningService.initializeNewClient(data);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Erreur lors du provisioning.");
    }
  }
}