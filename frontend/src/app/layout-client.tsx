/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : LAYOUT CLIENT (SMOOTH HYDRATION)
 * RÔLE : Transition visuelle fluide lors du chargement JS
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2, Fingerprint, ShieldCheck } from "lucide-react";
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES
// ============================================================================

export interface LayoutClientProps {
  children: React.ReactNode;
}

export interface LoadingScreenProps {
  label: string;
  sublabel: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const PUBLIC_PATHS = ['/', '/auth', '/api', '/resources', '/norms', '/external', '/diagnostic'];

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label, sublabel }: LoadingScreenProps) {
  return (
    <div 
      className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-4 md:gap-6 font-sans italic select-none"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative flex items-center justify-center" aria-hidden="true">
        {/* Anneau externe */}
        <div className="absolute inset-0 border-2 md:border-3 lg:border-4 border-blue-600/20 border-t-blue-600 rounded-full w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 animate-spin -m-1 md:-m-1.5 lg:-m-2" />
        <Loader2 className="animate-spin text-blue-400 w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 relative z-10" strokeWidth={1} />
        <Fingerprint className="absolute text-blue-400/20 w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 z-0" />
      </div>
      <div className="text-center space-y-1 md:space-y-1.5 lg:space-y-2">
        <p className="text-[9px] md:text-[10px] font-black text-blue-400 uppercase tracking-widest animate-pulse m-0">
          {label}
        </p>
        <p className="text-[7px] md:text-[8px] font-bold text-slate-600 uppercase tracking-widest m-0">
          {sublabel}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function LayoutClient({ children }: LayoutClientProps) {
  const pathname = usePathname();
  const [isReady, setIsReady] = useState<boolean>(false);

  // Détection des zones publiques
  const isPublicPage = PUBLIC_PATHS.some(path => 
    pathname === path || pathname.startsWith(path)
  );

  useEffect(() => {
    /**
     * ⚡ SYNCHRONISATION MATRIX (Zustand)
     * Temps pour réhydrater le token localStorage avant d'afficher les pages sécurisées
     */
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 150);

    return () => clearTimeout(timer);
  }, [pathname]);

  /**
   * ⏳ ÉCRAN DE VÉRIFICATION (Uniquement Dashboard)
   * Pages publiques affichées immédiatement
   */
  if (!isReady && !isPublicPage) {
    return (
      <LoadingScreen 
        label="Initialisation SDE Matrix" 
        sublabel="Synchronisation du noyau de sécurité" 
      />
    );
  }

  // Une fois prêt ou sur page publique, affichage normal
  return <>{children}</>;
}