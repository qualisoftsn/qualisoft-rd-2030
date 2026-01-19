import { 
  BadRequestException, 
  Injectable, 
  Logger, 
  UnauthorizedException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterTenantDto } from './dto/register-tenant.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * LOGIN : Authentification et récupération du statut de première connexion
   */
  async login(loginDto: LoginDto) {
    const { U_Email, U_Password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { U_Email },
      include: { tenant: true }
    });

    // Vérification de l'existence et du mot de passe
    if (!user || !(await bcrypt.compare(U_Password, user.U_PasswordHash))) {
      this.logger.error(`❌ Échec de connexion : ${U_Email}`);
      throw new UnauthorizedException('Identifiants incorrects');
    }

    this.logger.log(`🚀 Connexion réussie : ${user.U_FirstName} ${user.U_LastName}`);

    // Construction du Payload JWT
    const payload = { 
      U_Id: user.U_Id, 
      email: user.U_Email, 
      tenantId: user.tenantId, 
      role: user.U_Role 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        U_Id: user.U_Id,
        U_FirstName: user.U_FirstName,
        U_LastName: user.U_LastName,
        U_Email: user.U_Email,
        U_Role: user.U_Role,
        U_FirstLogin: user.U_FirstLogin, // 👈 Indispensable pour la modale de bienvenue
        tenantId: user.tenantId,
        U_TenantName: user.tenant?.T_Name,
        U_Tenant: user.tenant
      }
    };
  }

  /**
   * REGISTER : Création atomique de l'instance Elite (Tenant + Site + Admin)
   * Configuration par défaut en mode ESSAI (14 jours)
   */
  async registerTenant(dto: RegisterTenantDto) {
    // 🛠️ Extraction stricte selon le Payload validé
    const { 
      companyName, ceoName, phone, address,
      adminFirstName, adminLastName, email, password 
    } = dto;

    // 1. Vérification d'unicité
    const existingUser = await this.prisma.user.findUnique({ where: { U_Email: email } });
    if (existingUser) {
      throw new BadRequestException("Cet email est déjà utilisé pour un compte administrateur.");
    }

    // 2. Préparation des données temporelles (Période d'essai de 14 jours)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);

    // 3. Transaction Atomique (Tout ou rien)
    return this.prisma.$transaction(async (tx) => {
      
      // Étape A : Création du Tenant (Instance de l'entreprise)
      const tenant = await tx.tenant.create({
        data: {
          T_Name: companyName,
          T_Email: email,
          T_Domain: companyName.toLowerCase().replace(/\s+/g, '-'),
          T_Plan: 'ESSAI', // 👈 Verrouillé sur ESSAI pour l'onboarding public
          T_SubscriptionStatus: 'TRIAL',
          T_SubscriptionEndDate: trialEndDate,
          T_Address: address,
          T_Phone: phone,
          T_CeoName: ceoName,
          T_IsActive: true,
        }
      });

      // Étape B : Création du Site par défaut (Siège Social)
      const site = await tx.site.create({
        data: {
          S_Name: 'Siège Social',
          S_Address: address,
          tenantId: tenant.T_Id
        }
      });

      // Étape C : Création de l'Administrateur principal
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await tx.user.create({
        data: {
          U_Email: email,
          U_PasswordHash: hashedPassword,
          U_FirstName: adminFirstName, 
          U_LastName: adminLastName,   
          U_Role: 'ADMIN',
          U_FirstLogin: true,          // 👈 Active la modale de bienvenue au premier login
          tenantId: tenant.T_Id,
          U_SiteId: site.S_Id,
        },
        include: { tenant: true }
      });

      this.logger.log(`✨ Instance Elite ESSAI créée avec succès : ${companyName} (${email})`);

      // 4. Retour des données avec Token pour connexion immédiate
      const payload = { 
        U_Id: user.U_Id, 
        email: user.U_Email, 
        tenantId: user.tenantId, 
        role: user.U_Role 
      };

      return {
        access_token: this.jwtService.sign(payload),
        user: {
          U_Id: user.U_Id,
          U_FirstName: user.U_FirstName,
          U_LastName: user.U_LastName,
          U_Email: user.U_Email,
          U_Role: user.U_Role,
          U_FirstLogin: user.U_FirstLogin,
          tenantId: user.tenantId,
          U_TenantName: tenant.T_Name,
          U_Tenant: tenant
        }
      };
    });
  }

  /**
   * DISABLE FIRST LOGIN : Désactive la modale après la première lecture
   */
  async disableFirstLogin(userId: string) {
    this.logger.log(`✅ Bienvenue terminée pour l'utilisateur : ${userId}`);
    return this.prisma.user.update({
      where: { U_Id: userId },
      data: { U_FirstLogin: false }
    });
  }
}