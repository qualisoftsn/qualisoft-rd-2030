/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🎴 MODULE : StatCard (Critical KPI Display)
 * RÔLE : Affichage de KPI critique avec filigrane dynamique
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { KeyboardEvent } from 'react';
import { LucideIcon, TrendingUp, ArrowUpRight } from 'lucide-react';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Strict typing)
// ============================================================================

export type StatVariant = 'info' | 'warning' | 'danger' | 'success';

export interface StatCardProps {
  title: string;
  value: string | number | null | undefined;
  icon: LucideIcon;
  variant: StatVariant;
  trend?: string;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}

export interface VariantStyles {
  text: string;
  background: string;
  border: string;
  shadow: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const VARIANT_STYLES: Record<StatVariant, VariantStyles> = {
  info: { 
    text: 'text-blue-400', 
    background: 'bg-blue-500/10', 
    border: 'border-blue-500/20',
    shadow: 'shadow-blue-500/20'
  },
  warning: { 
    text: 'text-amber-400', 
    background: 'bg-amber-500/10', 
    border: 'border-amber-500/20',
    shadow: 'shadow-amber-500/20'
  },
  danger: { 
    text: 'text-red-400', 
    background: 'bg-red-500/10', 
    border: 'border-red-500/20',
    shadow: 'shadow-red-500/20'
  },
  success: { 
    text: 'text-emerald-400', 
    background: 'bg-emerald-500/10', 
    border: 'border-emerald-500/20',
    shadow: 'shadow-emerald-500/20'
  },
};

const formatValue = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number') {
    return Number.isInteger(value) ? value.toLocaleString('fr-SN') : value.toFixed(2);
  }
  return value;
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  variant, 
  trend,
  onClick,
  className,
  ariaLabel
}: StatCardProps) {
  const styles = VARIANT_STYLES[variant];
  const isClickable = !!onClick;
  const formattedValue = formatValue(value);

  const handleClick = () => {
    onClick?.();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && isClickable) {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <article 
      className={cn(
        "bg-white p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl border border-slate-100 shadow-xl hover:shadow-2xl hover:border-blue-500/30 transition-all duration-700 group relative overflow-hidden text-left italic font-sans focus-within:ring-2 focus-within:ring-blue-400",
        isClickable && "cursor-pointer",
        className
      )}
      role={isClickable ? "button" : "article"}
      aria-label={ariaLabel || `${title}: ${formattedValue}`}
      tabIndex={isClickable ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-2 md:space-y-3 lg:space-y-4">
          <p className="text-[8px] md:text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest m-0">
            {title}
          </p>
          <div className="flex items-baseline gap-2 md:gap-3 flex-wrap">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter leading-none m-0 tabular-nums">
              {formattedValue}
            </h3>
            {trend && (
              <span className="flex items-center gap-1 md:gap-1.5 text-[8px] md:text-[9px] lg:text-[10px] font-black text-blue-500 uppercase whitespace-nowrap">
                <TrendingUp size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" strokeWidth={3} aria-hidden="true" /> 
                {trend}
              </span>
            )}
          </div>
        </div>
        
        <div className={cn(
          "p-3 md:p-4 lg:p-5 rounded-xl md:rounded-2xl border transition-all group-hover:rotate-12 group-hover:scale-110 duration-500",
          styles.text, styles.background, styles.border
        )}>
          <Icon size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" strokeWidth={2.5} aria-hidden="true" />
        </div>
      </div>

      {/* FILIGRANE SDE */}
      <Icon 
        className="absolute -right-4 md:-right-6 lg:-right-8 -bottom-4 md:-bottom-6 lg:-bottom-8 text-slate-100 opacity-20 group-hover:opacity-40 group-hover:scale-125 transition-all duration-1000" 
        size={120} 
        aria-hidden="true" 
      />
      
      {isClickable && (
        <div className="mt-4 md:mt-6 lg:mt-8 flex items-center gap-1.5 md:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true">
          <span className="text-[7px] md:text-[8px] font-black uppercase text-blue-500 tracking-widest">
            Détails du registre
          </span>
          <ArrowUpRight size={10} className="w-2.5 h-2.5 md:w-3 md:h-3" aria-hidden="true" />
        </div>
      )}
    </article>
  );
}

export default StatCard;