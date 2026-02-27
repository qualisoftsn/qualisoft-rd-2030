import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth.service';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  /**
   * ✅ Signature compatible IAuthGuard
   * On retourne Promise<boolean> pour éviter le conflit avec Observable.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Récupération sécurisée du token depuis les cookies
    const refreshToken = request.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token absent de la session');
    }

    try {
      // Validation via AuthService
      const payload = await this.authService.verifyRefreshToken(refreshToken);
      
      // On injecte le payload validé dans la requête
      // Casté en 'any' pour éviter les erreurs TS sur request.user
      (request as any).user = payload;
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Session expirée ou invalide');
    }
  }
}