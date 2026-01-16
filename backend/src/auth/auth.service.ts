import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
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
   * Récupère l'accès intégral basé sur le rôle et le plan.
   */
  async login(loginDto: LoginDto) {
    const { U_Email, U_Password } = loginDto;

    // 1. Recherche de l'utilisateur avec son Tenant (Respect du schéma Prisma)
    const user = await this.prisma.user.findUnique({
      where: { U_Email },
      include: { tenant: true }
    });

    if (!user) {
      this.logger.error(`❌ Échec : Utilisateur ${U_Email} introuvable.`);
      throw new UnauthorizedException('Identifiants incorrects');
    }

    // 2. Vérification du mot de passe (bcrypt)
    const isPasswordValid = await bcrypt.compare(U_Password, user.U_PasswordHash);
    
    if (!isPasswordValid) {
      this.logger.error(`❌ Échec : Mot de passe invalide pour ${U_Email}.`);
      throw new UnauthorizedException('Identifiants incorrects');
    }

    this.logger.log(`🚀 Accès accordé : ${user.U_FirstName} ${user.U_LastName} [${user.U_Role}]`);

    // 3. Payload JWT enrichi pour le SMI
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
        U_Tenant: user.tenant // Contient le T_Plan, T_SubscriptionStatus, etc.
      }
    };
  }

  /**
   * REGISTER : Déploiement d'une nouvelle instance Qualisoft Elite
   * Crée atomiquement le Tenant, le Site et l'Admin principal.
   */
  async registerTenant(dto: RegisterTenantDto) {
    const { 
      companyName, ceoName, phone, address,
      firstName, lastName, email, password 
    } = dto;

    // 1. Vérification d'unicité (Empêche les doublons sur l'email admin)
    const existingUser = await this.prisma.user.findUnique({ where: { U_Email: email } });
    if (existingUser) {
      throw new BadRequestException("Cet email entreprise est déjà utilisé pour un compte administrateur.");
    }

    // 2. Configuration de la période d'essai Elite (14 jours)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);

    // 3. Transaction Atomique : On crée tout ou on annule tout
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
          T_Plan: 'ENTREPRISE',               // ⚡ Elite Force : Plan complet par défaut
          T_SubscriptionStatus: 'TRIAL',      // ⚡ Statut Essai
          T_SubscriptionEndDate: trialEndDate,
          T_IsActive: true,
        }
      });

      // B. Création du Site de base (Siège Social)
      const defaultSite = await tx.site.create({
        data: {
          S_Name: 'Siège Social',
          S_Address: address,
          tenantId: tenant.T_Id
        }
      });

      // C. Création de l'Administrateur principal
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

      this.logger.log(`✨ Nouvelle instance Elite créée : ${companyName} (${email})`);

      // 4. Génération automatique du token pour connexion immédiate
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