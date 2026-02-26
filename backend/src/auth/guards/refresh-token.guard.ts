// auth/guards/refresh-token.guard.ts
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {
  constructor(private authService: AuthService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean | Observable<boolean>> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token manquant');
    }

    try {
      // 🔑 VALIDATION DU REFRESH TOKEN
      const payload = await this.authService.verifyRefreshToken(refreshToken);
      request.user = payload;
      return true;
    } catch (e) {
      throw new UnauthorizedException('Refresh token invalide');
    }
  }
}