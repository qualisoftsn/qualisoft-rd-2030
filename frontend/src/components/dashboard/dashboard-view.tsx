/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🚀 MODULE : DashboardView (QHSE Command Center)
 * RÔLE : Centre de commandement QHSE (Revue de Direction)
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { KeyboardEvent } from 'react';
import { useDashboard } from '@/core/hooks/use-dashboard';
import { StatCard } from './stat-card';
import { SSEChart } from './sse-chart';
import { ActionPlan, Action } from './actions-plan';
import { 
  AlertTriangle, ShieldAlert, CheckCircle2, Activity, 
  Loader2, RefreshCcw, Zap, TrendingUp, AlertCircle
} from 'lucide-react';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Strict typing)
// ============================================================================

export interface DashboardData {
  risquesCount: number;
  ncCount: number;
  sseCount: number;
  complianceScore: number;
  sseData: Array<{
    date: string;
    count: number;
    type?: string;
  }>;
  recentActions: Action[];
  alerts?: Array<{
    id: string;
    type: 'CRITICAL' | 'WARNING' | 'INFO';
    message: string;
    createdAt: string;
  }>;
}

export interface DashboardViewProps {
  onStatClick?: (stat: string, value: number | string) => void;
  onActionClick?: (action: Action) => void;
  className?: string;
}

export interface LoadingStateProps {
  label: string;
}

export interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export interface AlertCardProps {
  title: string;
  message: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  onAction?: () => void;
  actionLabel?: string;
}

// ============================================================================
// SOUS-COMPOSANT : LOADING STATE
// ============================================================================

