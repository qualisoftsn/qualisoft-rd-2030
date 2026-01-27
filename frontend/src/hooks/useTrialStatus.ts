import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { differenceInDays, parseISO, startOfDay } from 'date-fns';

export function useTrialStatus() {
  const { user } = useAuthStore();
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [phase, setPhase] = useState<'ACTIVE' | 'WARNING' | 'CRITICAL' | 'EXPIRED'>('ACTIVE');

  useEffect(() => {
    if (!user?.U_Tenant) return;

    const tenant = user.U_Tenant;
    const status = tenant.T_SubscriptionStatus;
    
    if (status === 'EXPIRED') {
      setIsReadOnly(true);
      setPhase('EXPIRED');
      setDaysLeft(0);
      return;
    }

    if (status === 'ACTIVE') {
      setIsReadOnly(false);
      setPhase('ACTIVE');
      return;
    }

    // Calcul pour TRIAL
    if (tenant.T_SubscriptionEndDate) {
      const end = startOfDay(parseISO(tenant.T_SubscriptionEndDate));
      const now = startOfDay(new Date());
      const days = differenceInDays(end, now);
      
      setDaysLeft(days > 0 ? days : 0);
      
      if (days <= 0) {
        setIsReadOnly(true);
        setPhase('EXPIRED');
        // Mettre à jour le statut côté serveur si nécessaire
        updateExpiredStatus(tenant.T_Id);
      } else if (days <= 3) {
        setPhase('CRITICAL');
        setIsReadOnly(false);
      } else if (days <= 7) {
        setPhase('WARNING');
        setIsReadOnly(false);
      }
    }
  }, [user]);

  const updateExpiredStatus = async (tenantId?: string) => {
    if (!tenantId) return;
    try {
      await fetch('/api/tenant/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, status: 'EXPIRED' })
      });
    } catch (e) {
      console.error('Erreur mise à jour statut:', e);
    }
  };

  return { isReadOnly, daysLeft, phase, isTrial: user?.U_Tenant?.T_SubscriptionStatus === 'TRIAL' };
}