import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Query, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

/**
 * 🛰️ CONTROLLER NOTIFICATIONS - QUALISOFT ELITE
 * Gère le flux d'alertes en temps réel entre le Noyau PostgreSQL et l'interface.
 */
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * 🚀 CRÉATION : ENREGISTREMENT D'UNE NOUVELLE ALERTE
   * @route POST /api/notifications
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
   * 📥 RÉCUPÉRATION : LISTE DES ALERTES ACTIVES (NON LUES)
   * @route GET /api/notifications/:userId?tenantId=...
   */
  @Get(':userId')
  async getMyNotifs(
    @Param('userId') userId: string, 
    @Query('tenantId') tenantId: string
  ) {
    return this.notificationsService.getMyNotifications(userId, tenantId);
  }

  /**
   * ✅ ACQUITTEMENT : MARQUER UNE ALERTE COMME TRAITÉE
   * @route PATCH /api/notifications/:id/read
   */
  @Patch(':id/read')
  async markRead(
    @Param('id') id: string, 
    @Body('userId') userId: string
  ) {
    // On passe le userId pour sécuriser l'acquittement (Seul le destinataire peut acquitter)
    return this.notificationsService.markAsRead(id, userId);
  }
}