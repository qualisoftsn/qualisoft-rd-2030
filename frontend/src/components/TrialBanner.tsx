/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * ⏳ MODULE : TrialBanner (License Monitoring & Security Barrier)
 * RÔLE : Monitoring de la licence et barrière de sécurité temporelle
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useEffect, useState, useMemo, useCallback, KeyboardEvent, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Clock, AlertTriangle, Zap, X, ShieldCheck, Crown, AlertCircle } from 'lucide-react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';

export interface TrialData {
  daysLeft: number;
  hoursLeft: number;
  isExpired: boolean;
  subscriptionStatus: SubscriptionStatus;
  trialEndDate?: string;
  trialStartDate?: string;
  maxTrialDays?: number;
}

export interface TrialBannerProps {
  isSuperAdmin: boolean;
  className?: string;
  onDismiss?: () => void;
  onRenewClick?: () => void;
}

export interface TrialStatus {
  isCritical: boolean;
  isWarning: boolean;
  progress: number;
  message: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user?: {
    U_Id: string;
    U_Email: string;
    U_Role: string;
  } | null;
  isLoading: boolean;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const DEFAULT_TRIAL_DAYS = 14;
const CRITICAL_THRESHOLD = 3; // days
const WARNING_THRESHOLD = 7; // days
const CHECK_INTERVAL = 3600000; // 1 hour in ms

const STATUS_CONFIG: Record<SubscriptionStatus, { label: string; color: string; bg: string }> = {
  TRIAL: { label: 'ESSAI', color: 'text-amber-400', bg: 'bg-amber-500' },
  ACTIVE: { label: 'ACTIF', color: 'text-emerald-400', bg: 'bg-emerald-500' },
  EXPIRED: { label: 'EXPIRÉ', color: 'text-red-400', bg: 'bg-red-500' },
  SUSPENDED: { label: 'SUSPENDU', color: 'text-slate-400', bg: 'bg-slate-500' },
};

// ============================================================================
// SOUS-COMPOSANT : SUPER ADMIN BANNER
// ============================================================================

interface SuperAdminBannerProps {
  className?: string;
}

function SuperAdminBanner({ className }: SuperAdminBannerProps) {
  return (
    <div 
      className={cn(
        "relative z-50 bg-gradient-to-r from-amber-500 to-amber-700 text-slate-900 h-10 md:h-12 flex items-center justify-center px-4 md:px-6 lg:px-8 shadow-xl border-b border-amber-400/50 italic font-sans",
        className
      )}
      role="status"
      aria-label="Mode super administrateur activé"
    >
      <div className="flex items-center gap-2 md:gap-3 lg:gap-4 animate-in fade-in slide-in-from-top-4 duration-1000">
        <Crown size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" strokeWidth={3} aria-hidden="true" />
        <p className="text-[7px] md:text-[8px] lg:text-[9px] lg:text-[10px] font-black uppercase tracking-widest leading-none">
          <span className="hidden sm:inline">Sovereign Mode — Accès Matriciel RD-2026 Illimité</span>
          <span className="sm:hidden">Mode Sovereign Actif</span>
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : TRIAL WARNING BANNER
// ============================================================================

interface TrialWarningBannerProps {
  trialData: TrialData;
  status: TrialStatus;
  onDismiss: () => void;
  onRenewClick: () => void;
  className?: string;
}

function TrialWarningBanner({ trialData, status, onDismiss, onRenewClick, className }: TrialWarningBannerProps) {
  const handleRenewClick = useCallback(() => {
    onRenewClick?.();
  }, [onRenewClick]);

  const handleDismiss = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      handleDismiss();
    }
  }, [handleDismiss]);

