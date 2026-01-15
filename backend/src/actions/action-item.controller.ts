import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('action-items')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActionItemController {
  constructor(private readonly actionsService: ActionsService) {} // Injection confirmée

  @Post()
  @Roles(Role.ADMIN, Role.AUDITEUR, Role.SAFETY_OFFICER)
  async create(@Body() data: any, @Req() req: any) {
    // req.user contient tenantId et U_Id via le JwtAuthGuard
    return this.actionsService.create(data, req.user.tenantId, req.user.U_Id);
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.actionsService.findAll(req.user.tenantId);
  }
}