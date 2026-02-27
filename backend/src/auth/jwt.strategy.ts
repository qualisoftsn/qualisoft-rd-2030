/**
 * 🛰️ JWT STRATEGY - QUALISOFT ELITE RD 2030
 * RÔLE : Extraction et validation du jeton pour sécuriser les routes API.
 */

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthPayload } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error("🚨 ERREUR CRITIQUE : JWT_SECRET n'est pas défini dans l'environnement.");
    }

    super({
      // Extrait le token du header 'Authorization: Bearer <token>'
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  /**
   * 🛡️ VALIDATION DU PAYLOAD
   * Cette méthode est appelée automatiquement par Passport après le déchiffrement du JWT.
   * Elle injecte l'objet retourné dans 'req.user'.
   */
  async validate(payload: any): Promise<AuthPayload> {
    // Vérification de l'existence des données minimales dans le jeton
    if (!payload.U_Email || !payload.tenantId) {
      throw new UnauthorizedException('Jeton de sécurité incomplet ou corrompu.');
    }

    // 🚩 RETOUR DU PAYLOAD SCELLÉ (Doit correspondre à l'interface AuthPayload)
    return {
      U_Id: payload.U_Id || payload.sub,
      U_Email: payload.U_Email,
      U_Role: payload.U_Role,
      tenantId: payload.tenantId,
      U_TenantDomain: payload.U_TenantDomain || 'elite',
      assignedProcessId: payload.assignedProcessId || null,
    };
  }
}