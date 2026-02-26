import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../decorators/public.decorator';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // 🔑 AUTHENTIFICATION & GÉNÉRATION DES TOKENS
    const { accessToken, refreshToken, user } = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
      loginDto.tenantId,
    );

    // ✅ SÉCURITÉ MAXIMALE : Refresh Token dans cookie HttpOnly
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,      // 🔒 Inaccessible via JavaScript
      secure: true,        // 🔒 HTTPS uniquement (en production)
      sameSite: 'strict',  // 🔒 Protection CSRF native
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      path: '/api/auth',
    });

    // ✅ Access Token retourné en JSON (stocké en mémoire frontend)
    return {
      accessToken,
      expiresIn: 900, // 15 minutes
      user: {
        U_Id: user.U_Id,
        U_Email: user.U_Email,
        U_FirstName: user.U_FirstName,
        U_LastName: user.U_LastName,
        U_Role: user.U_Role,
        tenantId: user.tenantId,
        // 🔑 CORRECTION CRITIQUE : Pas de U_TenantDomain dans le schéma Prisma
        // → On utilise T_Domain via relation tenant (chargée dans validateUser)
        tenantDomain: user.tenant?.T_Domain || null,
      },
    };
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refresh(@Req() req: Request) {
    const userId = req.user['U_Id'];
    const tenantId = req.user['tenantId'];

    // ✅ GÉNÉRATION D'UN NOUVEL ACCESS TOKEN
    const newAccessToken = await this.authService.generateAccessToken({
      U_Id: userId,
      U_Email: req.user['U_Email'],
      U_Role: req.user['U_Role'],
      tenantId,
    });

    return {
      accessToken: newAccessToken,
      expiresIn: 900,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Res({ passthrough: true }) res: Response) {
    // ✅ DÉSACTIVATION PROPRE DU REFRESH TOKEN
    res.clearCookie('refresh_token', {
      path: '/api/auth',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return res.send();
  }
}