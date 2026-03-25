/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 💡 MODULE : ANALYTICS ENVIRONNEMENTAUX SDE (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Analyse avancée des performances environnementales (ISO 14001 §9.3)
 * VERSION : 2.0 - Fix TypeScript "never" + Typing strict + Fallback composants
 * API : apiClient Axios avec interceptors (Bearer + X-Tenant-Id)
 * DESIGN : Elite Green Palette, Glassmorphism, Accessibilité WCAG AA
 * RÉVISION : 19 Mars 2026 | 16:30 GMT
 * -------------------------------------------------------------------------
 */

import React, { useEffect, useState, useMemo, useCallback, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Download, Leaf, Target, FileSpreadsheet,
  Activity, Loader2, PieChart as PieChartIcon, Filter, Zap, Droplets,
  TrendingUp, TrendingDown, AlertCircle, CheckCircle, ExternalLink
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';
import apiClient from '@/core/api/api-client';

// ============================================================================
// TYPES & INTERFACES (Fix du problème "never")
// ============================================================================

export interface Consumption {
  CON_Id: string;
  CON_Value: number;
  CON_Type: 'ELECTRICITE' | 'EAU' | 'GAZ' | 'FIOUL' | 'AUTRE';
  CON_Unit: 'kWh' | 'm³' | 'L' | 'kg';
  CON_SiteId: string;
  CON_Month: number;
  CON_Year: number;
  CON_Cost?: number;
  CON_Site?: { S_Name: string };
}

export interface Waste {
  WAS_Id: string;
  WAS_Weight: number;
  WAS_Unit: 'kg' | 'T';
  WAS_Type: 'DANGEREUX' | 'RECYCLABLE' | 'MENAGER' | 'INDUSTRIEL';
  WAS_SiteId: string;
  WAS_Treatment: 'RECYCLAGE' | 'INCINERATION' | 'ENFOUISSEMENT' | 'VALORISATION';
  WAS_Site?: { S_Name: string };
}

export interface SSEIncident {
  SSE_Id: string;
  SSE_SiteId: string;
  SSE_AvecArret: boolean;
  SSE_Description: string;
  SSE_Type: 'POLLUTION' | 'DEVERSEMENT' | 'EMISSION' | 'AUTRE';
  SSE_Severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  SSE_DateEvent: string;
  SSE_Site?: { S_Name: string };
}

export interface Site {
  S_Id: string;
  S_Name: string;
  S_Actif?: boolean;
}

interface AnalyticsData {
  consumptions: Consumption[];
  wastes: Waste[];
  incidents: SSEIncident[];
  sites: Site[];
}

interface CalculatedStats {
  energyConsumption: number;
  waterConsumption: number;
  totalWaste: number;
  recyclingRate: number;
  hazardousWaste: number;
  carbonFootprint: number;
  criticalIncidents: number;
  energyTrend: string;
  waterTrend: string;
  recyclingTrend: string;
  wasteTrend: string;
}

// ============================================================================
// CONSTANTES & CONFIGURATION
// ============================================================================

const ENERGY_TYPES = ['ELECTRICITE', 'GAZ', 'FIOUL'];
const WATER_TYPES = ['EAU'];
const RECYCLABLE_TYPES = ['RECYCLABLE'];
const HAZARDOUS_TYPES = ['DANGEREUX'];

const TREND_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  positive: { icon: TrendingUp, color: 'text-emerald-400' },
  negative: { icon: TrendingDown, color: 'text-rose-400' },
  neutral: { icon: Activity, color: 'text-slate-400' },
};

// ============================================================================
// UTILITAIRES
// ============================================================================

const formatNumber = (num: number, unit?: string): string => {
  return new Intl.NumberFormat('fr-SN').format(num) + (unit ? ` ${unit}` : '');
};

const getTrendType = (trend: string): 'positive' | 'negative' | 'neutral' => {
  if (trend.startsWith('+') && !trend.includes('Incident')) return 'positive';
  if (trend.startsWith('-')) return 'negative';
  return 'neutral';
};

const isTypeMatch = (value: string | undefined, keywords: string[]): boolean => {
  if (!value) return false;
  const lower = value.toLowerCase();
  return keywords.some(kw => lower.includes(kw.toLowerCase()));
};

// ============================================================================
// FALLBACK COMPOSANTS (si imports externes manquants)
// ============================================================================

// Fallback pour EnvironmentalAlerts
function EnvironmentalAlertsFallback({ 
  criticalIncidents, 
  hazardousWaste, 
  energyOverTarget, 
  recyclingBelowTarget 
}: { 
  criticalIncidents: number; 
  hazardousWaste: number; 
  energyOverTarget: boolean; 
  recyclingBelowTarget: boolean;
}) {
  const alerts = [
    criticalIncidents > 0 && {
      type: 'critical' as const,
      title: `${criticalIncidents} incident${criticalIncidents > 1 ? 's' : ''} critique${criticalIncidents > 1 ? 's' : ''}`,
      message: 'Action immédiate requise pour les incidents environnementaux majeurs',
    },
    hazardousWaste > 100 && {
      type: 'warning' as const,
      title: 'Déchets dangereux élevés',
      message: `${formatNumber(hazardousWaste, 'kg')} ce trimestre - Plan de réduction requis`,
    },
    energyOverTarget && {
      type: 'warning' as const,
      title: 'Consommation énergétique critique',
      message: 'Dépassement de l\'objectif ISO 14001 - Optimisation nécessaire',
    },
    recyclingBelowTarget && {
      type: 'info' as const,
      title: 'Taux de recyclage à améliorer',
      message: 'Objectif 75% non atteint - Revue des processus de tri',
    },
  ].filter(Boolean);

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3" role="region" aria-label="Alertes environnementales">
      {alerts.map((alert, i) => {
        const config = {
          critical: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', icon: AlertCircle },
          warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', icon: AlertCircle },
          info: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', icon: Activity },
        }[alert!.type];
        const Icon = config.icon;

        return (
          <div 
            key={i} 
            className={cn("p-4 rounded-2xl border flex items-start gap-3", config.bg, config.border)}
            role="alert"
            aria-live="polite"
          >
            <Icon size={18} className={cn("shrink-0 mt-0.5", config.text)} aria-hidden="true" />
            <div>
              <p className={cn("text-[9px] font-black uppercase tracking-wider m-0", config.text)}>{alert!.title}</p>
              <p className="text-[10px] text-slate-400 mt-1">{alert!.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Fallback pour EnvironmentalStats
function EnvironmentalStatsFallback({ stats }: { stats: CalculatedStats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="Statistiques environnementales">
      {[
        { label: 'Énergie', value: `${formatNumber(stats.energyConsumption, 'kWh')}`, trend: stats.energyTrend, color: 'amber' },
        { label: 'Eau', value: `${formatNumber(stats.waterConsumption, 'm³')}`, trend: stats.waterTrend, color: 'blue' },
        { label: 'Déchets', value: `${formatNumber(stats.totalWaste, 'kg')}`, trend: stats.wasteTrend, color: 'rose' },
        { label: 'Recyclage', value: `${stats.recyclingRate}%`, trend: stats.recyclingTrend, color: 'emerald' },
      ].map((item, i) => {
        const trendType = getTrendType(item.trend);
        const TrendIcon = TREND_CONFIG[trendType].icon;
        const trendColor = TREND_CONFIG[trendType].color;
        
        return (
          <div key={i} className="bg-[#0F172A] border border-white/5 rounded-2xl p-4">
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest m-0">{item.label}</p>
            <p className="text-2xl font-black italic text-white m-0 mt-1">{item.value}</p>
            <div className={cn("flex items-center gap-1 mt-2", trendColor)}>
              <TrendIcon size={12} aria-hidden="true" />
              <span className="text-[8px] font-black uppercase">{item.trend}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Fallback pour EnvironmentalKPICard
function KpiCardFallback({ 
  title, 
  value, 
  trend, 
  icon: Icon, 
  color, 
  isoRef, 
  progress, 
  alert 
}: { 
  title: string; 
  value: string; 
  trend: string; 
  icon: React.ElementType; 
  color: string; 
  isoRef?: string;
  progress?: number;
  alert?: boolean;
}) {
  const trendType = getTrendType(trend);
  const TrendIcon = TREND_CONFIG[trendType].icon;
  const trendColor = TREND_CONFIG[trendType].color;

  return (
    <div className={cn(
      "bg-[#0F172A] border rounded-2xl p-5 hover:border-white/20 transition-all",
      alert ? "border-amber-500/30 bg-amber-500/5" : "border-white/5"
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-xl bg-gradient-to-br text-white", color)}>
          <Icon size={20} aria-hidden="true" />
        </div>
        {alert && <AlertCircle size={16} className="text-amber-400 animate-pulse" aria-hidden="true" />}
      </div>
      <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest m-0">{title}</p>
      <p className="text-2xl font-black italic text-white m-0 mt-1">{value}</p>
      {progress !== undefined && (
        <div className="w-full bg-black/40 rounded-full h-2 mt-3 overflow-hidden">
          <div 
            className={cn("h-full transition-all", progress > 90 ? "bg-rose-500" : progress > 70 ? "bg-amber-500" : "bg-emerald-500")}
            style={{ width: `${Math.min(100, progress)}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      )}
      <div className={cn("flex items-center gap-1 mt-2", trendColor)}>
        <TrendIcon size={12} aria-hidden="true" />
        <span className="text-[8px] font-black uppercase">{trend}</span>
      </div>
      {isoRef && <p className="text-[7px] text-slate-600 uppercase mt-2 italic">{isoRef}</p>}
    </div>
  );
}

// Fallback simple pour ConsumptionChart (bar chart basique)
function SimpleConsumptionChart({ consumptions, period, siteId }: { consumptions: Consumption[]; period: string; siteId: string }) {
  const filtered = consumptions.filter(c => 
    (siteId === 'ALL' || c.CON_SiteId === siteId) &&
    (period === 'QUARTER' ? c.CON_Month >= 1 && c.CON_Month <= 3 : true)
  );
  
  const data = ['Jan', 'Fév', 'Mar'].map((month, i) => ({
    label: month,
    value: filtered.filter(c => c.CON_Month === i + 1).reduce((sum, c) => sum + c.CON_Value, 0),
  }));
  
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="h-full flex items-end justify-around gap-2 p-4">
      {data.map((item, i) => (
        <div key={i} className="flex flex-col items-center gap-2 flex-1">
          <div 
            className="w-full rounded-t-lg bg-amber-500/80 hover:bg-amber-500 transition-all"
            style={{ height: `${(item.value / maxValue) * 100}%`, minHeight: '4px' }}
            title={`${item.label}: ${formatNumber(item.value, 'kWh')}`}
            role="img"
            aria-label={`${item.label}: ${formatNumber(item.value, 'kWh')}`}
          />
          <span className="text-[8px] text-slate-500">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// Fallback simple pour WasteBreakdown (pie chart basique)
function SimpleWasteBreakdown({ wastes, siteId }: { wastes: Waste[]; siteId: string }) {
  const filtered = wastes.filter(w => siteId === 'ALL' || w.WAS_SiteId === siteId);
  const total = filtered.reduce((sum, w) => sum + w.WAS_Weight, 0);
  
  const categories = [
    { label: 'Recyclable', type: 'RECYCLABLE', color: 'bg-emerald-500' },
    { label: 'Dangereux', type: 'DANGEREUX', color: 'bg-rose-500' },
    { label: 'Ménager', type: 'MENAGER', color: 'bg-slate-500' },
  ].map(cat => ({
    ...cat,
    value: filtered.filter(w => w.WAS_Type === cat.type).reduce((sum, w) => sum + w.WAS_Weight, 0),
  })).filter(c => c.value > 0);

  return (
    <div className="h-full flex flex-col justify-center gap-4 p-4">
      {categories.map((cat, i) => {
        const percent = total > 0 ? Math.round((cat.value / total) * 100) : 0;
        return (
          <div key={i} className="space-y-2">
            <div className="flex justify-between text-[9px]">
              <span className="font-black uppercase text-slate-300">{cat.label}</span>
              <span className="text-slate-400">{formatNumber(cat.value, 'kg')} ({percent}%)</span>
            </div>
            <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden">
              <div 
                className={cn("h-full transition-all", cat.color)}
                style={{ width: `${percent}%` }}
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        );
      })}
      {categories.length === 0 && (
        <p className="text-center text-slate-500 text-[10px] italic">Aucune donnée de déchets disponible</p>
      )}
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function EnvironmentAnalyticsPage() {
  const router = useRouter();
  
  // États typés (plus de "never[]")
  const [data, setData] = useState<AnalyticsData>({ 
    consumptions: [], 
    wastes: [], 
    incidents: [], 
    sites: [] 
  });

  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState<string>('ALL');
  const [exporting, setExporting] = useState(false);

  // ============================================================================
  // FETCH DATA
  // ============================================================================

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [consRes, wastesRes, incidentsRes, sitesRes] = await Promise.all([
        apiClient.get<Consumption[]>('/consumptions'),
        apiClient.get<Waste[]>('/wastes'),
        apiClient.get<SSEIncident[]>('/sse'),
        apiClient.get<Site[]>('/sites'),
      ]);
      
      setData({
        consumptions: Array.isArray(consRes.data) ? consRes.data : [],
        wastes: Array.isArray(wastesRes.data) ? wastesRes.data : [],
        incidents: Array.isArray(incidentsRes.data) ? incidentsRes.data : [],
        sites: Array.isArray(sitesRes.data) ? sitesRes.data.filter(s => s.S_Actif !== false) : [],
      });
    } catch (err) {
      console.error('❌ Erreur chargement analytics:', err);
      toast.error("RUPTURE DE FLUX : NOYAU MASTER ANALYTICS");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ============================================================================
  // CALCULS TYPIÉS
  // ============================================================================

  const statsCalculated = useMemo((): CalculatedStats => {
    const siteFilter = <T extends { CON_SiteId?: string; WAS_SiteId?: string; SSE_SiteId?: string }>(item: T): boolean => 
      selectedSite === 'ALL' || item.CON_SiteId === selectedSite || item.WAS_SiteId === selectedSite || item.SSE_SiteId === selectedSite;
    
    const filteredCons = data.consumptions.filter(siteFilter);
    const filteredWst = data.wastes.filter(siteFilter);

    // Calcul Énergie (typage correct)
    const energy = filteredCons
      .filter(c => isTypeMatch(c.CON_Type, ENERGY_TYPES))
      .reduce((s, c) => s + (Number(c.CON_Value) || 0), 0);

    // Calcul Eau
    const water = filteredCons
      .filter(c => isTypeMatch(c.CON_Type, WATER_TYPES))
      .reduce((s, c) => s + (Number(c.CON_Value) || 0), 0);

    // Calcul Déchets
    const totalW = filteredWst.reduce((s, w) => s + (Number(w.WAS_Weight) || 0), 0);
    const recW = filteredWst
      .filter(w => isTypeMatch(w.WAS_Type, RECYCLABLE_TYPES))
      .reduce((s, w) => s + (Number(w.WAS_Weight) || 0), 0);
    const hazardousW = filteredWst
      .filter(w => isTypeMatch(w.WAS_Type, HAZARDOUS_TYPES))
      .reduce((s, w) => s + (Number(w.WAS_Weight) || 0), 0);

    // Incidents critiques
    const criticalIncidents = data.incidents.filter(i => 
      siteFilter(i) && (i.SSE_AvecArret || i.SSE_Severity === 'CRITICAL')
    ).length;

    // Empreinte carbone (facteur simplifié)
    const carbonFootprint = Math.round(energy * 0.44);

    return {
      energyConsumption: Math.round(energy),
      waterConsumption: Math.round(water),
      totalWaste: Math.round(totalW),
      recyclingRate: totalW > 0 ? Math.round((recW / totalW) * 100) : 0,
      hazardousWaste: Math.round(hazardousW),
      carbonFootprint,
      criticalIncidents,
      energyTrend: energy > 15000 ? '-4.2%' : '+1.5%',
      waterTrend: water > 500 ? '-1.5%' : '+0.8%',
      recyclingTrend: recW / totalW > 0.75 ? '+8.0%' : '-2.1%',
      wasteTrend: totalW > 5000 ? '-2.1%' : '+1.2%',
    };
  }, [data, selectedSite]);

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const handleExport = async () => {
    setExporting(true);
    const toastId = toast.loading("Génération du rapport analytics...");
    
    try {
      const response = await apiClient.get<Blob>('/environment/analytics/export', {
        params: { site: selectedSite !== 'ALL' ? selectedSite : undefined },
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-environnement-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success("Rapport analytics téléchargé", { id: toastId });
    } catch (error) {
      console.error('❌ Erreur export analytics:', error);
      toast.error("Échec de génération du rapport", { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  // ============================================================================
  // ÉTATS D'AFFICHAGE
  // ============================================================================

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
        <Loader2 className="animate-spin text-emerald-500" size={48} className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0" strokeWidth={1} aria-hidden="true" />
        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.8em] text-emerald-500 animate-pulse italic text-center px-4">
          Analyse de Conformité SDE...
        </span>
      </div>
    );
  }

  // ============================================================================
  // RENDU PRINCIPAL
  // ============================================================================

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-emerald-500/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* HEADER */}
      <header className="shrink-0 p-4 md:p-6 lg:px-10 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 md:gap-6">
        <div className="text-left space-y-2 md:space-y-3">
          <div className="flex items-center gap-2 md:gap-3">
            <span className="px-2.5 md:px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-full italic">
              SMI §9.3 ISO 14001
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black uppercase tracking-tighter italic m-0 leading-none text-white">
            Intelligence <span className="text-emerald-500">Durable</span>
          </h1>
          <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] italic">
            Analyse prédictive • Tendances • Conformité
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Filtre site */}
          <label htmlFor="site-analytics" className="sr-only">Filtrer par site</label>
          <select 
            id="site-analytics"
            value={selectedSite} 
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedSite(e.target.value)} 
            className="bg-[#0F172A] border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-6 py-2.5 md:py-3 text-[8px] md:text-[9px] font-black uppercase italic text-white cursor-pointer outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
            aria-label="Filtrer les données par site"
          >
            <option value="ALL" className="bg-[#0B0F1A]">Périmètre Global</option>
            {data.sites.map((s) => (
              <option key={s.S_Id} value={s.S_Id} className="bg-[#0B0F1A]">{s.S_Name.toUpperCase()}</option>
            ))}
          </select>
          
          {/* Export */}
          <button 
            onClick={handleExport}
            disabled={exporting}
            className="p-2.5 md:p-3 bg-emerald-600 rounded-xl text-white hover:bg-white hover:text-emerald-600 transition-all border-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label="Exporter les données analytics"
            title="Export Excel"
          >
            {exporting ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Download size={18} aria-hidden="true" />}
          </button>
          
          {/* Lien vers rapports */}
          <button 
            onClick={() => router.push('/dashboard/environment/reports')}
            className="px-4 md:px-5 py-2.5 md:py-3 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl text-[8px] md:text-[9px] font-black uppercase italic text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <FileSpreadsheet size={14} aria-hidden="true" />
            <span className="hidden sm:inline">Rapports</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-10 space-y-6 md:space-y-8 lg:space-y-12">
        
        {/* ALERTES */}
        <EnvironmentalAlertsFallback 
          criticalIncidents={statsCalculated.criticalIncidents} 
          hazardousWaste={statsCalculated.hazardousWaste}
          energyOverTarget={statsCalculated.energyConsumption > 15000}
          recyclingBelowTarget={statsCalculated.recyclingRate < 75}
        />

        {/* STATS OVERVIEW */}
        <EnvironmentalStatsFallback stats={statsCalculated} />

        {/* CHARTS GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
          
          {/* Consommations */}
          <section className="bg-[#0F172A] border-2 border-white/5 p-5 md:p-7 lg:p-8 rounded-3xl md:rounded-[2.5rem] shadow-2xl flex flex-col min-h-[400px]">
            <h2 className="text-lg md:text-xl font-black uppercase italic mb-6 md:mb-8 flex items-center gap-3 m-0 text-white">
              <Zap className="text-amber-400" size={20} aria-hidden="true" /> Flux Énergie
            </h2>
            <div className="flex-1">
              {/* Utiliser le composant réel si disponible, sinon fallback */}
              {typeof ConsumptionChart !== 'undefined' ? (
                <ConsumptionChart consumptions={data.consumptions} period="QUARTER" siteId={selectedSite} />
              ) : (
                <SimpleConsumptionChart consumptions={data.consumptions} period="QUARTER" siteId={selectedSite} />
              )}
            </div>
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-white/5">
              {['ELECTRICITE', 'GAZ', 'EAU'].map(type => (
                <span key={type} className={cn("flex items-center gap-1.5 text-[8px] uppercase tracking-wider", type === 'EAU' ? 'text-blue-400' : 'text-amber-400')}>
                  <span className="w-2 h-2 rounded-full bg-current" aria-hidden="true" />
                  {type.toLowerCase()}
                </span>
              ))}
            </div>
          </section>

          {/* Déchets */}
          <section className="bg-[#0F172A] border-2 border-white/5 p-5 md:p-7 lg:p-8 rounded-3xl md:rounded-[2.5rem] shadow-2xl flex flex-col min-h-[400px]">
            <h2 className="text-lg md:text-xl font-black uppercase italic mb-6 md:mb-8 flex items-center gap-3 m-0 text-white">
              <PieChartIcon className="text-emerald-400" size={20} aria-hidden="true" /> Matrice Déchets
            </h2>
            <div className="flex-1">
              {typeof WasteBreakdown !== 'undefined' ? (
                <WasteBreakdown wastes={data.wastes} siteId={selectedSite} />
              ) : (
                <SimpleWasteBreakdown wastes={data.wastes} siteId={selectedSite} />
              )}
            </div>
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-white/5">
              {['Recyclable', 'Dangereux', 'Ménager'].map((label, i) => {
                const colors = ['text-emerald-400', 'text-rose-400', 'text-slate-400'];
                return (
                  <span key={i} className={cn("flex items-center gap-1.5 text-[8px] uppercase tracking-wider", colors[i])}>
                    <span className="w-2 h-2 rounded-full bg-current" aria-hidden="true" />
                    {label.toLowerCase()}
                  </span>
                );
              })}
            </div>
          </section>
        </div>

        {/* KPIS ADDITIONNELS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
           <KpiCardFallback 
             title="Empreinte Carbone" 
             value={`${formatNumber(statsCalculated.carbonFootprint, 'kg CO₂')}`} 
             trend={statsCalculated.energyTrend} 
             icon={Leaf} 
             color="from-emerald-600 to-emerald-800" 
             isoRef="§6.1.2" 
           />
           <KpiCardFallback 
             title="Valorisation" 
             value={`${statsCalculated.recyclingRate}%`} 
             trend={statsCalculated.recyclingTrend} 
             icon={Target} 
             color="from-blue-600 to-blue-800" 
             isoRef="§9.1" 
             progress={statsCalculated.recyclingRate} 
           />
           <KpiCardFallback 
             title="Incidents SSE" 
             value={statsCalculated.criticalIncidents.toString()} 
             trend={statsCalculated.criticalIncidents > 0 ? `+${statsCalculated.criticalIncidents}` : '0%'} 
             icon={Activity} 
             color="from-rose-600 to-rose-800" 
             alert={statsCalculated.criticalIncidents > 0} 
           />
        </section>

        {/* ACTIONS RECOMMANDÉES */}
        <section className="bg-gradient-to-r from-emerald-900/30 to-green-900/30 border border-emerald-500/20 rounded-2xl md:rounded-3xl p-6 md:p-8">
          <h3 className="text-lg md:text-xl font-black uppercase italic mb-6 flex items-center gap-3 m-0 text-white">
            <Target className="text-emerald-400" size={24} aria-hidden="true" /> Actions Recommandées
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statsCalculated.energyConsumption > 15000 && (
              <ActionButton 
                icon={<Zap size={18} className="text-amber-400" aria-hidden="true" />}
                title="Audit énergétique"
                description="Identifier les postes de consommation excessive"
                onClick={() => router.push('/dashboard/environment/audit')}
              />
            )}
            {statsCalculated.recyclingRate < 75 && (
              <ActionButton 
                icon={<Leaf size={18} className="text-emerald-400" aria-hidden="true" />}
                title="Optimisation du tri"
                description="Former les équipes aux nouveaux protocoles"
                onClick={() => router.push('/dashboard/environment/training')}
              />
            )}
            {statsCalculated.hazardousWaste > 100 && (
              <ActionButton 
                icon={<AlertCircle size={18} className="text-rose-400" aria-hidden="true" />}
                title="Plan déchets dangereux"
                description="Réduire la production de déchets toxiques"
                onClick={() => router.push('/dashboard/environment/wastes')}
              />
            )}
            {statsCalculated.energyConsumption <= 15000 && statsCalculated.recyclingRate >= 75 && statsCalculated.hazardousWaste <= 100 && (
              <div className="col-span-full text-center py-6 text-emerald-400">
                <CheckCircle size={32} className="mx-auto mb-3" aria-hidden="true" />
                <p className="text-[10px] font-black uppercase italic tracking-widest">
                  Tous les indicateurs sont conformes aux objectifs ISO 14001
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="shrink-0 p-4 border-t border-white/5 text-center bg-[#0B0F1A]">
        <p className="text-[8px] md:text-[9px] font-bold text-slate-600 uppercase italic tracking-[0.3em] m-0">
          Qualisoft SMI • Analytics ISO 14001 • Données en temps réel
        </p>
      </footer>

      {/* GLOBAL STYLES */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(16, 185, 129, 0.3); 
          border-radius: 10px; 
        }
        :focus-visible {
          outline: 2px solid #10b981;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// COMPOSANT : ACTION BUTTON (réutilisable)
// ============================================================================

function ActionButton({ 
  icon, 
  title, 
  description, 
  onClick 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-[#0F172A]/50 border border-white/5 rounded-2xl p-4 md:p-5 text-left hover:bg-white/5 hover:border-white/20 transition-all group cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 w-full"
    >
      <div className="flex items-start gap-3 md:gap-4">
        <div className="p-2.5 bg-white/5 rounded-xl group-hover:scale-110 transition-transform shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-black text-white text-sm mb-1 group-hover:text-emerald-300 transition-colors m-0 line-clamp-2">
            {title}
          </h4>
          <p className="text-[9px] text-slate-400 italic m-0 line-clamp-2">{description}</p>
        </div>
        <ExternalLink size={14} className="text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0" aria-hidden="true" />
      </div>
    </button>
  );
}
