/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛡️ MODULE : TrialProvider.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Calculateur du cycle de vie du Tenant et verrouillage Read-Only.
 * CORRECTIF : Alignement strict de l'objet trialStatus avec TrialContextType.
 * RÉVISION : 03 Mars 2026 | 04:15 GMT
 */

"use client";

import React, { createContext, useContext, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';

// --- 🔱 INTERFACE DE LICENCE RD-2026 ---
interface TrialContextType {
  isReadOnly: boolean;  // Verrouillage des actions (POST/PUT/DELETE)
  isExpired: boolean;   // État de validité du bail
  daysRemaining: number;
  plan: string;
}

const TrialContext = createContext<TrialContextType | null>(null);

export const TrialProvider = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((state: any) => state.user);

  const trialStatus = useMemo((): TrialContextType => {
    // 🛡️ CAS : AGENT SOUVERAIN OU PAS DE USER
    if (!user || !user.U_TenantExpiry) {
      return { 
        isReadOnly: false, 
        isExpired: false, 
        daysRemaining: 999, 
        plan: user?.U_TenantPlan || 'MASTER' 
      };
    }

    const expiryDate = new Date(user.U_TenantExpiry);
    const now = new Date();
    
    // Calcul de l'écart temporel (§ISO 27001)
    const diffTime = expiryDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // 🔒 LOGIQUE DE VERROUILLAGE : Si expiré, alors Read-Only
    const expired = daysRemaining <= 0;

    return {
      isExpired: expired,
      isReadOnly: expired, // On scelle isReadOnly sur l'état d'expiration
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      plan: user.U_TenantPlan || 'ESSENTIAL'
    };
  }, [user]);

  return (
    <TrialContext.Provider value={trialStatus}>
      {children}
    </TrialContext.Provider>
  );
};

export const useTrial = () => {
  const context = useContext(TrialContext);
  if (!context) {
    throw new Error('ERREUR CRITIQUE : useTrial doit être utilisé au sein de TrialProvider.');
  }
  return context;
};