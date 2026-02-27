// auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { compare } from 'bcryptjs';
import { User } from '@prisma/client';

/**
 * 🚩 INTERFACE DE DONNÉES SCELLÉES
 * Alignée sur JwtStrategy et AuthController pour éviter les erreurs TS2353
 */
export interface AuthPayload {
  U_Id: string;
  U_Email: string;
  U_Role: string;
  tenantId: string;
  U_TenantDomain: string; // ✅ AJOUTÉ : Indispensable pour le routage Matrix
  assignedProcessId?: string | null;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(
    email: string,
    password: string,
    tenantId?: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    // 🔍 RECHERCHE DE L'UTILISATEUR AVEC SA RELATION TENANT
    const user = await this.prisma.user.findFirst({
      where: {
        U_Email: email.toLowerCase().trim(),
        U_IsActive: true,
        ...(tenantId && tenantId !== 'MATRIX' ? { tenantId } : {}),
      },
      include: {
        tenant: true, // 🔑 Récupère T_Domain depuis la table Tenant
      },
    });

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // 🔐 VÉRIFICATION DU MOT DE PASSE
    const isValid = await compare(password, user.U_PasswordHash);
    if (!isValid) {
      this.logger.warn(`Tentative de connexion échouée pour ${email}`);
      throw new UnauthorizedException('Identifiants invalides');
    }

    // 🚩 CAS SPÉCIAL : SUPER_ADMIN (accès multi-tenant)
    if (user.U_Role === 'SUPER_ADMIN' && !tenantId) {
      throw new BadRequestException('Le tenantId est requis pour les SUPER_ADMIN');
    }

    // ✅ PRÉPARATION DU PAYLOAD MATRIX
    // On extrait le domaine du tenant ou on met 'elite' par défaut
    const payload: AuthPayload = {
      U_Id: user.U_Id,
      U_Email: user.U_Email,
      U_Role: user.U_Role,
      tenantId: user.tenantId,
      U_TenantDomain: (user as any).tenant?.T_Domain || 'elite',
      assignedProcessId: null
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload);

    return { accessToken, refreshToken, user };
  }

  /**
   * ✅ GÉNÉRATION ACCESS TOKEN
   */
  generateAccessToken(payload: AuthPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: this.configService.get<string>('JWT_SECRET'),
    });
  }

  /**
   * ✅ GÉNÉRATION REFRESH TOKEN
   */
  async generateRefreshToken(payload: AuthPayload): Promise<string> {
    return this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });
  }

  /**
   * ✅ VÉRIFICATION REFRESH TOKEN (Utilisée par le Guard)
   */
  async verifyRefreshToken(token: string): Promise<AuthPayload> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      return payload as AuthPayload;
    } catch (e) {
      this.logger.warn('Refresh token invalide ou expiré');
      throw new UnauthorizedException('Session expirée');
    }
  }
}