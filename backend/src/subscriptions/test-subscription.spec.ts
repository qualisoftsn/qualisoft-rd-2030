import { PlanGuard } from '../auth/guards/plan.guard';
import { SubscriptionsService } from './subscriptions.service';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

describe('PlanGuard (Simulation de Verrouillage SaaS)', () => {
  let guard: PlanGuard;
  let subService: Partial<SubscriptionsService>;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    // Simulation du service de souscription
    subService = {
      getSubscriptionDetails: jest.fn(),
    };
    guard = new PlanGuard(reflector as any, subService as any);
  });

  const mockContext = (tenantPlan: string, featureRequired: string, status = 'ACTIVE') => {
    // Simule la métadonnée @RequireFeature
    jest.spyOn(reflector, 'get').mockReturnValue(featureRequired);

    return {
      getHandler: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          user: { tenantId: 'test-tenant-123' },
        }),
      }),
    } as unknown as ExecutionContext;
  };

  it('✅ [SCÉNARIO 1] Client ÉMERGENCE accède à la GED (Autorisé)', async () => {
    (subService.getSubscriptionDetails as jest.Mock).mockResolvedValue({
      planName: 'ÉMERGENCE',
      status: 'ACTIVE',
      availableFeatures: ['GED_BASE', 'NC', 'ACTIONS', 'BASIC_DASH']
    });

    const context = mockContext('FREE', 'GED_BASE');
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    console.log("✔ Test 1 : Accès GED pour ÉMERGENCE validé.");
  });

  it('❌ [SCÉNARIO 2] Client ÉMERGENCE accède à l\'AUDIT (Refusé)', async () => {
    (subService.getSubscriptionDetails as jest.Mock).mockResolvedValue({
      planName: 'ÉMERGENCE',
      status: 'ACTIVE',
      availableFeatures: ['GED_BASE', 'NC', 'ACTIONS', 'BASIC_DASH']
    });

    const context = mockContext('FREE', 'AUDIT');
    
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    console.log("✔ Test 2 : Blocage module AUDIT pour ÉMERGENCE validé.");
  });

  it('✅ [SCÉNARIO 3] Client ENTREPRISE accède à l\'AUDIT (Autorisé)', async () => {
    (subService.getSubscriptionDetails as jest.Mock).mockResolvedValue({
      planName: 'ENTREPRISE',
      status: 'ACTIVE',
      availableFeatures: ['GED_BASE', 'NC', 'ACTIONS', 'BASIC_DASH', 'KPI', 'AUDIT', 'SSE']
    });

    const context = mockContext('PRO', 'AUDIT');
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    console.log("✔ Test 3 : Accès AUDIT pour ENTREPRISE validé.");
  });

  it('❌ [SCÉNARIO 4] Client avec abonnement EXPIRÉ (Refusé)', async () => {
    (subService.getSubscriptionDetails as jest.Mock).mockResolvedValue({
      planName: 'ENTREPRISE',
      status: 'EXPIRED',
      availableFeatures: ['ALL_ACCESS']
    });

    const context = mockContext('PRO', 'ANY_FEATURE');

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    console.log("✔ Test 4 : Blocage pour compte EXPIRÉ validé.");
  });
});