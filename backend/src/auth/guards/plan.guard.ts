import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionsService } from '../../subscriptions/subscriptions.service';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(private reflector: Reflector, private subService: SubscriptionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new UnauthorizedException('Identification impossible.');

    // 👑 GOD MODE : BYPASS SOUVERAIN
    // Si l'utilisateur est l'Architecte (SUPER_ADMIN), on ignore toutes les restrictions de plan
    if (user.U_Role === Role.SUPER_ADMIN || user.U_Role === 'SUPER_ADMIN') {
      return true;
    }

    if (!user.tenantId) throw new UnauthorizedException('Identification territoriale impossible.');

    const isWriteOperation = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(request.method);
    
    // Vérifie si le tenant a un accès actif en écriture (selon son abonnement)
    await this.subService.checkAccess(user.tenantId, isWriteOperation);

    const requiredFeature = this.reflector.get<string>('feature', context.getHandler());
    if (!requiredFeature) return true;

    const subDetails = await this.subService.getSubscriptionDetails(user.tenantId);
    const features = subDetails.availableFeatures || [];
    
    if (!features.includes(requiredFeature) && !features.includes('ALL_ACCESS')) {
      throw new ForbiddenException(`Module [${requiredFeature}] non inclus dans votre plan.`);
    }
    
    return true;
  }
}