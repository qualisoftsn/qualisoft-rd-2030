/**
 * 🛡️ MODULE : JwtStrategy.ts (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Validation du porteur de jeton et extraction du contexte Matrix.
 * FONCTION : Extraction du JWT depuis le Cookie HTTP-Only ou le Header Bearer.
 * RÉVISION : 04 Mars 2026 | 18:46 GMT
 * -------------------------------------------------------------------------
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Role } from '../types/elite-sde';
import { AuthPayload } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error("🚨 CRITIQUE : 'JWT_SECRET' est introuvable dans le Kernel.");
    }

    super({
      // 📡 Extracteur Hybride SDE : Cherche d'abord dans le cookie sécurisé, puis dans le Header Auth
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let data = request?.cookies['access_token'];
          if (!data) {
            data = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
          }
          return data;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any): Promise<AuthPayload> {
    if (!payload.U_Id || !payload.tenantId) {
      throw new UnauthorizedException('Jeton corrompu : Métadonnées Matrix manquantes.');
    }

    if (payload.U_Role === Role.SUPER_ADMIN || payload.U_Role === 'SUPER_ADMIN') {
      return {
        U_Id: payload.U_Id,
        U_Email: payload.U_Email || 'master@qualisoft.sn',
        U_Role: Role.SUPER_ADMIN,
        tenantId: payload.tenantId,
        U_TenantDomain: payload.U_TenantDomain || 'matrix',
        assignedProcessId: null
      };
    }

    if (!payload.U_TenantDomain) {
      throw new UnauthorizedException('Domaine Matrix manquant dans le protocole de sécurité.');
    }

    return {
      U_Id: payload.U_Id,
      U_Email: payload.U_Email,
      tenantId: payload.tenantId,
      U_TenantDomain: payload.U_TenantDomain,
      U_Role: payload.U_Role as Role,
      assignedProcessId: payload.assignedProcessId || null
    };
  }
}