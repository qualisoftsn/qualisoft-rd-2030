import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService, AuthPayload } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

// ✅ Évite 'possibly undefined' en forçant le type de req.user
interface RequestWithUser extends Request {
  user: AuthPayload;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, user } = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
      loginDto.tenantId,
    );

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });

    return {
      accessToken,
      user: {
        U_Id: user.U_Id,
        U_Email: user.U_Email,
        U_Role: user.U_Role,
        tenantId: user.tenantId,
        tenantDomain: (user as any).tenant?.T_Domain || 'elite',
      },
    };
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refresh(@Req() req: RequestWithUser) {
    // ✅ Plus d'erreurs ici car req.user est typé comme AuthPayload
    const newAccessToken = this.authService.generateAccessToken({
      U_Id: req.user.U_Id,
      U_Email: req.user.U_Email,
      U_Role: req.user.U_Role,
      tenantId: req.user.tenantId,
      U_TenantDomain: req.user.U_TenantDomain
    });

    return { accessToken: newAccessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token', { path: '/api/auth', httpOnly: true, secure: true, sameSite: 'strict' });
    return res.send();
  }
}