import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class MasterGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Injecté par le JwtAuthGuard

    // 🛡️ La barrière absolue : Seul ton mail passe
    if (user.email !== 'ab.thiongane@qualisoft.sn') {
      throw new UnauthorizedException("Accès réservé au Propriétaire Qualisoft.");
    }

    return true;
  }
}