/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * ⏳ MODULE : TrialProvider
 * -------------------------------------------------------------------------
 * RÔLE : Surveillance du cycle de vie de la licence du Tenant.
 * FONCTION : Vérifie l'état de l'abonnement (TRIAL/ACTIVE) et verrouille 
 * l'accès en cas d'expiration pour protéger l'intégrité du SDE.
 */

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
    // 🛡️ SÉCURISATION BUILD : Protection contre le pathname null
    if (!pathname) return;

    // Périmètre de surveillance : Uniquement les routes internes
    if (!pathname.startsWith('/trial') && !pathname.startsWith('/dashboard')) {
      return;
    }

    /**
     * 🛰️ checkStatus
     * Interroge le noyau Matrix pour récupérer l'état du Tenant courant.
     * Le backend extrait le TenantId du token JWT pour garantir l'isolation.
     */
    const checkStatus = async () => {
      try {
        const res = await apiClient.get('/tenant/status');
        
        // Mapping de l'état du Tenant
        const isTrialMode = res.data?.subscriptionStatus === 'TRIAL';
        
        setTrialData({
          isTrial: isTrialMode,
          daysLeft: res.data.daysLeft || 0,
          isExpired: res.data.isExpired || false,
          tenantName: res.data.tenantName || 'Instance Elite',
          showBanner: isTrialMode,
          setShowBanner: (show) => setTrialData(prev => prev ? { ...prev, showBanner: show } : null)
        });
        
        // 🚨 Redirection automatique si le délai de grâce est dépassé
        if (res.data.isExpired && !pathname.includes('/essai/expire')) {
          router.push('/essai/expire');
        }
      } catch (err) {
        // En cas d'erreur de communication, on reste silencieux pour ne pas 
        // bloquer l'UI, mais l'accès API reste protégé par le token.
        console.warn("Qualisoft Kernel : Erreur de synchronisation Trial.");
      }
    };

    checkStatus();
    
    // Fréquence de rafraîchissement (5 minutes) pour la précision du pilotage
    const interval = setInterval(checkStatus, 300000); 
    return () => clearInterval(interval);
  }, [pathname, router]);

  // Fallback pendant l'hydratation du contexte
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