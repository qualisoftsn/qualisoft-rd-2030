/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// 🛡️ DÉFINITION DES QUOTAS OFFICIELS QUALISOFT RD 2030
const PLAN_LIMITS: Record<string, any> = {
  EMERGENCE: { RQ: 1, PILOTE: 3, COPILOTE: 0 },
  CROISSANCE: { RQ: 1, PILOTE: 6, COPILOTE: 0 },
  ENTREPRISE: { RQ: 2, PILOTE: 10, COPILOTE: 10 },
  GROUPE: { RQ: 999, PILOTE: 999, COPILOTE: 999 }, // Puissance illimitée
};

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user, method, path } = request;

    if (!user || !user.tenantId) {
      throw new ForbiddenException("Authentification requise pour vérifier l'instance.");
    }

    // 1. RÉCUPÉRATION DU TENANT (PLAN ET EXPIRATION)
    const tenant = await this.prisma.tenant.findUnique({
      where: { T_Id: user.tenantId }
    });

    if (!tenant) {
      throw new ForbiddenException("Instance Qualisoft introuvable.");
    }

    // --- VÉRIFICATION 1 : LE VERROU TEMPorel (LECTURE SEULE) ---
    const now = new Date();
    const isExpired = tenant.T_SubscriptionEndDate && now > tenant.T_SubscriptionEndDate;

    if (isExpired) {
      // ✅ STRATÉGIE : On autorise le GET (Lecture) mais on bloque tout le reste
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        throw new ForbiddenException(
          "VOTRE ESSAI A EXPIRÉ. L'instance est verrouillée en LECTURE SEULE. Veuillez régulariser votre abonnement pour modifier vos données."
        );
      }
    }

    // --- VÉRIFICATION 2 : GESTION DES QUOTAS (CRÉATION UTILISATEUR) ---
    // On cible spécifiquement la création d'utilisateurs
    if (method === 'POST' && path.includes('/users')) {
      const { U_Role } = request.body; 
      const plan = tenant.T_Plan || 'EMERGENCE';
      const limits = PLAN_LIMITS[plan];

      if (!limits) {
        throw new ForbiddenException(`Le plan ${plan} n'est pas reconnu par le système.`);
      }

      // Compter les utilisateurs actifs pour ce rôle précis dans ce Tenant
      const currentCount = await this.prisma.user.count({
        where: { 
          tenantId: user.tenantId,
          U_Role: U_Role,
          U_IsActive: true 
        }
      });

      // Validation des seuils de collaborateurs
      if (U_Role === 'RQ' && currentCount >= limits.RQ) {
        throw new ForbiddenException(
          `LIMITE ATTEINTE : Le plan ${plan} est limité à ${limits.RQ} Responsable Qualité (RQ).`
        );
      }
      
      if (U_Role === 'PILOTE' && currentCount >= limits.PILOTE) {
        throw new ForbiddenException(
          `LIMITE ATTEINTE : Votre plan ${plan} est limité à ${limits.PILOTE} Pilotes. Passez au plan supérieur.`
        );
      }

      if (U_Role === 'COPILOTE' && limits.COPILOTE === 0) {
        throw new ForbiddenException(
          `OPTION NON DISPONIBLE : Le plan ${plan} n'inclut pas de Copilotes. Veuillez passer au Plan Entreprise.`
        );
      }
    }

    return true;
  }
}