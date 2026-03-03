/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛡️ MODULE : AuthProvider.tsx (FUSION SUPRÊME)
 * -------------------------------------------------------------------------
 * RÔLE : Sentinelle de route & Pilote de Licence (Trial/Read-Only).
 * CORRECTIF : Définition explicite du TrialContext pour stopper l'erreur L45.
 * RÉVISION : 03 Mars 2026 | 03:45 GMT
 */

"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Loader2, ShieldCheck } from 'lucide-react';

// --- 1. DÉFINITION DU CONTEXTE DE LICENCE (Indispensable pour corriger l'erreur) ---
interface TrialStatus {
  isReadOnly: boolean;
  daysRemaining: number;
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED';
}

const TrialContext = createContext<TrialStatus | null>(null);

// Hook pour consommer la licence dans les composants (ex: ReadOnlyGuard)
export const useTrial = () => {
  const context = useContext(TrialContext);
  if (context === undefined) throw new Error("useTrial doit être utilisé dans AuthProvider");
  return context as TrialStatus;
};

// --- 2. LE PROVIDER SOUVERAIN ---
const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/register', '/auth/expired'];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isInitialized } = useAuthStore() as any;
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Étape 1 : Hydratation Matrix
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // --- 3. LOGIQUE DE LICENCE (TRIAL) ---
  const trialStatus = useMemo((): TrialStatus => {
    // Si Master session ou pas de user : Pas de restriction
    if (!user || !user.U_TenantExpiry || user.U_Role === 'SUPERADMIN') {
      return { isReadOnly: false, daysRemaining: 999, status: 'ACTIVE' };
    }

    const expiryDate = new Date(user.U_TenantExpiry);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isExpired = daysRemaining <= 0;

    return {
      isReadOnly: isExpired,
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      status: isExpired ? 'EXPIRED' : 'ACTIVE'
    };
  }, [user]);

  // --- 4. GUARD DE ROUTE RÉGALIEN ---
  useEffect(() => {
    if (!hasMounted) return;

    const isPublic = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));

    if (!isAuthenticated && !isPublic) {
      router.replace('/auth/login?session=expired');
    }
    
    if (isAuthenticated && pathname === '/auth/login') {
      router.replace('/dashboard');
    }
  }, [hasMounted, isAuthenticated, pathname, router]);

  // --- 5. RENDU SÉCURISÉ ---
  if (!hasMounted) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] italic">
        <Loader2 className="animate-spin text-blue-600 mb-6" size={56} strokeWidth={3} />
        <div className="flex items-center gap-3">
          <ShieldCheck size={16} className="text-blue-500 animate-pulse" />
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em]">
            Séquence d&apos;Initialisation Matrix...
          </p>
        </div>
      </div>
    );
  }

  return (
    <TrialContext.Provider value={trialStatus}>
      {children}
    </TrialContext.Provider>
  );
}