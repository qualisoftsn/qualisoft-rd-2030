import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  ForbiddenException, 
  Logger 
} from '@nestjs/common';
import { Role } from '@prisma/client';

/**
 * 👑 MASTER GUARD (Souveraineté Elite MS)
 * Sentinel de l'espace Matrix.
 * Autorise le passage basé sur le privilège SUPER_ADMIN injecté par la JwtStrategy.
 */
@Injectable()
export class MasterGuard implements CanActivate {
  private readonly logger = new Logger(MasterGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; 

    // 1. Audit d'existence (§Sécurité)
    if (!user) {
      this.logger.error('❌ Accès refusé : Aucun contexte utilisateur (req.user) détecté.');
      throw new ForbiddenException("Identification Master requise pour franchir ce garde.");
    }

    // 2. Vérification de la hiérarchie (§Souveraineté)
    // On valide que le rôle correspond strictement à l'Enum SUPER_ADMIN
    if (user.U_Role !== Role.SUPER_ADMIN) {
      this.logger.warn(
        `🚫 TENTATIVE D'INTRUSION : ${user.U_Email} [Role: ${user.U_Role}] a tenté d'accéder à la Matrix.`
      );
      throw new ForbiddenException(
        "Opération restreinte : Privilèges de Super Administrateur Qualisoft requis."
      );
    }

    // 3. Validation de passage souverain
    // Note : On ne vérifie pas l'existence en base ici pour respecter la neutralité de la Matrix
    this.logger.log(`👑 MASTER ACCÈS : Autorité confirmée pour ${user.U_Email} (Contexte: ${user.tenantId})`);
    return true;
  }
}