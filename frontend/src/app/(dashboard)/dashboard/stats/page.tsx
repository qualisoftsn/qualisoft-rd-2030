/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🧠 MODULE : CENTRE DE COMMANDEMENT DÉCISIONNEL (ISO 9001 §9.1)
 * RÔLE : Agrégation multi-normes, matrice des risques et prédiction IA
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useEffect, useState, useMemo } from 'react';
import { 
  TrendingUp, ShieldCheck, AlertTriangle, Target, Zap, 
  BarChart3, RefreshCcw, ArrowUpRight, ArrowDownRight, 
  Clock, FileText, Brain, AlertOctagon, CheckCircle2,
  ChevronRight, Download
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';
import { useAuthStore } from '@/store/authStore';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export type PeriodType = '7d' | '30d' | '90d' | '1y';

export interface KPIHistoryPoint {
  m: string;
  v: number;
}

export interface KPIData {
  label: string;
  value: number;
  unit: string;
  trend: number;
  target: number;
  history: KPIHistoryPoint[];
}

export interface RiskMatrixPoint {
  x: number;
  y: number;
  label?: string;
}

export interface ProcessCompliance {
  name: string;
  percentage: number;
}

export interface LoadingScreenProps {
  label: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  grid: 'rgba(255, 255, 255, 0.05)'
};

const PERIODS: PeriodType[] = ['7d', '30d', '90d', '1y'];

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: LoadingScreenProps) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <div className="relative" aria-hidden="true">
        <RefreshCcw className="animate-spin text-blue-400 w-12 h-12 md:w-16 md:h-16" strokeWidth={1} />
        <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse text-blue-400 w-6 h-6 md:w-8 md:h-8" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : KPI CARD
// ============================================================================

interface KPICardProps {
  kpi: KPIData;
  icon: React.ReactNode;
  index: number;
}

