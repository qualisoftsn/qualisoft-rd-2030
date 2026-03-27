/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : ImpersonationBanner (Admin Masquerade Alert)
 * RÔLE : Barre d'alerte haute visibilité lors d'une session d'impersonation
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité + Security
 */

import React, { useCallback, useState, useEffect, KeyboardEvent } from 'react';
import { ShieldAlert, ZapOff, User, Clock, AlertTriangle, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface UserAuth {
  U_Id: string;
  U_Email: string;
  U_FirstName: string;
  U_LastName: string;
  U_Role: string;
  U_TenantId?: string;
  U_TenantName?: string;
  U_IsActive?: boolean;
  impersonation?: ImpersonationData;
}

export interface ImpersonationData {
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

export interface AuthState {
  user: UserAuth | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  exitImpersonation?: () => Promise<void>;
  logout?: () => Promise<void>;
}

export interface ImpersonationBannerProps {
  className?: string;
  onExit?: () => void;
}

// ============================================================================
// UTILITAIRES
// ============================================================================

const formatDuration = (start: string): string => {
  if (!start) return '0s';
  
  const startMs = new Date(start).getTime();
  const nowMs = Date.now();
  const diffSec = Math.floor((nowMs - startMs) / 1000);
  
  if (diffSec < 0) return '0s';
  if (diffSec < 60) return `${diffSec}s`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}min`;
  return `${Math.floor(diffSec / 3600)}h ${Math.floor((diffSec % 3600) / 60)}min`;
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function ImpersonationBanner({ className, onExit }: ImpersonationBannerProps) {
  const router = useRouter();
  const { user, exitImpersonation, logout } = useAuthStore() as AuthState;
  
  const [isExiting, setIsExiting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [duration, setDuration] = useState<string>('0s');

  // Vérification de l'état d'impersonation
  const impersonationData = user?.impersonation;
  const isImpersonating = !!impersonationData;

  // Update duration every second
  useEffect(() => {
    if (!isImpersonating || !impersonationData?.startedAt) return;
    
    const updateDuration = () => {
      setDuration(formatDuration(impersonationData.startedAt));
    };
    
    updateDuration();
    const interval = setInterval(updateDuration, 1000);
    
    return () => clearInterval(interval);
  }, [isImpersonating, impersonationData?.startedAt]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showConfirm) {
        setShowConfirm(false);
      }
    };

    if (showConfirm) {
      document.addEventListener('keydown', handleEscape as any);
    }
    return () => document.removeEventListener('keydown', handleEscape as any);
  }, [showConfirm]);

  if (!isImpersonating || !user) return null;

  // Gestion de la sortie d'impersonation
  const handleExitMasquerade = useCallback(async () => {
    if (isExiting) return;
    
    setIsExiting(true);
    const toastId = toast.loading("Rupture de la session d'impersonation...");
    
    try {
      // Logging de l'action (audit trail)
      if (typeof window !== 'undefined' && window.navigator?.sendBeacon) {
        window.navigator.sendBeacon('/api/audit/impersonation-exit', JSON.stringify({
          originalUser: impersonationData?.originalUser?.U_Email,
          impersonatedUser: impersonationData?.impersonatedUser?.U_Email,
          exitedAt: new Date().toISOString(),
          duration: formatDuration(impersonationData?.startedAt || ''),
        }));
      }
      
      // Appel au store pour sortir du mode impersonation
      if (exitImpersonation) {
        await exitImpersonation();
      } else if (logout) {
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

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && showConfirm) {
      setShowConfirm(false);
    }
  };

  const handleConfirmKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleExitMasquerade();
    }
  };

  const handleCancelKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setShowConfirm(false);
    }
  };

  return (
    <div 
      className={cn(
        "fixed top-0 left-0 w-full z-50 animate-in slide-in-from-top duration-300",
        className
      )}
      role="alert"
      aria-live="assertive"
      aria-label="Mode impersonation actif"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600 h-10 md:h-12 flex items-center justify-between px-3 md:px-4 lg:px-6 shadow-2xl border-b border-amber-500/30">
        
        {/* SECTION GAUCHE : Info impersonation */}
        <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3 min-w-0 flex-1">
          <ShieldAlert 
            size={14} 
            className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 text-white animate-pulse shrink-0" 
            aria-hidden="true" 
          />
          <p className="text-[6px] md:text-[7px] lg:text-[8px] font-black text-white uppercase tracking-widest m-0 italic truncate">
            Mode Mascarade
            <span className="mx-0.5 md:mx-1 lg:mx-2 opacity-50 hidden sm:inline">|</span> 
            <span className="hidden sm:inline">
              <span className="opacity-75">Cible:</span>{' '}
              <span className="underline decoration-2 underline-offset-2 font-normal not-italic">
                {impersonationData?.impersonatedUser?.U_Email || 'Utilisateur'}
              </span>
            </span>
          </p>
        </div>

        {/* SECTION CENTRE : Avertissement (Desktop) */}
        <div className="hidden lg:flex items-center gap-1.5 md:gap-2 text-[6px] md:text-[7px] lg:text-[8px] font-black text-white/90 uppercase tracking-widest italic">
          <AlertTriangle size={10} className="w-2.5 h-2.5 md:w-3 md:h-3 text-white/80 shrink-0" aria-hidden="true" />
          <span className="truncate max-w-xs md:max-w-md">
            Actions enregistrées au nom de {impersonationData?.impersonatedUser?.U_FirstName}
          </span>
          <span className="hidden xl:inline opacity-75">•</span>
          <span className="hidden xl:inline flex items-center gap-1">
            <Clock size={10} className="w-2.5 h-2.5 md:w-3 md:h-3" aria-hidden="true" /> {duration}
          </span>
        </div>

        {/* SECTION DROITE : Bouton de sortie */}
        <div className="flex items-center gap-1 md:gap-1.5 lg:gap-2">
          {/* Confirmation modale inline */}
          {showConfirm ? (
            <div 
              className="flex items-center gap-1 md:gap-1.5 bg-black/20 rounded-full px-1.5 md:px-2 py-1"
              role="dialog"
              aria-modal="true"
              aria-label="Confirmation de sortie"
            >
              <span className="text-[6px] md:text-[7px] font-black text-white uppercase tracking-widest">Confirmer ?</span>
              <button 
                type="button"
                onClick={handleExitMasquerade}
                onKeyDown={handleConfirmKeyDown}
                disabled={isExiting}
                className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2 md:px-2.5 py-0.5 md:py-1 rounded-full transition-all border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Confirmer la sortie"
                aria-busy={isExiting}
              >
                {isExiting ? (
                  <span className="w-2.5 h-2.5 md:w-3 md:h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                ) : (
                  <span className="text-[6px] md:text-[7px] font-black uppercase">Oui</span>
                )}
              </button>
              <button 
                type="button"
                onClick={() => setShowConfirm(false)}
                onKeyDown={handleCancelKeyDown}
                className="text-[6px] md:text-[7px] font-black text-white/70 hover:text-white transition-colors border-none bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 rounded px-1"
                aria-label="Annuler"
              >
                Non
              </button>
            </div>
          ) : (
            <button 
              type="button"
              onClick={() => setShowConfirm(true)}
              disabled={isExiting}
              className="flex items-center gap-1 md:gap-1.5 lg:gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-2 md:px-3 lg:px-4 py-1 md:py-1.5 lg:py-2 rounded-full transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group focus:outline-none focus:ring-2 focus:ring-white/50 shrink-0"
              aria-label="Quitter le mode impersonation"
              aria-expanded={showConfirm}
            >
              <span className="hidden sm:inline text-[6px] md:text-[7px] lg:text-[8px] font-black text-white uppercase tracking-widest italic">
                {isExiting ? 'SORTIE...' : 'QUITTER'}
              </span>
              <ZapOff 
                size={12} 
                className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 text-white group-hover:scale-110 transition-transform shrink-0" 
                aria-hidden="true" 
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}