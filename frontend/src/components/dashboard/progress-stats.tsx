/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 📈 MODULE : ProgressStats (Action Plan Closure Rate)
 * RÔLE : Performance de clôture des actions du Tenant (§10.2 ISO)
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React from 'react';
import { Activity, Target, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Strict typing)
// ============================================================================

export interface ProgressStatsProps {
  total: number;
  done: number;
  target?: number; // Objectif personnalisé (défaut: 100%)
  className?: string;
  onProgressClick?: () => void;
}

export interface StatusBoxProps {
  label: string;
  value: number;
  color: string;
  background: string;
  border: string;
  icon?: React.ElementType;
}

export interface ProgressBarProps {
  percentage: number;
  done: number;
  total: number;
}

// ============================================================================
// SOUS-COMPOSANT : PROGRESS BAR
// ============================================================================

function ProgressBar({ percentage, done, total }: ProgressBarProps) {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  
  return (
    <div 
      className="h-5 md:h-6 lg:h-7 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 md:p-1 lg:p-1.5 border border-slate-200/50 shadow-inner mb-6 md:mb-8 lg:mb-10"
      role="progressbar"
      aria-valuenow={clampedPercentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progression: ${clampedPercentage}% (${done} sur ${total} actions)`}
    >
      <div 
        className={cn(
          "h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_25px_rgba(37,99,235,0.5)] flex items-center justify-end px-2 md:px-3 lg:px-4",
          clampedPercentage === 100 && "bg-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.5)]"
        )}
        style={{ width: `${clampedPercentage}%` }}
        aria-hidden="true"
      >
        {clampedPercentage > 0 && (
          <div className="h-1 md:h-1.5 w-1 md:w-1.5 bg-white rounded-full animate-pulse shadow-white shadow-lg" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : STATUS BOX
// ============================================================================

function StatusBox({ label, value, color, background, border, icon: Icon }: StatusBoxProps) {
  return (
    <article 
      className={cn(
        background, border, "p-4 md:p-6 lg:p-8 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] flex flex-col items-center text-center group hover:scale-[1.02] transition-all focus-within:ring-2 focus-within:ring-blue-400",
        color
      )}
      role="article"
      aria-label={`${label}: ${value}`}
      tabIndex={0}
    >
      {Icon && (
        <Icon size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 mb-2 md:mb-3 opacity-50" aria-hidden="true" />
      )}
      <p className={cn("text-[8px] md:text-[9px] font-black uppercase tracking-widest italic leading-none mb-2 md:mb-3", color)}>
        {label}
      </p>
      <p className={cn("text-3xl md:text-4xl lg:text-5xl font-black italic tracking-tighter leading-none m-0 tabular-nums", color)}>
        {value}
      </p>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export function ProgressStats({ 
  total, 
  done, 
  target = 100,
  className,
  onProgressClick 
}: ProgressStatsProps) {
  // Protection contre division par zéro et valeurs négatives
  const safeTotal = Math.max(0, total);
  const safeDone = Math.max(0, Math.min(done, safeTotal));
  const percentage = safeTotal > 0 ? Math.round((safeDone / safeTotal) * 100) : 0;
  const inProgress = safeTotal - safeDone;
  const targetReached = percentage >= target;

  const handleClick = () => {
    onProgressClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <article 
      className={cn(
        "bg-white p-4 md:p-6 lg:p-8 xl:p-10 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] border border-slate-100 shadow-xl md:shadow-2xl animate-in zoom-in-95 duration-700 italic text-left relative overflow-hidden focus-within:ring-2 focus-within:ring-blue-400",
        className
      )}
      role="region"
      aria-labelledby="progress-title"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {/* Decorative Target Icon */}
      <Target 
        size={150} 
        className="absolute -left-4 md:-left-6 lg:-left-10 -bottom-4 md:-bottom-6 lg:-bottom-10 text-slate-50 opacity-10 w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48" 
        aria-hidden="true" 
      />
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 md:gap-6 lg:gap-8 mb-6 md:mb-8 lg:mb-10 relative z-10">
        <div className="space-y-2 md:space-y-3">
          <p 
            className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 md:gap-3 m-0"
            id="progress-title"
          >
             <Activity size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 text-blue-500" aria-hidden="true" /> 
             Taux de Clôture PAQ
          </p>
          <h3 
            className={cn(
              "text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter leading-none italic m-0 tabular-nums",
              targetReached ? "text-emerald-500" : "text-slate-900"
            )}
            aria-label={`Taux de clôture: ${percentage}%`}
          >
            {percentage}%
          </h3>
        </div>
        <div className="text-left lg:text-right">
          <p className="text-sm md:text-base font-black text-slate-900 uppercase tracking-tighter m-0 italic tabular-nums">
            <span className={cn("text-blue-500", targetReached && "text-emerald-500")}>{safeDone}</span> / {safeTotal} Actions Clôturées
          </p>
          <p className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1 md:mt-2 m-0 italic">
            Objectif SDE : {target}%
          </p>
          {targetReached && safeTotal > 0 && (
            <p className="text-[7px] md:text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1 m-0 italic flex items-center gap-1 justify-start lg:justify-end">
              <CheckCircle2 size={10} className="w-2.5 h-2.5" aria-hidden="true" /> Objectif Atteint
            </p>
          )}
        </div>
      </div>
      
      {/* PROGRESS BAR */}
      <ProgressBar percentage={percentage} done={safeDone} total={safeTotal} />

      {/* STATUS BOXES */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:gap-6 lg:gap-8 relative z-10">
        <StatusBox 
          label="Registre Clôturé" 
          value={safeDone} 
          color="text-emerald-500" 
          background="bg-emerald-50" 
          border="border-emerald-100"
          icon={CheckCircle2}
        />
        <StatusBox 
          label="Flux en Cours" 
          value={inProgress} 
          color="text-amber-500" 
          background="bg-amber-50" 
          border="border-amber-100"
          icon={Clock}
        />
      </div>
    </article>
  );
}

export default ProgressStats;