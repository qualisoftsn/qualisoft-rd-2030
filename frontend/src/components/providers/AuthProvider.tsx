/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : AUTH PROVIDER SOUVERAIN
 * -------------------------------------------------------------------------
 * RÔLE : Garantir la présence d'une session valide avant le rendu du dashboard.
 * FONCTION : Se substitue à NextAuth pour une gestion légère et anti-XSS.
 * -------------------------------------------------------------------------
 * DATE : 01 Mars 2026 | 15:45 GMT
 */

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    /**
     * 🛡️ PROTOCOLE DE VÉRIFICATION
     * On vérifie si un jeton est présent en mémoire ou dans les cookies.
     */
    const initAuth = async () => {
      await checkAuth();
      setIsLoaded(true);
    };

    initAuth();
  }, [checkAuth]);

  // Barrière de redirection pour les zones protégées
  useEffect(() => {
    if (isLoaded) {
      const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
      if (isProtectedRoute && !isAuthenticated) {
        router.replace('/auth/login');
      }
    }
  }, [isLoaded, isAuthenticated, pathname, router]);

  // Écran de verrouillage pendant la synchronisation du noyau
  if (!isLoaded) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] italic animate-pulse">
          Synchronisation Sécurisée...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}