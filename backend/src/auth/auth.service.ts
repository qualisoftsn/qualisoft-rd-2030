import { 
  BadRequestException, 
  Injectable, 
  Logger, 
  UnauthorizedException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * LOGIN : Authentification Multi-Tenant
   * Gère la connexion et retourne l'accès complet au SMI.
   */
  async login(loginDto: LoginDto) {
    const { U_Email, U_Password } = loginDto;

    // 1. Recherche de l'utilisateur (Respect du préfixe U_)
    const user = await this.prisma.user.findUnique({
      where: { U_Email },
      include: { tenant: true }
    });

    if (!user) {
      this.logger.error(`❌ Échec : Utilisateur ${U_Email} introuvable.`);
      throw new UnauthorizedException('Identifiants incorrects');
    }

    // 2. Vérification du mot de passe haché
    const isPasswordValid = await bcrypt.compare(U_Password, user.U_PasswordHash);
    
    if (!isPasswordValid) {
      this.logger.error(`❌ Échec : Mot de passe invalide pour ${U_Email}.`);
      throw new UnauthorizedException('Identifiants incorrects');
    }

    this.logger.log(`🚀 Accès accordé : ${user.U_FirstName} ${user.U_LastName} [${user.U_Role}]`);

    // 3. Payload JWT pour la session
    const payload = { 
      U_Id: user.U_Id, 
      U_Email: user.U_Email, 
      tenantId: user.tenantId, 
      U_Role: user.U_Role 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        U_Id: user.U_Id,
        U_FirstName: user.U_FirstName,
        U_LastName: user.U_LastName,
        U_Email: user.U_Email,
        U_Role: user.U_Role,
        tenantId: user.tenantId,
        U_SiteId: user.U_SiteId,
        U_TenantName: user.tenant?.T_Name,
        U_Tenant: user.tenant // Accès au plan et statut d'abonnement
      }
    };
  }

  /**
   * REGISTER : Déploiement Instance Qualisoft Elite
   * Crée atomiquement le Tenant, le Site et l'Administrateur principal.
   */
  async registerTenant(dto: RegisterTenantDto) {
    const { 
      companyName, ceoName, phone, address,
      firstName, lastName, email, password 
    } = dto;

    // 1. Vérification d'unicité (U_Email)
    const existingUser = await this.prisma.user.findUnique({ where: { U_Email: email } });
    if (existingUser) {
      throw new BadRequestException("Cet email entreprise est déjà utilisé pour un compte administrateur.");
    }

    // 2. Calcul de la période d'essai (14 jours à partir d'aujourd'hui)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);

    // 3. Transaction Atomique : Garantie l'intégrité des 40 tables
    return this.prisma.$transaction(async (tx) => {
      
      // A. Création du Tenant (Organisation)
      const tenant = await tx.tenant.create({
        data: {
          T_Name: companyName,
          T_CeoName: ceoName,
          T_Phone: phone,
          T_Address: address,
          T_Email: email,
          T_Domain: companyName.toLowerCase().replace(/\s+/g, '-'),
          T_Plan: 'ENTREPRISE',               // ⚡ Elite Force : Plan complet
          T_SubscriptionStatus: 'TRIAL',      // ⚡ Statut Essai par défaut
          T_SubscriptionEndDate: trialEndDate,
          T_IsActive: true,
        }
      });

      // B. Création du Site de base (Obligatoire pour la hiérarchie SMI)
      const defaultSite = await tx.site.create({
        data: {
          S_Name: 'Siège Social',
          S_Address: address,
          tenantId: tenant.T_Id
        }
      });

      // C. Création de l'Administrateur principal (Respect des champs U_)
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await tx.user.create({
        data: {
          U_Email: email,
          U_PasswordHash: hashedPassword,
          U_FirstName: firstName, 
          U_LastName: lastName,   
          U_Role: 'ADMIN',
          tenantId: tenant.T_Id,
          U_SiteId: defaultSite.S_Id,
        },
        include: { tenant: true }
      });

      this.logger.log(`✨ Instance Elite créée avec succès : ${companyName} (${email})`);

      // 4. Génération du token pour connexion automatique après inscription
      const payload = { 
        U_Id: user.U_Id, 
        U_Email: user.U_Email, 
        tenantId: user.tenantId, 
        U_Role: user.U_Role 
      };

      return {
        access_token: this.jwtService.sign(payload),
        user: {
          U_Id: user.U_Id,
          U_FirstName: user.U_FirstName,
          U_LastName: user.U_LastName,
          U_Email: user.U_Email,
          U_Role: user.U_Role,
          tenantId: user.tenantId,
          U_SiteId: user.U_SiteId,
          U_TenantName: tenant.T_Name,
          U_Tenant: tenant
        }
      };
    });
  }
}