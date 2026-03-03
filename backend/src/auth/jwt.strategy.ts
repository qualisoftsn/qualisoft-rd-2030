/**
 * 🛡️ MODULE : JwtStrategy.ts
 * -------------------------------------------------------------------------
 * RÔLE : Validation du porteur de jeton et extraction du contexte Matrix.
 * FONCTION : Authentification Bearer + Bypass Master Sovereign.
 * RÉVISION : 03 Mars 2026 | 05:45 GMT
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '../types/elite-sde';
import { AuthPayload } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    // 🔍 RÉCUPÉRATION PRÉALABLE DU SECRET (Fix Erreur L17-22)
    const jwtSecret = configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error("🚨 CRITIQUE : 'JWT_SECRET' est introuvable dans le Kernel.");
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret, // Injection du secret vérifié
    });
  }

  /**
   * 🛂 PROTOCOLE DE VALIDATION
   * Une fois le jeton techniquement valide, on extrait les droits d'accès.
   */
  async validate(payload: any): Promise<AuthPayload> {
    // 1. Vérification de l'intégrité minimale du payload scellé
    if (!payload.U_Id || !payload.tenantId) {
      throw new UnauthorizedException('Jeton corrompu : Métadonnées Matrix manquantes.');
    }

    // 👑 2. GESTION DU BYPASS MASTER (GOD MODE)
    // Si l'utilisateur est SUPER_ADMIN, il franchit les barrières de tenant classiques.
    if (payload.U_Role === Role.SUPER_ADMIN || payload.U_Role === 'SUPER_ADMIN') {
      return {
        U_Id: payload.U_Id,
        U_Email: payload.U_Email || 'master@qualisoft.sn',
        U_Role: Role.SUPER_ADMIN,
        tenantId: payload.tenantId, // Peut être 'MATRIX' ou un ID spécifique (impersonation)
        U_TenantDomain: payload.U_TenantDomain || 'matrix',
        assignedProcessId: null
      };
    }

    // 🏢 3. VÉRIFICATION DU DOMAINE MATRIX
    // On s'assure que le domaine est présent pour l'isolation multi-tenant.
    if (!payload.U_TenantDomain) {
      throw new UnauthorizedException('Domaine Matrix manquant dans le protocole de sécurité.');
    }

    // 🚀 4. RETOUR DU CONTEXTE UTILISATEUR
    // Sera injecté dans request.user par NestJS
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