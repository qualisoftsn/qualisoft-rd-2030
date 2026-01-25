import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'SECRET_KEY_QUALISOFT',
    });
  }

  async validate(payload: any) {
    if (!payload) {
      throw new UnauthorizedException('Token vide ou corrompu.');
    }

    if (!payload.tenantId) {
      this.logger.error('❌ Requête bloquée : Pas de tenantId dans le JWT');
      throw new UnauthorizedException('Accès refusé : Instance non identifiée.');
    }

    if (!payload.U_Id) {
      throw new UnauthorizedException('Token invalide : ID utilisateur manquant.');
    }

    // L'objet renvoyé ici est celui qui sera utilisé par TOUS les Guards (req.user)
    return { 
      U_Id: payload.U_Id, 
      U_Email: payload.U_Email, 
      tenantId: payload.tenantId, 
      U_Role: payload.U_Role 
    };
  }
}