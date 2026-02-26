/**
 * 🛰️ MOTEUR D'AUTHENTIFICATION SOUVERAIN - QUALISOFT ELITE RD 2030
 * VERSION : 3.0.0 (Territorialisation & Scellage JWT)
 * RÔLE : Gestion du cycle de vie des sessions et provisioning des nœuds.
 */

// import {
//   BadRequestException,
//   ConflictException,
//   Injectable,
//   InternalServerErrorException,
//   Logger,
//   NotFoundException,
//   UnauthorizedException
// } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { Plan, Role, SubscriptionStatus, Tenant, User } from '@prisma/client';
// import * as bcrypt from 'bcryptjs';

// import { PrismaService } from '../prisma/prisma.service';
// import { LoginDto } from './dto/login.dto';
// import { RegisterTenantDto } from './dto/register-tenant.dto';

// // --- INTERFACES SCELLÉES ---
// export interface AuthPayload {
//   U_Id: string;
//   U_Email: string;
//   tenantId: string;
//   U_TenantDomain: string; // 🚩 Le slug pour le Middleware (ex: "pad")
//   U_Role: string;
//   assignedProcessId?: string | null;
// }

// export interface LoginResponse {
//   access_token: string;
//   user: {
//     U_Id: string;
//     U_FirstName: string | null;
//     U_LastName: string | null;
//     U_Email: string;
//     U_Role: string;
//     tenantId: string;
//     U_TenantName: string;
//     U_TenantDomain: string; // 🚩 Le slug pour la navigation
//     assignedProcessId: string | null;
//   };
// }

// @Injectable()
// export class AuthService {
//   private readonly logger = new Logger(AuthService.name);

//   constructor(
//     private readonly prisma: PrismaService, 
//     private readonly jwtService: JwtService
//   ) {}

//   /**
//    * 🔓 IDENTIFICATION DU NŒUD PAR DOMAINE
//    * Crucial pour le chargement initial : pad.qualisoft.sn -> "pad"
//    */
//   async getTenantByDomain(domain: string): Promise<Partial<Tenant>> {
//     const tenant = await this.prisma.tenant.findUnique({
//       where: { T_Domain: domain.toLowerCase().trim() },
//       select: { T_Id: true, T_Name: true, T_Domain: true, T_IsActive: true }
//     });

//     if (!tenant) {
//       throw new NotFoundException(`Le nœud Matrix [${domain}] est introuvable.`);
//     }

//     if (!tenant.T_IsActive) {
//       throw new UnauthorizedException(`Le nœud [${tenant.T_Name}] est actuellement suspendu.`);
//     }

//     return tenant;
//   }

//   /**
//    * 🔓 LECTURE DU REGISTRE PUBLIC (Fédération)
//    */
//   async getPublicTenants(): Promise<Partial<Tenant>[]> {
//     try {
//       return await this.prisma.tenant.findMany({
//         where: { T_IsActive: true },
//         select: { T_Id: true, T_Name: true, T_Domain: true },
//         orderBy: { T_Name: 'asc' }
//       });
//     } catch (error) {
//       throw new InternalServerErrorException("Base Matrix inaccessible.");
//     }
//   }

//   /**
//    * 🔓 SCAN DES COLLABORATEURS D'UN NŒUD
//    */
//   async getTenantUsers(tenantId: string): Promise<Partial<User>[]> {
//     try {
//       return await this.prisma.user.findMany({
//         where: { tenantId, U_IsActive: true },
//         select: { U_Id: true, U_FirstName: true, U_LastName: true, U_Email: true },
//         orderBy: { U_LastName: 'asc' }
//       });
//     } catch (error) {
//       throw new InternalServerErrorException("Liste des collaborateurs indisponible.");
//     }
//   }

//   /**
//    * 🔐 AUTHENTIFICATION SOUVERAINE
//    * Gère le Bypass Master et l'identification multi-tenant.
//    */
//   async login(loginDto: LoginDto): Promise<LoginResponse> {
//     const emailNormalized = loginDto.email.toLowerCase().trim();
//     const rawPassword = loginDto.password;
    
//     // 🛡️ BYPASS MASTER SOUVERAIN (Abdoulaye Thiongane)
//     // Synchronisé avec le mot de passe scellé du projet
//     if (emailNormalized === 'ab.thiongane@qualisoft.sn' && (rawPassword === 'Qualisoft@2026' || rawPassword === 'mohamed1965ab1711@@@')) {
//       const masterPayload: AuthPayload = { 
//         U_Id: 'CORE_MASTER', 
//         U_Email: emailNormalized, 
//         tenantId: 'MATRIX', // 🚩 CORRECTION CRITIQUE : Aligné sur les Guards
//         U_TenantDomain: 'elite', // 🚩 Territoire Master
//         U_Role: Role.SUPER_ADMIN 
//       };
      
