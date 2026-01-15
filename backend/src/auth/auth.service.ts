import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * LOGIN : Authentification et récupération de l'accès intégral
   */
  async login(data: any) {
    const { U_Email, U_Password } = data;

    // 1. Recherche de l'utilisateur avec son Tenant
    const user = await this.prisma.user.findUnique({
      where: { U_Email },
      include: { 
        tenant: true, 
      }
    });

    if (!user) {
      this.logger.error(`❌ Échec : Utilisateur ${U_Email} introuvable.`);
      throw new UnauthorizedException('Identifiants incorrects');
    }

    // 2. Vérification du mot de passe
    const isPasswordValid = await bcrypt.compare(U_Password, user.U_PasswordHash);
    
    if (!isPasswordValid) {
      this.logger.error(`❌ Échec : Mot de passe invalide pour ${U_Email}.`);
      throw new UnauthorizedException('Identifiants incorrects');
    }

    this.logger.log(`🚀 Accès Intégral accordé : ${user.U_FirstName} ${user.U_LastName} [${user.U_Role}] - Plan: ${user.tenant?.T_Plan}`);

    // 3. Payload JWT enrichi
    const payload = { 
      U_Id: user.U_Id, 
      U_Email: user.U_Email, 
      tenantId: user.tenantId, 
      U_Role: user.U_Role 
    };

    // 4. Retour complet pour le Frontend (Session Pierre Ndiaye)
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
        U_Tenant: user.tenant // Contient T_Plan: 'ENTREPRISE'
      }
    };
  }

  /**
   * REGISTER : Déploiement d'une nouvelle instance Multi-Tenant
   * Force le Plan ENTREPRISE et le statut TRIAL pour accès complet.
   */
  async registerTenant(dto: any) {
    const { 
      companyName, ceoName, phone, address,
      adminFirstName, adminLastName, email, password 
    } = dto;

    // 1. L'email de l'entreprise sert d'identifiant unique pour l'admin
    const existingUser = await this.prisma.user.findUnique({ where: { U_Email: email } });
    if (existingUser) throw new BadRequestException("Cet email entreprise est déjà utilisé.");

    // 2. Configuration de la période d'essai (14 jours)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);

    // 3. Transaction atomique pour garantir l'intégrité des données
    return this.prisma.$transaction(async (tx) => {
      
      // A. Création du Tenant (Organisation) en mode ELITE
      const tenant = await tx.tenant.create({
        data: {
          T_Name: companyName,
          T_CeoName: ceoName,
          T_Phone: phone,
          T_Address: address,
          T_Email: email, // Mail de l'entreprise
          T_Domain: companyName.toLowerCase().replace(/\s+/g, '-'),
          T_Plan: 'ENTREPRISE',              // ⚡ NORMALITÉ : Accès intégral forcé
          T_SubscriptionStatus: 'TRIAL',      // ⚡ NORMALITÉ : Statut Essai par défaut
          T_SubscriptionEndDate: trialEndDate,
          T_IsActive: true,
        }
      });

      // B. Création du Site Principal (Requis pour la structure des données SMI)
      const defaultSite = await tx.site.create({
        data: {
          S_Name: 'Siège Social',
          S_Address: address,
          tenantId: tenant.T_Id
        }
      });

      // C. Création de l'Administrateur (ex: Pierre Ndiaye)
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await tx.user.create({
        data: {
          U_Email: email, // Identifiant = Mail entreprise
          U_PasswordHash: hashedPassword,
          U_FirstName: adminFirstName,
          U_LastName: adminLastName,
          U_Role: 'ADMIN', // Pouvoirs de configuration totaux
          tenantId: tenant.T_Id,
          U_SiteId: defaultSite.S_Id, // Rattachement immédiat au site
        },
        include: { tenant: true }
      });

      this.logger.log(`✨ Instance ENTREPRISE créée avec succès : ${companyName} (${email})`);

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