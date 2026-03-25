/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 💡 COMPOSANT : KPI CARD ENVIRONNEMENTALE
 * -------------------------------------------------------------------------
 * RÔLE : Visualisation atomique d'un indicateur de performance (IPE)
 * VERSION : 2.0 - Typing strict + Accessibilité + Design Elite
 * DESIGN : Style "ClickUp Glass", barres de progression néon, WCAG AA
 * RÉVISION : 19 Mars 2026 | 17:30 GMT
 * -------------------------------------------------------------------------
 */

import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, LucideIcon } from 'lucide-react';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type KpiColor = 'emerald' | 'blue' | 'amber' | 'rose' | 'purple' | 'cyan';

export interface EnvironmentalKPICardProps {
  title: string;
  value: string | number;
  target?: string;
  progress?: number;
  trend?: string;
  icon: LucideIcon;
  color: KpiColor;
  isoRef?: string;
  alert?: boolean;
  onClick?: () => void;
  className?: string;
  'aria-label'?: string;
}

// ============================================================================
// CONFIGURATION DES COULEURS
// ============================================================================

const COLOR_CONFIG: Record<KpiColor, { 
  gradient: string; 
  text: string; 
  progress: string;
  progressAlert: string;
}> = {
  emerald: {
    gradient: 'from-emerald-500 to-emerald-700',
    text: 'text-emerald-400',
    progress: 'bg-emerald-500 shadow-[0_0_10px_#10b981]',
    progressAlert: 'bg-amber-500 shadow-[0_0_10px_#f59e0b]',
  },
  blue: {
    gradient: 'from-blue-500 to-blue-700',
    text: 'text-blue-400',
    progress: 'bg-blue-500 shadow-[0_0_10px_#3b82f6]',
    progressAlert: 'bg-amber-500 shadow-[0_0_10px_#f59e0b]',
  },
  amber: {
    gradient: 'from-amber-500 to-orange-600',
    text: 'text-amber-400',
    progress: 'bg-amber-500 shadow-[0_0_10px_#f59e0b]',
    progressAlert: 'bg-rose-500 shadow-[0_0_10px_#ef4444]',
  },
  rose: {
    gradient: 'from-rose-500 to-red-700',
    text: 'text-rose-400',
    progress: 'bg-rose-500 shadow-[0_0_10px_#f43f5e]',
    progressAlert: 'bg-rose-500 shadow-[0_0_10px_#f43f5e]',
  },
  purple: {
    gradient: 'from-purple-500 to-violet-700',
    text: 'text-purple-400',
    progress: 'bg-purple-500 shadow-[0_0_10px_#a855f7]',
    progressAlert: 'bg-amber-500 shadow-[0_0_10px_#f59e0b]',
  },
  cyan: {
    gradient: 'from-cyan-500 to-teal-700',
    text: 'text-cyan-400',
    progress: 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]',
    progressAlert: 'bg-amber-500 shadow-[0_0_10px_#f59e0b]',
  },
};

const getTrendConfig = (trend?: string) => {
  if (!trend) return { icon: null, color: 'text-slate-400', label: '' };
  if (trend.startsWith('-') && !trend.includes('Incident')) {
    return { icon: TrendingDown, color: 'text-emerald-400', label: 'Amélioration' };
  }
  if (trend.startsWith('+') && !trend.includes('Incident')) {
    return { icon: TrendingUp, color: 'text-rose-400', label: 'Dégradation' };
  }
  return { icon: null, color: 'text-slate-400', label: '' };
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function EnvironmentalKPICard({
  title,
  value,
  target,
  progress,
  trend,
  icon: Icon,
  color,
  isoRef,
  alert = false,
  onClick,
  className,
  'aria-label': ariaLabel,
}: EnvironmentalKPICardProps) {
  const config = COLOR_CONFIG[color];
  const trendConfig = getTrendConfig(trend);
  const TrendIcon = trendConfig.icon;
  
  const progressColor = (alert || (progress !== undefined && progress > 90)) 
    ? config.progressAlert 
    : config.progress;

  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <article
      onClick={onClick ? handleClick : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
      className={cn(
        "bg-[#0F172A] p-5 md:p-7 lg:p-8 rounded-2xl md:rounded-3xl border-2 border-white/5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F1A]",
        alert ? "animate-pulse border-amber-500/30 bg-amber-500/5" : "hover:border-white/20",
        onClick && "cursor-pointer group",
        className
      )}
      role={onClick ? "button" : "article"}
      aria-label={ariaLabel || `${title}: ${value}${target ? ` sur ${target}` : ''}`}
      tabIndex={onClick ? 0 : -1}
    >
      {/* Header: Icon + ISO Ref */}
      <div className="flex justify-between items-start mb-5 md:mb-6">
        <div className={cn(
          "p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5 text-white transition-transform",
          onClick && "group-hover:scale-110",
          `bg-gradient-to-br ${config.gradient}`
        )}>
          <Icon size={20} className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0" aria-hidden="true" />
        </div>
        {isoRef && (
          <span className="text-[7px] md:text-[8px] font-black bg-black/40 text-slate-500 px-2.5 md:px-3 py-1 rounded-full border border-white/5 italic">
            {isoRef}
          </span>
        )}
      </div>
      
      {/* Contenu principal */}
      <div className="space-y-1 md:space-y-1.5 text-left">
        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 italic m-0">
          {title}
        </p>
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-black italic text-white tracking-tighter m-0 uppercase leading-none">
          {value}
        </h3>
        {target && (
          <p className="text-[8px] md:text-[9px] font-bold text-slate-600 mt-2 md:mt-3 italic uppercase m-0 tracking-widest">
            Cible: <span className="text-slate-400">{target}</span>
          </p>
        )}
      </div>
      
      {/* Barre de progression */}
      {progress !== undefined && (
        <div className="w-full bg-white/5 h-1.5 md:h-2 rounded-full mt-5 md:mt-6 overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div 
            className={cn("h-full rounded-full transition-all duration-700", progressColor)}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
      
      {/* Footer: Analytics + Trend */}
      <div className="flex items-center justify-between mt-6 md:mt-8 pt-4 border-t border-white/5">
        <p className="text-[8px] md:text-[9px] font-black uppercase italic text-slate-500 m-0 tracking-widest flex items-center gap-1.5 md:gap-2">
          Matrix Analytics <ArrowUpRight size={10} className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0" aria-hidden="true" />
        </p>
        {trend && (
          <div className={cn("flex items-center text-[9px] md:text-[10px] font-black italic", trendConfig.color)}>
            {TrendIcon && <TrendIcon size={12} className="w-12 h-12 md:w-14 md:h-14 flex-shrink-0" className="mr-1" aria-hidden="true" />}
            <span aria-label={`${trendConfig.label}: ${trend}`}>{trend}</span>
          </div>
        )}
      </div>
    </article>
  );
}
