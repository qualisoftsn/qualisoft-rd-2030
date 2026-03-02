/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ⏳ MODULE : TrialProvider.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Monitoring de licence et protection contre l'expiration SDE.
 * RÉVISION : 02 Mars 2026 | 18:55 GMT
 */

"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';

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
  const { isAuthenticated } = useAuthStore() as any;
  const pathname = usePathname();
  const router = useRouter();

  const checkStatus = useCallback(async () => {
    if (!isAuthenticated || !pathname?.startsWith('/dashboard')) return;

    try {
      const { data } = await apiClient.get('/tenant/status');
      const isTrialMode = data.subscriptionStatus === 'TRIAL';
      
      setTrialData({
        isTrial: isTrialMode,
        daysLeft: data.daysLeft || 0,
        isExpired: data.isExpired || false,
        tenantName: data.T_Name || 'Instance Elite',
        showBanner: isTrialMode && !data.isExpired,
        setShowBanner: (show) => setTrialData(prev => prev ? { ...prev, showBanner: show } : null)
      });
      
      if (data.isExpired && !pathname.includes('/auth/expired')) {
        router.push('/auth/expired');
      }
    } catch (err) {
      console.warn("⚠️ Qualisoft Kernel : Surveillance licence interrompue.");
    }
  }, [isAuthenticated, pathname, router]);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 600000); // 10 min
    return () => clearInterval(interval);
  }, [checkStatus]);

  return (
    <TrialContext.Provider value={trialData}>
      {children}
    </TrialContext.Provider>
  );
}

export const useTrial = () => useContext(TrialContext) || { isTrial: false, daysLeft: 0, isExpired: false, showBanner: false };