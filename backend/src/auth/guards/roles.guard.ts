import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * 🛡️ ROLES GUARD : Architecture Elite MS
 * Gère l'accès granulaire basé sur les rôles Prisma.
 * Intègre un bypass de souveraineté pour le SUPER_ADMIN (Master).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Extraction des rôles requis via le décorateur @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // Si aucun rôle n'est spécifié, la route est accessible à tout utilisateur authentifié
    if (!requiredRoles) return true;
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // 2. Vérification de l'existence du contexte utilisateur
    if (!user || !user.U_Role) {
      this.logger.warn(`🚫 Accès refusé : Contexte utilisateur ou rôle manquant.`);
      return false;
    }

    // 👑 3. BYPASS SOUVERAIN (GOD MODE)
    // Le SUPER_ADMIN (Master) franchit tous les contrôles de rôles.
    if (user.U_Role === Role.SUPER_ADMIN || user.U_Role === 'SUPER_ADMIN') {
      return true;
    }
    
    // 4. Vérification standard pour les collaborateurs des tenants
    const hasPermission = requiredRoles.includes(user.U_Role);

    if (!hasPermission) {
      this.logger.warn(
        `🚫 CONFLIT DE PRIVILÈGE : ${user.U_Email} [${user.U_Role}] a tenté d'accéder à une ressource réservée à [${requiredRoles.join(', ')}]`
      );
    }

    return hasPermission;
  }
}