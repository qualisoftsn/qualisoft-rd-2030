/**
 * 🛰️ MODULE : NotificationsController
 * -------------------------------------------------------------------------
 * RÔLE : Gestion des flux d'alertes personnels et régaliens.
 * SÉCURITÉ : Scellé par JwtAuthGuard (Zéro NextAuth).
 * RÉVISION : 03 Mars 2026 | 23:15 GMT
 * -------------------------------------------------------------------------
 */

import { 
  Controller, Get, Post, Patch, Param, Body, 
  UseGuards, Req, HttpCode, HttpStatus, Logger 
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * 🚀 CRÉATION D'ALERTE
   * Utilisé par les services internes (NC, Audit) pour notifier un utilisateur.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.createNotification(
      dto.userId,
      dto.N_Title,
      dto.N_Message,
      dto.N_Type,
      dto.tenantId
    );
  }

  /**
   * 📥 FLUX PERSONNEL
   * Récupère les notifications non lues de l'utilisateur connecté.
   */
  @Get('me')
  async getMyNotifs(@Req() req) {
    const userId = req.user.U_Id; // Extraction scellée du JWT
    const tenantId = req.user.tenantId;
    return this.notificationsService.getMyNotifications(userId, tenantId);
  }

  /**
   * ✅ ACQUITTEMENT GLOBAL
   */
  @Patch('read-all')
  async markAllAsRead(@Req() req) {
    const userId = req.user.U_Id;
    return this.notificationsService.markAllAsRead(userId);
  }

  /**
   * ✅ ACQUITTEMENT UNITAIRE
   */
  @Patch(':id/read')
  async markRead(@Param('id') id: string, @Req() req) {
    const userId = req.user.U_Id;
    return this.notificationsService.markAsRead(id, userId);
  }
}