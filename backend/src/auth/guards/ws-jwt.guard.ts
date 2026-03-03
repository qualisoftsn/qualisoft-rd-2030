/**
 * 🛰️ MODULE : ws-jwt.guard.ts
 * -------------------------------------------------------------------------
 * RÔLE : Protection des tunnels WebSockets par validation du Sceau JWT.
 * RÉVISION : 03 Mars 2026 | 23:45 GMT
 */

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      // Extraction du token depuis le handshake (auth)
      const token = client.handshake.auth?.token;

      if (!token) throw new WsException('Jeton Matrix manquant.');

      const payload = await this.jwtService.verifyAsync(token);
      client['user'] = payload; // Injection de l'utilisateur dans le client socket
      
      return true;
    } catch (err) {
      throw new WsException('Accès refusé au tunnel souverain.');
    }
  }
}