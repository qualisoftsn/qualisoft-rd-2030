/**
 * CHEMIN ABSOLU : /backend/src/auth/auth.controller.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Pilotage des flux d'accès (Public & Privé) et validation des sessions.
 */

import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Param, 
  Body, 
  HttpCode, 
  HttpStatus, 
  Logger 
} from '@nestjs/common';
import { 
  AuthService, 
  LoginResponse 
} from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { User, Tenant } from '@prisma/client';
import { Public } from './decorators/public.decorator'; // ✅ IMPORT SOUVERAIN

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * 🔓 REGISTRE PUBLIC DES TENANTS
   * Utilisé par le Portail Entreprise pour charger la liste des organisations.
   */
  @Public() 
  @Get('public/tenants')
  @HttpCode(HttpStatus.OK)
  async getPublicTenants(): Promise<Partial<Tenant>[]> {
    this.logger.log("🔍 Accès public : Scan des organisations actives.");
    return await this.authService.getPublicTenants();
  }

  /**
   * 🔓 REGISTRE PUBLIC DES COLLABORATEURS
   * Utilisé par le Login Cascade pour l'identification par nœud.
   */
  @Public()
  @Get('public/tenants/:tenantId/users')
  @HttpCode(HttpStatus.OK)
  async getPublicUsers(@Param('tenantId') tenantId: string): Promise<Partial<User>[]> {
    this.logger.log(`🔍 Accès public : Scan des citoyens pour le nœud : ${tenantId}`);
    return await this.authService.getTenantUsers(tenantId);
  }

  /**
   * 🔐 AUTHENTIFICATION (LOGIN)
   * Bypass Master inclus dans le service.
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    this.logger.log(`🔑 Tentative d'accès sécurisé pour : ${loginDto.email}`);
    return await this.authService.login(loginDto);
  }

  /**
   * 🏗️ ENRÔLEMENT DE TENANT (PROVISIONING)
   * Création d'une nouvelle instance Matrix.
   */
  @Public()
  @Post('register-tenant')
  @HttpCode(HttpStatus.CREATED)
  async registerTenant(
    @Body() registerDto: RegisterTenantDto
  ): Promise<{ success: boolean; tenantId: string; message: string }> {
    this.logger.warn(`🏗️ Requête d'enrôlement Matrix pour : ${registerDto.companyName}`);
    return await this.authService.registerTenant(registerDto);
  }

  /**
   * 🖋️ CRÉATION DE COLLABORATEUR (ADMIN)
   * Route protégée : nécessite une session active.
   */
  @Post('tenants/:tenantId/users')
  @HttpCode(HttpStatus.CREATED)
  async createUserInTenant(
    @Param('tenantId') tenantId: string, 
    @Body() userData: any
  ): Promise<User> {
    this.logger.log(`🖋️ Scellage d'un collaborateur pour le nœud : ${tenantId}`);
    return await this.authService.createUserForTenant(tenantId, userData);
  }

  /**
   * 🔄 VALIDATION DE PREMIÈRE CONNEXION
   */
  @Patch('disable-first-login/:userId')
  @HttpCode(HttpStatus.OK)
  async disableFirstLogin(@Param('userId') userId: string): Promise<User> {
    this.logger.log(`🔄 Mise à jour du scellé FirstLogin pour : ${userId}`);
    return await this.authService.disableFirstLogin(userId);
  }
}