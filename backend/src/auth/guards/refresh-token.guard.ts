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
   * ✅ Correction du type de retour pour satisfaire le compilateur TS.
   * On retire 'Observable' pour ne garder que le type asynchrone Promise.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Récupération sécurisée du token depuis les cookies (configuré via cookie-parser)
    const refreshToken = request.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token absent de la session');
    }

    try {
      // 🔑 Validation interne via ton AuthService (Matrix SDE)
      const payload = await this.authService.verifyRefreshToken(refreshToken);
      
      // On injecte le payload validé (userId, role, U_TenantDomain) dans la requête
      request.user = payload;
      
      return true;
    } catch (error) {
      // Si le token est expiré ou corrompu (signature invalide)
      throw new UnauthorizedException('Session expirée ou invalide');
    }
  }
}