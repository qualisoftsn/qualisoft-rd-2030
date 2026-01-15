import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { NcService } from './nc.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('audits/nc')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NcController { // Nom exact attendu par AuditsModule
  constructor(private readonly ncService: NcService) {}

  @Post()
  @Roles(Role.ADMIN, Role.AUDITEUR)
  async create(@Body() dto: any, @Req() req: any) {
    // Utilisation de tenantId et U_Id pour la traçabilité
    return this.ncService.create(dto, req.user.tenantId, req.user.U_Id);
  }
}