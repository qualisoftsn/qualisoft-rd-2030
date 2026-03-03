/**
 * 🛰️ MODULE : AdminMatrixService
 * -------------------------------------------------------------------------
 * RÔLE : Supervision souveraine des tenants et protocole d'Impersonation.
 * RÉVISION : 03 Mars 2026 | 17:15 GMT
 */

import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';

@Injectable()
export class AdminMatrixService {
  private readonly logger = new Logger(AdminMatrixService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  /**
   * 📋 RÉPERTOIRE GLOBAL
   * Récupère tous les tenants avec leurs statistiques de pénétration (Users/Sites).
   */
  async findAllTenants() {
    return this.prisma.tenant.findMany({
      orderBy: { T_CreatedAt: 'desc' },
      include: {
        _count: {
          select: { T_Users: true, T_Sites: true }
        }
      }
    });
  }

  /**
   * 🔍 SCAN DE NŒUD
   * Extraction des détails complets d'un tenant pour audit master.
   */
  async getTenantFullDetails(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { T_Id: tenantId },
      include: {
        T_Users: { orderBy: { U_CreatedAt: 'desc' } },
        T_Sites: true,
        T_OrgUnits: { include: { OU_Type: true } }
      }
    });
    if (!tenant) throw new NotFoundException("Nœud Matrix introuvable.");
    return tenant;
  }

  /**
   * 🔐 PROTOCOLE D'IMPERSONATION (PRISE DE CONTRÔLE)
   * Génère un jeton souverain pour pénétrer un nœud sans mot de passe.
   */
  async generateImpersonationToken(tenantId: string) {
    const adminTarget = await this.prisma.user.findFirst({
      where: { tenantId, U_Role: Role.ADMIN, U_IsActive: true }
    });

    if (!adminTarget) throw new NotFoundException("Aucune autorité racine (ADMIN) trouvée sur ce nœud.");

    const payload = { 
      sub: adminTarget.U_Id, 
      email: adminTarget.U_Email, 
      role: adminTarget.U_Role, 
      tenantId: tenantId,
      isImpersonated: true 
    };

    return {
      access_token: this.jwtService.sign(payload),
      targetUser: {
        U_Id: adminTarget.U_Id,
        U_Email: adminTarget.U_Email,
        U_FirstName: adminTarget.U_FirstName,
        U_LastName: adminTarget.U_LastName
      }
    };
  }

  /**
   * ⚡ MODIFICATION SOUVERAINE
   * Permet à l'Architecte de modifier n'importe quel utilisateur, quel que soit son tenant.
   */
  async updateUserSovereign(userId: string, data: any) {
    return this.prisma.user.update({
      where: { U_Id: userId },
      data: {
        U_FirstName: data.U_FirstName,
        U_LastName: data.U_LastName,
        U_Role: data.U_Role,
        U_IsActive: data.U_IsActive,
        tenantId: data.tenantId 
      }
    });
  }
}