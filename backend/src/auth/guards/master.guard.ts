import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  ForbiddenException, 
  Logger 
} from '@nestjs/common';

@Injectable()
export class MasterGuard implements CanActivate {
  private readonly logger = new Logger(MasterGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 1. Vérification de l'existence de l'utilisateur (injecté par JwtStrategy)
    if (!user) {
      this.logger.error('❌ MasterGuard : Aucun utilisateur trouvé dans la requête');
      throw new ForbiddenException("Accès refusé : Identification requise.");
    }

    // 2. Vérification du rôle Super Admin
    // On compare avec le rôle exact défini dans ton schéma Prisma
    if (user.U_Role !== 'SUPER_ADMIN') {
      this.logger.warn(`🚫 Tentative d'accès non autorisé par : ${user.U_Email} (Rôle: ${user.U_Role})`);
      throw new ForbiddenException("Désolé, seul le Super Administrateur peut effectuer cette opération.");
    }

    this.logger.log(`👑 Accès Master autorisé pour : ${user.U_Email}`);
    return true;
  }
}