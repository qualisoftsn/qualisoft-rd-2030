import { 
  Injectable, CanActivate, ExecutionContext, 
  ForbiddenException, UnauthorizedException 
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class SovereignGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const method = request.method;
    const path = request.url;

    if (!user) throw new UnauthorizedException("Session expirée ou invalide.");

    // 👑 1. SUPER_ADMIN (ab.thiongane@qualisoft.sn) : Omnipotence
    if (user.U_Role === 'SUPER_ADMIN' || user.U_Email === 'ab.thiongane@qualisoft.sn') {
      return true;
    }

    // 👁️ 2. OBSERVATEUR : Droit de lecture pure (§7.5)
    if (user.U_Role === 'OBSERVATEUR' && method !== 'GET') {
      throw new ForbiddenException("Accès limité à la consultation seule (Mode Observateur).");
    }

    // 🔍 3. AUDITEUR : Lecture SMI + Écriture Audits/Rapports (§9.2)
    if (user.U_Role === 'AUDITEUR') {
      const isAuditRoute = path.includes('audit') || path.includes('non-conformite');
      if (method !== 'GET' && !isAuditRoute) {
        throw new ForbiddenException("L'auditeur ne peut modifier que les données liées à sa mission.");
      }
    }

    // 🚀 4. PILOTE & COPILOTE : Étanchéité du Cockpit (§4.4)
    if (user.U_Role === 'PILOTE' || user.U_Role === 'COPILOTE') {
       // On peut ajouter ici une logique de vérification de l'ID du processus dans l'URL
       // pour s'assurer qu'il ne sort pas de son tunnel.
    }

    // ⚙️ 5. ADMIN & RQ : Pilotage Intégral du Tenant
    if (user.U_Role === 'ADMIN_RQ' || user.U_Role === 'ADMIN' || user.U_Role === 'RQ') {
      return true; // Accès total au périmètre du tenant (géré ensuite par le CRUD Service)
    }

    // 👤 6. USER : Opérationnel standard
    return true; // Les restrictions fines sont gérées au niveau des contrôleurs
  }
}