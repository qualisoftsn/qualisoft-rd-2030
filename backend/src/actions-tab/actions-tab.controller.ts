import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ActionsTabService } from './actions-tab.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActionStatus } from '@prisma/client';

@Controller('actions-tab')
@UseGuards(JwtAuthGuard)
export class ActionsTabController {
  constructor(private readonly actionsTabService: ActionsTabService) {}

  @Get()
  async fetchDashboard(
    @Req() req: any, 
    @Query('processId') processId?: string
  ) {
    return this.actionsTabService.getActionsDashboard(req.user.tenantId, processId);
  }

  @Patch(':id/evolve')
  async evolve(
    @Req() req: any, 
    @Param('id') id: string, 
    @Body('status') status: ActionStatus
  ) {
    return this.actionsTabService.evolveAction(req.user.tenantId, id, status);
  }

  @Delete(':id/archive')
  async archive(@Req() req: any, @Param('id') id: string) {
    return this.actionsTabService.sealAction(req.user.tenantId, id, req.user.U_Role);
  }
}