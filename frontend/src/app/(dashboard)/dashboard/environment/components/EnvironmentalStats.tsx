/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 💡 COMPOSANT : BARRE STATISTIQUE MATRIX
 * -------------------------------------------------------------------------
 * RÔLE : Synthèse rapide des tendances IPE mensuelles
 * VERSION : 2.0 - Typing strict + Accessibilité + Design Elite
 * DESIGN : Grid responsive, alertes visuelles, WCAG AA
 * RÉVISION : 19 Mars 2026 | 17:45 GMT
 * -------------------------------------------------------------------------
 */

import React from 'react';
import { Zap, Droplets, Recycle, Trash2, AlertTriangle, LucideIcon } from 'lucide-react';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface EnvStatsData {
  energy: number;
  water: number;
  recycling: number;
  waste: number;
  energyUnit?: string;
  waterUnit?: string;
  wasteUnit?: string;
}

export interface MetricConfig {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  alert: boolean;
  alertMessage?: string;
}

export interface EnvironmentalStatsProps {
  stats: EnvStatsData;
  className?: string;
  thresholds?: {
    energy: number;
    waste: number;
    recycling: number;
  };
}

// ============================================================================
// CONFIGURATION PAR DÉFAUT
// ============================================================================

const DEFAULT_THRESHOLDS = {
  energy: 10000,
  waste: 5000,
  recycling: 75,
};

const getMetricConfig = (stats: EnvStatsData, thresholds: typeof DEFAULT_THRESHOLDS): MetricConfig[] => [
  { 
    label: 'ÉLECTRICITÉ', 
    val: `${new Intl.NumberFormat('fr-SN').format(stats.energy)} ${stats.energyUnit || 'kWh'}`, 
    icon: Zap, 
    color: 'text-amber-400', 
    alert: stats.energy > thresholds.energy,
    alertMessage: 'Seuil critique dépassé',
  },
  { 
    label: 'RESSOURCES EAU', 
    val: `${new Intl.NumberFormat('fr-SN').format(stats.water)} ${stats.waterUnit || 'm³'}`, 
    icon: Droplets, 
    color: 'text-blue-400', 
    alert: false,
  },
  { 
    label: 'VALORISATION', 
    val: `${stats.recycling}%`, 
    icon: Recycle, 
    color: 'text-emerald-400', 
    alert: stats.recycling < thresholds.recycling,
    alertMessage: 'Objectif ISO non atteint',
  },
  { 
    label: 'VOLUME DÉCHETS', 
    val: `${new Intl.NumberFormat('fr-SN').format(stats.waste)} ${stats.wasteUnit || 'kg'}`, 
    icon: Trash2, 
    color: 'text-rose-400', 
    alert: stats.waste > thresholds.waste,
    alertMessage: 'Volume excessif détecté',
  },
];

// ============================================================================
// COMPOSANT : METRIC CARD
// ============================================================================

interface MetricCardProps {
  metric: MetricConfig;
}

function MetricCard({ metric }: MetricCardProps) {
  const Icon = metric.icon;

  return (
    <article 
      className={cn(
        "p-5 md:p-7 lg:p-8 rounded-2xl md:rounded-3xl border-2 border-white/5 bg-[#0F172A] flex flex-col items-center justify-center text-center transition-all hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400",
        metric.alert && "animate-pulse ring-1 ring-amber-500/20 border-amber-500/30"
      )}
      role="article"
      aria-labelledby={`metric-${metric.label.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <div className={cn("p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 mb-4 md:mb-5", metric.color)}>
        <Icon size={24} className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0" aria-hidden="true" />
      </div>
      
      <p id={`metric-${metric.label.replace(/\s+/g, '-').toLowerCase()}`} className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 md:mb-2 italic m-0">
        {metric.label}
      </p>
      
      <h4 className="text-xl md:text-2xl font-black italic text-white uppercase tracking-tighter m-0 leading-none">
        {metric.value}
      </h4>
      
      {metric.alert && metric.alertMessage && (
        <p className="text-[7px] md:text-[8px] font-black text-amber-400 uppercase mt-2 md:mt-3 flex items-center gap-1 md:gap-1.5" role="status">
          <AlertTriangle size={10} className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0" aria-hidden="true" /> 
          <span className="truncate max-w-[120px]">{metric.alertMessage}</span>
        </p>
      )}
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function EnvironmentalStats({ 
  stats, 
  className, 
  thresholds = DEFAULT_THRESHOLDS 
}: EnvironmentalStatsProps) {
  const metrics = getMetricConfig(stats, thresholds);

  return (
    <section 
      className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6", className)}
      role="region"
      aria-label="Statistiques environnementales rapides"
    >
      {metrics.map((metric, index) => (
        <MetricCard key={index} metric={metric} />
      ))}
    </section>
  );
}
