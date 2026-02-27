import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth.service';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  // Signature Promise<boolean> pure pour respecter IAuthGuard
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token absent');
    }

    try {
      const payload = await this.authService.verifyRefreshToken(refreshToken);
      // On utilise 'any' sur request pour permettre l'injection de user sans conflit TS
      (request as any).user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Session expirée');
    }
  }
}