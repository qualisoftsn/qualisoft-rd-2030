import { Controller, Post, Body, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { ProvisioningService } from './provisioning.service';
import { ProvisioningDto } from './dto/provisioning.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MasterGuard } from '../auth/guards/master.guard';

@Controller('admin/matrix/provisioning')
@UseGuards(JwtAuthGuard, MasterGuard)
export class ProvisioningController {
  constructor(private readonly provisioningService: ProvisioningService) {}

  @Post('initialize')
  @HttpCode(HttpStatus.CREATED)
  async initialize(@Body() data: ProvisioningDto) {
    // On passe directement le DTO qui est maintenant validé et complet
    return await this.provisioningService.initializeNewClient(data);
  }
}