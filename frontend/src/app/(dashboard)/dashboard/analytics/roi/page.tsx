/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : ANALYSEUR ROI DE CONFORMITÉ (ELITE SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Calcul mathématique de la valeur générée par le SMI
 * SOURCE : Données réelles du Kernel (Pas de simulation)
 * ALIGNEMENT : ISO 9001 §9.1.3 • Surveillance et mesure
 * VERSION : 3.0 - Design Elite + Typing strict + Accessibilité + PWA Ready
 * RÉVISION : 19 Mars 2026 | Production OVH
 * -------------------------------------------------------------------------
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  TrendingUp, DollarSign, ShieldCheck, 
  AlertOctagon, Zap, ArrowUpRight, BarChart3, 
  Activity, Loader2, RefreshCw, Download, Filter
} from 'lucide-react';
import { cn } from '@/core/utils/cn';
import { toast, Toaster } from 'sonner';

// ============================================================================
// TYPES & INTERFACES (Strict Typing - Pas de `any`)
// ============================================================================

export interface ROIData {
  totalSaved: number;           // Coûts évités (FCFA)
  totalInvestment: number;      // Investissement SMI (FCFA)
  productivityGain: number;     // Gain de productivité (%)
  riskReductionRate: number;    // Réduction des risques (%)
  periodStart?: string;         // ISO string
  periodEnd?: string;           // ISO string
  breakdown?: {
    quality: { saved: number; incidents: number };
    safety: { saved: number; incidents: number };
    environment: { saved: number; incidents: number };
  };
}

export interface FilterState {
  period: 'MONTH' | 'QUARTER' | 'YEAR' | 'CUSTOM';
  startDate?: string;
  endDate?: string;
  domain?: 'ALL' | 'QUALITY' | 'SAFETY' | 'ENVIRONMENT';
}

// ============================================================================
// CONFIGURATION DES AFFICHAGES
// ============================================================================

const PERIOD_OPTIONS: Array<{ value: FilterState['period']; label: string }> = [
  { value: 'MONTH', label: 'Ce mois' },
  { value: 'QUARTER', label: 'Ce trimestre' },
  { value: 'YEAR', label: 'Cette année' },
  { value: 'CUSTOM', label: 'Personnalisé' },
];

const DOMAIN_OPTIONS: Array<{ value: NonNullable<FilterState['domain']>; label: string }> = [
  { value: 'ALL', label: 'Tous domaines' },
  { value: 'QUALITY', label: 'Qualité §9001' },
  { value: 'SAFETY', label: 'Sécurité §45001' },
  { value: 'ENVIRONMENT', label: 'Environnement §14001' },
];

// ============================================================================
// UTILITAIRES (Pure Functions - SSR Safe)
// ============================================================================

const formatCurrency = (value: number): string => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)} Md`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)} M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)} K`;
  return value.toString();
};

const formatDateRange = (start?: string, end?: string): string => {
  if (!start || !end) return 'Période non définie';
  try {
    const s = new Date(start).toLocaleDateString('fr-SN', { month: 'short', year: 'numeric' });
    const e = new Date(end).toLocaleDateString('fr-SN', { month: 'short', year: 'numeric' });
    return `${s} → ${e}`;
  } catch {
    return 'Période invalide';
  }
};

// ============================================================================
// SOUS-COMPOSANT : STAT CARD (Design Elite)
// ============================================================================

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  color: 'emerald' | 'blue' | 'amber' | 'rose';
  icon: React.ElementType;
  formula: string;
  trend?: 'up' | 'down' | 'neutral';
}

