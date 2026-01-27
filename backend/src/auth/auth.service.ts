import { 
  BadRequestException, Injectable, Logger, UnauthorizedException, 
  InternalServerErrorException 
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
    private jwtService: JwtService
  ) {}

  /** ✅ Liste des instances pour le portail public */
  async getPublicTenants() {
    return this.prisma.tenant.findMany({
      where: { T_IsActive: true },
      select: { T_Id: true, T_Name: true, T_Domain: true },
      orderBy: { T_Name: 'asc' }
    });
  }

  /** ✅ Liste des profils pour une instance spécifique */
  async getTenantUsers(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId, U_IsActive: true },
      select: { U_Id: true, U_FirstName: true, U_LastName: true, U_Email: true },
      orderBy: { U_LastName: 'asc' }
    });
  }

  /** 🔑 Login avec isolation des données par Tenant */
  async login(loginDto: LoginDto) {
    const emailNormalized = loginDto.U_Email.toLowerCase().trim();
    this.logger.log(`🔑 [AUTH] Tentative de connexion : ${emailNormalized}`);

    const user = await this.prisma.user.findUnique({
      where: { U_Email: emailNormalized },
      include: { tenant: true }
    });

    if (!user || !(await bcrypt.compare(loginDto.U_Password, user.U_PasswordHash))) {
      throw new UnauthorizedException('Identifiants invalides.');
    }

    if (!user.U_IsActive) {
      throw new UnauthorizedException('Votre compte est désactivé.');
    }

    // Gestion du rôle spécial pour l'instance mère Qualisoft
    const role = user.tenantId === 'QS-2026-JANV' ? 'SUPER_ADMIN' : user.U_Role;

    return {
      access_token: this.jwtService.sign({ 
        U_Id: user.U_Id, 
        U_Email: user.U_Email, 
        tenantId: user.tenantId, 
        U_Role: role 
      }),
      user: {
        U_Id: user.U_Id,
        U_FirstName: user.U_FirstName,
        U_LastName: user.U_LastName,
        U_Email: user.U_Email,
        U_Role: role,
        tenantId: user.tenantId,
        U_TenantName: user.tenant?.T_Name || 'Qualisoft Elite'
      }
    };
  }

  /** 🏗️ Création d'une nouvelle instance (Transaction sécurisée) */
  async registerTenant(dto: RegisterTenantDto) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { U_Email: email } });
    
    if (existing) {
      throw new BadRequestException("Cet email est déjà utilisé par un autre administrateur.");
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Création du Tenant
        const tenant = await tx.tenant.create({
          data: {
            T_Name: dto.companyName,
            T_Email: email,
            T_Domain: dto.companyName.toLowerCase().replace(/\s+/g, '-'),
            T_Plan: 'ESSAI',
            T_SubscriptionStatus: 'TRIAL',
            T_IsActive: true,
          }
        });

        // 2. Création du Siège Social par défaut
        const site = await tx.site.create({
          data: { S_Name: 'Siège Social', tenantId: tenant.T_Id }
        });

        // 3. Création du compte Administrateur
        await tx.user.create({
          data: {
            U_Email: email,
            U_PasswordHash: hashedPassword,
            U_FirstName: dto.adminFirstName || 'Admin',
            U_LastName: dto.adminLastName || dto.companyName,
            U_Role: 'ADMIN',
            tenantId: tenant.T_Id,
            U_SiteId: site.S_Id,
            U_FirstLogin: true
          }
        });

        return { success: true, tenantId: tenant.T_Id };
      });
    } catch (error: any) {
      this.logger.error(`🚨 Erreur registerTenant : ${error.message}`);
      throw new InternalServerErrorException("Échec de la création de l'instance Qualisoft.");
    }
  }

  /** 🏁 Désactivation du flag de première connexion */
  async disableFirstLogin(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { U_Id: userId } });
      if (!user) throw new BadRequestException("Utilisateur introuvable.");

      return await this.prisma.user.update({
        where: { U_Id: userId },
        data: { U_FirstLogin: false }
      });
    } catch (error: any) {
      this.logger.error(`🚨 Erreur disableFirstLogin : ${error.message}`);
      throw new InternalServerErrorException("Impossible de mettre à jour le statut de connexion.");
    }
  }
}