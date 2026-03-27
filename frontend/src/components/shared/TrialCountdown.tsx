/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * ⏳ MODULE : TrialCountdown (Trial Period Monitor)
 * RÔLE : Monitoring temps réel et protection de l'instance
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { differenceInDays, startOfDay, isValid } from "date-fns";
import { AlertTriangle, Lock, Rocket, ShieldAlert, Key, ChevronRight } from "lucide-react";
import { cn } from '@/core/utils/cn';
import { useCallback, useMemo } from "react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type TrialStatus = 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';

export interface TrialCountdownProps {
  endDate: string | Date | null | undefined;
  status: TrialStatus;
  onRenewClick?: () => void;
  onActivateClick?: () => void;
  className?: string;
}

export interface CountdownState {
  daysLeft: number;
  isExpired: boolean;
  isCritical: boolean;
  isWarning: boolean;
  message: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const CRITICAL_THRESHOLD = 2; // days
const WARNING_THRESHOLD = 7; // days

const ALERT_CONFIG = {
  expired: {
    bg: 'bg-[#0B0F1A]',
    border: 'border-red-600',
    textColor: 'text-red-400',
    iconBg: 'bg-red-600/20',
    iconColor: 'text-red-400',
    buttonBg: 'bg-red-600 hover:bg-red-500',
    label: 'INSTANCE VÉROUILLÉE',
  },
  critical: {
    bg: 'bg-red-600',
    border: 'border-red-500',
    textColor: 'text-white',
    iconBg: 'bg-red-500/20',
    iconColor: 'text-white',
    buttonBg: 'bg-white hover:bg-slate-100',
    label: 'ALERTE CRITIQUE',
  },
  warning: {
    bg: 'bg-amber-400',
    border: 'border-amber-500',
    textColor: 'text-slate-900',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-slate-900',
    buttonBg: 'bg-slate-900 hover:bg-slate-800',
    label: 'ALERTE PRÉVENTIVE',
  },
};

// ============================================================================
// UTILITAIRES
// ============================================================================

const calculateDaysLeft = (endDate: string | Date | null | undefined): number => {
  if (!endDate) return Infinity;
  
  const date = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  if (!isValid(date)) return Infinity;
  
  return differenceInDays(
    startOfDay(date),
    startOfDay(new Date())
  );
};

const formatDaysLeft = (days: number): string => {
  if (days < 0) return 'Expiré';
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return '1 jour';
  return `${days} jours`;
};

// ============================================================================
// SOUS-COMPOSANT : EXPIRED BANNER
// ============================================================================

interface ExpiredBannerProps {
  onRenewClick?: () => void;
  className?: string;
}

function ExpiredBanner({ onRenewClick, className }: ExpiredBannerProps) {
  const config = ALERT_CONFIG.expired;
  
  const handleClick = useCallback(() => {
    onRenewClick?.();
  }, [onRenewClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <div 
      className={cn(
        "bg-[#0B0F1A] border-b-4 border-red-600 p-4 md:p-6 lg:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 md:gap-6 lg:gap-10 animate-in slide-in-from-top duration-700 sticky top-0 z-50 shadow-xl backdrop-blur-md italic font-sans text-left",
        className
      )}
      role="alert"
      aria-live="assertive"
      aria-label="Instance expirée - Lecture seule activée"
    >
      <div className="flex items-start sm:items-center gap-4 md:gap-6">
        <div 
          className={cn(
            "p-3 md:p-4 rounded-xl md:rounded-2xl border animate-pulse shrink-0",
            config.iconBg, config.border
          )}
          aria-hidden="true"
        >
          <Lock className={cn("w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8", config.iconColor)} />
        </div>
        <div>
          <h4 className="text-base md:text-lg font-black uppercase tracking-tighter text-white m-0">
            Instance Qualisoft en <span className={cn("underline underline-offset-4", config.textColor)}>Lecture Seule</span>
          </h4>
          <p className="text-[8px] md:text-[9px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 md:mt-1.5 lg:mt-2 m-0 leading-none">
            Le bail d&apos;exploitation est expiré. Le périmètre d&apos;écriture est désactivé.
          </p>
        </div>
      </div>
      <button 
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "bg-red-600 hover:bg-red-500 text-white px-6 md:px-8 lg:px-10 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all shadow-xl border-none cursor-pointer flex items-center gap-2 md:gap-3 lg:gap-4 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-[#0B0F1A]",
          config.buttonBg
        )}
        aria-label="Restaurer la licence"
      >
        <Key size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" aria-hidden="true" /> 
        <span className="hidden sm:inline">Restaurer la licence</span>
        <span className="sm:hidden">Restaurer</span>
      </button>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : CRITICAL ALERT
// ============================================================================

interface CriticalAlertProps {
  daysLeft: number;
  className?: string;
}

function CriticalAlert({ daysLeft, className }: CriticalAlertProps) {
  const config = ALERT_CONFIG.critical;
  
  return (
    <div 
      className={cn(
        "bg-red-600 p-3 md:p-4 lg:p-5 flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 lg:gap-8 sticky top-0 z-50 shadow-xl italic font-sans animate-pulse",
        className
      )}
      role="alert"
      aria-live="polite"
      aria-label={`Alerte critique: verrouillage dans ${daysLeft} jours`}
    >
      <ShieldAlert className={cn("w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8", config.iconColor)} aria-hidden="true" />
      <p className="text-[10px] md:text-[11px] lg:text-sm font-black uppercase tracking-tighter text-white m-0 text-center">
        ALERTE MASTER : Verrouillage du Nœud Matrix dans <span className="underline decoration-4 text-white font-black">{formatDaysLeft(daysLeft)}</span> !
      </p>
      <Rocket size={20} className={cn("w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 animate-bounce", config.iconColor)} aria-hidden="true" />
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : WARNING ALERT
// ============================================================================

interface WarningAlertProps {
  daysLeft: number;
  onActivateClick?: () => void;
  className?: string;
}

function WarningAlert({ daysLeft, onActivateClick, className }: WarningAlertProps) {
  const config = ALERT_CONFIG.warning;
  
  const handleClick = useCallback(() => {
    onActivateClick?.();
  }, [onActivateClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <div 
      className={cn(
        "bg-amber-400 p-3 md:p-4 lg:p-5 flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 lg:gap-8 sticky top-0 z-50 border-b-2 border-amber-500 shadow-xl italic font-sans",
        className
      )}
      role="alert"
      aria-live="polite"
      aria-label={`Alerte préventive: expiration dans ${daysLeft} jours`}
    >
      <AlertTriangle className={cn("w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7", config.iconColor)} aria-hidden="true" />
      <p className={cn("text-[9px] md:text-[10px] lg:text-[11px] font-black uppercase tracking-widest m-0 leading-none text-center", config.textColor)}>
        PILOTAGE : La période d&apos;essai Qualisoft Elite expire dans <span className={cn("bg-slate-900 text-white px-2 md:px-3 py-0.5 md:py-1 rounded-lg font-mono text-sm md:text-base lg:text-lg ml-1 md:ml-2", config.textColor)}>{daysLeft}</span> jours.
      </p>
      <button 
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "text-white px-4 md:px-6 lg:px-8 py-2 md:py-2.5 lg:py-3 rounded-lg md:rounded-xl text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest border-none cursor-pointer hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-amber-400",
          config.buttonBg
        )}
        aria-label="Activer l'instance complète"
      >
        <span className="hidden sm:inline">Activer l&apos;Instance</span>
        <span className="sm:hidden">Activer</span>
      </button>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function TrialCountdown({ 
  endDate, 
  status, 
  onRenewClick,
  onActivateClick,
  className 
}: TrialCountdownProps) {
  // Calculate countdown state
  const countdownState = useMemo((): CountdownState => {
    const daysLeft = calculateDaysLeft(endDate);
    const isExpired = daysLeft < 0;
    const isCritical = daysLeft >= 0 && daysLeft <= CRITICAL_THRESHOLD;
    const isWarning = daysLeft > CRITICAL_THRESHOLD && daysLeft <= WARNING_THRESHOLD;
    
    let message = '';
    if (isExpired) {
      message = 'Instance expirée';
    } else if (isCritical) {
      message = `Verrouillage dans ${formatDaysLeft(daysLeft)}`;
    } else if (isWarning) {
      message = `Expiration dans ${formatDaysLeft(daysLeft)}`;
    }
    
    return { daysLeft, isExpired, isCritical, isWarning, message };
  }, [endDate]);

  // ✅ PROTECTION SDE : Rien à afficher si la licence est "ACTIVE" (Full)
  if (!endDate || status !== 'TRIAL') {
    return null;
  }

  // 🔴 PHASE 1 : INSTANCE VÉROUILLÉE (Lecture Seule)
  if (countdownState.isExpired) {
    return <ExpiredBanner onRenewClick={onRenewClick} className={className} />;
  }

  // 🟠 PHASE 2 : ALERTE CRITIQUE (<= 2 jours)
  if (countdownState.isCritical) {
    return <CriticalAlert daysLeft={countdownState.daysLeft} className={className} />;
  }

  // 🟡 PHASE 3 : ALERTE PRÉVENTIVE (<= 7 jours)
  if (countdownState.isWarning) {
    return (
      <WarningAlert 
        daysLeft={countdownState.daysLeft} 
        onActivateClick={onActivateClick}
        className={className}
      />
    );
  }

  return null;
}