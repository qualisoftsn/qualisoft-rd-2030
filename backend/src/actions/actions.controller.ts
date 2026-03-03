/**
 * 🛰️ MODULE : ActionsController
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage des actions d'amélioration et correctives.
 * RÉVISION : 03 Mars 2026 | 05:55 GMT
 */

import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, ActionStatus } from '@prisma/client';

@Controller('actions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActionsController {
  constructor(private readonly actionsService: ActionsService) {}

  @Get()
  async findAll(@Req() req) {
    return this.actionsService.findAll(req.user.tenantId);
  }

  @Get('me')
  async findMyActions(@Req() req) {
    return this.actionsService.findMyActions(req.user.U_Id, req.user.tenantId);
  }

  @Get('overdue')
  async findOverdue(@Req() req) {
    return this.actionsService.findOverdue(req.user.tenantId);
  }

  @Post()
  @Roles(Role.ADMIN, Role.RQ, Role.SAFETY_OFFICER)
  async create(@Body() dto: CreateActionDto, @Req() req) {
    // Utilisation des identifiants extraits du JWT souverain
    return this.actionsService.create(dto, req.user.tenantId, req.user.U_Id);
  }

  @Post('from-reclamation/:id')
  async createFromReclamation(@Param('id') id: string, @Req() req) {
    return this.actionsService.createFromReclamation(id, req.user.tenantId, req.user.U_Id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateActionDto, @Req() req) {
    return this.actionsService.update(id, dto, req.user.tenantId);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: ActionStatus, @Req() req) {
    return this.actionsService.updateStatus(id, status, req.user.tenantId);
  }

  @Patch(':id/deadline')
  @Roles(Role.ADMIN, Role.RQ)
  async updateDeadline(@Param('id') id: string, @Body('deadline') deadline: string, @Req() req) {
    return this.actionsService.updateDeadline(id, req.user.tenantId, new Date(deadline));
  }
}