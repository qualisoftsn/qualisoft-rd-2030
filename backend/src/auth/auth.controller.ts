import { 
  BadRequestException, Body, ClassSerializerInterceptor, 
  Controller, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post, 
  UseInterceptors, UseGuards 
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { ContactService } from './contact.service';
import { LoginDto } from './dto/login.dto';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { InviteDto } from './dto/invite.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SovereignGuard } from '../common/guards/sovereign.guard';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  private readonly logger = new Logger('AuthController');
  
  constructor(
    private readonly authService: AuthService, 
    private readonly contactService: ContactService
  ) {}

  /** * 📜 ISO 9001 §4.1 : Compréhension de l'organisme et de son contexte 
   * Récupère les instances actives pour le portail de connexion Qualisoft.
   */
  @Public()
  @Get('tenants/public')
  @HttpCode(HttpStatus.OK)
  async getPublicTenants() {
    return this.authService.getPublicTenants();
  }

  /** * 👥 Récupération des profils par instance 
   * Utilisé pour la sélection du collaborateur lors du "Tunneling" initial.
   */
  @Public()
  @Get('tenants/:id/users')
  @HttpCode(HttpStatus.OK)
  async getTenantUsers(@Param('id') id: string) {
    this.logger.log(`[AUTH] Fetching users for tenant: ${id}`);
    return this.authService.getTenantUsers(id);
  }

  /** * 🔑 Login Centralisé 
   * Authentification et génération du token JWT avec injection du assignedProcessId.
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /** * 🏗️ Création d'Instance (Phase 1 ou Inscription Directe)
   * Processus d'auto-inscription sécurisé pour les nouveaux clients Qualisoft.
   */
  @Public()
  @Post('register-tenant')
  @HttpCode(HttpStatus.CREATED)
  async registerTenant(@Body() registerDto: RegisterTenantDto) {
    this.logger.warn(`[AUTH] New Tenant Registration attempt: ${registerDto.companyName}`);
    return this.authService.registerTenant(registerDto);
  }

  /** * 🔐 Phase 2 : Déploiement Administrateur (§7.1.2)
   * Permet d'assigner un compte ADMIN à un Tenant déjà existant.
   * Note: En production, cette route devrait être protégée par SovereignGuard.
   */
  @Public() 
  @Post('register-admin-only')
  @HttpCode(HttpStatus.CREATED)
  async registerAdminOnly(@Body() adminDto: any) {
    this.logger.log(`[AUTH] Assigning new ADMIN to tenant ID: ${adminDto.tenantId}`);
    return this.authService.registerAdminOnly(adminDto);
  }

  /** * 🏁 Finalisation de Première Connexion 
   * Double protection : JWT pour l'identité + Sovereign pour l'autorité.
   */
  @UseGuards(JwtAuthGuard, SovereignGuard)
  @Patch('disable-first-login/:id')
  @HttpCode(HttpStatus.OK)
  async disableFirstLogin(@Param('id') id: string) {
    this.logger.log(`[AUTH] Disabling first-login flag for user: ${id}`);
    return this.authService.disableFirstLogin(id);
  }

  /** * 📩 Demande d'Invitation (Prospects)
   * Canal de capture pour les futurs clients Qualisoft.
   */
  @Public()
  @Post('invite')
  @HttpCode(HttpStatus.OK)
  async invite(@Body() inviteDto: InviteDto) {
    if (!inviteDto.email || !inviteDto.company) {
      this.logger.error(`[AUTH] Invalid invite request from: ${inviteDto.email}`);
      throw new BadRequestException("Champs requis manquants pour la demande d'invitation.");
    }
    return this.contactService.sendInviteRequest(inviteDto);
  }
}