/**
 * 🛰️ MODULE : LAYOUT CLIENT (SMOOTH HYDRATION)
 * -------------------------------------------------------------------------
 * RÔLE : Assure une transition visuelle fluide lors du chargement JS.
 * FIX : Zéro Redirection ici pour laisser la Landing Page libre.
 * RÉVISION : 03 Mars 2026 | 23:55 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import { Loader2, Fingerprint } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isReady, setIsReady] = useState<boolean>(false);

  // Détection des zones publiques
  const isPublicPage = pathname === "/" || pathname.startsWith("/auth");

  useEffect(() => {
    /**
     * ⚡ SYNCHRONISATION MATRIX
     * On laisse le temps à Zustand de réhydrater le token du domaine .qualisoft.sn
     */
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 150); 

    return () => clearTimeout(timer);
  }, [pathname]);

  /**
   * ⏳ ÉCRAN DE VÉRIFICATION (Uniquement pour le Dashboard)
   * Si l'on demande la vitrine (/) ou l'auth, on ne bloque JAMAIS le rendu.
   */
  if (!isReady && !isPublicPage) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6">
        <div className="relative">
            <Loader2 className="animate-spin text-blue-600 w-16 h-16" strokeWidth={2} />
            <Fingerprint className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400/20 w-8 h-8" />
        </div>
        <div className="text-center space-y-2">
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] italic animate-pulse">
                Initialisation SDE Matrix
            </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}