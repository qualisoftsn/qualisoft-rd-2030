import { Controller, Get, Post, Body, UseGuards, Req, Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto'; // 👈 Import du DTO
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('services')
@UseGuards(JwtAuthGuard)
export class ServicesController {
  private readonly logger = new Logger(ServicesController.name);

  constructor(private readonly servicesService: ServicesService) {}

  /**
   * Créer une nouvelle unité organique (Service, Direction, etc.)
   */
  @Post()
  @Roles(Role.ADMIN, Role.SAFETY_OFFICER)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() createServiceDto: CreateServiceDto, @Req() req: any) {
    const tenantId = req.user.tenantId;
    this.logger.log(`🏗️ Création de l'unité [${createServiceDto.OU_Name}] pour le tenant: ${tenantId}`);
    
    return this.servicesService.create(tenantId, createServiceDto);
  }

  /**
   * Lister toutes les unités du tenant actuel
   */
  @Get()
  async findAll(@Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.servicesService.findAll(tenantId);
  }
}