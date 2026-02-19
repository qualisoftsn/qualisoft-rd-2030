import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  private readonly logger = new Logger(SubscriptionGuard.name);
  constructor(private prisma: PrismaService, private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) return true;

    if (!user) throw new ForbiddenException("Identification requise.");

    // 👑 GOD MODE : BYPASS SOUVERAIN
    // Le Super Admin n'est pas soumis aux dates d'expiration des abonnements
    if (user.U_Role === Role.SUPER_ADMIN || user.U_Role === 'SUPER_ADMIN') {
      return true;
    }

    if (!user.tenantId) throw new ForbiddenException("Identification territoriale requise.");

    const tenant = await this.prisma.tenant.findUnique({ where: { T_Id: user.tenantId } });
    if (!tenant) throw new ForbiddenException("Instance territoriale introuvable.");

    const isExpired = tenant.T_SubscriptionEndDate && new Date() > tenant.T_SubscriptionEndDate;
    
    if (isExpired && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      throw new ForbiddenException("ESSAI TERMINÉ : Passage en LECTURE SEULE. Veuillez renouveler votre licence Qualisoft Elite.");
    }
    
    return true;
  }
}