import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * TENANT GUARD - SÉCURITÉ SOUVERAINE
 * Vérifie la correspondance entre l'utilisateur connecté et le sous-domaine accédé.
 */

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 1. On autorise les routes marquées comme publiques (ex: Liste des tenants)
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // 2. Récupération de l'utilisateur (déjà validé par JwtAuthGuard)
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('Identité utilisateur introuvable.');
    }

    // 3. Extraction du Tenant-ID envoyé par le Frontend
    const requestedTenantId = request.headers['x-tenant-id'];

    if (!requestedTenantId) {
      throw new UnauthorizedException('Le header [x-tenant-id] est requis pour cette opération.');
    }

    // 4. Validation de la souveraineté
    // Un Super-Admin Qualisoft peut accéder à tous les tenants
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // Un utilisateur standard est verrouillé sur son propre tenantId (slug ou UUID)
    // On compare l'ID contenu dans le Token avec celui demandé par le sous-domaine
    if (user.tenantId !== requestedTenantId && user.tenantSlug !== requestedTenantId) {
      throw new ForbiddenException(
        `Accès refusé : notre session est liée au client [${user.tenantId}], pas à [${requestedTenantId}].`
      );
    }

    return true;
  }
}