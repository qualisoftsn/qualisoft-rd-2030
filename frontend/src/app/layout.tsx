/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * 🛰️ COMPONENT : DASHBOARD LAYOUT (SOUVERAIN)
 * Rôle : Wrapper de sécurité pour les vues du dashboard.
 * Note : Utilise exclusivement useAuthStore (Zéro Next-Auth).
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  // ✅ Correction : Récupération sécurisée depuis le store Zustand
  const { user, isAuthenticated } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // On attend un cycle de rendu pour s'assurer que Zustand a chargé le localStorage
    const checkAuth = () => {
      if (!useAuthStore.getState().isAuthenticated) {
        router.replace("/auth/login");
      } else {
        setIsReady(true);
      }
    };

    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router]);

  // Détermination du rôle Matrix
  const isSuperAdmin = user?.U_Role === "SUPER_ADMIN";

  // Interface de transition pendant la vérification du Kernel
  if (!isReady || !user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic animate-pulse">
          Vérification des accès Matrix...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white selection:bg-blue-600/20">
      {/* 🚩 Note technique : Ce composant sert de conteneur logique.
          La Sidebar et le TrialBanner sont gérés au niveau du layout de page (app/(dashboard)/layout.tsx)
      */}
      {children}
    </div>
  );
}