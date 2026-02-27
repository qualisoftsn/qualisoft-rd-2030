import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// 🚩 SUPPRIME l'import de AuthPayload depuis auth.service s'il cause une erreur

// ✅ DÉFINITION LOCALE UNIQUE (Fait office de source de vérité pour TS)
export interface AuthPayload {
  U_Id: string;
  U_Email: string;
  U_Role: string;
  tenantId: string;
  U_TenantDomain: string; // 👈 Assure-toi que ce nom est EXACTEMENT le même partout
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
      throw new Error("🚨 CRITIQUE : JWT_SECRET absent.");
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtDecodedPayload): Promise<AuthPayload> {
    const userId = payload.U_Id || payload.sub;

    if (!userId) {
      throw new UnauthorizedException('Identité corrompue.');
    }

    // ✅ L'objet retourné ici doit correspondre pile-poil à l'interface AuthPayload ci-dessus
    return {
      U_Id: userId,
      U_Email: payload.U_Email,
      U_Role: payload.U_Role,
      tenantId: payload.tenantId,
      U_TenantDomain: payload.U_TenantDomain || 'elite',
      assignedProcessId: payload.assignedProcessId || null
    };
  }
}