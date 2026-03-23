/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 💡 COMPOSANT : ALERTES ENVIRONNEMENTALES SDE
 * -------------------------------------------------------------------------
 * RÔLE : Monitoring temps réel des dérives IPE (§9.1 ISO 14001)
 * VERSION : 2.0 - Typing strict + Accessibilité + Design Elite
 * DESIGN : Cartes de priorité Matrix, Glow dynamique, Mobile Ready, WCAG AA
 * RÉVISION : 19 Mars 2026 | 17:15 GMT
 * -------------------------------------------------------------------------
 */

import React from 'react';
import { AlertTriangle, Flame, Zap, Recycle, ShieldAlert, LucideIcon } from 'lucide-react';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type AlertPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type AlertColor = 'rose' | 'amber' | 'blue' | 'emerald';

export interface EnvironmentalAlert {
  id: string;
  show: boolean;
  icon: LucideIcon;
  title: string;
  description: string;
  color: AlertColor;
  priority: AlertPriority;
  actionUrl?: string;
  actionLabel?: string;
}

export interface EnvironmentalAlertsProps {
  criticalIncidents: number;
  hazardousWaste: number;
  energyOverTarget: boolean;
  recyclingBelowTarget: boolean;
  className?: string;
  onAlertClick?: (alert: EnvironmentalAlert) => void;
}

// ============================================================================
// CONFIGURATION DES ALERTES
// ============================================================================

const ALERT_CONFIG: Record<AlertColor, { 
  border: string; 
  bg: string; 
  text: string; 
  shadow: string;
  iconBg: string;
}> = {
  rose: {
    border: 'border-rose-500/30',
    bg: 'bg-rose-500/5',
    text: 'text-rose-400',
    shadow: 'shadow-[0_0_20px_rgba(244,63,94,0.15)]',
    iconBg: 'bg-rose-500/10',
  },
  amber: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/5',
    text: 'text-amber-400',
    shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    iconBg: 'bg-amber-500/10',
  },
  blue: {
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/5',
    text: 'text-blue-400',
    shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]',
    iconBg: 'bg-blue-500/10',
  },
  emerald: {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/5',
    text: 'text-emerald-400',
    shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    iconBg: 'bg-emerald-500/10',
  },
};

const PRIORITY_ORDER: Record<AlertPriority, number> = {
  CRITICAL: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
};

// ============================================================================
// COMPOSANT : ALERT CARD
// ============================================================================

interface AlertCardProps {
  alert: EnvironmentalAlert;
  onClick?: () => void;
}

function AlertCard({ alert, onClick }: AlertCardProps) {
  const config = ALERT_CONFIG[alert.color];
  const Icon = alert.icon;

  return (
    <article 
      className={cn(
        "p-4 md:p-5 rounded-2xl md:rounded-3xl border-2 backdrop-blur-md flex items-start gap-3 md:gap-4 transition-all hover:scale-[1.02] focus-within:scale-[1.02] cursor-pointer",
        config.border, config.bg, config.shadow,
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F1A]"
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      role="article"
      aria-labelledby={`alert-title-${alert.id}`}
      tabIndex={0}
    >
      <div className={cn("p-2.5 md:p-3 rounded-xl shadow-inner shrink-0", config.iconBg)}>
        <Icon size={18} md:size={20} className={cn("animate-pulse", config.text)} aria-hidden="true" />
      </div>
      
      <div className="space-y-1 md:space-y-1.5 min-w-0 flex-1">
        <div className="flex justify-between items-center w-full gap-2">
          <h4 
            id={`alert-title-${alert.id}`}
            className={cn("text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white m-0 italic truncate", config.text)}
          >
            {alert.title}
          </h4>
          <span className={cn(
            "text-[7px] md:text-[8px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg bg-white/10 shrink-0",
            alert.priority === 'CRITICAL' ? "text-rose-400" :
            alert.priority === 'HIGH' ? "text-amber-400" :
            alert.priority === 'MEDIUM' ? "text-blue-400" : "text-slate-400"
          )}>
            {alert.priority}
          </span>
        </div>
        <p className="text-[8px] md:text-[9px] font-bold uppercase italic text-slate-400 m-0 leading-tight line-clamp-2">
          {alert.description}
        </p>
        {alert.actionLabel && (
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
            className={cn(
              "mt-2 text-[7px] md:text-[8px] font-black uppercase tracking-wider underline decoration-2 underline-offset-2",
              config.text, "hover:opacity-80 transition-opacity"
            )}
          >
            {alert.actionLabel} →
          </button>
        )}
      </div>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function EnvironmentalAlerts({ 
  criticalIncidents, 
  hazardousWaste, 
  energyOverTarget, 
  recyclingBelowTarget,
  className,
  onAlertClick
}: EnvironmentalAlertsProps) {
  
  const alerts: EnvironmentalAlert[] = useMemo(() => [
    { 
      id: 'critical-incidents',
      show: criticalIncidents > 0, 
      icon: ShieldAlert, 
      title: 'INCIDENT CRITIQUE', 
      description: `${criticalIncidents} événement${criticalIncidents > 1 ? 's' : ''} à traiter immédiatement`, 
      color: 'rose' as AlertColor, 
      priority: 'CRITICAL' as AlertPriority,
      actionUrl: '/dashboard/environment/incidents?status=critical',
      actionLabel: 'Voir les incidents',
    },
    { 
      id: 'hazardous-waste',
      show: hazardousWaste > 100, 
      icon: Flame, 
      title: 'DÉCHETS DANGEREUX', 
      description: `${new Intl.NumberFormat('fr-SN').format(hazardousWaste)} kg de matières à filière spécifique`, 
      color: 'amber' as AlertColor, 
      priority: 'HIGH' as AlertPriority,
      actionUrl: '/dashboard/environment/wastes',
      actionLabel: 'Gérer les déchets',
    },
    { 
      id: 'energy-over',
      show: energyOverTarget, 
      icon: Zap, 
      title: 'DÉRIVE ÉLECTRIQUE', 
      description: 'Seuil de consommation > 90% de l\'objectif ISO 14001', 
      color: 'amber' as AlertColor, 
      priority: 'MEDIUM' as AlertPriority,
      actionUrl: '/dashboard/environment/consumptions',
      actionLabel: 'Optimiser',
    },
    { 
      id: 'recycling-low',
      show: recyclingBelowTarget, 
      icon: Recycle, 
      title: 'DÉFAUT RECYCLAGE', 
      description: 'Taux inférieur au standard ISO 14001 (75%)', 
      color: 'blue' as AlertColor, 
      priority: 'LOW' as AlertPriority,
      actionUrl: '/dashboard/environment/wastes',
      actionLabel: 'Améliorer',
    },
  ].filter(a => a.show).sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]), 
  [criticalIncidents, hazardousWaste, energyOverTarget, recyclingBelowTarget]);

  if (alerts.length === 0) return null;

  return (
    <section 
      className={cn("grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 animate-in slide-in-from-top-4 duration-500", className)}
      role="region"
      aria-label="Alertes environnementales"
    >
      {alerts.map((alert) => (
        <AlertCard 
          key={alert.id} 
          alert={alert} 
          onClick={() => onAlertClick?.(alert)} 
        />
      ))}
    </section>
  );
}