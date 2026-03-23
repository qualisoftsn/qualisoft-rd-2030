/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 🛰️ MODULE : ImpersonationBanner.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Barre d'alerte haute visibilité lors d'une session d'impersonation
 * VERSION : 2.0 - Corrections Tailwind + Sécurité + Accessibilité
 * FONCTION : Rappel visuel et procédure de retour au compte Master
 * SÉCURITÉ : Zustand Only + Confirmation avant sortie + Audit logging
 * RÉVISION : 19 Mars 2026 | 12:15 GMT
 * -------------------------------------------------------------------------
 */

import React, { useCallback, useState } from 'react';
import { ShieldAlert, ZapOff, User, Clock, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ImpersonationData {
  originalUser: {
    U_Id: string;
    U_Email: string;
    U_FirstName: string;
    U_LastName: string;
  };
  impersonatedUser: {
    U_Id: string;
    U_Email: string;
    U_FirstName: string;
    U_LastName: string;
  };
  startedAt: string;
  reason?: string;
}

interface ImpersonationBannerProps {
  className?: string;
  onExit?: () => void;
}

// ============================================================================
// UTILITAIRES
// ============================================================================

const formatDuration = (start: string): string => {
  const startMs = new Date(start).getTime();
  const nowMs = Date.now();
  const diffSec = Math.floor((nowMs - startMs) / 1000);
  
  if (diffSec < 60) return `${diffSec}s`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}min`;
  return `${Math.floor(diffSec / 3600)}h ${Math.floor((diffSec % 3600) / 60)}min`;
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function ImpersonationBanner({ className, onExit }: ImpersonationBannerProps) {
  const router = useRouter();
  const { user, logout, exitImpersonation } = useAuthStore();
  
  const [isExiting, setIsExiting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Vérification de l'état d'impersonation
  const impersonationData = user?.impersonation as ImpersonationData | undefined;
  const isImpersonating = !!impersonationData;

  if (!isImpersonating || !user) return null;

  // Gestion de la sortie d'impersonation
  const handleExitMasquerade = useCallback(async () => {
    if (isExiting) return;
    
    setIsExiting(true);
    const toastId = toast.loading("Rupture de la session d'impersonation...");
    
    try {
      // Logging de l'action (optionnel - à adapter selon ton backend)
      if (typeof window !== 'undefined' && window.navigator?.sendBeacon) {
        window.navigator.sendBeacon('/api/audit/impersonation-exit', JSON.stringify({
          originalUser: impersonationData?.originalUser?.U_Email,
          exitedAt: new Date().toISOString(),
          duration: formatDuration(impersonationData?.startedAt || ''),
        }));
      }
      
      // Appel au store pour sortir du mode impersonation
      if (exitImpersonation) {
        await exitImpersonation();
      } else {
        // Fallback: logout + redirection
        await logout();
        // Nettoyage des cookies de session
        document.cookie = "qualisoft_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure";
      }
      
      toast.success("Retour au compte principal effectué", { 
        id: toastId,
        duration: 3000,
      });
      
      onExit?.();
      router.push('/admin/matrix');
      
    } catch (error) {
      console.error("❌ Erreur sortie impersonation:", error);
      toast.error("Impossible de quitter le mode impersonation. Réessayez.", { 
        id: toastId,
        duration: 5000,
      });
    } finally {
      setIsExiting(false);
      setShowConfirm(false);
    }
  }, [isExiting, impersonationData, exitImpersonation, logout, onExit, router]);

  const duration = formatDuration(impersonationData?.startedAt || '');

  return (
    <div 
      className={cn(
        "fixed top-0 left-0 w-full z-[50] animate-in slide-in-from-top duration-300",
        className
      )}
      role="alert"
      aria-live="assertive"
      aria-label="Mode impersonation actif"
    >
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600 h-10 md:h-12 flex items-center justify-between px-4 md:px-6 shadow-2xl border-b border-amber-500/30">
        
        {/* SECTION GAUCHE : Info impersonation */}
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <ShieldAlert size={14} className="w-14 h-14 md:w-16 md:h-16 flex-shrink-0" className="text-white animate-pulse shrink-0" aria-hidden="true" />
          <p className="text-[8px] md:text-[9px] font-black text-white uppercase tracking-[0.15em] m-0 italic truncate">
            Mode Mascarade
            <span className="mx-1 md:mx-2 opacity-50 hidden sm:inline">|</span> 
            <span className="hidden sm:inline">
              <span className="opacity-75">Cible:</span>{' '}
              <span className="underline decoration-2 underline-offset-2 font-normal not-italic">
                {impersonationData?.impersonatedUser?.U_Email || 'Utilisateur'}
              </span>
            </span>
          </p>
        </div>

        {/* SECTION CENTRE : Avertissement (Desktop) */}
        <div className="hidden lg:flex items-center gap-2 text-[8px] font-black text-white/90 uppercase tracking-widest italic">
          <AlertTriangle size={10} className="text-white/80 shrink-0" aria-hidden="true" />
          <span className="truncate max-w-md">
            Actions enregistrées au nom de {impersonationData?.impersonatedUser?.U_FirstName}
          </span>
          <span className="hidden xl:inline opacity-75">•</span>
          <span className="hidden xl:inline flex items-center gap-1">
            <Clock size={10} aria-hidden="true" /> {duration}
          </span>
        </div>

        {/* SECTION DROITE : Bouton de sortie */}
        <div className="flex items-center gap-2">
          {/* Confirmation modale inline */}
          {showConfirm ? (
            <div className="flex items-center gap-2 bg-black/20 rounded-full px-2 py-1">
              <span className="text-[8px] font-black text-white uppercase tracking-widest">Confirmer ?</span>
              <button 
                onClick={handleExitMasquerade}
                disabled={isExiting}
                className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-all border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Confirmer la sortie"
              >
                {isExiting ? (
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="text-[8px] font-black uppercase">Oui</span>
                )}
              </button>
              <button 
                onClick={() => setShowConfirm(false)}
                className="text-[8px] font-black text-white/70 hover:text-white transition-colors border-none bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
                aria-label="Annuler"
              >
                Non
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowConfirm(true)}
              disabled={isExiting}
              className="flex items-center gap-1 md:gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-3 md:px-4 py-1.5 md:py-2 rounded-full transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group focus:outline-none focus:ring-2 focus:ring-white/50 shrink-0"
              aria-label="Quitter le mode impersonation"
            >
              <span className="hidden sm:inline text-[8px] md:text-[9px] font-black text-white uppercase tracking-widest italic">
                {isExiting ? 'SORTIE...' : 'QUITTER'}
              </span>
              <ZapOff 
                size={12} className="w-12 h-12 md:w-14 md:h-14 flex-shrink-0" 
                className="text-white group-hover:scale-110 transition-transform" 
                aria-hidden="true" 
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}