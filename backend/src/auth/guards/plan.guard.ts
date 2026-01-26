import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  ForbiddenException,
  UnauthorizedException 
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionsService } from '../../subscriptions/subscriptions.service';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private subService: SubscriptionsService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. BYPASS DÉCORATEUR @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const method = request.method;

    // 2. BYPASS RÔLE SUPER_ADMIN
    if (user && user.U_Role === 'SUPER_ADMIN') {
      return true;
    }

    // 3. VÉRIFICATION SESSION
    if (!user || !user.tenantId) {
      throw new UnauthorizedException('Session invalide ou identification du client impossible.');
    }

    // 4. MODE LECTURE / ÉCRITURE (Check via Service)
    const isWriteOperation = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method);
    await this.subService.checkAccess(user.tenantId, isWriteOperation);

    // 5. VÉRIFICATION DE LA FONCTIONNALITÉ (FEATURE)
    const requiredFeature = this.reflector.get<string>('feature', context.getHandler());
    if (!requiredFeature) {
      return true;
    }

    const subDetails = await this.subService.getSubscriptionDetails(user.tenantId);
    const features = subDetails.availableFeatures || [];

    const hasAccess = features.includes(requiredFeature) || features.includes('ALL_ACCESS');

    if (!hasAccess) {
      throw new ForbiddenException(
        `Accès refusé : Le module [${requiredFeature}] n'est pas inclus dans votre plan actuel (${subDetails.planName}).`
      );
    }

    return true;
  }
}