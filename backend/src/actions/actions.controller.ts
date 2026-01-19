import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req, Logger } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('actions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActionsController {
  constructor(private readonly actionsService: ActionsService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.actionsService.findAll(req.user.tenantId);
  }

  @Get('me')
  async findMyActions(@Req() req: any) {
    return this.actionsService.findMyActions(req.user.U_Id, req.user.tenantId);
  }

  @Get('overdue')
  async findOverdue(@Req() req: any) {
    return this.actionsService.findOverdue(req.user.tenantId);
  }

  @Post()
  @Roles(Role.ADMIN, Role.AUDITEUR, Role.SAFETY_OFFICER)
  async create(@Body() data: any, @Req() req: any) {
    return this.actionsService.create(data, req.user.tenantId, req.user.U_Id);
  }

  @Post('from-reclamation/:id')
  async createFromReclamation(@Param('id') id: string, @Req() req: any) {
    return this.actionsService.createFromReclamation(id, req.user.tenantId, req.user.U_Id);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }, @Req() req: any) {
    return this.actionsService.updateStatus(id, body.status, req.user.tenantId);
  }

  @Patch(':id/deadline')
  @Roles(Role.ADMIN)
  async updateDeadline(@Param('id') id: string, @Body('deadline') deadline: string, @Req() req: any) {
    return this.actionsService.updateDeadline(id, req.user.tenantId, new Date(deadline));
  }
}