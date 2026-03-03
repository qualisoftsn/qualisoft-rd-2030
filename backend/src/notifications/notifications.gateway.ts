/**
 * 🛰️ MODULE : notifications.gateway.ts
 * -------------------------------------------------------------------------
 * RÔLE : Hub de diffusion temps réel (Broadcast Master & Unicast User).
 * RÉVISION : 03 Mars 2026 | 23:50 GMT
 */

import { 
  WebSocketGateway, WebSocketServer, OnGatewayConnection, 
  OnGatewayDisconnect 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

@WebSocketGateway({
  namespace: 'matrix-alerts',
  cors: { origin: '*', credentials: true },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(NotificationsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`[CONNEXION] Terminal raccordé : ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`[DÉCONNEXION] Terminal libéré : ${client.id}`);
  }

  /**
   * 📣 ALERTE GÉNÉRALE (Master)
   */
  broadcastCritical(payload: any) {
    this.server.emit('CRITICAL_EVENT', payload);
  }

  /**
   * 🎯 ALERTE CIBLÉE (User)
   */
  sendToUser(userId: string, payload: any) {
    this.server.emit(`user-notif-${userId}`, payload);
  }
}