//       return {
//         access_token: this.jwtService.sign(masterPayload),
//         user: {
//           U_Id: 'CORE_MASTER',
//           U_FirstName: 'Abdoulaye',
//           U_LastName: 'Thiongane',
//           U_Email: emailNormalized,
//           U_Role: Role.SUPER_ADMIN,
//           tenantId: 'MATRIX', // 🚩 CORRECTION CRITIQUE
//           U_TenantName: 'Qualisoft Corporate',
//           U_TenantDomain: 'elite',
//           assignedProcessId: null
//         }
//       };
//     }

//     // 🕵️ RECHERCHE DANS LE REGISTRE UTILISATEUR
//     const userInDb = await this.prisma.user.findUnique({
//       where: { U_Email: emailNormalized },
//       include: { tenant: true }
//     });

//     if (!userInDb || !(await bcrypt.compare(rawPassword, userInDb.U_PasswordHash))) {
//       throw new UnauthorizedException('Identifiants Matrix invalides.');
//     }

//     if (!userInDb.U_IsActive) throw new UnauthorizedException('Compte suspendu par le système.');

//     // 🛰️ DÉTERMINATION DU PROCESSUS ACTIF (ISO 9001)
//     let activeProcessId = userInDb.U_AssignedProcessId;
//     if (!activeProcessId && (userInDb.U_Role === Role.PILOTE || userInDb.U_Role === Role.COPILOTE)) {
//       const linkedProcess = await this.prisma.processus.findFirst({
//         where: {
//           tenantId: userInDb.tenantId,
//           PR_IsActive: true,
//           OR: [{ PR_PiloteId: userInDb.U_Id }, { PR_CoPiloteId: userInDb.U_Id }]
//         },
//         select: { PR_Id: true }
//       });
//       activeProcessId = linkedProcess?.PR_Id || null;
//     }

//     // 🚩 CONSTRUCTION DU PAYLOAD AVEC LE SLUG DU DOMAINE
//     const finalPayload: AuthPayload = { 
//       U_Id: userInDb.U_Id, 
//       U_Email: userInDb.U_Email, 
//       tenantId: userInDb.tenantId, 
//       U_TenantDomain: userInDb.tenant.T_Domain, // 🚩 Le slug (ex: "pad")
//       U_Role: userInDb.U_Role, 
//       assignedProcessId: activeProcessId 
//     };

//     return {
//       access_token: this.jwtService.sign(finalPayload),
//       user: {
//         U_Id: userInDb.U_Id,
//         U_FirstName: userInDb.U_FirstName,
//         U_LastName: userInDb.U_LastName,
//         U_Email: userInDb.U_Email,
//         U_Role: userInDb.U_Role,
//         tenantId: userInDb.tenantId,
//         U_TenantName: userInDb.tenant?.T_Name || 'Qualisoft Node',
//         U_TenantDomain: userInDb.tenant.T_Domain, // 🚩 Indispensable pour le routage Frontend
//         assignedProcessId: activeProcessId
//       }
//     };
//   }

//   /**
//    * 🏗️ PROVISIONING DE TENANT (TRANSACTION ATOMIQUE)
//    * Création simultanée du Tenant, du Siège et de l'Admin Racine.
//    */
//   async registerTenant(dto: RegisterTenantDto): Promise<{ success: boolean; tenantId: string; message: string }> {
//     const emailLower = dto.email.toLowerCase().trim();
//     const passwordHashed = await bcrypt.hash(dto.password, 12); // Round 12 pour sécurité ELITE
//     const domainSlug = dto.companyName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

//     try {
//       const result = await this.prisma.$transaction(async (tx) => {
//         // 1. Création Tenant
//         const tenantCreated = await tx.tenant.create({
//           data: {
//             T_Name: dto.companyName,
//             T_Email: emailLower,
//             T_Domain: domainSlug,
//             T_CeoName: dto.ceoName,
//             T_Address: dto.address,
//             T_Phone: dto.phone,
//             T_Plan: Plan.ENTREPRISE,
//             T_SubscriptionStatus: SubscriptionStatus.ACTIVE,
//             T_IsActive: true,
//             T_ContractDuration: 24,
//             T_TacitRenewal: true,
//           }
//         });

//         // 2. Création Siège Social (Ancrage géographique)
//         const siteCreated = await tx.site.create({ 
//           data: { 
//             S_Id: `SITE_HQ_${tenantCreated.T_Id.slice(0, 8)}`,
//             S_Name: `SIÈGE - ${tenantCreated.T_Name.toUpperCase()}`, 
//             S_Address: dto.address,
//             S_Country: 'Sénégal',
//             tenantId: tenantCreated.T_Id 
//           } 
//         });

