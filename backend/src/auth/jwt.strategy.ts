import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private configService: ConfigService) {
    // 1. On extrait la clé d'abord
    const jwtSecret = configService.get<string>('JWT_SECRET');

    // 2. On vérifie sa présence pour rassurer TypeScript
    if (!jwtSecret) {
      throw new Error("JWT_SECRET est manquant dans les variables d'environnement");
    }

    // 3. On passe les options au parent avec une clé garantie 'string'
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret, 
    });
  }

  /**
   * Cette méthode est appelée AUTOMATIQUEMENT si le token est valide.
   * Elle injecte les données dans 'req.user'.
   */
  async validate(payload: any) {
    // Vérification de la présence des champs essentiels pour le Multi-Tenant
    if (!payload || !payload.U_Id || !payload.tenantId) {
      this.logger.error('❌ Payload JWT incomplet ou malformé');
      throw new UnauthorizedException('Session invalide : informations manquantes.');
    }

    // L'objet retourné ici devient 'req.user' dans tes contrôleurs
    return {
      U_Id: payload.U_Id,
      U_Email: payload.U_Email,
      tenantId: payload.tenantId,
      U_Role: payload.U_Role,
    };
  }
}