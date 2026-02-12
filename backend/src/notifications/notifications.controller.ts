import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  UseGuards, 
  Request, 
  HttpCode, 
  HttpStatus,
  ForbiddenException
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // 🛡️ Assure-toi du chemin

/**
 * 🛰️ CONTROLLER NOTIFICATIONS - QUALISOFT ELITE (PROD READY)
 * Sécurisé par JWT.
 */
@Controller('notifications')
@UseGuards(JwtAuthGuard) // 🔒 TOUTES les routes sont protégées
export class NotificationsController {
  
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * 🚀 CRÉATION (Interne ou via API)
   * Peut être appelée par d'autres services.
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
   * 📥 RÉCUPÉRATION : FLUX PERSONNEL
   * @route GET /api/notifications/me
   * Le Frontend appelle "me", le Backend déduit l'ID du Token.
   */
  @Get('me')
  async getMyNotifs(@Request() req) {
    const userId = req.user.userId; // 👈 Extrait du Token (SÉCURISÉ)
    const tenantId = req.user.tenantId; // Optionnel si tu filtres par tenant

    // On délègue au service sans exposer d'ID dans l'URL
    return this.notificationsService.getMyNotifications(userId, tenantId);
  }

  /**
   * ✅ ACQUITTEMENT TOTAL (NETTOYAGE)
   * @route PATCH /api/notifications/read-all
   */
  @Patch('read-all')
  async markAllAsRead(@Request() req) {
    const userId = req.user.userId;
    return this.notificationsService.markAllAsRead(userId);
  }

  /**
   * ✅ ACQUITTEMENT UNITAIRE
   * @route PATCH /api/notifications/:id/read
   */
  @Patch(':id/read')
  async markRead(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    
    // Le service doit vérifier que la notif appartient bien à cet userId
    return this.notificationsService.markAsRead(id, userId);
  }
}