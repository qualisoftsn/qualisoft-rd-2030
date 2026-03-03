/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛡️ MODULE : AuthProvider.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Sentinelle de Session & Libération des Portes.
 * FIX : Autorise l'affichage immédiat du Login et de la Landing Page.
 * RÉVISION : 03 Mars 2026 | 02:15 GMT
 */

"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';

const TrialContext = createContext<any>(null);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore() as any;
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { setHasMounted(true); }, []);

  // 🌍 DÉFINITION DES ZONES DE LIBRE PASSAGE
  const isPublicRoute = useMemo(() => {
    if (!pathname) return false;
    const publicPaths = ['/auth/login', '/auth/register', '/auth/expired', '/'];
    // On laisse passer si c'est dans la liste ou si ça commence par /auth/
    return publicPaths.includes(pathname) || pathname.startsWith('/auth/');
  }, [pathname]);

  // 🔄 LOGIQUE D'AIGUILLAGE SOUVERAIN
  useEffect(() => {
    if (!hasMounted) return;

    // Rediriger vers dashboard si déjà connecté sur une page publique
    if (isAuthenticated && isPublicRoute && pathname !== '/') {
      router.replace('/dashboard');
    }
    
    // Bloquer et rediriger vers login si accès privé sans session
    if (!isAuthenticated && !isPublicRoute) {
      router.replace('/auth/login');
    }
  }, [hasMounted, isAuthenticated, isPublicRoute, pathname, router]);

  // 🔱 CALCUL DE LICENCE
  const trialStatus = useMemo(() => {
    if (!user) return { isReadOnly: false, daysRemaining: 0 };
    const expiry = new Date(user.U_TenantExpiry);
    const days = Math.ceil((expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return { isReadOnly: days <= 0, daysRemaining: days };
  }, [user]);

  // 🛑 ÉCRAN DE CHARGEMENT : Uniquement pour les pages PRIVÉES
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

  // ✅ LIBÉRATION : Rendu des pages publiques ou du Dashboard authentifié
  return (
    <TrialContext.Provider value={trialStatus}>
      {children}
    </TrialContext.Provider>
  );
}