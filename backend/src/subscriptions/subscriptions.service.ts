import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Plan, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 🛡️ HARMONISATION : Mapping des plans commerciaux vers les limites techniques
   */
  private readonly PLAN_LIMITS: any = {
    [Plan.ESSAI]: { name: 'ESSAI', maxProcesses: 3, maxPilotes: 3, maxRQ: 1, features: ['GED_BASE', 'NC', 'ACTIONS', 'BASIC_DASH'] },
    [Plan.EMERGENCE]: { name: 'EMERGENCE', maxProcesses: 10, maxPilotes: 6, maxRQ: 1, features: ['GED_BASE', 'NC', 'ACTIONS', 'BASIC_DASH', 'KPI', 'MATRICE'] },
   
    [Plan.GROUPE]: { name: 'GROUPE', maxProcesses: 9999, maxPilotes: 9999, maxRQ: 9999, features: ['ALL_ACCESS'] },
    // ✅ Ajout des alias pour supporter l'auto-inscription directe
    'CROISSANCE': { name: 'CROISSANCE', maxProcesses: 10, maxPilotes: 6, maxRQ: 1, features: ['GED_BASE', 'NC', 'ACTIONS', 'BASIC_DASH', 'KPI', 'MATRICE'] },
  };

  /**
   * VERROU QUANTITATIF
   */
  async checkQuota(tenantId: string, metric: 'PROCESS' | 'PILOTE' | 'RQ') {
    const tenant = await this.prisma.tenant.findUnique({ where: { T_Id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant introuvable.');

    const limits = this.PLAN_LIMITS[tenant.T_Plan] || this.PLAN_LIMITS[Plan.ESSAI];

    switch (metric) {
      case 'PROCESS':
        const count = await this.prisma.processus.count({ where: { tenantId: tenantId } });
        if (count >= limits.maxProcesses) throw new ForbiddenException(`Quota de processus atteint pour le plan ${limits.name}.`);
        break;
      case 'PILOTE':
        const pCount = await this.prisma.user.count({ where: { tenantId: tenantId, U_Role: 'PILOTE', U_IsActive: true } });
        if (pCount >= limits.maxPilotes) throw new ForbiddenException(`Limite de Pilotes atteinte (${limits.maxPilotes}) pour le plan ${limits.name}.`);
        break;
      case 'RQ':
        const rCount = await this.prisma.user.count({ where: { tenantId: tenantId, U_Role: 'ADMIN', U_IsActive: true } });
        if (rCount >= limits.maxRQ) throw new ForbiddenException(`Limite de Responsables Qualité atteinte pour le plan ${limits.name}.`);
        break;
    }
    return true;
  }

  /**
   * VERROU TEMPOREL
   */
  async checkAccess(tenantId: string, isWriteOperation: boolean = false) {
    const tenant = await this.prisma.tenant.findUnique({ where: { T_Id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant introuvable.');

    const now = new Date();
    const isExpired = tenant.T_SubscriptionEndDate && tenant.T_SubscriptionEndDate < now;

    if (isExpired && isWriteOperation) {
      throw new ForbiddenException("Accès en LECTURE SEULE : Votre abonnement a expiré.");
    }

    if (tenant.T_SubscriptionStatus === SubscriptionStatus.SUSPENDED) {
      throw new ForbiddenException("Compte suspendu.");
    }

    return tenant;
  }

  /**
   * RÉCUPÉRATION DES DÉTAILS (Utilisé par Sidebar & Billing)
   */
  async getSubscriptionDetails(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { T_Id: tenantId },
      include: { _count: { select: { T_Processes: true, T_Users: true } } }
    });

    if (!tenant) throw new NotFoundException('Tenant non trouvé.');
    
    // 🛡️ Correction de l'erreur "undefined" : on fallback sur FREE si le plan est inconnu
    const limits = this.PLAN_LIMITS[tenant.T_Plan] || this.PLAN_LIMITS[Plan.ESSAI];
    
    const now = new Date();
    const isExpired = tenant.T_SubscriptionEndDate && tenant.T_SubscriptionEndDate < now;

    return {
      currentPlan: tenant.T_Plan,
      planName: limits.name,
      status: isExpired ? 'EXPIRED' : tenant.T_SubscriptionStatus,
      isReadOnly: isExpired,
      endDate: tenant.T_SubscriptionEndDate,
      usage: {
        processes: { used: tenant._count.T_Processes, limit: limits.maxProcesses },
        pilotes: { 
          used: await this.prisma.user.count({ where: { tenantId: tenantId, U_Role: 'PILOTE', U_IsActive: true } }), 
          limit: limits.maxPilotes 
        }
      },
      availableFeatures: limits.features,
      nextPlan: this.calculateNextPlan(tenant.T_Plan)
    };
  }

  private calculateNextPlan(current: any): any {
    const plans: any[] = [
      Plan.ESSAI, 
      Plan.EMERGENCE, 
      Plan.CROISSANCE, 
      Plan.ENTREPRISE, 
      Plan.GROUPE
    ];

    const currentIndex = plans.indexOf(current);
    if (currentIndex === -1 || currentIndex >= plans.length - 1) return null;

    const nextPlanId = plans[currentIndex + 1];
    return { 
      id: nextPlanId, 
      name: this.PLAN_LIMITS[nextPlanId]?.name || 'ELITE' 
    };
  }

  async upgradePlan(tenantId: string, newPlan: Plan, months: number = 1) {
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);
    return this.prisma.tenant.update({
      where: { T_Id: tenantId },
      data: { 
        T_Plan: newPlan, 
        T_SubscriptionStatus: SubscriptionStatus.ACTIVE, 
        T_SubscriptionEndDate: endDate, 
        T_IsActive: true 
      }
    });
  }
}