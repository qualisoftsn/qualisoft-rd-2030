import { Controller, Get, Patch, Param, UseGuards, Req, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifService: NotificationsService) {}

  /**
   * 📥 RÉCUPÉRER MES ALERTES (DASHBOARD)
   */
  @Get()
  async getMine(@Req() req: any) {
    return this.notifService.getMyNotifications(req.user.U_Id, req.user.tenantId);
  }

  /**
   * ✅ MARQUER UNE ALERTE COMME TRAITÉE
   */
  @Patch(':id/read')
  async markRead(@Param('id') id: string, @Req() req: any) {
    return this.notifService.markAsRead(id, req.user.U_Id);
  }

  /**
   * 🚀 DÉCLENCHER LE SCAN (RESERVÉ ADMIN/RQ)
   */
  @Post('run-scan')
  async triggerScan(@Req() req: any) {
    return this.notifService.runGlobalSurveillance(req.user.tenantId);
  }
}