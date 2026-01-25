import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class MasterGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; 

    // 🛡️ ACCÈS RÉSERVÉ : Vérification sur l'identité harmonisée
    if (!user || user.U_Email !== 'ab.thiongane@qualisoft.sn') {
      throw new UnauthorizedException("Accès réservé exclusivement au Propriétaire Qualisoft.");
    }

    return true;
  }
}