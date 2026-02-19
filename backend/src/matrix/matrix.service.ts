/**
 * CHEMIN ABSOLU : /backend/src/matrix/matrix.service.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Moteur souverain (Lecture, Incarnation, Enrôlement).
 */

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class MatrixService {
  private readonly logger = new Logger(MatrixService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async findAllTenants() {
    try {
      return await this.prisma.tenant.findMany({
        include: { _count: { select: { T_Users: true, T_Sites: true } } },
        orderBy: { T_CreatedAt: 'desc' }
      });
    } catch (error) {
      this.logger.error("Échec registre global Matrix", error);
      throw new Error("Base Matrix inaccessible.");
    }
  }

  async getTenantDetails(id: string) {
    if (id === 'deploy') return null;
    const tenant = await this.prisma.tenant.findUnique({
      where: { T_Id: id },
      include: {
        T_Users: { orderBy: { U_CreatedAt: 'desc' } },
        _count: { select: { T_Users: true, T_Sites: true } }
      }
    });
    if (!tenant) throw new NotFoundException("Nœud Matrix introuvable.");
    return tenant;
  }

  async impersonate(tenantId: string) {
    const targetUser = await this.prisma.user.findFirst({
      where: { tenantId, U_Role: 'ADMIN', U_IsActive: true },
      include: { tenant: true }
    });

    if (!targetUser) {
      throw new NotFoundException("Aucun compte racine actif trouvé sur ce nœud.");
    }

    const payload = { U_Id: targetUser.U_Id, U_Email: targetUser.U_Email, tenantId: targetUser.tenantId, U_Role: targetUser.U_Role };
    this.logger.warn(`🎭 INCARNATION : Génération du pont vers [${targetUser.tenant.T_Name}]`);

    return {
      token: this.jwtService.sign(payload),
      user: {
        U_Id: targetUser.U_Id, U_FirstName: targetUser.U_FirstName, U_LastName: targetUser.U_LastName,
        U_Email: targetUser.U_Email, U_Role: targetUser.U_Role, tenantId: targetUser.tenantId, U_TenantName: targetUser.tenant.T_Name
      }
    };
  }

  async createUserForTenant(tenantId: string, data: any) {
    const passwordHash = await bcrypt.hash(data.password || "Qualisoft@2026", 10);
    const defaultSite = await this.prisma.site.findFirst({ where: { tenantId } });

    return await this.prisma.user.create({
      data: {
        U_Email: data.U_Email.toLowerCase().trim(),
        U_FirstName: data.U_FirstName, U_LastName: data.U_LastName,
        U_PasswordHash: passwordHash, U_Role: data.U_Role,
        tenantId: tenantId, U_SiteId: defaultSite?.S_Id || null,
        U_IsActive: true, U_FirstLogin: true
      }
    });
  }

  async findPublicTenants() {
    return await this.prisma.tenant.findMany({
      where: { T_IsActive: true },
      select: { T_Id: true, T_Name: true, T_Domain: true, T_CeoName: true },
      orderBy: { T_Name: 'asc' }
    });
  }

  async findPublicUsersByTenant(tenantId: string) {
    return await this.prisma.user.findMany({
      where: { tenantId, U_IsActive: true },
      select: { U_Id: true, U_FirstName: true, U_LastName: true, U_Email: true },
      orderBy: { U_LastName: 'asc' }
    });
  }
}