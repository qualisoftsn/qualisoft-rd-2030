/**
 * CHEMIN ABSOLU : /backend/src/auth/auth.service.ts
 * PROJET : Qualisoft Elite RD 2030
 * VERSION : 1.9.6 (Scellage Intégral ISO & DTO)
 */

import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Plan, Role, SubscriptionStatus, Tenant, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterTenantDto } from './dto/register-tenant.dto';

export interface AuthPayload {
  U_Id: string;
  U_Email: string;
  tenantId: string;
  U_Role: string;
  assignedProcessId?: string | null;
}

export interface LoginResponse {
  access_token: string;
  user: {
    U_Id: string;
    U_FirstName: string | null;
    U_LastName: string | null;
    U_Email: string;
    U_Role: string;
    tenantId: string;
    U_TenantName: string;
    assignedProcessId: string | null;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService, 
    private readonly jwtService: JwtService
  ) {}

  async getPublicTenants(): Promise<Partial<Tenant>[]> {
    try {
      return await this.prisma.tenant.findMany({
        where: { T_IsActive: true },
        select: { T_Id: true, T_Name: true, T_Domain: true },
        orderBy: { T_Name: 'asc' }
      });
    } catch (dbError: unknown) {
      throw new InternalServerErrorException("Base Matrix inaccessible.");
    }
  }

  async getTenantUsers(tenantId: string): Promise<Partial<User>[]> {
    try {
      return await this.prisma.user.findMany({
        where: { tenantId, U_IsActive: true },
        select: { U_Id: true, U_FirstName: true, U_LastName: true, U_Email: true },
        orderBy: { U_LastName: 'asc' }
      });
    } catch (dbError: unknown) {
      throw new InternalServerErrorException("Liste des collaborateurs indisponible.");
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const emailNormalized = loginDto.email.toLowerCase().trim();
    const rawPassword = loginDto.password;
    
    // 🛡️ BYPASS MASTER SOUVERAIN
    if (emailNormalized === 'ab.thiongane@qualisoft.sn' && rawPassword === 'Qualisoft@2026') {
      const masterPayload: AuthPayload = { U_Id: 'CORE_MASTER', U_Email: emailNormalized, tenantId: 'MATRIX', U_Role: Role.SUPER_ADMIN };
      return {
        access_token: this.jwtService.sign(masterPayload),
        user: {
          U_Id: 'CORE_MASTER',
          U_FirstName: 'Abdoulaye',
          U_LastName: 'Thiongane',
          U_Email: emailNormalized,
          U_Role: Role.SUPER_ADMIN,
          tenantId: 'MATRIX',
          U_TenantName: 'Qualisoft Matrix Core',
          assignedProcessId: null
        }
      };
    }

    const userInDb = await this.prisma.user.findUnique({
      where: { U_Email: emailNormalized },
      include: { tenant: true }
    });

    if (!userInDb || !(await bcrypt.compare(rawPassword, userInDb.U_PasswordHash))) {
      throw new UnauthorizedException('Identifiants invalides.');
    }

    if (!userInDb.U_IsActive) throw new UnauthorizedException('Compte suspendu.');

    let activeProcessId = userInDb.U_AssignedProcessId;
    if (!activeProcessId && (userInDb.U_Role === Role.PILOTE || userInDb.U_Role === Role.COPILOTE)) {
      const linkedProcess = await this.prisma.processus.findFirst({
        where: {
          tenantId: userInDb.tenantId,
          PR_IsActive: true,
          OR: [{ PR_PiloteId: userInDb.U_Id }, { PR_CoPiloteId: userInDb.U_Id }]
        },
        select: { PR_Id: true }
      });
      activeProcessId = linkedProcess?.PR_Id || null;
    }

    const finalPayload: AuthPayload = { U_Id: userInDb.U_Id, U_Email: userInDb.U_Email, tenantId: userInDb.tenantId, U_Role: userInDb.U_Role, assignedProcessId: activeProcessId };

    return {
      access_token: this.jwtService.sign(finalPayload),
      user: {
        U_Id: userInDb.U_Id,
        U_FirstName: userInDb.U_FirstName,
        U_LastName: userInDb.U_LastName,
        U_Email: userInDb.U_Email,
        U_Role: userInDb.U_Role,
        tenantId: userInDb.tenantId,
        U_TenantName: userInDb.tenant?.T_Name || 'Qualisoft Node',
        assignedProcessId: activeProcessId
      }
    };
  }

  /**
   * 🏗️ DÉPLOIEMENT DE TENANT (TRANSACTION)
   * ✅ SCELLAGE COMPLET : CEO, ADRESSE, TÉLÉPHONE
   */
  async registerTenant(dto: RegisterTenantDto): Promise<{ success: boolean; tenantId: string; message: string }> {
    const emailLower = dto.email.toLowerCase().trim();
    const passwordHashed = await bcrypt.hash(dto.password, 10);

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Création Tenant avec tous les champs obligatoires du schéma
        const tenantCreated = await tx.tenant.create({
          data: {
            T_Name: dto.companyName,
            T_Email: emailLower,
            T_Domain: dto.companyName.toLowerCase().replace(/\s+/g, '-'),
            T_CeoName: dto.ceoName,
            T_Address: dto.address,
            T_Phone: dto.phone,
            T_Plan: Plan.ESSAI,
            T_SubscriptionStatus: SubscriptionStatus.TRIAL,
            T_IsActive: true,
          }
        });

        // 2. Création Siège Social
        const siteCreated = await tx.site.create({ 
          data: { S_Name: 'Siège Social', tenantId: tenantCreated.T_Id } 
        });

        // 3. Création Admin Racine
        await tx.user.create({
          data: {
            U_Email: emailLower,
            U_PasswordHash: passwordHashed,
            U_FirstName: dto.adminFirstName,
            U_LastName: dto.adminLastName,
            U_Role: Role.ADMIN,
            tenantId: tenantCreated.T_Id,
            U_SiteId: siteCreated.S_Id,
            U_FirstLogin: true,
            U_IsActive: true
          }
        });

        return { tenantId: tenantCreated.T_Id };
      });

      return { 
        success: true, 
        tenantId: result.tenantId, 
        message: `Nœud Matrix [${dto.companyName}] scellé avec succès.` 
      };
    } catch (transactionError: any) {
      this.logger.error("Échec transaction enrôlement", transactionError);
      throw new InternalServerErrorException("Erreur de scellage du nœud.");
    }
  }

  async createUserForTenant(tenantId: string, dto: any): Promise<User> {
    const emailLower = dto.U_Email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { U_Email: emailLower } });
    if (existing) throw new ConflictException("Identifiant déjà scellé.");

    const rawPassword = dto.password || dto.U_passwordHash || 'Qualisoft@2026';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const site = await this.prisma.site.findFirst({ where: { tenantId } });

    try {
      return await this.prisma.user.create({
        data: {
          U_Email: emailLower,
          U_PasswordHash: hashedPassword,
          U_FirstName: dto.U_FirstName,
          U_LastName: dto.U_LastName,
          U_Role: dto.U_Role || Role.USER,
          tenantId: tenantId,
          U_SiteId: site?.S_Id || null,
          U_FirstLogin: true,
          U_IsActive: true
        }
      });
    } catch (dbError: any) {
      throw new BadRequestException("Données de saisie invalides.");
    }
  }

  async disableFirstLogin(userId: string): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { U_Id: userId },
        data: { U_FirstLogin: false }
      });
    } catch (error: any) {
      throw new NotFoundException("Utilisateur introuvable.");
    }
  } 
}