import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ForbiddenException } from '@nestjs/common';
import { OrgUnitsService } from './org-units.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Role } from '@prisma/client';

@Controller('org-units')
@UseGuards(JwtAuthGuard)
export class OrgUnitController {
  constructor(private readonly orgUnitsService: OrgUnitsService) {}

  /**
   * ✅ Vérification de rôle centralisée
   */
  private checkAdmin(role: string) {
    const allowedRoles: string[] = [Role.ADMIN, Role.SUPER_ADMIN];
    if (!allowedRoles.includes(role)) {
      throw new ForbiddenException("Accès refusé : Seule l'administration peut configurer la structure.");
    }
  }

  @Post()
  async create(
    @GetUser('U_Role') role: string, 
    @GetUser('tenantId') tid: string, 
    @Body() dto: any
  ) {
    this.checkAdmin(role);
    return this.orgUnitsService.create(tid, dto);
  }

  @Get()
  async findAll(@GetUser('tenantId') tid: string) {
    return this.orgUnitsService.findAll(tid);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @GetUser('U_Role') role: string, 
    @GetUser('tenantId') tid: string, 
    @Body() dto: any
  ) {
    this.checkAdmin(role);
    return this.orgUnitsService.update(id, tid, dto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string, 
    @GetUser('U_Role') role: string, 
    @GetUser('tenantId') tid: string
  ) {
    this.checkAdmin(role);
    return this.orgUnitsService.remove(id, tid);
  }
}