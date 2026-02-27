import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthPayload } from './auth.service';
import { Role } from '../types/elite-sde';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private readonly configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error("🚨 CRITIQUE : JWT_SECRET absent");
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any): Promise<AuthPayload> {
    const userId = payload.U_Id || payload.sub;

    // Gestion du compte Master SDE
    if (userId === 'CORE_MASTER' || payload.U_Role === Role.SUPER_ADMIN) {
      return {
        U_Id: 'CORE_MASTER',
        U_Email: payload.U_Email || 'ab.thiongane@qualisoft.sn',
        U_Role: Role.SUPER_ADMIN,
        tenantId: 'MATRIX',
        U_TenantDomain: payload.U_TenantDomain || 'elite',
        assignedProcessId: null
      };
    }

    if (!payload.U_TenantDomain) {
      throw new UnauthorizedException('Domaine Matrix manquant dans le token');
    }

    return {
      U_Id: userId,
      U_Email: payload.U_Email,
      tenantId: payload.tenantId,
      U_TenantDomain: payload.U_TenantDomain,
      U_Role: payload.U_Role as Role,
      assignedProcessId: payload.assignedProcessId || null
    };
  }
}