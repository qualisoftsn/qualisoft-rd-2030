import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  ForbiddenException 
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionsService } from '../../subscriptions/subscriptions.service';

/**
 * PLAN & ACCESS GUARD (Stratégie SaaS Qualisoft)
 * 1. Gère les fonctionnalités par plan (ÉMERGENCE, etc.)
 * 2. Implémente le "Mode Lecture Seule" pour les prospects/clients expirés.
 */
@Injectable()
export class PlanGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private subService: SubscriptionsService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const method = request.method;

    if (!user || !user.tenantId) {
      throw new ForbiddenException('Session invalide ou identification du client impossible.');
    }

    // --- ÉTAPE 1 : GESTION DU MODE LECTURE / ÉCRITURE ---
    // Les opérations de lecture (GET) sont autorisées même en cas d'expiration pour la rétention.
    // Les opérations d'écriture (POST, PATCH, PUT, DELETE) sont soumises à validité du plan.
    const isWriteOperation = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method);
    
    // Cette méthode du service lève une ForbiddenException si expiré ET tentative d'écriture.
    await this.subService.checkAccess(user.tenantId, isWriteOperation);

    // --- ÉTAPE 2 : VÉRIFICATION DE LA FONCTIONNALITÉ (FEATURE) ---
    const requiredFeature = this.reflector.get<string>('feature', context.getHandler());
    
    // Si la route n'est pas marquée par @RequireFeature, l'accès est libre (ex: profil, dashboard)
    if (!requiredFeature) {
      return true;
    }

    const subDetails = await this.subService.getSubscriptionDetails(user.tenantId);
    const features = subDetails.availableFeatures;

    // Vérification de la présence de la feature ou du bypass GROUPE (ALL_ACCESS)
    const hasAccess = features.includes(requiredFeature) || features.includes('ALL_ACCESS');

    if (!hasAccess) {
      throw new ForbiddenException(
        `Accès refusé : Le module [${requiredFeature}] n'est pas inclus dans votre plan actuel (${subDetails.planName}).`
      );
    }

    return true;
  }
}