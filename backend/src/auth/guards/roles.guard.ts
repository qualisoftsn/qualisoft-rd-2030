import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Récupération des rôles requis définis sur le Controller ou la méthode
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // 2. Si aucun rôle n'est requis (ex: route publique), on laisse passer
    if (!requiredRoles) {
      return true;
    }
    
    // 3. Extraction de l'utilisateur injecté par Passport (JwtStrategy)
    const { user } = context.switchToHttp().getRequest();
    
    // 4. VÉRIFICATION CRITIQUE : 
    // Votre JwtStrategy renvoie U_Role, donc nous vérifions user.U_Role
    if (!user || !user.U_Role) {
      return false; // Pas d'utilisateur ou pas de rôle = Accès refusé
    }
    
    // 5. On vérifie si le rôle de l'utilisateur est présent dans la liste autorisée
    return requiredRoles.includes(user.U_Role);
  }
}