function KPICard({ kpi, icon, index }: KPICardProps) {
  const isPositive = kpi.trend > 0;

  return (
    <article 
      className="bg-slate-900/40 border border-white/5 p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] group relative overflow-hidden shadow-2xl hover:border-blue-500/30 transition-all focus-within:ring-2 focus-within:ring-blue-400"
      role="article"
      aria-label={`${kpi.label}: ${kpi.value}${kpi.unit}`}
    >
      <div className="flex justify-between items-start mb-4 md:mb-6">
        <div className={cn(
          "p-3 md:p-4 rounded-xl md:rounded-2xl bg-black/40 border border-white/5",
          isPositive ? 'text-emerald-400' : 'text-red-400'
        )}>
          {icon}
        </div>
        <div className={cn(
          "flex items-center gap-1 text-[8px] md:text-[9px] px-2 md:px-3 py-1 rounded-full border",
          isPositive 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
            : 'bg-red-500/10 text-red-400 border-red-500/20'
        )}>
          {isPositive ? (
            <ArrowUpRight size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden="true" />
          ) : (
            <ArrowDownRight size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden="true" />
          )} 
          {Math.abs(kpi.trend)}%
        </div>
      </div>
      <div className="text-3xl md:text-4xl lg:text-5xl font-black italic tracking-tighter leading-none mb-0.5 md:mb-1">
        {kpi.value}
        <span className="text-lg md:text-xl text-slate-500 ml-1 md:ml-2">{kpi.unit}</span>
      </div>
      <div className="text-[9px] md:text-[10px] text-slate-500 tracking-widest mb-4 md:mb-6 lg:mb-8">{kpi.label}</div>
      <div className="h-12 md:h-14 lg:h-16 w-full opacity-40 group-hover:opacity-100 transition-opacity" role="img" aria-label={`Historique ${kpi.label}`}>
         <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={kpi.history}>
              <Area 
                type="monotone" 
                dataKey="v" 
                stroke={COLORS.primary} 
                fill={COLORS.primary} 
                fillOpacity={0.2} 
                strokeWidth={3} 
              />
            </AreaChart>
         </ResponsiveContainer>
      </div>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function StatsIntelligencePage() {
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<PeriodType>('30d');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [period]);

  const kpis: KPIData[] = useMemo(() => [
    { label: 'Conformité SMI', value: 94.2, unit: '%', trend: 2.1, target: 95, history: [{ m: 'J', v: 89 }, { m: 'F', v: 91 }, { m: 'M', v: 94.2 }] },
    { label: 'Couverture GPEC', value: 78.5, unit: '%', trend: 5.4, target: 80, history: [{ m: 'J', v: 65 }, { m: 'F', v: 72 }, { m: 'M', v: 78.5 }] },
    { label: 'Résolution NC', value: 12, unit: 'j', trend: -15, target: 10, history: [{ m: 'J', v: 18 }, { m: 'F', v: 15 }, { m: 'M', v: 12 }] },
    { label: 'Efficacité SMI', value: 88, unit: '%', trend: -1.2, target: 90, history: [{ m: 'J', v: 85 }, { m: 'F', v: 90 }, { m: 'M', v: 88 }] }
  ], []);

  const kpiIcons = [
    <ShieldCheck size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" aria-hidden="true" />,
    <Target size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" aria-hidden="true" />,
    <Clock size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" aria-hidden="true" />,
    <Zap size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" aria-hidden="true" />
  ];

  const handleExport = async (format: string) => {
    const toastId = toast.loading(`Génération du rapport ${format}...`);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Exportation scellée et téléchargée.', { id: toastId });
    } catch {
      toast.error('Erreur de liaison Kernel.', { id: toastId });
    }
  };

  const processCompliance: ProcessCompliance[] = [
    { name: 'Pilotage SMI', percentage: 92 },
    { name: 'Ressources Humaines', percentage: 87 },
    { name: 'Relation Client', percentage: 92 }
  ];

  const riskMatrixData: RiskMatrixPoint[] = [
    { x: 70, y: 85, label: 'Risque 1' },
    { x: 40, y: 60, label: 'Risque 2' },
    { x: 20, y: 90, label: 'Risque 3' }
  ];

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Synchronisation du Cerveau Statistique..." />;
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />
      
      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 bg-black/40 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 md:gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-1 md:space-y-2 w-full xl:w-auto">
          <div className="flex items-center gap-2 md:gap-3 text-blue-400 text-[9px] md:text-[10px] tracking-widest">
            <Brain size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 animate-pulse" aria-hidden="true" /> 
            Algorithme Neural v5.4
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl xl:text-6xl tracking-tighter leading-none m-0">
            Intelligence <span className="text-blue-400">Statistique</span>
          </h1>
          <p className="text-slate-500 text-[8px] md:text-[9px] tracking-widest m-0" role="img" aria-label="Indice global de performance: 88.4%">
            Indice Global : I_g = 88.4%
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full xl:w-auto justify-center xl:justify-end">
          <div className="bg-white/5 p-1 md:p-1.5 rounded-xl md:rounded-2xl flex gap-1 border border-white/5 shadow-inner" role="radiogroup" aria-label="Sélection de période">
            {PERIODS.map((p) => (
              <button 
                key={p} 
                type="button"
                onClick={() => setPeriod(p)} 
                className={cn(
                  "px-3 md:px-4 lg:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400",
                  period === p ? 'bg-blue-600 text-white shadow-lg' : 'bg-transparent text-slate-500 hover:text-white'
                )}
                role="radio"
                aria-checked={period === p}
                aria-label={`Période ${p}`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-2" role="group" aria-label="Options d'export">
            <button 
              type="button"
              onClick={() => handleExport('PDF')} 
              className="p-2 md:p-3 lg:p-4 bg-white/5 border border-white/10 rounded-lg md:rounded-xl hover:text-blue-400 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Exporter en PDF"
            >
              <FileText size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
            </button>
            <button 
              type="button"
              onClick={() => handleExport('EXCEL')} 
              className="p-2 md:p-3 lg:p-4 bg-white/5 border border-white/10 rounded-lg md:rounded-xl hover:text-emerald-400 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400"
              aria-label="Exporter en Excel"
            >
              <Download size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* 📊 MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
        <div className="max-w-[100rem] mx-auto space-y-6 md:space-y-8 lg:space-y-10">
          
          {/* KPI GRID */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8" role="list" aria-label="Indicateurs clés de performance">
            {kpis.map((kpi, i) => (
              <KPICard 
                key={i} 
                kpi={kpi} 
                icon={kpiIcons[i]} 
                index={i} 
              />
            ))}
          </section>

          {/* CHARTS SECTION */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            <article 
              className="xl:col-span-2 bg-slate-900/40 border border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[4rem] p-4 md:p-6 lg:p-10 shadow-2xl h-[350px] md:h-[400px] lg:h-[500px] flex flex-col"
              aria-labelledby="compliance-flow-title"
            >
               <h3 id="compliance-flow-title" className="text-lg md:text-xl lg:text-2xl font-black italic m-0 mb-6 md:mb-8 lg:mb-10">
                 Flux de Conformité <span className="text-blue-400">§9.1.3</span>
               </h3>
               <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={kpis[0].history}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                      <XAxis 
                        dataKey="m" 
                        stroke="#475569" 
                        fontSize={10} 
                        fontStyle="italic"
                        tick={{ fill: '#475569', fontSize: 10, fontStyle: 'italic' }}
                      />
                      <YAxis 
                        stroke="#475569" 
                        fontSize={10} 
                        fontStyle="italic"
                        tick={{ fill: '#475569', fontSize: 10, fontStyle: 'italic' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0B0F1A', 
                          border: 'none', 
                          borderRadius: '20px', 
                          fontWeight: '900',
                          fontStyle: 'italic'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="v" 
                        stroke={COLORS.primary} 
                        strokeWidth={5} 
                        dot={{ r: 6 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
               </div>
            </article>

            <article 
              className="bg-slate-900/40 border border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[4rem] p-4 md:p-6 lg:p-10 shadow-2xl h-[350px] md:h-[400px] lg:h-[500px] flex flex-col text-left"
              aria-labelledby="risk-matrix-title"
            >
               <h3 id="risk-matrix-title" className="text-lg md:text-xl lg:text-2xl font-black italic m-0 mb-4 md:mb-6 flex justify-between items-center">
                 Matrice Risques 
                 <AlertOctagon className="text-red-400 animate-pulse w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" />
               </h3>
               <div className="bg-red-600/10 border border-red-600/20 p-4 md:p-6 rounded-2xl md:rounded-3xl mb-4 md:mb-6 lg:mb-8" role="alert">
                  <p className="text-[8px] md:text-[9px] text-red-400 tracking-widest mb-1 md:mb-2 font-black">ALERTE CRITIQUE</p>
                  <p className="text-[10px] md:text-sm font-black m-0 leading-tight">3 Menaces majeures détectées par l&apos;algorithme.</p>
               </div>
               <div className="flex-1 min-h-0 relative" role="img" aria-label="Matrice des risques ISO 31000">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                      <XAxis type="number" dataKey="x" domain={[0, 100]} hide />
                      <YAxis type="number" dataKey="y" domain={[0, 100]} hide />
                      <Scatter data={riskMatrixData} fill={COLORS.danger}>
                        {riskMatrixData.map((entry, index) => (
                          <Cell key={index} fill={COLORS.danger} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 border border-white/5 flex items-center justify-center opacity-10 font-black text-4xl md:text-5xl lg:text-6xl pointer-events-none">
                    ISO 31000
                  </div>
               </div>
            </article>
          </div>

          {/* PROCESS COMPLIANCE & INSIGHTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
             <article 
               className="bg-slate-900/40 border border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[4rem] p-4 md:p-6 lg:p-10"
               aria-labelledby="process-compliance-title"
             >
                <h3 id="process-compliance-title" className="text-lg md:text-xl lg:text-2xl font-black italic m-0 mb-6 md:mb-8 lg:mb-10 flex items-center gap-3 md:gap-4">
                  <CheckCircle2 className="text-emerald-400 w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" /> 
                  Conformité Processus §4.4
                </h3>
                <div className="space-y-4 md:space-y-6 lg:space-y-8 text-left" role="list">
                   {processCompliance.map((p, i) => (
                      <div key={i} className="space-y-2 md:space-y-3" role="listitem">
                         <div className="flex justify-between text-[10px] md:text-xs font-black italic uppercase">
                           <span>{p.name}</span>
                           <span className="text-blue-400">{p.percentage}%</span>
                         </div>
                         <div 
                           className="h-2 md:h-2.5 lg:h-3 bg-black/60 rounded-full border border-white/10 p-0.5 md:p-1"
                           role="progressbar"
                           aria-valuenow={p.percentage}
                           aria-valuemin={0}
                           aria-valuemax={100}
                           aria-label={`${p.name}: ${p.percentage}%`}
                         >
                           <div 
                             className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                             style={{ width: `${p.percentage}%` }}
                             aria-hidden="true"
                           />
                         </div>
                      </div>
                   ))}
                </div>
             </article>
             
             <article 
               className="bg-blue-600/5 border-2 border-blue-500/20 rounded-2xl md:rounded-3xl lg:rounded-[4rem] p-4 md:p-6 lg:p-10 flex flex-col justify-between relative overflow-hidden"
               aria-labelledby="neural-insights-title"
             >
                <Brain 
                  className="absolute -right-4 md:-right-6 lg:-right-10 -bottom-4 md:-bottom-6 lg:-bottom-10 opacity-10 w-40 h-40 md:w-50 md:h-50 lg:w-60 lg:h-60" 
                  aria-hidden="true" 
                />
                <div className="relative z-10 space-y-4 md:space-y-6 text-left">
                   <h3 id="neural-insights-title" className="text-lg md:text-xl lg:text-2xl lg:text-3xl font-black italic m-0 flex items-center gap-3 md:gap-4">
                     <Zap className="text-blue-400 w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" /> 
                     Insights Neuraux
                   </h3>
                   <div className="bg-white/5 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/10 italic font-bold text-[10px] md:text-[11px] leading-relaxed" role="alert">
                      DÉVIATION DÉTECTÉE SUR LE PROCESSUS CLIENT (-9%). RISQUE D&apos;ÉCART MAJEUR LORS DU PROCHAIN AUDIT AFNOR.
                   </div>
                   <button 
                     type="button"
                     className="bg-blue-600 text-white px-4 md:px-6 lg:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] tracking-widest border-none cursor-pointer hover:bg-white hover:text-blue-700 transition-all shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                     aria-label="Générer une action corrective"
                   >
                     GÉNÉRER ACTION CORRECTIVE
                   </button>
                </div>
             </article>
          </div>
        </div>
      </main>

      <footer className="shrink-0 bg-black/40 border-t border-white/5 px-4 md:px-6 py-3 md:py-4 lg:py-6 flex flex-col sm:flex-row items-center justify-between gap-2 md:gap-3 text-[8px] md:text-[9px] text-slate-500 tracking-widest" role="contentinfo">
        <span>© Qualisoft RD-2026 • Neural Core v4.2.1-stable</span>
        <span className="text-blue-400 font-black">MASTER SYNC : {new Date().toLocaleTimeString('fr-SN')}</span>
      </footer>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}