import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';

const PLAN_LIMITS: Record<string, any> = {
  EMERGENCE: { RQ: 1, PILOTE: 3, COPILOTE: 0 },
  CROISSANCE: { RQ: 1, PILOTE: 6, COPILOTE: 0 },
  ENTREPRISE: { RQ: 2, PILOTE: 10, COPILOTE: 10 },
  GROUPE: { RQ: 999, PILOTE: 999, COPILOTE: 999 },
  ESSAI: { RQ: 2, PILOTE: 5, COPILOTE: 2 },
};

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true; 

    const request = context.switchToHttp().getRequest();
    const { user, method, path, headers } = request;

    if (!user || !user.tenantId) {
      throw new ForbiddenException("Authentification requise pour vérifier l'instance.");
    }

    // 🛡️ SÉCURITÉ SUPPLÉMENTAIRE : On vérifie que le header x-tenant-id matche le JWT
    const tenantHeader = headers['x-tenant-id'];
    if (tenantHeader && tenantHeader !== user.tenantId) {
       throw new ForbiddenException("Violation d'accès : Discordance entre le jeton et l'instance demandée.");
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { T_Id: user.tenantId }
    });

    if (!tenant) throw new ForbiddenException("Instance Qualisoft introuvable.");

    // LECTURE SEULE SI EXPIRÉ
    const isExpired = tenant.T_SubscriptionEndDate && new Date() > tenant.T_SubscriptionEndDate;
    if (isExpired && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      throw new ForbiddenException("VOTRE ABONNEMENT A EXPIRÉ. L'instance est verrouillée en LECTURE SEULE.");
    }

    // GESTION DES QUOTAS UTILISATEURS
    if (method === 'POST' && path.includes('/users')) {
      const { U_Role } = request.body; 
      const plan = tenant.T_Plan || 'EMERGENCE';
      const limits = PLAN_LIMITS[plan];

      const currentCount = await this.prisma.user.count({
        where: { tenantId: user.tenantId, U_Role, U_IsActive: true }
      });

      if (limits && currentCount >= (limits[U_Role] ?? 999)) {
        throw new ForbiddenException(`LIMITE ATTEINTE : Votre plan ${plan} ne permet pas d'ajouter plus de ${U_Role}.`);
      }
    }

    return true;
  }
}