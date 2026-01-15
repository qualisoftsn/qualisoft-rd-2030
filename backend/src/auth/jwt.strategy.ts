import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'SECRET_KEY_QUALISOFT',
    });
  }

  /**
   * @param payload Contenu décodé du Token
   * @returns L'objet injecté dans req.user pour nos services
   */
  async validate(payload: any) {
    // 🛡️ Vérification stricte du TenantId (nom de clé harmonisé)
    if (!payload.tenantId) {
      throw new UnauthorizedException('Token invalide : Identifiant entreprise manquant.');
    }

    // On retourne l'objet exactement comme nos services l'attendent (req.user.U_...)
    return { 
      U_Id: payload.U_Id, 
      U_Email: payload.U_Email, 
      tenantId: payload.tenantId,
      U_Role: payload.U_Role 
    };
  }
}