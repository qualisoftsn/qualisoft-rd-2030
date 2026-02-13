import { 
  Controller, Get, Post, Patch, Param, Body, 
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
   * 🔓 IDENTIFICATION PAR SOUS-DOMAINE
   * Utilisé pour la fidélisation (ex: sde.qualisoft.sn)
   */
  @Public()
  @Get('domain/:domain')
  @HttpCode(HttpStatus.OK)
  async getTenantByDomain(@Param('domain') domain: string): Promise<Partial<Tenant>> {
    this.logger.log(`🔍 Identification du nœud par domaine : ${domain}`);
    return await this.authService.getTenantByDomain(domain);
  }

  /**
   * 🔓 REGISTRE PUBLIC DES TENANTS
   */
  @Public() 
  @Get('public/tenants')
  @HttpCode(HttpStatus.OK)
  async getPublicTenants(): Promise<Partial<Tenant>[]> {
    return await this.authService.getPublicTenants();
  }

  /**
   * 🔐 AUTHENTIFICATION
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    this.logger.log(`🔑 Tentative d'accès sécurisé : ${loginDto.email}`);
    return await this.authService.login(loginDto);
  }

  // ... (Garder registerTenant et autres méthodes à l'identique)
}