import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // 1. Extraction de l'utilisateur (déjà injecté par le JwtAuthGuard précédent)
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('Authentification requise pour vérifier le locataire.');
    }

    // 2. Identification du Tenant demandé
    // On récupère l'identifiant envoyé par le Frontend via le header personnalisé
    const requestedTenantId = request.headers['x-tenant-id'];

    if (!requestedTenantId) {
      throw new UnauthorizedException('Identifiant de locataire (Tenant-ID) manquant dans les en-têtes.');
    }

    // 3. Logique de cloisonnement (Souveraineté des données)
    // - Un utilisateur classique ne peut accéder QU'À son propre tenantId.
    // - Un SUPER_ADMIN peut potentiellement naviguer partout (optionnel).
    
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    if (user.tenantId !== requestedTenantId) {
      throw new ForbiddenException(
        `Violation de périmètre : Vous tentez d'accéder au tenant [${requestedTenantId}] alors que vous appartenez au tenant [${user.tenantId}].`
      );
    }

    // Si tout correspond, le portier laisse passer la requête vers le contrôleur
    return true;
  }
}