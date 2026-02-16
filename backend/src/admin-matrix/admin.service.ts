/**
 * 🛰️ ADMIN SERVICE - QUALISOFT ELITE RD 2030
 * RÔLE : Gestion souveraine des utilisateurs et monitoring des tenants.
 */

import { Injectable, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs'; // Nécessaire pour le hachage

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

  // 🔐 MODIFICATION SOUVERAINE
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
        tenantId: data.tenantId 
      }
    });
  }

  // 🆕 MÉTHODE AJOUTÉE POUR CORRIGER L'ERREUR DE COMPILATION
  // Permet d'enrôler un utilisateur depuis le Cockpit Matrix
  async createExternalUser(tenantId: string, data: any) {
    // 1. On vérifie que le tenant existe et on récupère son site par défaut
    const tenant = await this.prisma.tenant.findUnique({
      where: { T_Id: tenantId },
      include: { T_Sites: true }
    });

    if (!tenant) throw new NotFoundException("Tenant cible introuvable.");

    // 2. On vérifie si l'email existe déjà
    const existing = await this.prisma.user.findUnique({ where: { U_Email: data.email } });
    if (existing) throw new ConflictException("Cet email est déjà utilisé dans la Matrix.");

    // 3. Hachage du mot de passe (ou défaut)
    const password = data.password || 'Qualisoft@2030';
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Création
    return this.prisma.user.create({
      data: {
        U_Email: data.email,
        U_PasswordHash: hashedPassword,
        U_FirstName: data.firstName || 'Utilisateur',
        U_LastName: data.lastName || 'System',
        U_Role: data.role || Role.USER,
        U_IsActive: true,
        tenantId: tenantId,
        // On lie au premier site du tenant pour éviter les orphelins
        U_SiteId: tenant.T_Sites[0]?.S_Id || null 
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