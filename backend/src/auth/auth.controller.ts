import { 
  BadRequestException, Body, ClassSerializerInterceptor, 
  Controller, HttpCode, HttpStatus, Logger, Param, Patch, Post, 
  UseInterceptors, UseGuards 
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { ContactService } from './contact.service';
import { LoginDto } from './dto/login.dto';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { InviteDto } from './dto/invite.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  private readonly logger = new Logger('AuthController');
  
  constructor(
    private readonly authService: AuthService, 
    private readonly contactService: ContactService
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register-tenant')
  @HttpCode(HttpStatus.CREATED)
  async registerTenant(@Body() registerDto: RegisterTenantDto) {
    return this.authService.registerTenant(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('disable-first-login/:id')
  @HttpCode(HttpStatus.OK)
  async disableFirstLogin(@Param('id') id: string) {
    return this.authService.disableFirstLogin(id);
  }

  @Public()
  @Post('invite')
  @HttpCode(HttpStatus.OK)
  async invite(@Body() inviteDto: InviteDto) {
    if (!inviteDto.email || !inviteDto.company) {
        throw new BadRequestException("Champs requis manquants : email ou company");
    }
    return this.contactService.sendInviteRequest(inviteDto);
  }
}