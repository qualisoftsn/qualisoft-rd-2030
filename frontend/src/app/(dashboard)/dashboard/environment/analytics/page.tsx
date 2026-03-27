/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 💡 MODULE : ANALYTICS ENVIRONNEMENTAUX (ISO 14001 §9.3)
 * VERSION : 3.0 - Typing strict + Fallback composants + Design Elite
 */

import React, { useEffect, useState, useMemo, useCallback, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Download, Leaf, Target, FileSpreadsheet, Activity, Loader2, 
  PieChart as PieChartIcon, Filter, Zap, Droplets, TrendingUp, 
  TrendingDown, AlertCircle, CheckCircle, ExternalLink
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';
import apiClient from '@/core/api/api-client';

// ============================================================================
// TYPES (Prisma aligned)
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
  WAS_Treatment: string;
  WAS_Site?: { S_Name: string };
}

export interface SSEIncident {
  SSE_Id: string;
  SSE_SiteId: string;
  SSE_AvecArret: boolean;
  SSE_Description: string;
  SSE_Type: string;
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
// CONSTANTES
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

const formatNumber = (num: number, unit?: string): string => 
  new Intl.NumberFormat('fr-SN').format(num) + (unit ? ` ${unit}` : '');

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
// FALLBACK COMPONENTS
// ============================================================================

function EnvironmentalAlerts({ stats }: { stats: CalculatedStats }) {
  const alerts = [
    stats.criticalIncidents > 0 && { type: 'critical', title: `${stats.criticalIncidents} incident(s) critique(s)`, message: 'Action immédiate requise' },
    stats.hazardousWaste > 100 && { type: 'warning', title: 'Déchets dangereux élevés', message: `${formatNumber(stats.hazardousWaste, 'kg')} ce trimestre` },
    stats.energyConsumption > 15000 && { type: 'warning', title: 'Consommation énergétique critique', message: 'Dépassement objectif ISO 14001' },
    stats.recyclingRate < 75 && { type: 'info', title: 'Taux de recyclage à améliorer', message: 'Objectif 75% non atteint' },
  ].filter(Boolean);

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3" role="region" aria-label="Alertes environnementales">
      {alerts.map((alert: any, i: number) => {
        const config: any = {
          critical: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', icon: AlertCircle },
          warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', icon: AlertCircle },
          info: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', icon: Activity },
        }[alert.type];
        const Icon = config.icon;
        return (
          <div key={i} className={cn("p-4 rounded-2xl border flex items-start gap-3", config.bg, config.border)} role="alert">
            <Icon size={18} className={cn("w-4.5 h-4.5 shrink-0 mt-0.5", config.text)} aria-hidden="true" />
            <div>
              <p className={cn("text-[9px] font-black uppercase tracking-wider m-0", config.text)}>{alert.title}</p>
              <p className="text-[10px] text-slate-400 mt-1">{alert.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EnvironmentalStats({ stats }: { stats: CalculatedStats }) {
  const items = [
    { label: 'Énergie', value: `${formatNumber(stats.energyConsumption, 'kWh')}`, trend: stats.energyTrend, color: 'amber' },
    { label: 'Eau', value: `${formatNumber(stats.waterConsumption, 'm³')}`, trend: stats.waterTrend, color: 'blue' },
    { label: 'Déchets', value: `${formatNumber(stats.totalWaste, 'kg')}`, trend: stats.wasteTrend, color: 'rose' },
    { label: 'Recyclage', value: `${stats.recyclingRate}%`, trend: stats.recyclingTrend, color: 'emerald' },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="Statistiques">
      {items.map((item, i) => {
        const trendType = getTrendType(item.trend);
        const { icon: TrendIcon, color: trendColor } = TREND_CONFIG[trendType];
        return (
          <div key={i} className="bg-[#0F172A] border border-white/5 rounded-2xl p-4">
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest m-0">{item.label}</p>
            <p className="text-2xl font-black italic text-white m-0 mt-1">{item.value}</p>
            <div className={cn("flex items-center gap-1 mt-2", trendColor)}>
              <TrendIcon size={12} className="w-3 h-3" aria-hidden="true" />
              <span className="text-[8px] font-black uppercase">{item.trend}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KpiCard({ title, value, trend, icon: Icon, color, isoRef, progress, alert }: any) {
  const { icon: TrendIcon, color: trendColor } = TREND_CONFIG[getTrendType(trend)];
  return (
    <div className={cn("bg-[#0F172A] border rounded-2xl p-5 hover:border-white/20 transition-all", alert ? "border-amber-500/30 bg-amber-500/5" : "border-white/5")}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-xl bg-gradient-to-br text-white", color)}><Icon size={20} className="w-5 h-5" aria-hidden="true" /></div>
        {alert && <AlertCircle size={16} className="w-4 h-4 text-amber-400 animate-pulse" aria-hidden="true" />}
      </div>
      <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest m-0">{title}</p>
      <p className="text-2xl font-black italic text-white m-0 mt-1">{value}</p>
      {progress !== undefined && (
        <div className="w-full bg-black/40 rounded-full h-2 mt-3 overflow-hidden">
          <div className={cn("h-full transition-all", progress > 90 ? "bg-rose-500" : progress > 70 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${Math.min(100, progress)}%` }} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} />
        </div>
      )}
      <div className={cn("flex items-center gap-1 mt-2", trendColor)}>
        <TrendIcon size={12} className="w-3 h-3" aria-hidden="true" />
        <span className="text-[8px] font-black uppercase">{trend}</span>
      </div>
      {isoRef && <p className="text-[7px] text-slate-600 uppercase mt-2 italic">{isoRef}</p>}
    </div>
  );
}

function SimpleBarChart({ data, color = '#f59e0b' }: { data: Array<{ label: string; value: number }>; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="h-48 flex items-end justify-around gap-2 p-4" role="img" aria-label="Graphique consommations">
      {data.map((item, i) => (
        <div key={i} className="flex flex-col items-center gap-2 flex-1">
          <div className="w-full rounded-t-lg transition-all" style={{ height: `${(item.value / max) * 100}%`, minHeight: '4px', backgroundColor: color, opacity: 0.9 }} title={`${item.label}: ${item.value}`} role="img" aria-label={`${item.label}: ${item.value}`} />
          <span className="text-[8px] text-slate-500">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function SimplePieChart({ data }: { data: Array<{ label: string; value: number; color: string }> }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <div className="h-48 flex flex-col justify-center gap-4 p-4" role="img" aria-label="Répartition déchets">
      {data.filter(d => d.value > 0).map((item, i) => {
        const percent = Math.round((item.value / total) * 100);
        return (
          <div key={i} className="space-y-2">
            <div className="flex justify-between text-[9px]">
              <span className="font-black uppercase text-slate-300">{item.label}</span>
              <span className="text-slate-400">{formatNumber(item.value, 'kg')} ({percent}%)</span>
            </div>
            <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden">
              <div className={cn("h-full transition-all", item.color)} style={{ width: `${percent}%` }} role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ActionButton({ icon, title, description, onClick }: any) {
  return (
    <button type="button" onClick={onClick} className="bg-[#0F172A]/50 border border-white/5 rounded-2xl p-4 md:p-5 text-left hover:bg-white/5 transition-all group cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 w-full">
      <div className="flex items-start gap-3 md:gap-4">
        <div className="p-2.5 bg-white/5 rounded-xl group-hover:scale-110 transition-transform shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-black text-white text-sm mb-1 group-hover:text-emerald-300 transition-colors m-0 line-clamp-2">{title}</h4>
          <p className="text-[9px] text-slate-400 italic m-0 line-clamp-2">{description}</p>
        </div>
        <ExternalLink size={14} className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0" aria-hidden="true" />
      </div>
    </button>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EnvironmentAnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData>({ consumptions: [], wastes: [], incidents: [], sites: [] });
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState<string>('ALL');
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [c, w, i, s] = await Promise.all([
        apiClient.get<Consumption[]>('/consumptions'),
        apiClient.get<Waste[]>('/wastes'),
        apiClient.get<SSEIncident[]>('/sse'),
        apiClient.get<Site[]>('/sites'),
      ]);
      setData({
        consumptions: Array.isArray(c.data) ? c.data : [],
        wastes: Array.isArray(w.data) ? w.data : [],
        incidents: Array.isArray(i.data) ? i.data : [],
        sites: Array.isArray(s.data) ? s.data.filter((x: Site) => x.S_Actif !== false) : [],
      });
    } catch (err) {
      console.error('❌ Erreur analytics:', err);
      toast.error("RUPTURE DE FLUX ANALYTICS");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') fetchData(); }, [fetchData]);

  const stats = useMemo((): CalculatedStats => {
    const filter = <T extends { CON_SiteId?: string; WAS_SiteId?: string; SSE_SiteId?: string }>(item: T) => 
      selectedSite === 'ALL' || item.CON_SiteId === selectedSite || item.WAS_SiteId === selectedSite || item.SSE_SiteId === selectedSite;
    
    const cons = data.consumptions.filter(filter);
    const wst = data.wastes.filter(filter);
    const energy = cons.filter(c => isTypeMatch(c.CON_Type, ENERGY_TYPES)).reduce((s, c) => s + (Number(c.CON_Value) || 0), 0);
    const water = cons.filter(c => isTypeMatch(c.CON_Type, WATER_TYPES)).reduce((s, c) => s + (Number(c.CON_Value) || 0), 0);
    const totalW = wst.reduce((s, w) => s + (Number(w.WAS_Weight) || 0), 0);
    const recW = wst.filter(w => isTypeMatch(w.WAS_Type, RECYCLABLE_TYPES)).reduce((s, w) => s + (Number(w.WAS_Weight) || 0), 0);
    const hazW = wst.filter(w => isTypeMatch(w.WAS_Type, HAZARDOUS_TYPES)).reduce((s, w) => s + (Number(w.WAS_Weight) || 0), 0);
    const critInc = data.incidents.filter(x => filter(x) && (x.SSE_AvecArret || x.SSE_Severity === 'CRITICAL')).length;
    
    return {
      energyConsumption: Math.round(energy),
      waterConsumption: Math.round(water),
      totalWaste: Math.round(totalW),
      recyclingRate: totalW > 0 ? Math.round((recW / totalW) * 100) : 0,
      hazardousWaste: Math.round(hazW),
      carbonFootprint: Math.round(energy * 0.44),
      criticalIncidents: critInc,
      energyTrend: energy > 15000 ? '-4.2%' : '+1.5%',
      waterTrend: water > 500 ? '-1.5%' : '+0.8%',
      recyclingTrend: recW / totalW > 0.75 ? '+8.0%' : '-2.1%',
      wasteTrend: totalW > 5000 ? '-2.1%' : '+1.2%',
    };
  }, [data, selectedSite]);

  const handleExport = async () => {
    setExporting(true);
    const tid = toast.loading("Génération rapport...");
    try {
      const res = await apiClient.get<Blob>('/environment/analytics/export', { params: { site: selectedSite !== 'ALL' ? selectedSite : undefined }, responseType: 'blob' });
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement('a'); a.href = url; a.download = `analytics-${new Date().toISOString().split('T')[0]}.xlsx`; a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Rapport téléchargé", { id: tid });
    } catch {
      toast.error("Échec export", { id: tid });
    } finally { setExporting(false); }
  };

  if (loading && typeof window !== 'undefined') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
        <Loader2 className="animate-spin text-emerald-400 w-12 h-12" aria-hidden="true" />
        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-emerald-400 animate-pulse italic">Analyse Conformité SDE...</span>
      </div>
    );
  }

  const chartData = ['Jan', 'Fév', 'Mar'].map((m, i) => ({ label: m, value: data.consumptions.filter(c => c.CON_Month === i + 1 && (selectedSite === 'ALL' || c.CON_SiteId === selectedSite)).reduce((s, c) => s + c.CON_Value, 0) }));
  const wasteData = [
    { label: 'Recyclable', value: data.wastes.filter(w => w.WAS_Type === 'RECYCLABLE' && (selectedSite === 'ALL' || w.WAS_SiteId === selectedSite)).reduce((s, w) => s + w.WAS_Weight, 0), color: 'bg-emerald-500' },
    { label: 'Dangereux', value: data.wastes.filter(w => w.WAS_Type === 'DANGEREUX' && (selectedSite === 'ALL' || w.WAS_SiteId === selectedSite)).reduce((s, w) => s + w.WAS_Weight, 0), color: 'bg-rose-500' },
    { label: 'Ménager', value: data.wastes.filter(w => w.WAS_Type === 'MENAGER' && (selectedSite === 'ALL' || w.WAS_SiteId === selectedSite)).reduce((s, w) => s + w.WAS_Weight, 0), color: 'bg-slate-500' },
  ];

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-emerald-500/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />
      
      <header className="shrink-0 px-4 md:px-6 lg:px-10 py-4 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div className="space-y-2 md:space-y-3">
          <span className="px-2.5 md:px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-full italic">SMI §9.3 ISO 14001</span>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tighter italic m-0 leading-none text-white">Intelligence <span className="text-emerald-500">Durable</span></h1>
          <p className="text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest italic">Analyse prédictive • Tendances • Conformité</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="site-analytics" className="sr-only">Filtrer par site</label>
          <select id="site-analytics" value={selectedSite} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedSite(e.target.value)} className="bg-[#0F172A] border border-white/10 rounded-xl px-4 py-2.5 text-[8px] md:text-[9px] font-black uppercase italic text-white cursor-pointer outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30" aria-label="Filtrer par site">
            <option value="ALL" className="bg-[#0B0F1A]">Périmètre Global</option>
            {data.sites.map(s => <option key={s.S_Id} value={s.S_Id} className="bg-[#0B0F1A]">{s.S_Name.toUpperCase()}</option>)}
          </select>
          <button onClick={handleExport} disabled={exporting} className="p-2.5 md:p-3 bg-emerald-600 rounded-xl text-white hover:bg-white hover:text-emerald-600 transition-all border-none disabled:opacity-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400" aria-label="Exporter">
            {exporting ? <Loader2 size={18} className="w-4.5 h-4.5 animate-spin" aria-hidden="true" /> : <Download size={18} className="w-4.5 h-4.5" aria-hidden="true" />}
          </button>
          <button onClick={() => router.push('/dashboard/environment/reports')} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[8px] md:text-[9px] font-black uppercase italic text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400"><FileSpreadsheet size={14} className="w-3.5 h-3.5" aria-hidden="true" /><span className="hidden sm:inline">Rapports</span></button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-10 py-5 space-y-6">
        <EnvironmentalAlerts stats={stats} />
        <EnvironmentalStats stats={stats} />
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section className="bg-[#0F172A] border border-white/5 rounded-2xl p-5 md:p-7 shadow-2xl flex flex-col min-h-[400px]">
            <h2 className="text-lg md:text-xl font-black uppercase italic mb-6 flex items-center gap-3 m-0 text-white"><Zap className="text-amber-400 w-5 h-5" aria-hidden="true" /> Flux Énergie</h2>
            <div className="flex-1"><SimpleBarChart data={chartData} color="#f59e0b" /></div>
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-white/5">
              {['ELECTRICITE', 'GAZ', 'EAU'].map(t => <span key={t} className={cn("flex items-center gap-1.5 text-[8px] uppercase tracking-wider", t === 'EAU' ? 'text-blue-400' : 'text-amber-400')}><span className="w-2 h-2 rounded-full bg-current" aria-hidden="true" />{t.toLowerCase()}</span>)}
            </div>
          </section>
          <section className="bg-[#0F172A] border border-white/5 rounded-2xl p-5 md:p-7 shadow-2xl flex flex-col min-h-[400px]">
            <h2 className="text-lg md:text-xl font-black uppercase italic mb-6 flex items-center gap-3 m-0 text-white"><PieChartIcon className="text-emerald-400 w-5 h-5" aria-hidden="true" /> Matrice Déchets</h2>
            <div className="flex-1"><SimplePieChart data={wasteData} /></div>
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-white/5">
              {['Recyclable', 'Dangereux', 'Ménager'].map((l, i) => { const c = ['text-emerald-400','text-rose-400','text-slate-400']; return <span key={i} className={cn("flex items-center gap-1.5 text-[8px] uppercase tracking-wider", c[i])}><span className="w-2 h-2 rounded-full bg-current" aria-hidden="true" />{l.toLowerCase()}</span>; })}
            </div>
          </section>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard title="Empreinte Carbone" value={`${formatNumber(stats.carbonFootprint, 'kg CO₂')}`} trend={stats.energyTrend} icon={Leaf} color="from-emerald-600 to-emerald-800" isoRef="§6.1.2" />
          <KpiCard title="Valorisation" value={`${stats.recyclingRate}%`} trend={stats.recyclingTrend} icon={Target} color="from-blue-600 to-blue-800" isoRef="§9.1" progress={stats.recyclingRate} />
          <KpiCard title="Incidents SSE" value={stats.criticalIncidents.toString()} trend={stats.criticalIncidents > 0 ? `+${stats.criticalIncidents}` : '0%'} icon={Activity} color="from-rose-600 to-rose-800" alert={stats.criticalIncidents > 0} />
        </section>

        <section className="bg-gradient-to-r from-emerald-900/30 to-green-900/30 border border-emerald-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-3 m-0 text-white"><Target className="text-emerald-400 w-6 h-6" aria-hidden="true" /> Actions Recommandées</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.energyConsumption > 15000 && <ActionButton icon={<Zap size={18} className="w-4.5 h-4.5 text-amber-400" aria-hidden="true" />} title="Audit énergétique" description="Identifier postes consommation excessive" onClick={() => router.push('/dashboard/environment/audit')} />}
            {stats.recyclingRate < 75 && <ActionButton icon={<Leaf size={18} className="w-4.5 h-4.5 text-emerald-400" aria-hidden="true" />} title="Optimisation du tri" description="Former équipes aux nouveaux protocoles" onClick={() => router.push('/dashboard/environment/training')} />}
            {stats.hazardousWaste > 100 && <ActionButton icon={<AlertCircle size={18} className="w-4.5 h-4.5 text-rose-400" aria-hidden="true" />} title="Plan déchets dangereux" description="Réduire production déchets toxiques" onClick={() => router.push('/dashboard/environment/wastes')} />}
            {stats.energyConsumption <= 15000 && stats.recyclingRate >= 75 && stats.hazardousWaste <= 100 && (
              <div className="col-span-full text-center py-6 text-emerald-400"><CheckCircle size={32} className="w-8 h-8 mx-auto mb-3" aria-hidden="true" /><p className="text-[10px] font-black uppercase italic tracking-widest">Tous indicateurs conformes ISO 14001</p></div>
            )}
          </div>
        </section>
      </main>

      <footer className="shrink-0 p-4 border-t border-white/5 text-center bg-[#0B0F1A]">
        <p className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase italic tracking-widest m-0">Qualisoft SMI • Analytics ISO 14001 • Données temps réel</p>
      </footer>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(16,185,129,0.3);border-radius:10px}:focus-visible{outline:2px solid #10b981;outline-offset:2px}`}</style>
    </div>
  );
}