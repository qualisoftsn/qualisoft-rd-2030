import { 
  Injectable, Logger, ConflictException, 
  InternalServerErrorException, NotFoundException, BadRequestException 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../common/email.service'; 
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
    private readonly emailService: EmailService,
  ) {}

  /**
   * 🏗️ TRANSACTION DE SCELLAGE ATOMIQUE
   * Version alignée sur le formulaire de déploiement 2030.
   */
  async initializeNewClient(data: ProvisioningDto): Promise<{ success: boolean; tenantId: string; domain: string; message: string }> {
    
    // 1. Génération du domaine à partir du nom de l'entreprise si non fourni
    const domainNormalized = data.companyName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const hashedPassword = await bcrypt.hash(data.password || 'Qualisoft@2026', 10);

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Vérification d'unicité
        const existing = await tx.tenant.findUnique({ where: { T_Domain: domainNormalized } });
        if (existing) throw new ConflictException(`Le domaine [${domainNormalized}] est déjà réservé.`);

        // 2. Création du Tenant avec les nouvelles métadonnées
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

        // 3. Création du Site Siège
        const site = await tx.site.create({
          data: { 
            S_Name: `SIÈGE SOCIAL - ${tenant.T_Name.toUpperCase()}`, 
            tenantId: tenant.T_Id 
          }
        });

        // 4. Création de l'Administrateur Racine
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
        
        return { tenantId: tenant.T_Id, domain: tenant.T_Domain };
      });

      return { 
        success: true, 
        tenantId: result.tenantId, 
        domain: result.domain,
        message: `Nœud Matrix scellé pour ${data.companyName}.` 
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Erreur de scellage : ${errorMessage}`);
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException("Rupture de la transaction atomique de scellage.");
    }
  }

  async createUser(tenantId: string, data: any): Promise<User> {
    if (!data.email) throw new BadRequestException("L'identifiant email est requis.");

    const hashedPassword = await bcrypt.hash(data.password || 'Qualisoft@2026', 10);
    const site = await this.prisma.site.findFirst({ where: { tenantId } });

    return this.prisma.user.create({
      data: {
        U_Email: data.email.toLowerCase().trim(),
        U_PasswordHash: hashedPassword,
        U_FirstName: data.firstName || 'Utilisateur',
        U_LastName: data.lastName || 'Nouveau',
        U_Role: (data.role as Role) || Role.USER,
        U_IsActive: true,
        tenantId: tenantId,
        U_SiteId: site?.S_Id || null,
      }
    });
  }

  async generateImpersonationToken(tenantId: string): Promise<ImpersonationResult> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { T_Id: tenantId },
      include: { T_Users: { where: { U_Role: Role.ADMIN, U_IsActive: true }, take: 1 } }
    });

    if (!tenant || tenant.T_Users.length === 0) throw new NotFoundException("Aucun accès souverain possible.");

    const target = tenant.T_Users[0];
    const payload = { sub: target.U_Id, U_Email: target.U_Email, tenantId: tenant.T_Id, isImpersonated: true };
    
    return {
      token: this.jwtService.sign(payload),
      user: { U_Id: target.U_Id, U_Email: target.U_Email, U_Role: target.U_Role, tenantId: tenant.T_Id, tenantName: tenant.T_Name }
    };
  }

  async getTenantDetails(tenantId: string) {
    const details = await this.prisma.tenant.findUnique({
      where: { T_Id: tenantId },
      include: { T_Users: { orderBy: { U_CreatedAt: 'desc' } }, T_Sites: true, _count: { select: { T_Users: true, T_Sites: true } } }
    });
    if (!details) throw new NotFoundException("Nœud introuvable.");
    return details;
  }
}