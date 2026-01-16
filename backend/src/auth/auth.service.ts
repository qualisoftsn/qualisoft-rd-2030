import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
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
   * LOGIN : Connexion classique
   */
  async login(loginDto: LoginDto) {
    const { U_Email, U_Password } = loginDto;
    const user = await this.prisma.user.findUnique({
      where: { U_Email },
      include: { tenant: true }
    });

    if (!user || !(await bcrypt.compare(U_Password, user.U_PasswordHash))) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    const payload = { U_Id: user.U_Id, email: user.U_Email, tenantId: user.tenantId, role: user.U_Role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        U_Id: user.U_Id,
        U_FirstName: user.U_FirstName,
        U_LastName: user.U_LastName,
        U_Email: user.U_Email,
        U_Role: user.U_Role,
        tenantId: user.tenantId,
        U_TenantName: user.tenant?.T_Name
      }
    };
  }

  /**
   * REGISTER : Création simultanée de l'Entreprise et de l'Administrateur
   */
  async registerTenant(dto: RegisterTenantDto) {
    const { 
      companyName, ceoName, phone, address,
      firstName, lastName, email, password 
    } = dto;

    // 1. Vérifier si l'email de l'admin existe déjà
    const existingUser = await this.prisma.user.findUnique({ where: { U_Email: email } });
    if (existingUser) throw new BadRequestException("Cet email est déjà utilisé.");

    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);

    // 2. TRANSACTION ATOMIQUE : On remplit les 3 tables d'un coup
    return this.prisma.$transaction(async (tx) => {
      
      // Étape A : Créer le TENANT
      const tenant = await tx.tenant.create({
        data: {
          T_Name: companyName,
          T_Email: email,
          T_Domain: companyName.toLowerCase().replace(/\s+/g, '-'),
          T_Plan: 'ENTREPRISE',
          T_SubscriptionStatus: 'TRIAL',
          T_SubscriptionEndDate: trialEndDate,
          T_Address: address,
          T_Phone: phone,
          T_CeoName: ceoName,
        }
      });

      // Étape B : Créer le SITE de base (Siège)
      const site = await tx.site.create({
        data: {
          S_Name: 'Siège Social',
          S_Address: address,
          tenantId: tenant.T_Id
        }
      });

      // Étape C : Créer l'USER (Administrateur) lié au Tenant et au Site
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await tx.user.create({
        data: {
          U_Email: email,
          U_PasswordHash: hashedPassword,
          U_FirstName: firstName, 
          U_LastName: lastName,   
          U_Role: 'ADMIN',
          tenantId: tenant.T_Id,
          U_SiteId: site.S_Id,
        }
      });

      this.logger.log(`✨ Succès : Entreprise ${companyName} et Admin ${firstName} créés.`);

      return {
        access_token: this.jwtService.sign({ U_Id: user.U_Id, tenantId: tenant.T_Id }),
        user: {
          U_Id: user.U_Id,
          U_FirstName: user.U_FirstName,
          U_Email: user.U_Email,
          U_TenantName: tenant.T_Name
        }
      };
    });
  }
}