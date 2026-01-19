import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrgUnitDto } from './dto/create-org-unit.dto';
import { UpdateOrgUnitDto } from './dto/update-org-unit.dto';
import { OrgUnitsService } from './org-units.service';

@Controller('org-units')
@UseGuards(JwtAuthGuard)
export class OrgUnitController {
  constructor(private readonly orgUnitsService: OrgUnitsService) {}

  /**
   * ✅ Vérification de rôle sécurisée
   */
  private checkAdmin(role: string) {
    // Correction : On compare des chaînes ou on cast proprement vers l'enum
    const allowedRoles: string[] = [Role.ADMIN, Role.SUPER_ADMIN];
    if (!allowedRoles.includes(role)) {
      throw new ForbiddenException("Accès refusé : Seule l'administration peut configurer la structure.");
    }
  }

  @Post()
  async create(
    @GetUser('U_Role') role: string, 
    @GetUser('tenantId') tid: string, 
    @Body() dto: CreateOrgUnitDto
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
    @Body() dto: UpdateOrgUnitDto
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