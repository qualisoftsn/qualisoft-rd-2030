/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : MATRIX TRANSITION LOADER (ELITE-SDE)
 * RÔLE : Séquençage visuel de l'entrée dans le Kernel
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Loader2, ShieldCheck, Zap, Activity, Cpu, CheckCircle2 } from 'lucide-react';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface MatrixLoaderProps {
  label?: string;
  onComplete?: () => void;
  autoHide?: boolean;
  hideAfter?: number;
}

export interface StatusItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: 'blue' | 'emerald' | 'amber' | 'red';
}

export interface LoaderState {
  progress: number;
  isComplete: boolean;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const DEFAULT_LABEL = "Initialisation du Tunnel...";
const DEFAULT_HIDE_AFTER = 2000; // 2 seconds after completion
const PROGRESS_INTERVAL = 30; // ms

const COLOR_CONFIG: Record<StatusItemProps['color'], string> = {
  blue: "text-blue-400",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  red: "text-red-400",
};

// ============================================================================
// SOUS-COMPOSANT : STATUS ITEM
// ============================================================================

function StatusItem({ icon: Icon, label, value, color }: StatusItemProps) {
  const colorClass = COLOR_CONFIG[color];
  
  return (
    <div 
      className="bg-white/2 border border-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl flex flex-col items-center gap-1.5 md:gap-2"
      role="status"
      aria-label={`${label}: ${value}`}
    >
      <Icon size={14} className={cn("w-3.5 h-3.5 md:w-4 md:h-4", colorClass)} aria-hidden="true" />
      <div className="text-center">
        <p className="text-[6px] md:text-[7px] font-black text-slate-500 uppercase m-0 tracking-widest">
          {label}
        </p>
        <p className="text-[8px] md:text-[9px] font-black text-white uppercase m-0 italic">
          {value}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function MatrixLoader({ 
  label = DEFAULT_LABEL, 
  onComplete,
  autoHide = true,
  hideAfter = DEFAULT_HIDE_AFTER
}: MatrixLoaderProps) {
  const [loaderState, setLoaderState] = useState<LoaderState>({
    progress: 0,
    isComplete: false,
  });

  const handleComplete = useCallback(() => {
    setLoaderState(prev => ({ ...prev, isComplete: true }));
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoaderState(prev => {
        if (prev.progress >= 100) {
          clearInterval(interval);
          if (!prev.isComplete) {
            handleComplete();
          }
          return prev;
        }
        return { ...prev, progress: prev.progress + 1 };
      });
    }, PROGRESS_INTERVAL);

    return () => clearInterval(interval);
  }, [handleComplete]);

  // Auto-hide after completion
  useEffect(() => {
    if (loaderState.isComplete && autoHide) {
      const timeout = setTimeout(() => {
        // Component should be unmounted by parent
        handleComplete();
      }, hideAfter);
      return () => clearTimeout(timeout);
    }
  }, [loaderState.isComplete, autoHide, hideAfter, handleComplete]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#050810] flex flex-col items-center justify-center overflow-hidden italic font-sans select-none"
      role="alert"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement de l'application"
    >
      
      {/* 🌌 GRILLE DE FOND DYNAMIQUE */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(128,128,128,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(128,128,128,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      <div 
        className="absolute inset-0 bg-blue-600/5"
        style={{
          maskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 70%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 70%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-sm px-6 md:px-8 space-y-8 md:space-y-10 lg:space-y-12 flex flex-col items-center">
        
        {/* 🛡️ LOGO PULSATIONNEL */}
        <div className="relative" role="img" aria-label="Logo Qualisoft Elite">
          <div 
            className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-blue-600/10 rounded-2xl md:rounded-3xl border-2 border-blue-500/20 flex items-center justify-center animate-pulse"
            aria-hidden="true"
          >
            <Cpu className="text-blue-400 w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16" strokeWidth={1} />
          </div>
          <div 
            className="absolute -top-1 md:-top-1.5 -right-1 md:-right-1.5 w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl animate-bounce"
            aria-hidden="true"
          >
            <ShieldCheck className="text-white w-4 h-4 md:w-5 md:h-5" />
          </div>
          {loaderState.isComplete && (
            <div 
              className="absolute inset-0 flex items-center justify-center"
              aria-hidden="true"
            >
              <CheckCircle2 className="text-emerald-400 w-16 h-16 md:w-20 md:h-20 animate-in zoom-in duration-300" />
            </div>
          )}
        </div>

        {/* 📊 TEXTES DE CHARGEMENT SDE */}
        <div className="text-center space-y-3 md:space-y-4 w-full">
          <h2 
            className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter m-0 italic"
            aria-label="Matrix OS version 3.0"
          >
            Matrix <span className="text-blue-400">OS</span>{' '}
            <span className="text-slate-600">v3.0</span>
          </h2>
          <div className="flex flex-col gap-1.5 md:gap-2">
            <p 
              className="text-[8px] md:text-[9px] lg:text-[10px] font-black text-blue-400 uppercase tracking-widest animate-pulse m-0"
              aria-live="polite"
            >
              {label}
            </p>
            <span 
              className="text-[7px] md:text-[8px] font-black text-slate-600 uppercase tracking-widest italic"
              aria-label={`Progression: ${loaderState.progress}%`}
            >
              Séquençage du nœud territorial : {loaderState.progress}%
            </span>
          </div>
        </div>

        {/* ⚡ BARRE DE PROGRESSION TACTIQUE */}
        <div 
          className="w-full h-1 md:h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 relative shadow-inner"
          role="progressbar"
          aria-valuenow={loaderState.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progression du chargement"
        >
           <div 
             className={cn(
               "h-full transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.8)]",
               loaderState.isComplete ? "bg-emerald-500" : "bg-blue-500"
             )}
             style={{ width: `${loaderState.progress}%` }}
             aria-hidden="true"
           />
        </div>

        {/* 📡 TÉLÉMÉTRIE FLOTTANTE */}
        <div 
          className="grid grid-cols-2 gap-3 md:gap-4 w-full pt-4 md:pt-6"
          role="list"
          aria-label="État du système"
        >
          <StatusItem 
            icon={Zap} 
            label="Tunnel SSL" 
            value={loaderState.isComplete ? "Vérifié" : "Actif"} 
            color={loaderState.isComplete ? "emerald" : "blue"} 
          />
          <StatusItem 
            icon={Activity} 
            label="Latence" 
            value="2ms" 
            color="emerald" 
          />
        </div>
      </div>

      {/* 🏛️ FILIGRANE SOUVERAIN */}
      <div 
        className="absolute bottom-6 md:bottom-8 lg:bottom-10 flex flex-col items-center gap-1.5 md:gap-2 opacity-20"
        aria-hidden="true"
      >
        <p className="text-[7px] md:text-[8px] lg:text-[9px] font-black text-slate-500 uppercase tracking-widest m-0">
          Qualisoft Elite Node
        </p>
        <div className="flex gap-1.5 md:gap-2">
           <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-blue-400 animate-ping" />
           <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-slate-700" />
           <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-slate-700" />
        </div>
      </div>
    </div>
  );
}