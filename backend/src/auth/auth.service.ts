import { 
  BadRequestException, Injectable, Logger, UnauthorizedException, 
  InternalServerErrorException, NotFoundException 
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

  /** ✅ Liste des instances actives (ISO 9001 §4.1) */
  async getPublicTenants() {
    return this.prisma.tenant.findMany({
      where: { T_IsActive: true },
      select: { T_Id: true, T_Name: true, T_Domain: true },
      orderBy: { T_Name: 'asc' }
    });
  }

  /** ✅ Liste des collaborateurs par instance */
  async getTenantUsers(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId, U_IsActive: true },
      select: { U_Id: true, U_FirstName: true, U_LastName: true, U_Email: true },
      orderBy: { U_LastName: 'asc' }
    });
  }

  /** 🔑 Login Master : Génération des 6 environnements ISO */
  async login(loginDto: LoginDto) {
    const emailNormalized = loginDto.U_Email.toLowerCase().trim();
    
    const user = await this.prisma.user.findUnique({
      where: { U_Email: emailNormalized },
      include: { tenant: true }
    });

    if (!user || !(await bcrypt.compare(loginDto.U_Password, user.U_PasswordHash))) {
      throw new UnauthorizedException('Identifiants invalides.');
    }

    if (!user.U_IsActive) {
      throw new UnauthorizedException('Ce compte a été archivé par la Direction.');
    }

    // 🛡️ 1. DÉTERMINATION DU RÔLE SOUVERAIN
    const isMaster = user.U_Email === 'ab.thiongane@qualisoft.sn' || user.tenantId === 'QS-2026-JANV';
    const role = isMaster ? 'SUPER_ADMIN' : user.U_Role;

    // 🚀 2. TUNNELING : Identification du cockpit (ISO 9001 §4.4)
    let assignedProcessId = (user as any).U_AssignedProcessId;

    if (!assignedProcessId && (role === 'PILOTE' || role === 'COPILOTE')) {
      const process = await this.prisma.processus.findFirst({
        where: {
          tenantId: user.tenantId,
          PR_IsActive: true,
          OR: [{ PR_PiloteId: user.U_Id }, { PR_CoPiloteId: user.U_Id }]
        },
        select: { PR_Id: true }
      });
      assignedProcessId = process?.PR_Id || null;
    }

    // 🎫 3. SIGNATURE DU PASSEPORT (JWT)
    const payload = { 
      U_Id: user.U_Id, 
      U_Email: user.U_Email, 
      tenantId: user.tenantId, 
      U_Role: role,
      assignedProcessId: assignedProcessId 
    };

    this.logger.log(`🔓 [AUTH] ${role} connecté : ${user.U_Email} (Tenant: ${user.tenantId})`);

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        U_Id: user.U_Id,
        U_FirstName: user.U_FirstName,
        U_LastName: user.U_LastName,
        U_Email: user.U_Email,
        U_Role: role,
        tenantId: user.tenantId,
        U_TenantName: user.tenant?.T_Name || 'Qualisoft Instance',
        assignedProcessId: assignedProcessId
      }
    };
  }

  /** 🏗️ Register Tenant Intégral (Cascade originelle) */
  async registerTenant(dto: RegisterTenantDto) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { U_Email: email } });
    
    if (existing) {
      throw new BadRequestException("Cet email est déjà rattaché à une instance existante.");
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      return await this.prisma.$transaction(async (tx) => {
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

        const site = await tx.site.create({
          data: { S_Name: 'Siège Social', tenantId: tenant.T_Id }
        });

        await tx.user.create({
          data: {
            U_Email: email,
            U_PasswordHash: hashedPassword,
            U_FirstName: dto.adminFirstName || 'Responsable',
            U_LastName: dto.adminLastName || 'Qualité',
            U_Role: 'ADMIN',
            tenantId: tenant.T_Id,
            U_SiteId: site.S_Id,
            U_FirstLogin: true
          }
        });

        return { success: true, tenantId: tenant.T_Id };
      });
    } catch (error: any) {
      this.logger.error(`🚨 Erreur critique registerTenant : ${error.message}`);
      throw new InternalServerErrorException("Échec de création de l'environnement Qualisoft.");
    }
  }

  /** 🔑 Phase 2 : Création de l'Administrateur Seul (Nouveau) */
  async registerAdminOnly(dto: any) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { U_Email: email } });

    if (existing) throw new BadRequestException("Email déjà utilisé.");

    const tenant = await this.prisma.tenant.findUnique({ where: { T_Id: dto.tenantId } });
    if (!tenant) throw new NotFoundException("Instance parente introuvable.");

    // Trouver ou créer le siège social pour l'assignation du site
    let site = await this.prisma.site.findFirst({ where: { tenantId: dto.tenantId } });
    if (!site) {
      site = await this.prisma.site.create({ data: { S_Name: 'Siège Social', tenantId: dto.tenantId } });
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        U_Email: email,
        U_PasswordHash: hashedPassword,
        U_FirstName: dto.firstName,
        U_LastName: dto.lastName,
        U_Role: 'ADMIN',
        tenantId: dto.tenantId,
        U_SiteId: site.S_Id,
        U_FirstLogin: true
      }
    });
  }

  /** 🏁 Désactivation du flag de bienvenue */
  async disableFirstLogin(userId: string) {
    try {
      return await this.prisma.user.update({
        where: { U_Id: userId },
        data: { U_FirstLogin: false }
      });
    } catch (error: any) {
      throw new InternalServerErrorException("Erreur de mise à jour du profil.");
    }
  } 
}