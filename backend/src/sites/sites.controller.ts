import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ForbiddenException } from '@nestjs/common';
import { SitesService } from './sites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Role } from '@prisma/client';

@Controller('sites')
@UseGuards(JwtAuthGuard)
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  // 🛡️ Logique de vérification de rôle centralisée
  private checkAdmin(role: Role) {
    const allowedRoles = [Role.ADMIN, Role.SUPER_ADMIN];
    if (!allowedRoles.includes(role as any)) {
      throw new ForbiddenException('Seul l\'administrateur peut configurer les sites de l\'organisation.');
    }
  }

  @Post()
  async create(
    @GetUser('U_Role') role: Role,
    @GetUser('tenantId') tenantId: string, 
    @Body() createSiteDto: any
  ) {
    this.checkAdmin(role);
    return this.sitesService.create(tenantId, createSiteDto);
  }

  @Get()
  async findAll(@GetUser('tenantId') tenantId: string) {
    return this.sitesService.findAll(tenantId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @GetUser('tenantId') tenantId: string
  ) {
    return this.sitesService.findOne(id, tenantId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @GetUser('U_Role') role: Role,
    @GetUser('tenantId') tenantId: string, 
    @Body() updateSiteDto: any
  ) {
    this.checkAdmin(role);
    return this.sitesService.update(id, tenantId, updateSiteDto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @GetUser('U_Role') role: Role,
    @GetUser('tenantId') tenantId: string
  ) {
    this.checkAdmin(role);
    return this.sitesService.remove(id, tenantId);
  }
}