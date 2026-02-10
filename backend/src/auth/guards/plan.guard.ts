import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionsService } from '../../subscriptions/subscriptions.service';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(private reflector: Reflector, private subService: SubscriptionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 👑 MASTER BYPASS
    if (user && user.U_Role === 'SUPER_ADMIN') return true;

    if (!user || !user.tenantId) throw new UnauthorizedException('Identification impossible.');

    const isWriteOperation = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(request.method);
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