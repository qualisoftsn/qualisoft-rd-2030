import { 
  Injectable, Logger, ConflictException, 
  InternalServerErrorException, NotFoundException, BadRequestException 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../common/email.service'; 
import { Role, Plan, SubscriptionStatus, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

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
   * Transaction atomique de scellage d'un nouveau nœud (Tenant).
   */
  async initializeNewClient(data: { 
    companyName: string; domain: string; 
    admin1Email: string; admin2Email: string;
    defaultPassword?: string 
  }): Promise<{ success: boolean; tenantId: string; domain: string; message: string }> {
    
    // Normalisation préventive
    const domainNormalized = data.domain ? data.domain.toLowerCase().trim().replace(/\s+/g, '-') : '';
    const hashedPassword = await bcrypt.hash(data.defaultPassword || 'Qualisoft@2026', 10);

    try {
      // Transaction Prisma : Tout ou Rien
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Vérification Unicité Domaine
        const existing = await tx.tenant.findUnique({ where: { T_Domain: domainNormalized } });
        if (existing) throw new ConflictException(`Le domaine [${domainNormalized}] est déjà actif.`);

        // 2. Création du Tenant
        const tenant = await tx.tenant.create({
          data: {
            T_Name: data.companyName,
            T_Email: data.admin1Email,
            T_Domain: domainNormalized,
            T_Plan: Plan.ESSAI,
            T_SubscriptionStatus: SubscriptionStatus.TRIAL,
            T_IsActive: true,
          },
        });

        // 3. Création du Site Siège par défaut
        const site = await tx.site.create({
          data: { S_Name: `SIÈGE - ${tenant.T_Name.toUpperCase()}`, tenantId: tenant.T_Id }
        });

        // 4. Création des Administrateurs (Dédoublonnage des emails)
        const emails = [...new Set([data.admin1Email.toLowerCase(), data.admin2Email.toLowerCase()])];
        
        for (const email of emails) {
          await tx.user.create({
            data: {
              U_Email: email, 
              U_PasswordHash: hashedPassword,
              U_FirstName: 'Admin', 
              U_LastName: 'Principal',
              U_Role: Role.ADMIN, 
              U_IsActive: true,
              tenantId: tenant.T_Id, 
              U_SiteId: site.S_Id
            }
          });
        }
        
        return { tenantId: tenant.T_Id, domain: tenant.T_Domain };
      });

      return { 
        success: true, 
        tenantId: result.tenantId, 
        domain: result.domain,
        message: `Nœud ${data.companyName} déployé avec succès sur l'infrastructure Qualisoft.` 
      };

    } catch (error) {
      this.logger.error(`Erreur lors du scellage : ${error}`);
      // On relance l'erreur si c'est déjà une exception HTTP connue (ex: Conflict), sinon 500
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException("Échec de la phase de scellage atomique.");
    }
  }

  /**
   * Création d'un collaborateur unitaire.
   * ✅ CORRECTIF APPLIQUÉ : Vérification de l'email avant traitement.
   */
  async createUser(tenantId: string, data: any): Promise<User> {
    // 🛡️ Garde-fou : Vérification critique
    if (!data.email) {
        this.logger.error(`Tentative de création utilisateur sans email pour le tenant ${tenantId}`);
        throw new BadRequestException("L'adresse email est obligatoire.");
    }

    const hashedPassword = await bcrypt.hash(data.password || 'Qualisoft@2026', 10);
    const site = await this.prisma.site.findFirst({ where: { tenantId } });

    // Normalisation sécurisée
    const normalizedEmail = data.email.toLowerCase().trim();

    return this.prisma.user.create({
      data: {
        U_Email: normalizedEmail,
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

  /**
   * Génération du jeton d'impersonation (Prise de contrôle Master).
   */
  async generateImpersonationToken(tenantId: string): Promise<ImpersonationResult> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { T_Id: tenantId },
      include: { T_Users: { where: { U_Role: Role.ADMIN, U_IsActive: true }, take: 1 } }
    });

    if (!tenant || tenant.T_Users.length === 0) {
        throw new NotFoundException("Cible introuvable ou aucun administrateur actif détecté.");
    }

    const target = tenant.T_Users[0];
    
    // Payload enrichi pour le contexte Matrix
    const payload = { 
        sub: target.U_Id, 
        U_Email: target.U_Email, 
        tenantId: tenant.T_Id, 
        isImpersonated: true 
    };
    
    return {
      token: this.jwtService.sign(payload),
      user: { 
          U_Id: target.U_Id, 
          U_Email: target.U_Email, 
          U_Role: target.U_Role, 
          tenantId: tenant.T_Id, 
          tenantName: tenant.T_Name 
        }
    };
  }

  /**
   * Récupération des détails d'une instance pour le Dashboard SuperAdmin.
   */
  async getTenantDetails(tenantId: string) {
    const details = await this.prisma.tenant.findUnique({
      where: { T_Id: tenantId },
      include: { 
          T_Users: { orderBy: { U_CreatedAt: 'desc' } }, 
          T_Sites: true, 
          _count: { select: { T_Users: true } } 
        }
    });

    if (!details) throw new NotFoundException("Instance introuvable.");
    return details;
  }
}