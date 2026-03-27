/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🔒 MODULE : ReadOnlyGuard (Trial Expiration Guard)
 * RÔLE : Sentinelle de modification. Bloque l'écriture, autorise la vue.
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useCallback } from "react";
import { useTrial } from "@/providers/TrialProvider";
import { Lock, ShieldAlert, ArrowUpRight, AlertTriangle } from "lucide-react";
import { cn } from '@/core/utils/cn';
import Link from "next/link";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface TrialContext {
  isReadOnly: boolean;
  daysUntilExpiration?: number;
  expirationDate?: string;
  plan?: string;
}

export interface ReadOnlyGuardProps {
  children: React.ReactNode;
  className?: string;
  renewalLink?: string;
}

export interface ReadOnlyOverlayProps {
  onRenewClick?: () => void;
  renewalLink?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const DEFAULT_RENEWAL_LINK = '/billing/renew';

// ============================================================================
// SOUS-COMPOSANT : READ-ONLY OVERLAY
// ============================================================================

function ReadOnlyOverlay({ onRenewClick, renewalLink = DEFAULT_RENEWAL_LINK }: ReadOnlyOverlayProps) {
  const handleRenewClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onRenewClick?.();
  }, [onRenewClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onRenewClick?.();
    }
  }, [onRenewClick]);

  return (
    <div 
      className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6 lg:p-8 animate-in fade-in duration-500"
      role="alert"
      aria-live="assertive"
      aria-label="Mode lecture seule activé - Licence expirée"
    >
      <div 
        className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl shadow-2xl flex flex-col items-center text-center border-b-4 md:border-b-8 border-orange-500 max-w-sm transform transition-transform"
        role="dialog"
        aria-modal="true"
        aria-labelledby="readonly-title"
        aria-describedby="readonly-description"
      >
        <div 
          className="w-16 h-16 md:w-20 md:h-20 bg-orange-100 rounded-xl md:rounded-2xl flex items-center justify-center text-orange-500 mb-4 md:mb-6 shadow-xl animate-pulse"
          aria-hidden="true"
        >
          <Lock size={24} className="w-6 h-6 md:w-8 md:h-8 lg:w-9 lg:h-9" />
        </div>
        <h4 
          id="readonly-title"
          className="text-lg md:text-xl lg:text-2xl font-black text-slate-900 uppercase italic tracking-tighter m-0 leading-none"
        >
          Mode Consultation <br/> 
          <span className="text-orange-500">Uniquement</span>
        </h4>
        <p 
          id="readonly-description"
          className="text-[8px] md:text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest mt-3 md:mt-4 leading-relaxed italic"
        >
          Votre licence Qualisoft Elite a expiré. <br/> 
          Modification et ajout de données suspendus (§ISO 27001).
        </p>
        <Link
          href={renewalLink}
          onClick={handleRenewClick}
          onKeyDown={handleKeyDown}
          className="mt-6 md:mt-8 px-6 md:px-8 lg:px-10 py-3 md:py-4 lg:py-5 bg-slate-950 text-white rounded-xl md:rounded-2xl text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase italic tracking-widest shadow-xl hover:bg-blue-600 transition-all border-none cursor-pointer flex items-center gap-2 md:gap-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          aria-label="Régulariser l'instance - Accéder à la page de renouvellement"
        >
          Régulariser l&apos;instance 
          <ArrowUpRight size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export function ReadOnlyGuard({ children, className, renewalLink = DEFAULT_RENEWAL_LINK }: ReadOnlyGuardProps) {
  const { isReadOnly } = useTrial();

  const handleRenewClick = useCallback(() => {
    // Optional: Track renewal click for analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'click_renewal', {
        event_category: 'trial',
        event_label: 'readonly_guard_renewal_click',
      });
    }
  }, []);

  if (!isReadOnly) {
    return <>{children}</>;
  }

  return (
    <div 
      className={cn("relative group rounded-2xl md:rounded-3xl overflow-hidden italic font-sans", className)}
      role="region"
      aria-label="Contenu en mode lecture seule"
    >
      {/* 🛡️ OVERLAY D'INTERDICTION ÉLITE */}
      <ReadOnlyOverlay 
        onRenewClick={handleRenewClick}
        renewalLink={renewalLink}
      />

      {/* CONTENU EN "GHOST MODE" (Consultable mais inerte) */}
      <div 
        className="opacity-40 pointer-events-none select-none grayscale blur-sm"
        aria-hidden="true"
        inert=""
      >
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// HOC WRAPPER (Optionnel)
// ============================================================================

export function withReadOnlyGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  renewalLink?: string
) {
  return function ReadOnlyGuardWrapped(props: P) {
    return (
      <ReadOnlyGuard renewalLink={renewalLink}>
        <WrappedComponent {...props} />
      </ReadOnlyGuard>
    );
  };
}