  const handleRenewKeyDown = useCallback((e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRenewClick();
    }
  }, [handleRenewClick]);

  const handleDismissKeyDown = useCallback((e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDismiss();
    }
  }, [handleDismiss]);

  const StatusIcon = status.isCritical ? AlertTriangle : Zap;

  return (
    <div 
      className={cn(
        "relative z-50 transition-all duration-1000 w-full font-sans italic border-b border-white/10 shadow-xl",
        status.isCritical 
          ? "bg-gradient-to-r from-red-600 to-orange-700" 
          : status.isWarning 
          ? "bg-gradient-to-r from-orange-500 to-amber-600" 
          : "bg-[#0B0F1A]",
        className
      )}
      role="alert"
      aria-live="polite"
      aria-label={`Période d'essai: ${trialData.daysLeft} jours restants`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 lg:px-10 py-3 md:py-4 flex flex-col md:flex-row justify-between items-center text-white gap-4 md:gap-6">
        
        {/* 🚨 INDICATEUR DE COMPTE À REBOURS */}
        <div className="flex items-center gap-3 md:gap-4 lg:gap-6 w-full md:w-auto">
          <div 
            className="p-2 md:p-2.5 lg:p-3 bg-white/15 rounded-lg md:rounded-xl lg:rounded-2xl backdrop-blur-sm border border-white/10 shadow-inner group-hover:rotate-12 transition-transform"
            aria-hidden="true"
          >
            <StatusIcon 
              size={16} 
              className={cn(
                "w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5",
                status.isCritical ? "animate-pulse text-white" : "text-amber-300 animate-bounce"
              )} 
            />
          </div>
          
          <div className="flex flex-col text-left min-w-0 flex-1">
            <span 
              className="text-[7px] md:text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-white/70 mb-1 md:mb-1.5 leading-none"
              id="trial-status-label"
            >
              {status.isCritical ? 'Alerte : Rupture de service imminente' : 'Période d\'essai Qualisoft Elite'}
            </span>
            <div className="flex items-center gap-2 md:gap-3 lg:gap-4 flex-wrap">
              <div 
                className="flex items-center gap-2 md:gap-2.5 lg:gap-3 text-[9px] md:text-[10px] lg:text-sm font-black uppercase tracking-tighter"
                aria-labelledby="trial-status-label"
              >
                <Clock 
                  size={14} 
                  className={cn("w-3.5 h-3.5 md:w-4 md:h-4", status.isCritical ? "text-white" : "text-amber-300")} 
                  aria-hidden="true" 
                />
                <span className="bg-black/20 px-2 md:px-3 lg:px-4 py-1 md:py-1.5 rounded-lg md:rounded-xl border border-white/5 tabular-nums">
                  {trialData.daysLeft} {trialData.daysLeft === 1 ? 'jour' : 'jours'} restants
                </span>
              </div>
              {status.isCritical && (
                <span 
                  className="text-[7px] md:text-[8px] bg-white text-red-600 px-2 md:px-3 py-0.5 md:py-1 rounded-md md:rounded-lg font-black animate-pulse tracking-widest uppercase"
                  role="alert"
                >
                  Action Requise
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 🚀 ACTIONS DE RÉGULARISATION */}
        <div className="flex items-center gap-3 md:gap-4 lg:gap-5 shrink-0 w-full md:w-auto justify-between md:justify-end">
          <button 
            type="button"
            onClick={handleRenewClick}
            onKeyDown={handleRenewKeyDown}
            className="bg-white text-slate-900 px-4 md:px-6 lg:px-8 py-2 md:py-2.5 lg:py-3.5 rounded-lg md:rounded-xl lg:rounded-2xl text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all hover:bg-blue-600 hover:text-white hover:scale-105 shadow-xl border-none cursor-pointer flex items-center gap-1.5 md:gap-2 lg:gap-3 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Débloquer la licence complète"
          >
            <ShieldCheck size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" aria-hidden="true" /> 
            <span className="hidden sm:inline">Débloquer la Licence Full</span>
            <span className="sm:hidden">Licence Full</span>
          </button>
          
          <button 
            type="button"
            onClick={handleDismiss}
            onKeyDown={handleDismissKeyDown}
            className="text-white/40 hover:text-white transition-all bg-transparent border-none cursor-pointer p-1.5 md:p-2 hover:bg-white/10 rounded-lg md:rounded-full focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Ignorer l'avertissement"
          >
            <X size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* 📊 BARRE DE PROGRESSION KERNEL */}
      <div 
        className="absolute bottom-0 left-0 h-1 md:h-1.5 lg:h-2 w-full bg-black/40"
        role="progressbar"
        aria-valuenow={status.progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progression de la période d'essai"
      >
        <div 
          className={cn(
            "h-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.3)]",
            status.isCritical ? "bg-white" : status.isWarning ? "bg-amber-400" : "bg-blue-400"
          )}
          style={{ width: `${status.progress}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function TrialBanner({ isSuperAdmin, className, onDismiss, onRenewClick }: TrialBannerProps) {
  const [trialData, setTrialData] = useState<TrialData | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore() as AuthState;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 📡 PROTOCOLE DE VÉRIFICATION KERNEL
   * Interrogation directe de l'API pour valider l'intégrité de la licence.
   */
  const checkTrialStatus = useCallback(async () => {
    if (!isAuthenticated || pathname?.startsWith('/auth') || isSuperAdmin) {
      setLoading(false);
      return;
    }

    try {
      const res = await apiClient.get<TrialData>('/tenant/trial-status');
      
      // Validate response
      if (!res.data || typeof res.data.daysLeft !== 'number') {
        throw new Error('Invalid trial data received');
      }
      
      setTrialData(res.data);
      setError(null);
      
      // ⛔ ÉJECTION SI EXPIRATION SCELLÉE
      if (res.data.isExpired || res.data.subscriptionStatus === 'EXPIRED') {
        // Only redirect if not already on expired page
        if (pathname !== '/auth/expired') {
          router.replace('/auth/expired');
        }
      }
    } catch (err) {
      const error = err as { message?: string };
      console.error("❌ SENTINELLE : Échec de synchronisation de licence.", error.message);
      setError(error.message || 'Échec de vérification de licence');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, pathname, isSuperAdmin, router]);

  useEffect(() => {
    if (authLoading) return;
    
    checkTrialStatus();
    
    // Setup interval for periodic checks
    intervalRef.current = setInterval(checkTrialStatus, CHECK_INTERVAL);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [authLoading, checkTrialStatus]);

  // Handle dismiss
  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    onDismiss?.();
  }, [onDismiss]);

  // Handle renew click
  const handleRenewClick = useCallback(() => {
    onRenewClick?.();
    router.push('/dashboard/settings/billing');
  }, [onRenewClick, router]);

  // --- 🎨 LOGIQUE VISUELLE ÉLITE ---
  const status = useMemo((): TrialStatus | null => {
    if (!trialData) return null;
    
    const isCritical = trialData.daysLeft <= CRITICAL_THRESHOLD;
    const isWarning = trialData.daysLeft <= WARNING_THRESHOLD && trialData.daysLeft > CRITICAL_THRESHOLD;
    const maxDays = trialData.maxTrialDays || DEFAULT_TRIAL_DAYS;
    const progress = Math.min(100, Math.max(0, 100 - (trialData.daysLeft / maxDays) * 100));
    
    let message = '';
    if (isCritical) {
      message = 'Expiration imminente';
    } else if (isWarning) {
      message = 'Expiration proche';
    }
    
    return { isCritical, isWarning, progress, message };
  }, [trialData]);

  // Loading state
  if (loading || authLoading) {
    return null;
  }

  // Don't show if not visible
  if (!isVisible) {
    return null;
  }

  // Don't show if ACTIVE subscription
  if (trialData?.subscriptionStatus === 'ACTIVE') {
    return null;
  }

  // Don't show if no trial data
  if (!trialData) {
    return null;
  }

  // 🛡️ MODE SOUVERAIN (SUPER-ADMIN)
  if (isSuperAdmin) {
    return <SuperAdminBanner className={className} />;
  }

  return (
    <TrialWarningBanner 
      trialData={trialData}
      status={status!}
      onDismiss={handleDismiss}
      onRenewClick={handleRenewClick}
      className={className}
    />
  );
}