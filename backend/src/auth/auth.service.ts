import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { compare } from 'bcryptjs';
import { Role, User } from '../types/elite-sde'; // ✅ Import de tes types

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

  async validateUser(email: string, password: string, tenantId?: string): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    const user = await this.prisma.user.findFirst({
      where: {
        U_Email: email.toLowerCase().trim(),
        U_IsActive: true,
        ...(tenantId && tenantId !== 'MATRIX' ? { tenantId } : {}),
      },
      include: { tenant: true },
    });

    if (!user || !(await compare(password, user.U_PasswordHash))) {
      throw new UnauthorizedException('Identifiants invalides');
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
      user,
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
    } catch {
      throw new UnauthorizedException('Session expirée');
    }
  }
}