//         // 3. Création Admin Racine
//         await tx.user.create({
//           data: {
//             U_Email: emailLower,
//             U_PasswordHash: passwordHashed,
//             U_FirstName: dto.adminFirstName,
//             U_LastName: dto.adminLastName,
//             U_Role: Role.ADMIN,
//             tenantId: tenantCreated.T_Id,
//             U_SiteId: siteCreated.S_Id,
//             U_FirstLogin: true,
//             U_IsActive: true
//           }
//         });

//         return { tenantId: tenantCreated.T_Id };
//       });

//       return { 
//         success: true, 
//         tenantId: result.tenantId, 
//         message: `Nœud Matrix [${dto.companyName}] scellé avec succès.` 
//       };
//     } catch (error: any) {
//       this.logger.error("❌ ÉCHEC PROVISIONING TENANT", error);
//       if (error.code === 'P2002') throw new ConflictException("Ce domaine ou email est déjà scellé dans la Matrix.");
//       throw new InternalServerErrorException("Erreur lors du scellage du nœud.");
//     }
//   }

//   /**
//    * 🖋️ ENRÔLEMENT COLLABORATEUR (RH SOUVERAIN)
//    */
//   async createUserForTenant(tenantId: string, dto: any): Promise<User> {
//     const emailLower = dto.U_Email.toLowerCase().trim();
//     const existing = await this.prisma.user.findUnique({ where: { U_Email: emailLower } });
//     if (existing) throw new ConflictException("Cet identifiant existe déjà dans le Registre Global.");

//     const rawPassword = dto.password || 'Qualisoft@2026';
//     const hashedPassword = await bcrypt.hash(rawPassword, 12);
//     const site = await this.prisma.site.findFirst({ where: { tenantId } });

//     try {
//       return await this.prisma.user.create({
//         data: {
//           U_Email: emailLower,
//           U_PasswordHash: hashedPassword,
//           U_FirstName: dto.U_FirstName,
//           U_LastName: dto.U_LastName,
//           U_Role: dto.U_Role || Role.USER,
//           tenantId: tenantId,
//           U_SiteId: site?.S_Id || null,
//           U_FirstLogin: true,
//           U_IsActive: true
//         }
//       });
//     } catch (error) {
//       throw new BadRequestException("Données d'enrôlement invalides.");
//     }
//   }

//   /**
//    * 🔄 BASCULE PREMIÈRE CONNEXION
//    */
//   async disableFirstLogin(userId: string): Promise<User> {
//     try {
//       return await this.prisma.user.update({
//         where: { U_Id: userId },
//         data: { U_FirstLogin: false }
//       });
//     } catch (error) {
//       throw new NotFoundException("Citoyen Matrix introuvable.");
//     }
//   } 
// }

// auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { compare } from 'bcryptjs';
import { User } from '@prisma/client';

export interface AuthPayload {
  U_Id: string;
  U_Email: string;
  U_Role: string;
  tenantId: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(
    email: string,
    password: string,
    tenantId?: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    // 🔍 RECHERCHE DE L'UTILISATEUR AVEC RELATIONS
    const user = await this.prisma.user.findFirst({
      where: {
        U_Email: email.toLowerCase().trim(),
        U_IsActive: true,
        ...(tenantId && tenantId !== 'MATRIX' ? { tenantId } : {}),
      },
      include: {
        tenant: true, // 🔑 Pour accéder à T_Domain (pas de U_TenantDomain dans Prisma)
      },
    });

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // 🔐 VÉRIFICATION DU MOT DE PASSE
    const isValid = await compare(password, user.U_PasswordHash);
    if (!isValid) {
      this.logger.warn(`Tentative de connexion échouée pour ${email}`);
      throw new UnauthorizedException('Identifiants invalides');
    }

    // 🚩 CAS SPÉCIAL : SUPER_ADMIN (accès multi-tenant)
    if (user.U_Role === 'SUPER_ADMIN' && !tenantId) {
      throw new BadRequestException('Le tenantId est requis pour les SUPER_ADMIN');
    }

    // ✅ GÉNÉRATION DES TOKENS
    const payload: AuthPayload = {
      U_Id: user.U_Id,
      U_Email: user.U_Email,
      U_Role: user.U_Role,
      tenantId: user.tenantId,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload);

    return { accessToken, refreshToken, user };
  }

  generateAccessToken(payload: AuthPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: this.configService.get<string>('JWT_SECRET'),
    });
  }

  async generateRefreshToken(payload: AuthPayload): Promise<string> {
    // 🔑 Stockage sécurisé côté serveur (optionnel mais recommandé)
    // Ici on génère juste un JWT longue durée (7j)
    return this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });
  }

  async verifyRefreshToken(token: string): Promise<AuthPayload> {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch (e) {
      this.logger.warn('Refresh token invalide ou expiré');
      throw new UnauthorizedException('Session expirée');
    }
  }
}