function LoadingState({ label }: LoadingStateProps) {
  return (
    <div 
      className="flex h-[60vh] md:h-[70vh] w-full flex-col items-center justify-center gap-4 md:gap-6 italic"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="relative" aria-hidden="true">
        <Loader2 className="h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 animate-spin text-blue-500 stroke-[3px]" />
        <div className="absolute inset-0 h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 animate-ping rounded-full bg-blue-500/20 scale-150" />
      </div>
      <p className="text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest animate-pulse">
        {label}
      </p>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : ERROR STATE
// ============================================================================

function ErrorState({ message, onRetry, isRetrying = false }: ErrorStateProps) {
  return (
    <div 
      className="h-[60vh] md:h-[70vh] flex items-center justify-center p-4 md:p-6 lg:p-8"
      role="alert"
      aria-live="assertive"
    >
      <article className="bg-white p-6 md:p-8 lg:p-10 lg:p-12 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] border border-red-100 shadow-2xl text-center max-w-lg italic">
        <ShieldAlert size={40} className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-red-500 mx-auto mb-4 md:mb-6" aria-hidden="true" />
        <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase m-0 leading-none">
          Rupture du Flux SDE
        </h2>
        <p className="text-slate-500 my-4 md:my-6 text-[10px] md:text-xs font-bold uppercase tracking-tight leading-relaxed">
          Le périmètre multi-tenant est inaccessible. Vérifiez votre accréditation Matrix.
        </p>
        <button 
          onClick={onRetry}
          disabled={isRetrying}
          className={cn(
            "w-full py-3 md:py-4 lg:py-5 bg-slate-950 text-white rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 md:gap-3 border-none cursor-pointer hover:bg-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400",
            isRetrying && "opacity-50 cursor-not-allowed"
          )}
          aria-busy={isRetrying}
          aria-label="Restaurer la connexion"
        >
          <RefreshCcw size={14} className={cn("w-3.5 h-3.5 md:w-4 md:h-4", isRetrying && "animate-spin")} aria-hidden="true" /> 
          {isRetrying ? 'Restauration...' : 'Restaurer la Connexion'}
        </button>
      </article>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : ALERT CARD
// ============================================================================

function AlertCard({ title, message, type, onAction, actionLabel }: AlertCardProps) {
  const typeConfig = {
    CRITICAL: { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500' },
    WARNING: { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500' },
    INFO: { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500' }
  };

  const config = typeConfig[type];

  return (
    <article 
      className="bg-slate-950 rounded-2xl md:rounded-3xl lg:rounded-[3rem] p-6 md:p-8 lg:p-10 text-white shadow-2xl relative overflow-hidden group border-none"
      role="alert"
      aria-live="polite"
    >
      <div className="absolute -bottom-10 md:-bottom-14 lg:-bottom-20 -right-10 md:-right-14 lg:-right-20 h-48 w-48 md:h-56 md:w-56 lg:h-64 lg:w-64 bg-blue-600/20 rounded-full blur-[80px] md:blur-[100px]" aria-hidden="true" />
      
      <div className="relative z-10 space-y-4 md:space-y-6 lg:space-y-8">
        <div className="flex items-center gap-2 md:gap-3">
          <span className={cn("h-2 w-2 md:h-2.5 md:w-2.5 lg:h-3 lg:w-3 rounded-full animate-ping", config.bg)} aria-hidden="true" />
          <h3 className="text-base md:text-lg font-black uppercase italic m-0">{title}</h3>
        </div>
        
        <div className={cn(
          "p-4 md:p-5 lg:p-6 bg-white/5 rounded-xl md:rounded-2xl lg:rounded-3xl border border-white/10 border-l-4",
          config.border
        )}>
          <p className={cn("text-[8px] md:text-[9px] font-black uppercase tracking-widest mb-1 md:mb-2 italic", config.text)}>
            Alerte {type}
          </p>
          <p className="text-[10px] md:text-sm font-black italic tracking-tighter leading-tight m-0 uppercase">
            {message}
          </p>
        </div>
        
        {onAction && actionLabel && (
          <button 
            onClick={onAction}
            className={cn(
              "w-full py-3 md:py-4 lg:py-5 bg-blue-600 hover:bg-white hover:text-blue-700 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all border-none cursor-pointer italic focus:outline-none focus:ring-2 focus:ring-blue-400",
              type === 'CRITICAL' && "animate-pulse"
            )}
            aria-label={actionLabel}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export function DashboardView({ onStatClick, onActionClick, className }: DashboardViewProps) {
  const { data, isLoading, isError, refetch, isFetching } = useDashboard();
  
  const mData = data as DashboardData | undefined;

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'r' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleRefresh();
    }
  };

  const handleStatClick = useCallback((stat: string, value: number | string) => {
    onStatClick?.(stat, value);
  }, [onStatClick]);

  const handleActionClick = useCallback((action: Action) => {
    onActionClick?.(action);
  }, [onActionClick]);

  if (isLoading) {
    return <LoadingState label="Initialisation du Noyau Matrix..." />;
  }

  if (isError) {
    return (
      <ErrorState 
        message="Erreur de connexion au dashboard" 
        onRetry={handleRefresh}
        isRetrying={isFetching}
      />
    );
  }

  return (
    <div 
      className={cn("space-y-8 md:space-y-10 lg:space-y-12 animate-in fade-in duration-700 pb-16 md:pb-20", className)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="main"
      aria-label="Tableau de bord QHSE"
    >
      
      {/* 🛡️ HEADER */}
      <header 
        className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 md:gap-6 lg:gap-8"
        role="banner"
      >
        <div className="space-y-2 md:space-y-3 lg:space-y-4 text-left">
          <div 
            className="flex items-center gap-2 md:gap-3 text-blue-500 font-black text-[8px] md:text-[9px] uppercase tracking-widest bg-blue-50 w-fit px-3 md:px-4 lg:px-5 py-1.5 md:py-2 rounded-full border border-blue-100 italic"
            role="status"
            aria-live="polite"
          >
            <Zap size={10} className="w-2.5 h-2.5 md:w-3 md:h-3 animate-pulse" fill="currentColor" aria-hidden="true" />
            <span>Sovereign Monitoring Active</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-none m-0 italic">
            Intelligence <span className="text-blue-600">Dashboard</span>
          </h1>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <article 
            className="bg-white p-1.5 md:p-2 pl-4 md:pl-6 rounded-xl md:rounded-2xl border border-slate-200 flex items-center gap-4 md:gap-6 shadow-xl"
            role="status"
            aria-label="État de synchronisation"
          >
            <div className="text-right">
              <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest italic m-0">
                Refresh Core
              </p>
              <p className="text-[10px] md:text-xs font-black text-slate-900 tabular-nums italic m-0">
                {isFetching ? 'Sync...' : 'Stable'}
              </p>
            </div>
            <button 
              onClick={handleRefresh}
              disabled={isFetching}
              className={cn(
                "p-2 md:p-3 lg:p-4 bg-slate-950 text-white rounded-lg md:rounded-xl hover:bg-blue-600 transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400",
                isFetching && "opacity-50 cursor-not-allowed"
              )}
              aria-label="Actualiser les données"
              aria-busy={isFetching}
            >
              <RefreshCcw size={16} className={cn("w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5", isFetching && "animate-spin")} aria-hidden="true" />
            </button>
          </article>
        </div>
      </header>

      {/* 📊 KPI GRID */}
      <section 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
        role="region"
        aria-label="Indicateurs clés de performance"
      >
        <StatCard 
          title="Risques Actifs" 
          value={mData?.risquesCount ?? 0} 
          icon={Activity} 
          variant="info" 
          trend="ISO 31000"
          onClick={() => handleStatClick('risques', mData?.risquesCount ?? 0)}
        />
        <StatCard 
          title="Non-Conformités" 
          value={mData?.ncCount ?? 0} 
          icon={AlertTriangle} 
          variant="warning" 
          trend="§10.2"
          onClick={() => handleStatClick('nc', mData?.ncCount ?? 0)}
        />
        <StatCard 
          title="Accidents SSE" 
          value={mData?.sseCount ?? 0} 
          icon={ShieldAlert} 
          variant="danger" 
          trend="LTI : 0"
          onClick={() => handleStatClick('sse', mData?.sseCount ?? 0)}
        />
        <StatCard 
          title="Conformité Globale" 
          value={`${mData?.complianceScore ?? 0}%`} 
          icon={CheckCircle2} 
          variant="success" 
          trend="Stable"
          onClick={() => handleStatClick('compliance', mData?.complianceScore ?? 0)}
        />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8 lg:gap-10 text-left">
        <div className="xl:col-span-2 space-y-6 md:space-y-8 lg:space-y-10">
          {/* GRAPHIQUE ACCIDENTOLOGIE */}
          <article 
            className="bg-white p-4 md:p-6 lg:p-8 xl:p-10 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] border border-slate-200 shadow-2xl"
            aria-labelledby="sse-chart-title"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-6 md:mb-8 lg:mb-10">
              <div className="space-y-0.5 md:space-y-1">
                <h3 id="sse-chart-title" className="text-lg md:text-xl lg:text-2xl font-black text-slate-900 uppercase italic m-0 tracking-tighter leading-none">
                  Analyse Accidentologie
                </h3>
                <p className="text-[8px] md:text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest m-0">
                  Flux des événements §10.2 ISO 45001
                </p>
              </div>
              <TrendingUp size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-blue-500" aria-hidden="true" />
            </div>
            <SSEChart data={mData?.sseData || []} />
          </article>

          {/* PLAN D'ACTIONS */}
          <section aria-labelledby="actions-title">
            <h3 id="actions-title" className="text-base md:text-lg lg:text-xl font-black text-slate-900 uppercase italic ml-2 md:ml-3 lg:ml-4 tracking-widest mb-4 md:mb-6">
              Dernières Actions PAQ
            </h3>
            <ActionPlan 
              actions={mData?.recentActions || []}
              onActionClick={handleActionClick}
            />
          </section>
        </div>

        {/* SIDEBAR D'ALERTES */}
        <aside className="space-y-4 md:space-y-6 lg:space-y-8" aria-label="Alertes et notifications">
          <AlertCard 
            title="Urgence QSE"
            message="Suspension de production : Zone Nord"
            type="CRITICAL"
            onAction={() => {
              // Déclencher protocole d'urgence
              console.log('Protocole d\'urgence déclenché');
            }}
            actionLabel="Déclencher Protocole"
          />
          
          {/* Additional alerts can be added here */}
          {mData?.alerts && mData.alerts.length > 0 && (
            <div className="space-y-3 md:space-y-4">
              {mData.alerts.slice(0, 2).map((alert) => (
                <AlertCard 
                  key={alert.id}
                  title={alert.type}
                  message={alert.message}
                  type={alert.type}
                />
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default DashboardView;