/**
 * 🛂 MODULE : AuthController
 * -------------------------------------------------------------------------
 * RÔLE : Endpoint Login/Refresh/Logout (Zéro NextAuth).
 * RÉVISION : 03 Mars 2026 | 04:30 GMT
 */

import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';

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

    // 🍪 Scellage du Refresh Token (HttpOnly pour sécurité maximale)
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true, 
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth/refresh',
    });

    return { accessToken, user };
  }

  @Public()
  @Post('refresh')
  async refresh(@Req() req: Request) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) throw new UnauthorizedException('Session expirée');

    const payload = await this.authService.verifyRefreshToken(refreshToken);
    const newAccessToken = this.authService.generateAccessToken(payload);

    return { accessToken: newAccessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
    return;
  }
}