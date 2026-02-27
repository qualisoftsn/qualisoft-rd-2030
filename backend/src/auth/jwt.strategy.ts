/**
 * 🛰️ JWT STRATEGY - QUALISOFT ELITE RD 2030
 * RÔLE : Déchiffrement et validation du jeton pour chaque requête.
 * VERSION : 2.1.1 (Correction Typescript & Alignement Multi-Tenant)
 */

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// 🚩 DÉFINITION LOCALE DES INTERFACES POUR GARANTIR LE BUILD
// Cela évite les conflits si AuthPayload dans auth.service n'est pas à jour
export interface AuthPayload {
  U_Id: string;
  U_Email: string;
  U_Role: string;
  tenantId: string;
  U_TenantDomain: string;
  assignedProcessId?: string | null;
}

interface JwtDecodedPayload {
  U_Id?: string;
  sub?: string;
  U_Email: string;
  U_Role: string;
  tenantId: string;
  U_TenantDomain: string;
  assignedProcessId?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private readonly configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error("🚨 CRITIQUE : JWT_SECRET absent de l'environnement.");
    }

    super({
      // ✅ Récupération via Header Bearer pour l'API
      // ✅ On peut aussi ajouter un extracteur de cookie si nécessaire pour la Vitrine
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * 🛡️ VALIDATION DU TOKEN
   * Cette méthode injecte l'utilisateur validé dans 'req.user'
   */
  async validate(payload: JwtDecodedPayload): Promise<AuthPayload> {
    const userId = payload.U_Id || payload.sub;

    // 1. CAS MASTER SOUVERAIN (Abdoulaye Thiongane)
    if (userId === 'CORE_MASTER' || payload.U_Role === 'SUPER_ADMIN') {
      return {
        U_Id: 'CORE_MASTER',
        U_Email: payload.U_Email || 'ab.thiongane@qualisoft.sn',
        U_Role: 'SUPER_ADMIN',
        tenantId: 'MATRIX',
        U_TenantDomain: payload.U_TenantDomain || 'elite',
        assignedProcessId: null
      };
    }

    // 2. VÉRIFICATION DE L'IDENTITÉ NUMÉRIQUE
    if (!userId) {
      this.logger.error("Tentative d'accès avec un token sans identifiant.");
      throw new UnauthorizedException('Identité numérique corrompue.');
    }

    // 3. VÉRIFICATION DU TERRITOIRE (Obligatoire pour les clients)
    if (!payload.U_TenantDomain) {
      this.logger.error(`Accès refusé : Domaine manquant pour l'utilisateur ${userId}`);
      throw new UnauthorizedException('Territoire non identifié.');
    }

    // 🚩 RETOUR DU PAYLOAD SCELLÉ
    return {
      U_Id: userId,
      U_Email: payload.U_Email,
      tenantId: payload.tenantId,
      U_TenantDomain: payload.U_TenantDomain,
      U_Role: payload.U_Role,
      assignedProcessId: payload.assignedProcessId || null
    };
  }
}