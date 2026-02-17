/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';

// --- INTERFACE CONSERVÉE ---
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
    // 🛡️ SÉCURISATION BUILD : Protection contre le pathname null (Next.js 16)
    // On sort immédiatement si le pathname n'est pas encore résolu par le moteur de Next
    if (!pathname) return;

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
            // Logique de mise à jour de l'état conservée
            setShowBanner: (show) => setTrialData(prev => prev ? { ...prev, showBanner: show } : null)
          });
          
          // Redirection vers ta page d'expiration Qualisoft
          if (res.data.isExpired) {
            router.push('/essai/expire');
          }
        } else {
          // Cas d'un compte standard (non TRIAL)
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
        // Erreur silencieuse si pas authentifié (ton choix conservé)
      }
    };

    checkStatus();
    
    // Intervalle de 5 minutes conservé pour la précision du SMI
    const interval = setInterval(checkStatus, 300000); 
    return () => clearInterval(interval);
  }, [pathname, router]);

  // Si les données ne sont pas encore chargées, on rend les enfants sans contexte (fallback)
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