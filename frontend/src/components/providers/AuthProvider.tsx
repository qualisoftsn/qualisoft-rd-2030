/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛡️ MODULE : AuthProvider.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Sentinelle de route et garant de l'hydratation Zustand.
 * RÉVISION : 02 Mars 2026 | 18:55 GMT
 */

"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Loader2, ShieldCheck } from 'lucide-react';

const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/register', '/auth/forgot-password'];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore() as any;
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Étape 1 : Synchronisation avec le stockage local (Hydratation Matrix)
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Étape 2 : Guard de Route Souverain
  useEffect(() => {
    if (!isLoaded) return;

    const isPublic = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));

    if (!isAuthenticated && !isPublic) {
      router.replace('/auth/login');
    }
    
    if (isAuthenticated && pathname === '/auth/login') {
      router.replace('/dashboard');
    }
  }, [isLoaded, isAuthenticated, pathname, router]);

  if (!isLoaded) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] italic">
        <Loader2 className="animate-spin text-blue-600 mb-6" size={56} strokeWidth={3} />
        <div className="flex items-center gap-3">
          <ShieldCheck size={16} className="text-blue-500 animate-pulse" />
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em]">
            Vérification des Habilitations Matrix...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}