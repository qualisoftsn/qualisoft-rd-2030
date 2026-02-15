/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';

interface TrialContextType {
  isTrial: boolean;
  daysLeft: number;
  isExpired: boolean;
  tenantName: string;
  showBanner: boolean;
  setShowBanner: (show: boolean) => void;
}

const TrialContext = createContext<TrialContextType | null>(null);

export function TrialProvider({ children }: { children: React.ReactNode }) {
  const [trialData, setTrialData] = useState<TrialContextType | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Ne vérifier que sur les routes protégées
    if (!pathname.startsWith('/trial') && !pathname.startsWith('/dashboard')) {
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await apiClient.get('/tenant/status');
        if (res.data?.subscriptionStatus === 'TRIAL') {
          setTrialData({
            isTrial: true,
            daysLeft: res.data.daysLeft,
            isExpired: res.data.isExpired,
            tenantName: res.data.tenantName,
            showBanner: true,
            setShowBanner: (show) => setTrialData(prev => prev ? { ...prev, showBanner: show } : null)
          });
          
          if (res.data.isExpired) {
            router.push('/essai/expire');
          }
        } else {
          setTrialData({
            isTrial: false,
            daysLeft: 0,
            isExpired: false,
            tenantName: '',
            showBanner: false,
            setShowBanner: () => {}
          });
        }
      } catch (err) {
        // Erreur silencieuse si pas authentifié
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 300000); // Check every 5 min
    return () => clearInterval(interval);
  }, [pathname, router]);

  if (!trialData) {
    return <>{children}</>;
  }

  return (
    <TrialContext.Provider value={trialData}>
      {children}
    </TrialContext.Provider>
  );
}

export const useTrial = () => useContext(TrialContext);