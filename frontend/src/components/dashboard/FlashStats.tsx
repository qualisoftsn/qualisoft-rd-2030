/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : FlashStats (Real-Time KPI Display)
 * RÔLE : Affichage des indicateurs critiques (KPI) en temps réel
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useEffect, useState, useCallback } from 'react';
import { ShieldAlert, CheckCircle2, Zap, Target, Loader2, AlertCircle, RefreshCcw } from 'lucide-react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Strict typing)
// ============================================================================

export interface StatsData {
  ncOpen: number;
  ncClosed: number;
  actionsPending: number;
  complianceRate: number;
  lastUpdated?: string;
}

export interface FlashStatsProps {
  onStatClick?: (stat: string, value: number) => void;
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface StatCardProps {
  label: string;
  value: number | string | null | undefined;
  icon: React.ElementType;
  color: string;
  background: string;
  onClick?: () => void;
  loading?: boolean;
}

export interface LoadingStateProps {
  label: string;
}

export interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const DEFAULT_REFRESH_INTERVAL = 30000; // 30 seconds

// ============================================================================
// SOUS-COMPOSANT : LOADING STATE
// ============================================================================

function LoadingState({ label }: LoadingStateProps) {
  return (
    <div 
      className="flex items-center justify-center py-8 md:py-10 lg:py-12"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <Loader2 size={24} className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-blue-400 animate-spin" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : ERROR STATE
// ============================================================================

function ErrorState({ message, onRetry, isRetrying = false }: ErrorStateProps) {
  return (
    <div 
      className="py-8 md:py-10 lg:py-12 text-center"
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle size={32} className="w-8 h-8 md:w-10 md:h-10 text-red-400 mx-auto mb-3 md:mb-4" aria-hidden="true" />
      <p className="text-[9px] md:text-[10px] font-black text-red-400 uppercase tracking-widest mb-3 md:mb-4">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
        className={cn(
          "px-4 md:px-6 py-2 md:py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all border border-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-400 inline-flex items-center gap-1.5 md:gap-2",
          isRetrying && "opacity-50 cursor-not-allowed"
        )}
        aria-label="Réessayer de charger les statistiques"
        aria-busy={isRetrying}
      >
        <RefreshCcw size={12} className={cn("w-3 h-3 md:w-3.5 md:h-3.5", isRetrying && "animate-spin")} aria-hidden="true" />
        {isRetrying ? 'Chargement...' : 'Réessayer'}
      </button>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : STAT CARD
// ============================================================================

function StatCard({ label, value, icon: Icon, color, background, onClick, loading = false }: StatCardProps) {
  const handleClick = () => {
    if (onClick && value !== null && value !== undefined) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick && value !== null && value !== undefined) {
      e.preventDefault();
      handleClick();
    }
  };

  const displayValue = value !== null && value !== undefined ? value : '—';

  return (
    <article 
      className={cn(
        "bg-[#0F172A]/40 border border-white/5 p-4 md:p-5 lg:p-6 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] flex items-center gap-3 md:gap-4 lg:gap-5 backdrop-blur-sm group hover:border-white/10 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400",
        loading && "opacity-50"
      )}
      role="article"
      aria-label={`${label}: ${displayValue}`}
      tabIndex={onClick ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className={cn("p-3 md:p-4 rounded-xl md:rounded-2xl", background, color)}>
        <Icon size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest m-0 truncate">
          {label}
        </p>
        <h4 className="text-xl md:text-2xl lg:text-3xl font-black text-white m-0 italic tracking-tighter truncate tabular-nums">
          {loading ? (
            <Loader2 size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 animate-spin inline" aria-hidden="true" />
          ) : (
            displayValue
          )}
        </h4>
      </div>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function FlashStats({ 
  onStatClick, 
  className,
  autoRefresh = true,
  refreshInterval = DEFAULT_REFRESH_INTERVAL
}: FlashStatsProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const res = await apiClient.get<StatsData>('/dashboard/stats/flash');
      setStats(res.data || null);
    } catch (err) {
      console.error("Échec Télémétrie Stats:", err);
      setError("Impossible de charger les statistiques");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchStats();
    }
  }, [fetchStats]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || loading || error) return;

    const interval = setInterval(() => {
      fetchStats(true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loading, error, fetchStats]);

  const handleRetry = useCallback(() => {
    fetchStats(false);
  }, [fetchStats]);

  const handleStatClick = useCallback((stat: string, value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    onStatClick?.(stat, numValue);
  }, [onStatClick]);

  if (loading) {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6", className)}>
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i}
            className="bg-[#0F172A]/40 border border-white/5 p-4 md:p-5 lg:p-6 rounded-xl md:rounded-2xl animate-pulse"
            aria-hidden="true"
          >
            <div className="flex items-center gap-3 md:gap-4 lg:gap-5">
              <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-xl md:rounded-2xl bg-slate-800" />
              <div className="flex-1 space-y-2">
                <div className="h-2 md:h-2.5 bg-slate-800 rounded w-20" />
                <div className="h-6 md:h-8 bg-slate-800 rounded w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <ErrorState message={error} onRetry={handleRetry} isRetrying={isRefreshing} />
      </div>
    );
  }

  const cards = [
    { 
      label: "NC Ouvertes", 
      value: stats?.ncOpen ?? 0, 
      icon: ShieldAlert, 
      color: "text-red-400", 
      bg: "bg-red-500/10",
      stat: 'ncOpen'
    },
    { 
      label: "NC Clôturées", 
      value: stats?.ncClosed ?? 0, 
      icon: CheckCircle2, 
      color: "text-emerald-400", 
      bg: "bg-emerald-500/10",
      stat: 'ncClosed'
    },
    { 
      label: "Actions en cours", 
      value: stats?.actionsPending ?? 0, 
      icon: Zap, 
      color: "text-blue-400", 
      bg: "bg-blue-500/10",
      stat: 'actionsPending'
    },
    { 
      label: "Conformité", 
      value: stats?.complianceRate !== undefined ? `${stats.complianceRate}%` : '—', 
      icon: Target, 
      color: "text-amber-400", 
      bg: "bg-amber-500/10",
      stat: 'complianceRate'
    },
  ];

  return (
    <div 
      className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6", className)}
      role="region"
      aria-label="Statistiques en temps réel"
    >
      {cards.map((card) => (
        <StatCard 
          key={card.stat}
          label={card.label}
          value={card.value}
          icon={card.icon}
          color={card.color}
          background={card.bg}
          onClick={() => handleStatClick(card.stat, card.value)}
          loading={isRefreshing}
        />
      ))}
    </div>
  );
}