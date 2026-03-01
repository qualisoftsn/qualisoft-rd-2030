/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * ⏳ MODULE : TRIAL PROVIDER (GESTION DES LICENCES)
 * -------------------------------------------------------------------------
 * RÔLE : Contrôle de l'accès selon l'état de l'abonnement du Tenant.
 * FONCTION : Verrouillage automatique du SDE si la licence expire.
 * -------------------------------------------------------------------------
 * DATE : 01 Mars 2026 | 15:45 GMT
 */

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
  const { isAuthenticated, tenantId } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  /**
   * 📡 PROTOCOLE DE VÉRIFICATION DE LICENCE
   * Interroge le Kernel Matrix pour valider les droits d'usage.
   */
  const checkStatus = useCallback(async () => {
    // On ne vérifie que si l'utilisateur est loggé et dans le dashboard
    if (!isAuthenticated || !pathname?.startsWith('/dashboard')) return;

    try {
      const res = await apiClient.get('/tenant/status');
      const data = res.data;
      
      const isTrialMode = data.subscriptionStatus === 'TRIAL';
      
      setTrialData({
        isTrial: isTrialMode,
        daysLeft: data.daysLeft || 0,
        isExpired: data.isExpired || false,
        tenantName: data.tenantName || 'Instance Elite',
        showBanner: isTrialMode && !data.isExpired,
        setShowBanner: (show) => setTrialData(prev => prev ? { ...prev, showBanner: show } : null)
      });
      
      // 🚨 REDIRECTION SOUVERAINE : En cas d'expiration, on bloque l'usage
      if (data.isExpired && !pathname.includes('/auth/expired')) {
        router.push('/auth/expired');
      }
    } catch (err) {
      console.warn("⚠️ Qualisoft Kernel : Échec de la surveillance licence.");
    }
  }, [isAuthenticated, pathname, router]);

  useEffect(() => {
    checkStatus();
    
    // Rafraîchissement toutes les 10 minutes (suffisant pour le cycle de vie)
    const interval = setInterval(checkStatus, 600000); 
    return () => clearInterval(interval);
  }, [checkStatus]);

  return (
    <TrialContext.Provider value={trialData}>
      {children}
    </TrialContext.Provider>
  );
}

export const useTrial = () => {
  const context = useContext(TrialContext);
  // Retourne un objet vide par défaut pour éviter les erreurs de déstructuration
  return context || { isTrial: false, daysLeft: 0, isExpired: false, showBanner: false };
};