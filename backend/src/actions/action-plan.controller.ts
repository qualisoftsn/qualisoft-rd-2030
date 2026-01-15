import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ActionPlanService } from './action-plan.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('action-plan')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActionPlanController {
  constructor(private readonly actionPlanService: ActionPlanService) {}

  @Post()
  @Roles(Role.ADMIN, Role.AUDITEUR)
  async create(@Body() data: any, @Req() req: any) {
    return this.actionPlanService.createFromNC(data, req.user.tenantId, req.user.U_Id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.AUDITEUR)
  async findAll(@Req() req: any) {
    return this.actionPlanService.findAll(req.user.tenantId);
  }
}