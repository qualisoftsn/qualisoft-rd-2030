/**
 * CHEMIN ABSOLU : /backend/src/auth/auth.controller.ts
 * PROJET : Qualisoft Elite RD 2030
 * VERSION : 2.1.1 (Souveraineté Multi-Tenant & Synchronisation Service)
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
   * Appelé par le Frontend lors de la détection de 'sde.qualisoft.sn'
   */
  @Public()
  @Get('domain/:domain')
  @HttpCode(HttpStatus.OK)
  async getTenantByDomain(@Param('domain') domain: string): Promise<Partial<Tenant>> {
    this.logger.log(`🔍 Identification du territoire Matrix : ${domain}`);
    return await this.authService.getTenantByDomain(domain);
  }

  /**
   * 🔓 [PUBLIC] REGISTRE DES ORGANISATIONS
   * Alimente la liste déroulante si aucun sous-domaine n'est détecté.
   */
  @Public() 
  @Get('public/tenants')
  @HttpCode(HttpStatus.OK)
  async getPublicTenants(): Promise<Partial<Tenant>[]> {
    this.logger.log(`📋 Récupération du registre public des nœuds.`);
    return await this.authService.getPublicTenants();
  }

  /**
   * 🔓 [PUBLIC] LISTE DES COLLABORATEURS D'UN NŒUD
   * Permet de lister les utilisateurs d'un client spécifique au login.
   */
  @Public()
  @Get('public/tenants/:tenantId/users')
  @HttpCode(HttpStatus.OK)
  async getTenantUsers(@Param('tenantId') tenantId: string): Promise<Partial<User>[]> {
    this.logger.log(`👥 Scan des collaborateurs pour le nœud ID : ${tenantId}`);
    return await this.authService.getTenantUsers(tenantId);
  }

  /**
   * 🔐 AUTHENTIFICATION SOUVERAINE
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    this.logger.log(`🔑 Tentative d'accès au Noyau par : ${loginDto.email}`);
    return await this.authService.login(loginDto);
  }

  /**
   * 🏗️ ENRÔLEMENT D'UN NOUVEAU NŒUD (AUTO-INSCRIPTION)
   */
  @Public()
  @Post('register-tenant')
  @HttpCode(HttpStatus.CREATED)
  async registerTenant(@Body() dto: RegisterTenantDto) {
    this.logger.log(`🚀 Déploiement autonome d'un nouveau nœud : ${dto.companyName}`);
    return await this.authService.registerTenant(dto);
  }
}