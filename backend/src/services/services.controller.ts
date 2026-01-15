import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('services')
@UseGuards(JwtAuthGuard)
export class ServicesController { // Correction du nom
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SAFETY_OFFICER) // INCIDENT_SAFETY -> SAFETY_OFFICER
  async create(@Body() data: any, @Req() req: any) {
    return this.servicesService.create(data, req.user.tenantId);
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.servicesService.findAll(req.user.tenantId);
  }
}