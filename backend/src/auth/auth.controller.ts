/**
 * 🛂 MODULE : AuthController (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Endpoint Login/Refresh/Logout (Zéro NextAuth).
 * FIX : Scellage du cookie Wildcard (.qualisoft.sn) pour éviter l'expiration
 * immédiate de la session sur les sous-domaines.
 * RÉVISION : 04 Mars 2026 | 18:46 GMT
 * -------------------------------------------------------------------------
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

    const isProduction = process.env.NODE_ENV === 'production';

    // 🍪 1. SCELLAGE DE L'ACCESS TOKEN (Le passeport principal)
    // C'est lui qui évite le "session=expired" immédiat sur les sous-domaines.
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction, 
      sameSite: isProduction ? 'none' : 'lax', // 'none' obligatoire pour le cross-subdomain en HTTPS
      domain: isProduction ? '.qualisoft.sn' : 'localhost', // 👈 LE CŒUR DU SCELLAGE MULTI-TENANT
      maxAge: 15 * 60 * 1000, // 15 minutes (synchronisé avec JWT_EXPIRES_IN)
      path: '/',
    });

    // 🍪 2. SCELLAGE DU REFRESH TOKEN (Le renouvelleur silencieux)
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction, 
      sameSite: isProduction ? 'none' : 'lax',
      domain: isProduction ? '.qualisoft.sn' : 'localhost',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      path: '/api/auth/refresh', // Strictement limité à l'endpoint de rafraîchissement
    });

    // On retourne quand même l'accessToken pour l'état Zustand en mémoire, 
    // mais le cookie assurera la survie aux rechargements de page.
    return { accessToken, user };
  }

  @Public()
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) throw new UnauthorizedException('Session expirée ou introuvable.');

    const payload = await this.authService.verifyRefreshToken(refreshToken);
    const newAccessToken = this.authService.generateAccessToken(payload);

    const isProduction = process.env.NODE_ENV === 'production';

    // 🍪 Renouvellement du cookie Access Token
    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      domain: isProduction ? '.qualisoft.sn' : 'localhost',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    return { accessToken: newAccessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Res({ passthrough: true }) res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';
    const domain = isProduction ? '.qualisoft.sn' : 'localhost';

    // Destruction totale des sceaux
    res.clearCookie('access_token', { domain, path: '/' });
    res.clearCookie('refresh_token', { domain, path: '/api/auth/refresh' });
    return;
  }
}