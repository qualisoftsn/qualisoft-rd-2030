/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
//* eslint-disable react-hooks/exhaustive-deps */
"use client";

/**
 * 🛰️ MODULE : LAYOUT CLIENT (SMOOTH HYDRATION)
 * -------------------------------------------------------------------------
 * RÔLE : Assure une transition visuelle fluide lors du chargement JS.
 * FIX : Extraction correcte de l'état isAuthenticated depuis Zustand.
 * -------------------------------------------------------------------------
 */

import { useAuthStore } from "@/store/authStore";
import { Loader2, ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // ✅ FIX LIGNE 23 : Extraction correcte de l'état depuis le store
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);
  
  // État de disponibilité visuelle
  const [isReady, setIsReady] = useState<boolean>(false);

  // Détection des zones publiques (Vitrine et Authentification)
  const isPublicPage = pathname === "/" || pathname.startsWith("/auth");

  useEffect(() => {
    /**
     * ⚡ SYNCHRONISATION MATRIX
     * On laisse un micro-délai pour permettre à Zustand d'hydrater 
     * le token depuis le localStorage/Cookie.
     */
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100); // 100ms suffisent pour stabiliser l'UI

    return () => clearTimeout(timer);
  }, [pathname]);

  /**
   * ⏳ ÉCRAN DE VÉRIFICATION
   * On affiche le loader uniquement sur les routes protégées 
   * tant que l'application n'a pas fini son auto-contrôle.
   */
  if (!isReady && !isPublicPage) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6">
        <div className="relative">
            <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
            <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />
        </div>
        <div className="text-center space-y-2">
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] italic animate-pulse">
                Séquence d&apos;initialisation Matrix
            </p>
            <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">
                Vérification des protocoles de souveraineté...
            </p>
        </div>
      </div>
    );
  }

  // Rendu final des composants (Dashboard, Admin, etc.)
  return <>{children}</>;
}