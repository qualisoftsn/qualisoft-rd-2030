import {
  ConflictException,
  Injectable, Logger,
  NotFoundException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Plan, Role, SubscriptionStatus, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { ProvisioningDto } from './dto/provisioning.dto';

export interface ImpersonationResult {
  token: string;
  user: {
    U_Id: string; U_Email: string; U_Role: string;
    tenantId: string; tenantName: string;
  };
}

@Injectable()
export class ProvisioningService {
  private readonly logger = new Logger(ProvisioningService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 🏗️ INITIALISATION NOUVEAU NŒUD
   */
  async initializeNewClient(data: ProvisioningDto) {
    const domainNormalized = data.companyName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const hashedPassword = await bcrypt.hash(data.password || 'Qualisoft@2026', 10);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const existing = await tx.tenant.findUnique({ where: { T_Domain: domainNormalized } });
        if (existing) throw new ConflictException(`Domaine ${domainNormalized} déjà scellé.`);

        const tenant = await tx.tenant.create({
          data: {
            T_Name: data.companyName,
            T_Email: data.email,
            T_Domain: domainNormalized,
            T_CeoName: data.ceoName,
            T_Phone: data.phone,
            T_Address: data.address,
            T_Plan: Plan.ESSAI,
            T_SubscriptionStatus: SubscriptionStatus.TRIAL,
            T_IsActive: true,
          },
        });

        const site = await tx.site.create({
          data: { S_Name: `SIÈGE - ${tenant.T_Name.toUpperCase()}`, tenantId: tenant.T_Id }
        });

        await tx.user.create({
          data: {
            U_Email: data.email.toLowerCase().trim(),
            U_PasswordHash: hashedPassword,
            U_FirstName: data.adminFirstName,
            U_LastName: data.adminLastName,
            U_Role: Role.ADMIN,
            U_IsActive: true,
            tenantId: tenant.T_Id,
            U_SiteId: site.S_Id
          }
        });

        return { success: true, tenantId: tenant.T_Id };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Erreur Provisioning: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * 🖋️ CRÉATION COLLABORATEUR (Méthode manquante corrigée)
   */
  async createUser(tenantId: string, data: any): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password || 'Qualisoft@2026', 10);
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
      }
    });
  }

  /**
   * 🎭 IMPERSONATION (Méthode manquante corrigée)
   */
  async generateImpersonationToken(tenantId: string): Promise<ImpersonationResult> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { T_Id: tenantId },
      include: { T_Users: { where: { U_Role: Role.ADMIN, U_IsActive: true }, take: 1 } }
    });

    if (!tenant || tenant.T_Users.length === 0) throw new NotFoundException("Cible introuvable.");

    const target = tenant.T_Users[0];
    const payload = { sub: target.U_Id, U_Email: target.U_Email, tenantId: tenant.T_Id, isImpersonated: true };
    
    return {
      token: this.jwtService.sign(payload),
      user: { 
        U_Id: target.U_Id, U_Email: target.U_Email, U_Role: target.U_Role, 
        tenantId: tenant.T_Id, tenantName: tenant.T_Name 
      }
    };
  }

  /**
   * 🛰️ DÉTAILS TENANT (Méthode manquante corrigée)
   */
  async getTenantDetails(tenantId: string) {
    const details = await this.prisma.tenant.findUnique({
      where: { T_Id: tenantId },
      include: { 
        T_Users: { orderBy: { U_CreatedAt: 'desc' } }, 
        T_Sites: true, 
        _count: { select: { T_Users: true, T_Sites: true } } 
      }
    });
    if (!details) throw new NotFoundException("Instance introuvable.");
    return details;
  }
}