/**
 * 🔐 MODULE : AuthService (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Orchestrateur de l'identité et du scellage JWT.
 * LOGIQUE : Validation Multi-Tenant, Hash Bcrypt, Génération Dual-Token.
 * RÉVISION : 04 Mars 2026 | 18:46 GMT
 * -------------------------------------------------------------------------
 */

import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { compare } from 'bcryptjs';
import { Role } from '../types/elite-sde'; 

export interface AuthPayload {
  U_Id: string;
  U_Email: string;
  U_Role: Role;
  tenantId: string;
  U_TenantDomain: string;
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

  async validateUser(email: string, password: string, tenantId?: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        U_Email: email.toLowerCase().trim(),
        U_IsActive: true,
        // Isolation forcée sauf pour les accès Matrix Master
        ...(tenantId && tenantId !== 'MATRIX' ? { tenantId } : {}),
      },
      include: { tenant: true },
    });

    if (!user) {
      throw new UnauthorizedException('Identifiants Matrix invalides');
    }

    const isValid = await compare(password, user.U_PasswordHash);
    if (!isValid) {
      throw new UnauthorizedException('Identifiants Matrix invalides');
    }

    if (user.U_Role === Role.SUPER_ADMIN && !tenantId) {
      throw new BadRequestException('Le tenantId est requis pour le protocole SUPER_ADMIN');
    }

    const payload: AuthPayload = {
      U_Id: user.U_Id,
      U_Email: user.U_Email,
      U_Role: user.U_Role as Role,
      tenantId: user.tenantId,
      U_TenantDomain: (user as any).tenant?.T_Domain || 'elite',
      assignedProcessId: user.U_AssignedProcessId || null
    };

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: await this.generateRefreshToken(payload),
      user: {
        U_Id: user.U_Id,
        U_Email: user.U_Email,
        U_Role: user.U_Role,
        tenantId: user.tenantId,
        U_TenantDomain: (user as any).tenant?.T_Domain || 'elite',
      },
    };
  }

  generateAccessToken(payload: AuthPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: this.configService.get<string>('JWT_SECRET'),
    });
  }

  async generateRefreshToken(payload: AuthPayload): Promise<string> {
    return this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });
  }

  async verifyRefreshToken(token: string): Promise<AuthPayload> {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      }) as AuthPayload;
    } catch (e) {
      throw new UnauthorizedException('Session Matrix expirée');
    }
  }
}