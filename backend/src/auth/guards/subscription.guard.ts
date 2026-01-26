import { 
  CanActivate, 
  ExecutionContext, 
  ForbiddenException, 
  Injectable, 
  Logger 
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * INTERFACE UTILISATEUR TYPÉE
 */
interface RequestUser {
  U_Id: string;
  U_Email: string;
  U_Role: string;
  tenantId: string;
}

@Injectable()
export class SubscriptionGuard implements CanActivate {
  private readonly logger = new Logger(SubscriptionGuard.name);

  constructor(
    private prisma: PrismaService, 
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as RequestUser;
    const method = request.method;
    const path = request.path as string;

    // 1. BYPASS DÉCORATEUR @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // 2. 👑 GOD MODE : LE MASTER (OU SUPER_ADMIN) EST OMNIPOTENT
    // Il accède à tout, tout le temps, sans vérification de licence.
    const isMaster = user && (user.U_Role === 'SUPER_ADMIN' || user.U_Role === 'SUPER_ADMIN');
    if (isMaster) {
      this.logger.log(`👑 Accès Propriétaire autorisé : ${user.U_Email} sur ${path}`);
      return true;
    }

    // 3. VÉRIFICATION DE SÉCURITÉ DE BASE
    if (!user || !user.tenantId) {
      throw new ForbiddenException("Identification requise pour accéder à cette instance.");
    }

    // 4. RÉCUPÉRATION DE L'ÉTAT DU TENANT (Instance Client)
    const tenant = await this.prisma.tenant.findUnique({ 
      where: { T_Id: user.tenantId } 
    });

    if (!tenant) {
      throw new ForbiddenException("Instance Qualisoft introuvable.");
    }

    // 5. LOGIQUE TRIAL & EXPIRATION (Passage en Lecture Seule)
    const now = new Date();
    const isExpired = tenant.T_SubscriptionEndDate && now > tenant.T_SubscriptionEndDate;

    if (isExpired) {
      // 🛑 SI EXSPIRÉ : On bloque toutes les méthodes de modification
      const isWritingMethod = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
      
      if (isWritingMethod) {
        this.logger.warn(`⏳ Accès restreint (Lecture seule) : ${tenant.T_Name} sur ${path}`);
        throw new ForbiddenException(
          "VOTRE ESSAI EST TERMINÉ. L'instance est passée en LECTURE SEULE. Contactez Qualisoft pour activer votre licence Élite."
        );
      }
      
      // ✅ On laisse passer le GET pour la consultation
      return true; 
    }

    // 6. LICENCE ACTIVE OU TRIAL EN COURS
    return true;
  }
}