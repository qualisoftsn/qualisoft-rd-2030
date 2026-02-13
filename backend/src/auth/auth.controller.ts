/**
 * CHEMIN ABSOLU : /backend/src/auth/auth.controller.ts
 * PROJET : Qualisoft Elite RD 2030
 * VERSION : 2.1.0 (Souveraineté Multi-Tenant)
 */

import { 
  Controller, Get, Post, Param, Body, 
  HttpCode, HttpStatus, Logger 
} from '@nestjs/common';
import { AuthService, LoginResponse } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { User, Tenant } from '@prisma/client';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * 🔓 [PUBLIC] IDENTIFICATION PAR SOUS-DOMAINE
   * C'est ici que 'sde.qualisoft.sn' récupère son nom et son ID.
   */
  @Public()
  @Get('domain/:domain')
  @HttpCode(HttpStatus.OK)
  async getTenantByDomain(@Param('domain') domain: string): Promise<Partial<Tenant>> {
    this.logger.log(`🔍 Requête d'identification du nœud : ${domain}`);
    return await this.authService.getTenantByDomain(domain);
  }

  /**
   * 🔓 [PUBLIC] REGISTRE DES ORGANISATIONS
   * Utilisé pour la liste déroulante au login.
   */
  @Public() 
  @Get('public/tenants')
  @HttpCode(HttpStatus.OK)
  async getPublicTenants(): Promise<Partial<Tenant>[]> {
    return await this.authService.getPublicTenants();
  }

  /**
   * 🔓 [PUBLIC] LISTE DES COLLABORATEURS D'UN NŒUD
   * 🚩 C'ÉTAIT LA PIÈCE MANQUANTE : Sans cette route @Public, 
   * la liste des utilisateurs reste vide au login !
   */
  @Public()
  @Get('public/tenants/:tenantId/users')
  @HttpCode(HttpStatus.OK)
  async getTenantUsers(@Param('tenantId') tenantId: string): Promise<Partial<User>[]> {
    this.logger.log(`👥 Récupération publique des collaborateurs pour le tenant : ${tenantId}`);
    return await this.authService.getTenantUsers(tenantId);
  }

  /**
   * 🔐 AUTHENTIFICATION SOUVERAINE
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    this.logger.log(`🔑 Tentative de connexion : ${loginDto.email}`);
    return await this.authService.login(loginDto);
  }

  /**
   * 🏗️ ENRÔLEMENT D'UN NOUVEAU NŒUD
   */
  @Public() // Ou restreint selon ta stratégie de déploiement
  @Post('register-tenant')
  @HttpCode(HttpStatus.CREATED)
  async registerTenant(@Body() dto: RegisterTenantDto) {
    this.logger.log(`🚀 Déploiement d'un nouveau nœud Matrix : ${dto.companyName}`);
    return await this.authService.registerTenant(dto);
  }
}