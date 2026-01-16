import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus, 
  UnauthorizedException, 
  BadRequestException,
  UseInterceptors,
  ClassSerializerInterceptor,
  Logger
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';

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

    if (!registerDto.email || !registerDto.password || !registerDto.companyName) {
      throw new BadRequestException(
        'Les informations de structure et de sécurité sont incomplètes',
      );
    }

    return this.authService.registerTenant(registerDto);
  }
}