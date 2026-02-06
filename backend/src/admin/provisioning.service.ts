import { 
  Injectable, 
  InternalServerErrorException, 
  Logger, 
  NotFoundException, 
  UnauthorizedException 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Role, Plan, SubscriptionStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

/**
 * 🚀 PROVISIONING SERVICE
 * Moteur de déploiement et d'impersonation Qualisoft Elite.
 * Gère la création des nœuds d'instance et l'autorité souveraine.
 */
@Injectable()
export class ProvisioningService {
  private readonly logger = new Logger(ProvisioningService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  /**
   * ✅ FONCTION : initializeNewClient (Nom Absolu)
   * Déploie un environnement complet : Tenant -> Site -> Admin.
   * Aligné sur le schéma Prisma (U_PasswordHash).
   */
  async initializeNewClient(data: { 
    companyName: string; 
    adminEmail: string; 
    domain?: string; 
    defaultPassword?: string 
  }) {
    const domain = (data.domain || data.companyName).toLowerCase().trim().replace(/\s+/g, '-');
    const email = data.adminEmail.toLowerCase().trim();
    const password = data.defaultPassword || 'qs@20252030';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      return await this.prisma.$transaction(async (tx) => {
        
        // 1. Création ou Mise à jour du Tenant (§Multi-Tenancy)
        const tenant = await tx.tenant.upsert({
          where: { T_Email: email },
          update: { 
            T_Name: data.companyName, 
            T_Domain: domain, 
            T_IsActive: true 
          },
          create: {
            T_Name: data.companyName,
            T_Email: email,
            T_Domain: domain,
            T_Plan: Plan.ESSAI,
            T_SubscriptionStatus: SubscriptionStatus.TRIAL,
            T_IsActive: true,
          },
        });

        // 2. Création du Site (Ligne 57 corrigée)
        // Correction : On utilise une structure de création propre avec liaison directe
        const site = await tx.site.create({
          data: {
            S_Name: `Siège Social - ${tenant.T_Name}`,
            S_IsActive: true,
            tenant: {
              connect: { T_Id: tenant.T_Id }
            }
          }
        });

        // 3. Création/Update du Compte Administrateur (§Souveraineté)
        // Utilisation de U_PasswordHash conformément au schéma Prisma
        await tx.user.upsert({
          where: { U_Email: email },
          update: { 
            tenantId: tenant.T_Id, 
            U_SiteId: site.S_Id,
            U_PasswordHash: hashedPassword 
          },
          create: {
            U_Email: email,
            U_PasswordHash: hashedPassword,
            U_FirstName: 'Admin',
            U_LastName: tenant.T_Name,
            U_Role: Role.ADMIN,
            U_IsActive: true,
            U_FirstLogin: true,
            tenant: {
              connect: { T_Id: tenant.T_Id }
            },
            U_Site: {
              connect: { S_Id: site.S_Id }
            }
          }
        });

        this.logger.log(`✅ Instance déployée avec succès : ${tenant.T_Domain}`);
        return { 
          success: true, 
          tenantId: tenant.T_Id, 
          domain: tenant.T_Domain,
          message: "Déploiement du nœud terminé." 
        };
      });
    } catch (error: any) {
      this.logger.error(`🚨 Échec initializeNewClient : ${error.message}`);
      throw new InternalServerErrorException(`Le provisioning a échoué : ${error.message}`);
    }
  }

  /**
   * ✅ FONCTION : generateImpersonationToken (Nom Absolu)
   * Génère un jeton d'autorité pour permettre au Master d'entrer dans un Tenant.
   */
  async generateImpersonationToken(tenantId: string) {
    this.logger.warn(`🔑 Requête d'impersonation pour le Tenant : ${tenantId}`);

    const tenant = await this.prisma.tenant.findUnique({
      where: { T_Id: tenantId },
      include: { 
        T_Users: { 
          where: { U_Role: Role.ADMIN }, 
          take: 1 
        } 
      }
    });

    if (!tenant || tenant.T_Users.length === 0) {
      throw new NotFoundException("Cible introuvable ou aucun administrateur détecté pour cette instance.");
    }

    const targetUser = tenant.T_Users[0];

    try {
      // Préparation du payload souverain
      const payload = {
        sub: targetUser.U_Id,
        email: targetUser.U_Email,
        tenantId: tenant.T_Id,
        role: targetUser.U_Role,
        isImpersonated: true,
        masterNode: 'Qualisoft-Souverain'
      };

      // Signature du jeton (valide 1 heure)
      const token = this.jwtService.sign(payload, { expiresIn: '1h' });

      return {
        access_token: token,
        user: {
          U_Id: targetUser.U_Id,
          U_FirstName: targetUser.U_FirstName,
          U_LastName: targetUser.U_LastName,
          U_Email: targetUser.U_Email,
          U_Role: targetUser.U_Role,
          tenantId: tenant.T_Id,
          tenantName: tenant.T_Name
        }
      };
    } catch (error: any) {
      this.logger.error(`Échec signature impersonation : ${error.message}`);
      throw new InternalServerErrorException("Erreur lors de la génération du jeton d'autorité.");
    }
  }
}