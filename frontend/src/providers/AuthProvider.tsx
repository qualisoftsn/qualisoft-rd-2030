/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛡️ MODULE : AuthProvider.tsx
 * -------------------------------------------------------------------------
 * CORRECTIF : Libération des routes publiques et aiguillage multi-tenant.
 * RÉVISION : 03 Mars 2026 | 02:03 GMT
 */

"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Loader2, ShieldCheck } from 'lucide-react';

const TrialContext = createContext<any>(null);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore() as any;
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { setHasMounted(true); }, []);

  // 📝 DÉFINITION DES ROUTES DE LIBRE PASSAGE
  const isPublicRoute = useMemo(() => {
    const publicPaths = ['/auth/login', '/auth/register', '/auth/expired', '/'];
    return publicPaths.some(path => pathname === path || pathname?.startsWith('/auth/'));
  }, [pathname]);

  // 🔄 LOGIQUE D'AIGUILLAGE (Le "Routing Sentinel")
  useEffect(() => {
    if (!hasMounted) return;

    // Si l'utilisateur est déjà connecté et tente d'aller sur le Login
    if (isAuthenticated && isPublicRoute && pathname !== '/') {
      router.replace('/dashboard');
    }
    
    // Si l'utilisateur n'est pas connecté et tente d'aller sur une page privée
    if (!isAuthenticated && !isPublicRoute) {
      router.replace('/auth/login');
    }
  }, [hasMounted, isAuthenticated, isPublicRoute, pathname, router]);

  // 🔱 CALCUL DE LICENCE (Trial)
  const trialStatus = useMemo(() => {
    if (!user) return { isReadOnly: false, daysRemaining: 0 };
    const expiry = new Date(user.U_TenantExpiry);
    const days = Math.ceil((expiry.getTime() - new Date().getTime()) / (1000 * 3000 * 24));
    return { isReadOnly: days <= 0, daysRemaining: days };
  }, [user]);

  // 🛑 ÉCRAN DE CHARGEMENT : Uniquement pour les routes PRIVÉES en attente
  if (!hasMounted || (!isAuthenticated && !isPublicRoute)) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] italic">
        <Loader2 className="animate-spin text-blue-600 mb-6" size={50} />
        <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] animate-pulse">
          Initialisation Matrix...
        </p>
      </div>
    );
  }

  // ✅ RENDU IMMÉDIAT pour les pages publiques ou les sessions validées
  return (
    <TrialContext.Provider value={trialStatus}>
      {children}
    </TrialContext.Provider>
  );
}