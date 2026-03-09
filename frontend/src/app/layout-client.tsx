'use client';

/**
 * 🛰️ MODULE : LAYOUT CLIENT (SMOOTH HYDRATION)
 * -------------------------------------------------------------------------
 * RÔLE : Assure une transition visuelle fluide lors du chargement JS.
 * FIX : Zéro Redirection ici pour laisser la Landing Page et Login libres.
 * SÉCURITÉ : Hydratation de Zustand pour éviter les flashs d'UI.
 * RÉVISION : 09 Mars 2026 | 16:35 GMT
 * -------------------------------------------------------------------------
 */

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2, Fingerprint } from "lucide-react";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isReady, setIsReady] = useState<boolean>(false);

  // Détection des zones publiques (Landing Page, Login, API)
  const isPublicPage = pathname === "/" || pathname.startsWith("/auth") || pathname.startsWith("/api");

  useEffect(() => {
    /**
     * ⚡ SYNCHRONISATION MATRIX (Zustand)
     * On laisse le temps à React de réhydrater le token local (localStorage) 
     * avant d'afficher les pages sécurisées pour éviter les "Flashs de Login".
     */
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 150); 

    return () => clearTimeout(timer);
  }, [pathname]);

  /**
   * ⏳ ÉCRAN DE VÉRIFICATION SOUVERAIN (Uniquement pour le Dashboard)
   * Si l'on demande la vitrine (/) ou l'auth, on affiche immédiatement les enfants.
   */
  if (!isReady && !isPublicPage) {
    return (
      <div className="h-dvh w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6 font-sans italic select-none">
        <div className="relative flex items-center justify-center">
            {/* Anneau de chargement externe */}
            <div className="absolute inset-0 border-4 border-blue-600/20 border-t-blue-600 rounded-full w-20 h-20 animate-spin -m-2" />
            <Loader2 className="animate-spin text-blue-500 w-16 h-16 relative z-10" strokeWidth={1} />
            <Fingerprint className="absolute text-blue-400/20 w-8 h-8 z-0" />
        </div>
        <div className="text-center space-y-2">
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] animate-pulse m-0">
                Initialisation SDE Matrix
            </p>
            <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest m-0">
                Synchronisation du noyau de sécurité
            </p>
        </div>
      </div>
    );
  }

  // Une fois prêt ou sur page publique, on affiche la page
  return <>{children}</>;
}