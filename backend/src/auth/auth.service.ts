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

  async login(data: any) {
    const { U_Email, U_Password } = data;

    const user = await this.prisma.user.findUnique({
      where: { U_Email },
      include: { tenant: true }
    });

    if (!user) {
      this.logger.error(`❌ Échec : Utilisateur ${U_Email} introuvable.`);
      throw new UnauthorizedException('Identifiants incorrects');
    }

    const isPasswordValid = await bcrypt.compare(U_Password, user.U_PasswordHash);
    
    if (!isPasswordValid) {
      this.logger.error(`❌ Échec : Mot de passe invalide pour ${U_Email}.`);
      throw new UnauthorizedException('Identifiants incorrects');
    }

    this.logger.log(`🚀 Accès Intégral accordé : ${user.U_FirstName} ${user.U_LastName} [${user.U_Role}]`);

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
        U_Tenant: user.tenant 
      }
    };
  }

  async registerTenant(dto: any) {
    const { 
      companyName, ceoName, phone, address,
      adminFirstName, adminLastName, email, password 
    } = dto;

    const existingUser = await this.prisma.user.findUnique({ where: { U_Email: email } });
    if (existingUser) throw new BadRequestException("Cet email entreprise est déjà utilisé.");

    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);

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
          T_Plan: 'ENTREPRISE', 
          T_SubscriptionStatus: 'TRIAL',
          T_SubscriptionEndDate: trialEndDate,
          T_IsActive: true,
        }
      });

      // B. Création du Site Principal
      const defaultSite = await tx.site.create({
        data: {
          S_Name: 'Siège Social',
          S_Address: address,
          tenantId: tenant.T_Id
        }
      });

      // C. Création de l'Administrateur
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await tx.user.create({
        data: {
          U_Email: email,
          U_PasswordHash: hashedPassword,
          U_FirstName: adminFirstName,
          U_LastName: adminLastName,
          U_Role: 'ADMIN',
          tenantId: tenant.T_Id,
          U_SiteId: defaultSite.S_Id,
        },
        include: { tenant: true }
      });

      this.logger.log(`✨ Instance ENTREPRISE créée avec succès : ${companyName} (${email})`);

      const payload = { U_Id: user.U_Id, U_Email: user.U_Email, tenantId: user.tenantId, U_Role: user.U_Role };

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