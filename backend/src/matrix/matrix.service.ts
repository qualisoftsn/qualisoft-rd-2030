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
    private readonly jwtService: JwtService // ✅ Nécessaire pour l'incarnation
  ) {}

  /**
   * 📋 RÉCUPÉRATION GLOBALE (COCKPIT MASTER)
   */
  async findAllTenants() {
    try {
      return await this.prisma.tenant.findMany({
        include: {
          _count: { select: { T_Users: true, T_Sites: true } }
        },
        orderBy: { T_CreatedAt: 'desc' }
      });
    } catch (error) {
      this.logger.error("Échec registre global Matrix", error);
      throw new Error("Base Matrix inaccessible.");
    }
  }

  /**
   * 🔍 DÉTAILS D'UN NŒUD
   */
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

  /**
   * 🎭 PONT D'INCARNATION (LOGIQUE SCELLÉE)
   * ✅ RÉPARE LE PONT : Génère un token d'accès pour le nœud cible.
   */
  async impersonate(tenantId: string) {
    // 1. Trouver l'administrateur principal du tenant cible
    const targetUser = await this.prisma.user.findFirst({
      where: { tenantId, U_Role: 'ADMIN', U_IsActive: true },
      include: { tenant: true }
    });

    if (!targetUser) {
      throw new NotFoundException("Aucun compte racine actif trouvé sur ce nœud.");
    }

    // 2. Générer le Payload souverain
    const payload = {
      U_Id: targetUser.U_Id,
      U_Email: targetUser.U_Email,
      tenantId: targetUser.tenantId,
      U_Role: targetUser.U_Role,
    };

    this.logger.warn(`🎭 INCARNATION : Génération du pont vers [${targetUser.tenant.T_Name}]`);

    return {
      token: this.jwtService.sign(payload),
      user: {
        U_Id: targetUser.U_Id,
        U_FirstName: targetUser.U_FirstName,
        U_LastName: targetUser.U_LastName,
        U_Email: targetUser.U_Email,
        U_Role: targetUser.U_Role,
        tenantId: targetUser.tenantId,
        U_TenantName: targetUser.tenant.T_Name
      }
    };
  }

  /**
   * 👤 ENRÔLEMENT COLLABORATEUR
   * ✅ AJOUTÉ : Permet au SuperAdmin de créer des comptes dans n'importe quel tenant.
   */
  async createUserForTenant(tenantId: string, data: any) {
    const passwordHash = await bcrypt.hash(data.password || "Qualisoft@2026", 10);
    
    // Récupérer le site par défaut (Siège) du tenant
    const defaultSite = await this.prisma.site.findFirst({ where: { tenantId } });

    return await this.prisma.user.create({
      data: {
        U_Email: data.U_Email.toLowerCase().trim(),
        U_FirstName: data.U_FirstName,
        U_LastName: data.U_LastName,
        U_PasswordHash: passwordHash,
        U_Role: data.U_Role,
        tenantId: tenantId,
        U_SiteId: defaultSite?.S_Id || null,
        U_IsActive: true,
        U_FirstLogin: true
      }
    });
  }

  /**
   * 🔓 ACCÈS PUBLICS
   */
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