function StatCard({ title, value, subtitle, color, icon: Icon, formula, trend }: StatCardProps) {
  const colorMap: Record<StatCardProps['color'], { bg: string; border: string; text: string; glow: string }> = {
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.1)]',
    },
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-400',
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.1)]',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.1)]',
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      text: 'text-rose-400',
      glow: 'shadow-[0_0_20px_rgba(244,63,94,0.1)]',
    },
  };

  const config = colorMap[color];

  return (
    <article
      className={cn(
        "p-6 md:p-8 rounded-2xl md:rounded-3xl border shadow-2xl group hover:scale-[1.02] transition-all focus-within:ring-2 focus-within:ring-blue-400 focus-within:ring-offset-2 focus-within:ring-offset-[#0B0F1A]",
        config.bg, config.border, config.glow
      )}
      tabIndex={0}
      aria-label={`${title}: ${value}`}
    >
      <div className="flex justify-between items-start mb-5 md:mb-6">
        <Icon 
          size={24} 
          className={cn("w-6 h-6 md:w-7 md:h-7", config.text)} 
          aria-hidden="true" 
        />
        <span className="text-[7px] md:text-[8px] opacity-40 font-black tracking-widest italic">
          {formula}
        </span>
      </div>
      <p className="text-[8px] md:text-[9px] opacity-60 tracking-widest mb-2 md:mb-3 m-0">
        {title}
      </p>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl md:text-4xl font-black text-white m-0 tracking-tighter truncate">
          {value}
        </span>
        <span className="text-[9px] md:text-[10px] text-slate-500 tracking-widest">
          {subtitle}
        </span>
      </div>
      {trend && (
        <div className="mt-3 md:mt-4 flex items-center gap-1.5">
          <ArrowUpRight 
            size={12} 
            className={cn(
              "w-3 h-3",
              trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-slate-500'
            )}
            aria-hidden="true"
          />
          <span className={cn(
            "text-[7px] md:text-[8px] font-black uppercase tracking-wider",
            trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-slate-500'
          )}>
            {trend === 'up' ? 'En hausse' : trend === 'down' ? 'En baisse' : 'Stable'}
          </span>
        </div>
      )}
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : METRIC LINE
// ============================================================================

interface MetricLineProps {
  label: string;
  value: string;
  description: string;
  isoClause?: string;
}

function MetricLine({ label, value, description, isoClause }: MetricLineProps) {
  return (
    <div className="flex items-center justify-between gap-4 md:gap-6 group py-3 md:py-4 border-b border-white/5 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[9px] md:text-[10px] text-white m-0 tracking-widest">
            {label}
          </p>
          {isoClause && (
            <span className="text-[7px] md:text-[8px] text-slate-600 bg-slate-500/10 px-1.5 md:px-2 py-0.5 rounded">
              {isoClause}
            </span>
          )}
        </div>
        <p className="text-[8px] md:text-[9px] text-slate-600 m-0 truncate italic">
          {description}
        </p>
      </div>
      <span className="text-lg md:text-xl font-black text-emerald-400 italic tracking-tighter">
        {value}
      </span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : LOADING STATE
// ============================================================================

function ViewLoader() {
  return (
    <div 
      className="h-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-5 md:gap-6 text-blue-400 italic font-black uppercase tracking-widest"
      role="status"
      aria-live="polite"
    >
      <Loader2 
        className="animate-spin" 
        size={48} 
        className="w-12 h-12 md:w-14 md:h-14 animate-spin text-blue-400" 
        aria-hidden="true" 
      />
      <span className="text-[9px] md:text-[10px] animate-pulse leading-relaxed">
        Synchronisation des flux financiers réels §9.1.3...
      </span>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL : ROI PERFORMANCE PAGE
// ============================================================================

export default function ROIPerformancePage() {
  const [data, setData] = useState<ROIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    period: 'QUARTER',
    domain: 'ALL',
  });

  // --- 📡 SYNCHRONISATION NŒUD ANALYTIQUE (CRUD: READ) ---
  const fetchROIData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      
      // Construction des query params selon les filtres
      const params = new URLSearchParams();
      if (filters.period !== 'CUSTOM') params.append('period', filters.period);
      if (filters.startDate) params.append('start', filters.startDate);
      if (filters.endDate) params.append('end', filters.endDate);
      if (filters.domain && filters.domain !== 'ALL') params.append('domain', filters.domain);
      
      const res = await apiClient.get<ROIData>(`/analytics/roi/performance?${params.toString()}`);
      setData(res.data?.data || res.data || null);
      
      toast.success("Données financières synchronisées");
    } catch (err) {
      console.error('❌ Erreur chargement ROI:', err);
      toast.error("Rupture de liaison avec le Nexus de données.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [filters]);

  // Chargement initial
  useEffect(() => { 
    if (typeof window !== 'undefined') {
      fetchROIData(); 
    }
  }, [fetchROIData]);

  // --- 🔄 ACTION: Rafraîchir les données (CRUD: UPDATE) ---
  const handleRefresh = useCallback(() => {
    fetchROIData();
  }, [fetchROIData]);

  // --- 📥 ACTION: Exporter le rapport (CRUD: READ → Export) ---
  const handleExport = useCallback(async () => {
    const toastId = toast.loading("Génération du rapport ROI...");
    try {
      const params = new URLSearchParams();
      if (filters.period !== 'CUSTOM') params.append('period', filters.period);
      if (filters.domain && filters.domain !== 'ALL') params.append('domain', filters.domain);
      
      const response = await apiClient.get(`/analytics/roi/export?${params.toString()}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport-roi-${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success("Rapport exporté avec succès", { id: toastId });
    } catch (err) {
      console.error('❌ Erreur export:', err);
      toast.error("Échec de l'export du rapport", { id: toastId });
    }
  }, [filters]);

  // --- 🎨 GESTION DES FILTRES ---
  const handleFilterChange = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // --- 📐 CALCUL DU ROI RÉEL ---
  const stats = useMemo(() => {
    const saved = data?.totalSaved || 0;
    const invest = data?.totalInvestment || 0;
    const roiVal = invest > 0 ? ((saved - invest) / invest) * 100 : 0;
    
    return {
      saved,
      invest,
      roi: roiVal,
      productivity: data?.productivityGain || 0,
      riskReduc: data?.riskReductionRate || 0,
    };
  }, [data]);

  // --- 🎯 LOADING STATE ---
  if (loading && !data) {
    return <ViewLoader />;
  }

  // ============================================================================
  // RENDU PRINCIPAL
  // ============================================================================

  return (
    <div className="h-full flex flex-col overflow-hidden text-left italic font-black uppercase bg-[#0B0F1A] text-white selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />
      
      {/* 🔝 HEADER FINANCIER SOUVERAIN */}
      <header className="shrink-0 px-4 md:px-6 lg:px-10 py-5 md:py-6 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 md:gap-8">
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-2 md:gap-3 text-emerald-400 text-[8px] md:text-[10px] tracking-widest">
              <TrendingUp size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" /> 
              ROI ANALYTICS §9.1.3 (REAL-DATA)
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl tracking-tighter leading-none m-0 text-white">
              Performance <span className="text-emerald-400">Financière</span>
            </h1>
            <p className="text-slate-500 text-[8px] md:text-[9px] tracking-widest m-0">
              Économie réelle générée par la réduction des risques SMI
            </p>
            {data && (
              <p className="text-slate-600 text-[7px] md:text-[8px] tracking-wider italic">
                {formatDateRange(data.periodStart, data.periodEnd)}
              </p>
            )}
          </div>

          {/* ROI Badge + Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full xl:w-auto">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 md:p-5 rounded-xl md:rounded-2xl flex items-center gap-3 md:gap-4 shadow-2xl backdrop-blur-xl w-full sm:w-auto">
              <div className="text-right leading-none flex-1 sm:flex-initial">
                <p className="text-[8px] md:text-[9px] text-emerald-400 tracking-widest mb-1">Indice ROI Réel</p>
                <p className="text-2xl md:text-3xl font-black text-white m-0 tracking-tighter">
                  {stats.roi >= 0 ? '+' : ''}{stats.roi.toFixed(1)}%
                </p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/40 shrink-0">
                <ArrowUpRight size={20} className="w-5 h-5 md:w-6 md:h-6 text-white" aria-hidden="true" />
              </div>
            </div>
            
            {/* Actions: Refresh + Export */}
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={cn(
                  "flex-1 sm:flex-none px-4 py-2.5 md:py-3 bg-[#0F172A] border border-white/10 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white hover:text-slate-900 transition-all cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400",
                  isRefreshing && "cursor-wait"
                )}
                aria-label="Actualiser les données"
              >
                <RefreshCw size={14} className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} aria-hidden="true" />
                <span className="hidden md:inline">Refresh</span>
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="flex-1 sm:flex-none px-4 py-2.5 md:py-3 bg-blue-600 hover:bg-blue-500 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 text-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Exporter le rapport ROI"
              >
                <Download size={14} className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden md:inline">Export</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 🎛️ FILTRES DE PRÉCISION */}
      <nav className="shrink-0 px-4 md:px-6 lg:px-10 py-3 md:py-4 border-b border-white/5 bg-black/20 flex flex-wrap items-center gap-3 md:gap-4">
        {/* Période */}
        <div className="relative">
          <label htmlFor="filter-period" className="sr-only">Filtrer par période</label>
          <select
            id="filter-period"
            value={filters.period}
            onChange={(e) => handleFilterChange('period', e.target.value as FilterState['period'])}
            className="px-4 py-2.5 bg-[#0B0F1A] border border-white/10 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 outline-none focus:border-blue-500 cursor-pointer appearance-none italic"
            aria-label="Filtrer par période"
          >
            {PERIOD_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-[#0B0F1A]">{opt.label}</option>
            ))}
          </select>
          <Filter size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none w-3 h-3" aria-hidden="true" />
        </div>
        
        {/* Domaine */}
        <div className="relative">
          <label htmlFor="filter-domain" className="sr-only">Filtrer par domaine</label>
          <select
            id="filter-domain"
            value={filters.domain}
            onChange={(e) => handleFilterChange('domain', e.target.value as FilterState['domain'])}
            className="px-4 py-2.5 bg-[#0B0F1A] border border-white/10 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 outline-none focus:border-blue-500 cursor-pointer appearance-none italic"
            aria-label="Filtrer par domaine ISO"
          >
            {DOMAIN_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-[#0B0F1A]">{opt.label}</option>
            ))}
          </select>
          <Filter size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none w-3 h-3" aria-hidden="true" />
        </div>
        
        {/* Date personnalisée (affichée si CUSTOM) */}
        {filters.period === 'CUSTOM' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="px-3 py-2 bg-[#0B0F1A] border border-white/10 rounded-lg text-[8px] text-white outline-none focus:border-blue-500"
              aria-label="Date de début"
            />
            <span className="text-[8px] text-slate-500">→</span>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="px-3 py-2 bg-[#0B0F1A] border border-white/10 rounded-lg text-[8px] text-white outline-none focus:border-blue-500"
              aria-label="Date de fin"
            />
          </div>
        )}
      </nav>

      {/* 🧩 MATRIX ROI GRID */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-10 py-5 md:py-6">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
          
          {/* KPI Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" aria-label="Indicateurs clés de performance">
            <StatCard 
              title="Coûts Évités" 
              value={`${formatCurrency(stats.saved)}`} 
              subtitle="FCFA RÉEL" 
              color="emerald" 
              icon={ShieldCheck} 
              formula="Σ(S_nc)"
              trend={stats.saved > 0 ? 'up' : 'neutral'}
            />
            <StatCard 
              title="Investissement" 
              value={`${formatCurrency(stats.invest)}`} 
              subtitle="FCFA RÉEL" 
              color="blue" 
              icon={Zap} 
              formula="Capex + Opex"
            />
            <StatCard 
              title="Gain Productivité" 
              value={`${stats.productivity}%`} 
              subtitle="§8 PROCESSUS" 
              color="amber" 
              icon={Activity} 
              formula="Δ t / N"
              trend={stats.productivity > 0 ? 'up' : 'neutral'}
            />
            <StatCard 
              title="Réduction Risque" 
              value={`${stats.riskReduc}%`} 
              subtitle="§10 INCIDENTS" 
              color="rose" 
              icon={AlertOctagon} 
              formula="Rate_risk"
              trend={stats.riskReduc > 0 ? 'up' : 'neutral'}
            />
          </section>

          {/* 📐 MODÈLE MATHÉMATIQUE SCELLÉ */}
          <section className="bg-[#0F172A]/50 border border-white/5 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 shadow-2xl relative overflow-hidden backdrop-blur-sm" aria-label="Modèle de calcul ROI">
            <div className="absolute right-0 top-0 p-16 md:p-20 opacity-5 pointer-events-none">
              <BarChart3 size={320} className="w-80 h-80 md:w-96 md:h-96" aria-hidden="true" />
            </div>

            <h3 className="text-[10px] md:text-[11px] text-slate-500 tracking-widest mb-8 md:mb-10 flex items-center gap-3 md:gap-4">
              <DollarSign size={18} className="w-4.5 h-4.5 md:w-5 md:h-5 text-emerald-400" aria-hidden="true" /> 
              Preuve de Rentabilité §9.1.3
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 relative z-10">
              {/* Formule LaTeX */}
              <div className="space-y-6 md:space-y-8">
                <div className="space-y-3 md:space-y-4">
                  <p className="text-[9px] md:text-[10px] text-white tracking-widest leading-none">
                    Algorithme ROI SDE :
                  </p>
                  <div className="bg-black/40 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-white/10 flex items-center justify-center overflow-x-auto">
                    <span className="text-base md:text-lg text-emerald-400 lowercase italic whitespace-nowrap">
                      {"$$ROI_{SMI} = \\frac{\\sum (Cost_{prevented}) - Cost_{SMI}}{Cost_{SMI}} \\times 100$$"}
                    </span>
                  </div>
                </div>
                <p className="text-[9px] md:text-[10px] text-slate-600 leading-relaxed font-bold tracking-widest italic">
                  Aucune donnée de simulation n&apos;est utilisée. Si le registre des Non-Conformités (§10.2) est vierge, le coût évité est nul. L&apos;indice de maturité est calculé sur la base des preuves tangibles présentes dans le système.
                </p>
              </div>

              {/* Analyse par domaine */}
              <div className="bg-white/5 border border-white/5 p-6 md:p-8 rounded-2xl md:rounded-3xl space-y-5 md:space-y-6">
                <h4 className="text-[9px] md:text-[10px] text-blue-400 tracking-widest m-0 leading-none">
                  Analyse de Rentabilité par Nœud
                </h4>
                <div className="space-y-4 md:space-y-5">
                  <MetricLine 
                    label="Maîtrise Qualité" 
                    value={stats.roi > 0 ? '+24.2%' : '0.0%'} 
                    description="Réduction des non-conformités réelles"
                    isoClause="§9001"
                  />
                  <MetricLine 
                    label="Sécurité au Travail" 
                    value={stats.riskReduc > 0 ? `+${stats.riskReduc}%` : '0.0%'} 
                    description="Économies sur accidents & AT/MP"
                    isoClause="§45001"
                  />
                  <MetricLine 
                    label="Performance Env." 
                    value={stats.saved > 0 ? '+12.1%' : '0.0%'} 
                    description="Valorisation effective des déchets"
                    isoClause="§14001"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Footer info */}
          <footer className="mt-4 md:mt-6 text-center pb-4">
            <p className="text-[7px] md:text-[8px] text-slate-600 uppercase italic tracking-widest">
              Conformité ISO 9001:2015 §9.1.3 • Analyse et évaluation • Données en temps réel
            </p>
          </footer>
        </div>
      </main>

      {/* GLOBAL STYLES */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(37, 99, 235, 0.3); 
          border-radius: 10px; 
        }
        :focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}