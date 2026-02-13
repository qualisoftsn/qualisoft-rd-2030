import { 
  Injectable, Logger, ConflictException, 
  InternalServerErrorException, NotFoundException, BadRequestException 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Role, Plan, SubscriptionStatus, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
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
   * 🏗️ INITIALISATION NŒUD MATRIX (ISO 9001 COMPLIANT)
   * Transaction atomique : Tenant -> Site -> Admin User
   */
  async initializeNewClient(data: ProvisioningDto): Promise<{ success: boolean; tenantId: string; message: string }> {
    
    // Normalisation du domaine (Ex: "Qualisoft SN" -> "qualisoft-sn")
    const domainNormalized = data.companyName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const hashedPassword = await bcrypt.hash(data.password || 'Qualisoft@2026', 10);

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Vérification d'existence (Email ou Domaine)
        const existingTenant = await tx.tenant.findFirst({
          where: { OR: [{ T_Email: data.email }, { T_Domain: domainNormalized }] }
        });

        if (existingTenant) {
          throw new ConflictException(`Un nœud avec cet email ou ce domaine [${domainNormalized}] existe déjà.`);
        }

        // 2. Création du Tenant (S'aligne sur ton schéma Prisma)
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

        // 3. Création du Site de Commandement (Siège)
        const site = await tx.site.create({
          data: {
            S_Name: `SIÈGE SOCIAL - ${tenant.T_Name.toUpperCase()}`,
            S_Address: data.address,
            tenantId: tenant.T_Id,
            S_IsActive: true,
          }
        });

        // 4. Création de l'Administrateur Racine (Supervision Matrix)
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
            U_Phone: data.phone
          }
        });

        return { tenantId: tenant.T_Id };
      });

      return { 
        success: true, 
        tenantId: result.tenantId, 
        message: `Le nœud ${data.companyName} a été scellé avec succès.` 
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[Matrix-Error] Échec du scellage : ${errorMessage}`);
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException("Rupture de la transaction atomique de provisioning.");
    }
  }

  /**
   * Création d'un collaborateur unitaire (Gestion Matrix)
   */
  async createUser(tenantId: string, data: any): Promise<User> {
    if (!data.email) throw new BadRequestException("Email obligatoire.");

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
   * Génération du jeton d'impersonation (Accès Souverain)
   */
  async generateImpersonationToken(tenantId: string): Promise<ImpersonationResult> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { T_Id: tenantId },
      include: { T_Users: { where: { U_Role: Role.ADMIN, U_IsActive: true }, take: 1 } }
    });

    if (!tenant || tenant.T_Users.length === 0) {
      throw new NotFoundException("Cible Matrix introuvable ou aucun admin actif.");
    }

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
   * Récupération des détails complets (Dashboard Matrix)
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

    if (!details) throw new NotFoundException("Nœud Matrix introuvable.");
    return details;
  }
}