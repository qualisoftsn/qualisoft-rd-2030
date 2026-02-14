/**
 * CHEMIN ABSOLU : /backend/src/admin-matrix/provisioning.service.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Moteur de déploiement atomique et gestion souveraine des nœuds.
 */

import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Plan, Role, SubscriptionStatus, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { ProvisioningDto } from './dto/provisioning.dto';

export interface ImpersonationResult {
  token: string;
  user: {
    U_Id: string;
    U_Email: string;
    U_Role: string;
    tenantId: string;
    tenantName: string;
  };
}

@Injectable()
export class ProvisioningService {
  private readonly logger = new Logger(ProvisioningService.name);
  private readonly MASTER_DEFAULT_PASSWORD = 'Qualisoft@2026';

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 🏗️ INITIALISATION NOUVEAU NŒUD (SCELLAGE ATOMIQUE)
   * Crée l'entité (Tenant), le siège (Site) et l'autorité (Admin) en une seule transaction.
   */
  async initializeNewClient(data: ProvisioningDto) {
    const domainNormalized = data.companyName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    // Hachage du mot de passe maître interne
    const hashedPassword = await bcrypt.hash(this.MASTER_DEFAULT_PASSWORD, 10);

    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Vérification de l'unicité du domaine technique
        const existing = await tx.tenant.findUnique({
          where: { T_Domain: domainNormalized },
        });

        if (existing) {
          throw new ConflictException(`Le domaine technique ${domainNormalized} est déjà scellé.`);
        }

        // 2. Création du Tenant (Nœud Matrix)
        // 🚀 CORRECTION : Passage direct en mode PRODUCTION / ACTIF
        const tenant = await tx.tenant.create({
          data: {
            T_Name: data.companyName,
            T_Email: data.email,
            T_Domain: domainNormalized,
            T_CeoName: data.ceoName,
            T_Phone: data.phone,
            T_Address: data.address,
            // On attribue le plan ENTREPRISE par défaut pour débloquer toutes les fonctionnalités
            T_Plan: Plan.ENTREPRISE, 
            // On active immédiatement la souscription
            T_SubscriptionStatus: SubscriptionStatus.ACTIVE,
            T_IsActive: true,
          },
        });

        // 3. Création du Site de Commandement (Siège Social)
        const site = await tx.site.create({
          data: {
            S_Name: `SIÈGE - ${tenant.T_Name.toUpperCase()}`,
            tenantId: tenant.T_Id,
            S_Address: data.address,
            S_IsActive: true,
          },
        });

        // 4. Enrôlement de l'Administrateur Racine
        await tx.user.create({
          data: {
            U_Email: data.email.toLowerCase().trim(),
            U_PasswordHash: hashedPassword,
            U_FirstName: data.adminFirstName,
            U_LastName: data.adminLastName,
            U_Role: Role.ADMIN,
            U_IsActive: true,
            tenantId: tenant.T_Id,
            U_SiteId: site.S_Id,
            U_FirstLogin: true, // Force le changement de mot de passe au premier accès
          },
        });

        return { success: true, tenantId: tenant.T_Id };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ ÉCHEC PROVISIONING [${data.companyName}] : ${errorMessage}`);
      
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException("Rupture de la transaction atomique de provisioning.");
    }
  }

  /**
   * 🖋️ ENRÔLEMENT COLLABORATEUR UNITAIRE
   */
  async createUser(tenantId: string, data: any): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password || this.MASTER_DEFAULT_PASSWORD, 10);
    const site = await this.prisma.site.findFirst({ where: { tenantId } });

    return this.prisma.user.create({
      data: {
        U_Email: data.email.toLowerCase().trim(),
        U_PasswordHash: hashedPassword,
        U_FirstName: data.firstName || 'Utilisateur',
        U_LastName: data.lastName || 'Elite',
        U_Role: (data.role as Role) || Role.USER,
        U_IsActive: true,
        tenantId: tenantId,
        U_SiteId: site?.S_Id || null,
      },
    });
  }

  /**
   * 🎭 PROTOCOLE D'IMPERSONATION (PRISE DE CONTRÔLE ADMIN)
   */
  async generateImpersonationToken(tenantId: string): Promise<ImpersonationResult> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { T_Id: tenantId },
      include: {
        T_Users: {
          where: { U_Role: Role.ADMIN, U_IsActive: true },
          take: 1,
        },
      },
    });

    if (!tenant || tenant.T_Users.length === 0) {
      throw new NotFoundException("Cible Matrix introuvable ou autorité racine inexistante.");
    }

    const target = tenant.T_Users[0];
    const payload = {
      sub: target.U_Id,
      U_Email: target.U_Email,
      tenantId: tenant.T_Id,
      isImpersonated: true,
    };

    return {
      token: this.jwtService.sign(payload),
      user: {
        U_Id: target.U_Id,
        U_Email: target.U_Email,
        U_Role: target.U_Role,
        tenantId: tenant.T_Id,
        tenantName: tenant.T_Name,
      },
    };
  }

  /**
   * 🛰️ RÉCUPÉRATION DES DÉTAILS DU NŒUD
   */
  async getTenantDetails(tenantId: string) {
    const details = await this.prisma.tenant.findUnique({
      where: { T_Id: tenantId },
      include: {
        T_Users: { orderBy: { U_CreatedAt: 'desc' } },
        T_Sites: true,
        _count: {
          select: { T_Users: true, T_Sites: true },
        },
      },
    });

    if (!details) {
      throw new NotFoundException("Nœud Matrix introuvable dans le registre.");
    }

    return details;
  }
}