import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UseInterceptors
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterTenantDto } from './dto/register-tenant.dto';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  private readonly logger = new Logger('AuthController');

  constructor(private readonly authService: AuthService) {}

  /**
   * @route   POST /api/auth/login
   * @desc    Authentification SMI Multi-Tenant
   */
  @Public() // 🔓 Autorise l'accès sans connexion préalable
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    this.logger.log(`📥 Requête de login reçue pour : ${loginDto.U_Email}`);

    if (!loginDto.U_Email || !loginDto.U_Password) {
      throw new UnauthorizedException(
        'Email (U_Email) et mot de passe (U_Password) requis',
      );
    }

    return this.authService.login({
        U_Email: loginDto.U_Email,
        U_Password: loginDto.U_Password
    });
  }

  /**
   * @route   POST /api/auth/register-tenant
   * @desc    Déploiement Instance Qualisoft Elite (Plan Entreprise)
   */
  @Public() // 🔓 Indispensable pour éviter le 403 lors de l'inscription
  @Post('register-tenant')
  @HttpCode(HttpStatus.CREATED)
  async registerTenant(@Body() registerDto: RegisterTenantDto) {
    this.logger.log(`🏢 Tentative de déploiement d'instance pour : ${registerDto.companyName}`);

    // Validation de sécurité minimale avant traitement
    if (!registerDto.email || !registerDto.password || !registerDto.companyName) {
      throw new BadRequestException(
        'Les informations de structure et de sécurité sont incomplètes',
      );
    }

    return this.authService.registerTenant(registerDto);
  }

  /**
   * @route   PATCH /api/auth/disable-first-login/:id
   * @desc    Désactive l'affichage de la modale de bienvenue pour l'utilisateur
   */
  @Patch('disable-first-login/:id')
  @HttpCode(HttpStatus.OK)
  async disableFirstLogin(@Param('id') id: string) {
    this.logger.log(`💡 Désactivation du flag premier login pour l'utilisateur : ${id}`);
    
    if (!id) {
      throw new BadRequestException("L'identifiant de l'utilisateur est requis.");
    }

    return this.authService.disableFirstLogin(id);
  }
}