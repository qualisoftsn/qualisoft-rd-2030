import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // 🔓 VÉRIFICATION DE LA ZONE PUBLIQUE
    // On regarde si le décorateur @Public() est présent sur la méthode ou la classe
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si c'est public, on laisse passer sans vérifier le JWT
    if (isPublic) {
      return true;
    }

    // Sinon, on exécute la validation standard du JWT
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException("Session invalide ou Token manquant");
    }
    return user;
  }
}