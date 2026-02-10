/**
 * CHEMIN ABSOLU : /backend/src/matrix/matrix.service.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Gestion administrative du Cockpit Master et accès publics.
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatrixService {
  private readonly logger = new Logger(MatrixService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 📋 RÉCUPÉRATION GLOBALE (COCKPIT)
   */
  async findAllTenants() {
    return await this.prisma.tenant.findMany({
      include: {
        _count: {
          select: { T_Users: true, T_Sites: true }
        }
      },
      orderBy: { T_CreatedAt: 'desc' }
    });
  }

  /**
   * 🔍 DÉTAILS D'UN NŒUD
   */
  async getTenantDetails(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { T_Id: id },
      include: {
        T_Users: true,
        _count: { select: { T_Users: true, T_Sites: true } }
      }
    });
    if (!tenant) throw new NotFoundException("Tenant introuvable.");
    return tenant;
  }

  /**
   * ✅ FIX TS2339 : SÉLECTEUR PUBLIC TENANTS
   */
  async findPublicTenants() {
    return await this.prisma.tenant.findMany({
      where: { T_IsActive: true },
      select: { T_Id: true, T_Name: true, T_Domain: true },
      orderBy: { T_Name: 'asc' }
    });
  }

  /**
   * ✅ FIX TS2339 : SÉLECTEUR PUBLIC COLLABORATEURS
   */
  async findPublicUsersByTenant(tenantId: string) {
    return await this.prisma.user.findMany({
      where: { tenantId, U_IsActive: true },
      select: { U_Id: true, U_FirstName: true, U_LastName: true, U_Email: true },
      orderBy: { U_LastName: 'asc' }
    });
  }
}