/**
 * 🛰️ ADMIN SERVICE - QUALISOFT ELITE RD 2030
 * RÔLE : Gestion souveraine des utilisateurs et monitoring des tenants.
 */

import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  // Récupérer tous les tenants pour la vue Matrix
  async findAllTenants() {
    return this.prisma.tenant.findMany({
      include: {
        _count: { select: { T_Users: true, T_Sites: true } }
      },
      orderBy: { T_CreatedAt: 'desc' }
    });
  }

  // Détails complets d'un nœud
  async getTenantFullDetails(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { T_Id: tenantId },
      include: {
        T_Users: true,
        T_Sites: true,
        T_OrgUnits: { include: { OU_Type: true } }
      }
    });
    if (!tenant) throw new NotFoundException("Tenant introuvable.");
    return tenant;
  }

  // 🔐 MODIFICATION SOUVERAINE (Fix Problème n°3)
  // Permet au Super Admin d'outrepasser l'isolation des tenants
  async updateUserSovereign(userId: string, data: any, adminUser: User) {
    if (adminUser.U_Role !== Role.SUPER_ADMIN) {
      throw new UnauthorizedException("Seul l'Architecte peut modifier des données inter-tenants.");
    }

    return this.prisma.user.update({
      where: { U_Id: userId },
      data: {
        U_FirstName: data.firstName,
        U_LastName: data.lastName,
        U_Role: data.role,
        U_IsActive: data.isActive,
        // On permet même de changer le tenant d'un utilisateur si besoin
        tenantId: data.tenantId 
      }
    });
  }

  // Protocole d'Impersonation
  async generateImpersonationToken(tenantId: string) {
    const adminTarget = await this.prisma.user.findFirst({
      where: { tenantId, U_Role: Role.ADMIN, U_IsActive: true }
    });

    if (!adminTarget) throw new NotFoundException("Aucun admin actif trouvé sur ce nœud.");

    const payload = { 
      sub: adminTarget.U_Id, 
      email: adminTarget.U_Email, 
      role: adminTarget.U_Role, 
      tenantId: tenantId,
      isImpersonated: true 
    };

    return {
      access_token: this.jwtService.sign(payload),
      targetUser: adminTarget
    };
  }
}