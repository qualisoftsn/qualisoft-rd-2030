import { Controller, Get, Post, Patch, Param, Body, UseGuards, Req, Query } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateAlertDto } from './dto/create-alert.dto';

@Controller('alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  findAll(@Req() req: any, @Query() query: any) {
    return this.alertsService.getAlerts(req.user.tenantId, {
      status: query.status,
      priority: query.priority,
      type: query.type
    });
  }

  @Get('stats')
  getStats(@Req() req: any) {
    return this.alertsService.getAlertStats(req.user.tenantId);
  }

  @Post()
  create(@Body() dto: CreateAlertDto, @Req() req: any) {
    return this.alertsService.createAlert(dto, req.user.tenantId);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Req() req: any) {
    return this.alertsService.markAsRead(id, req.user.U_Id);
  }

  @Patch(':id/acknowledge')
  acknowledge(@Param('id') id: string, @Body() body: { comment?: string }, @Req() req: any) {
    return this.alertsService.acknowledgeAlert(id, req.user.U_Id, body.comment);
  }

  @Get('unread/count')
  getUnreadCount(@Req() req: any) {
    return this.alertsService.getAlerts(req.user.tenantId, { status: 'UNREAD' }).then(alerts => ({
      count: alerts.length
    }));
  }
}