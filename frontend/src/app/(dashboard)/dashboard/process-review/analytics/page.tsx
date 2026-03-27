/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🧠 MODULE : ANALYTICS DES REVUES (ISO 9001 §9.1.3)
 * RÔLE : Analyse de l'efficacité du SMQ
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { useEffect, useState } from "react";
import apiClient, { type ApiError } from "@/core/api/api-client";
import { 
  ArrowLeft, CheckCircle2, ShieldCheck, Target, TrendingUp, RefreshCw, BarChart3
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { cn } from "@/core/utils/cn";

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface TrendItem {
  period: string;
  rate: number;
}

export interface ActionStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  executionRate: number;
}

export interface ReviewStats {
  validated: number;
  pending: number;
  overdue: number;
}

export interface ReviewAnalytics {
  reviews: ReviewStats;
  actions: ActionStats;
  trend: TrendItem[];
}

export interface StatBoxProps {
  icon: React.ElementType;
  val: number;
  label: string;
  color: 'emerald' | 'blue';
}

export interface AnalyticProgressProps {
  label: string;
  val: number;
  total: number;
  color: 'emerald' | 'blue' | 'slate';
}

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCw className="animate-spin text-indigo-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : STAT BOX
// ============================================================================

function StatBox({ icon: Icon, val, label, color }: StatBoxProps) {
  const colors: Record<StatBoxProps['color'], string> = { 
    emerald: "text-emerald-400", 
    blue: "text-blue-400" 
  };
  
  return (
    <article className="bg-[#0F172A] border-2 border-white/5 p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] relative overflow-hidden group hover:border-blue-500/30 transition-all shadow-2xl focus-within:ring-2 focus-within:ring-indigo-400">
      <Icon className={cn("w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mb-4 md:mb-6 lg:mb-8", colors[color])} aria-hidden="true" />
      <div className="text-4xl md:text-5xl lg:text-6xl font-black italic leading-none text-white m-0 tracking-tighter">{val}</div>
      <p className="text-[9px] md:text-[10px] text-slate-500 tracking-widest mt-3 md:mt-4 m-0 uppercase font-black italic">{label}</p>
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : ANALYTIC PROGRESS
// ============================================================================

function AnalyticProgress({ label, val, total, color }: AnalyticProgressProps) {
  const colors: Record<AnalyticProgressProps['color'], string> = { 
    emerald: "bg-emerald-500", 
    blue: "bg-blue-500", 
    slate: "bg-slate-500" 
  };
  
  const percentage = total > 0 ? Math.round((val / total) * 100) : 0;
  
  return (
    <div className="space-y-3 md:space-y-4" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100} aria-label={`${label}: ${percentage}%`}>
      <div className="flex justify-between items-end text-[10px] md:text-[11px] font-black italic uppercase tracking-widest">
        <span className="text-slate-400">{label}</span>
        <span className="text-white text-lg md:text-xl">{val} <small className="text-slate-600 text-sm md:text-base">/ {total}</small></span>
      </div>
      <div className="h-3 md:h-4 bg-black/40 rounded-full overflow-hidden p-0.5 md:p-1 border border-white/5 shadow-inner">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000", colors[color])} 
          style={{ width: `${percentage}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function ReviewAnalyticsPage() {
  const [stats, setStats] = useState<ReviewAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      apiClient.get<ReviewAnalytics>("/process-reviews/analytics")
        .then(res => setStats(res.data?.data || res.data || null))
        .catch((error: unknown) => {
          console.error('❌ Erreur chargement analytics:', error);
          toast.error("ERREUR CRITIQUE D'INTELLIGENCE MATRIX");
        })
        .finally(() => setLoading(false));
    }
  }, []);

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Compilation de l'Intelligence Décisionnelle..." />;
  }

  if (!stats) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status">
        <BarChart3 className="text-indigo-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Aucune donnée disponible</p>
        <button 
          type="button"
          onClick={() => router.back()}
          className="mt-4 text-[9px] text-indigo-400 hover:text-indigo-300 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded px-3 py-1"
        >
          Retour Cockpit
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 mt-12 lg:mt-0">
        <button 
          type="button"
          onClick={() => router.back()} 
          className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] text-slate-500 hover:text-white transition-all bg-transparent border-none cursor-pointer italic tracking-widest mb-4 md:mb-6 uppercase focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded px-2 py-1"
          aria-label="Retour au cockpit des revues"
        >
          <ArrowLeft size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> 
          <span className="hidden sm:inline">Retour Cockpit</span>
        </button>
        <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter leading-none m-0 italic">
          Intelligence <span className="text-indigo-400">Décisionnelle</span>
        </h1>
      </header>

      {/* 📊 MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
        <div className="max-w-[100rem] mx-auto space-y-8 md:space-y-10 lg:space-y-12 pb-10 md:pb-16 lg:pb-20">
          
          {/* KPI GRID */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8" role="list" aria-label="Statistiques des revues">
            <StatBox icon={CheckCircle2} val={stats.reviews?.validated || 0} label="Revues Scellées" color="emerald" />
            <StatBox icon={Target} val={stats.actions?.total || 0} label="Actions Générées" color="blue" />
            <article className="md:col-span-2 bg-gradient-to-br from-blue-600/20 to-emerald-600/20 border-2 border-white/10 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] p-6 md:p-8 lg:p-10 flex items-center justify-between relative overflow-hidden group shadow-2xl transition-all hover:scale-[1.01] focus-within:ring-2 focus-within:ring-indigo-400">
              <TrendingUp className="absolute right-0 top-0 p-4 md:p-6 lg:p-8 opacity-5 w-32 h-32 md:w-40 md:h-40 lg:w-44 lg:h-44" aria-hidden="true" />
              <div className="relative z-10">
                <p className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl italic tracking-tighter leading-none text-emerald-400 m-0">
                  {stats.actions?.executionRate || 0}%
                </p>
                <p className="text-[9px] md:text-[10px] lg:text-[11px] text-white/50 tracking-widest mt-3 md:mt-4 m-0 uppercase font-black italic">
                  Taux Global de Réalisation
                </p>
              </div>
              <ShieldCheck size={48} className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20 text-emerald-500/20 hidden xl:block" aria-hidden="true" />
            </article>
          </section>

          {/* 📈 BAR CHART */}
          <section className="bg-[#0F172A] border-2 border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[4.5rem] p-6 md:p-8 lg:p-12 xl:p-16 shadow-2xl space-y-6 md:space-y-8 lg:space-y-12" aria-labelledby="chart-title">
            <h3 id="chart-title" className="text-[10px] md:text-[11px] lg:text-[12px] text-emerald-400 tracking-widest m-0 italic flex items-center gap-3 md:gap-4">
              <TrendingUp size={18} className="w-4.5 h-4.5 md:w-5 md:h-5 lg:w-6 lg:h-6" aria-hidden="true" /> 
              Évolution de l&apos;Efficacité Mensuelle
            </h3>
            <div className="flex items-end justify-between h-64 md:h-80 lg:h-96 gap-2 md:gap-4 lg:gap-6 px-4 md:px-6 lg:px-10" role="img" aria-label="Graphique d'évolution de l'efficacité">
              {stats.trend && stats.trend.length > 0 ? stats.trend.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                   <div 
                     className="absolute -top-10 md:-top-12 opacity-0 group-hover:opacity-100 transition-all bg-white text-slate-900 text-[9px] md:text-[10px] px-3 md:px-4 py-1.5 md:py-2 rounded-xl font-black italic pointer-events-none"
                     aria-hidden="true"
                   >
                     {item.rate}%
                   </div>
                   <div 
                     className="w-full bg-blue-600/10 group-hover:bg-blue-600 transition-all duration-700 rounded-t-xl md:rounded-t-2xl lg:rounded-t-3xl relative" 
                     style={{ height: `${item.rate}%` }}
                     role="presentation"
                   >
                     <div className="absolute top-0 w-full h-0.5 md:h-1 bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.8)]" aria-hidden="true" />
                   </div>
                   <span className="text-[8px] md:text-[9px] lg:text-[10px] text-slate-500 mt-4 md:mt-6 tracking-widest font-black uppercase italic group-hover:text-white truncate w-full text-center">
                     {item.period}
                   </span>
                </div>
              )) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600">
                  <p className="text-[10px] md:text-[11px] tracking-widest">Aucune donnée de tendance disponible</p>
                </div>
              )}
            </div>
          </section>

          {/* 📉 ACTION PROGRESSION */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8 lg:gap-12" aria-label="Progression du plan d'action">
            <article className="xl:col-span-2 bg-[#0F172A] p-6 md:p-8 lg:p-12 xl:p-16 border-2 border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[4rem] space-y-6 md:space-y-8 lg:space-y-12 shadow-2xl">
              <h3 className="text-[10px] md:text-[11px] lg:text-[12px] text-blue-400 tracking-widest m-0 italic">
                Détails du Plan d&apos;Action Stratégique
              </h3>
              <div className="space-y-6 md:space-y-8 lg:space-y-10">
                <AnalyticProgress label="Actions Clôturées" val={stats.actions?.completed || 0} total={stats.actions?.total || 1} color="emerald" />
                <AnalyticProgress label="Actions en Cours" val={stats.actions?.inProgress || 0} total={stats.actions?.total || 1} color="blue" />
                <AnalyticProgress label="Actions en Attente" val={stats.actions?.pending || 0} total={stats.actions?.total || 1} color="slate" />
              </div>
            </article>
            <article className="bg-blue-600/5 border-2 border-blue-500/10 p-6 md:p-8 lg:p-12 xl:p-16 rounded-2xl md:rounded-3xl lg:rounded-[4rem] shadow-2xl flex flex-col justify-between focus-within:ring-2 focus-within:ring-blue-400">
              <ShieldCheck size={32} className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-blue-400 animate-pulse" aria-hidden="true" />
              <div className="space-y-4 md:space-y-6">
                <h4 className="text-2xl md:text-3xl lg:text-4xl leading-none italic tracking-tighter m-0 uppercase">Expertise Audit Ready</h4>
                <p className="text-[10px] md:text-[11px] text-slate-500 leading-relaxed font-black uppercase tracking-widest italic m-0">
                  La progression de ce mapping prouve l&apos;amélioration continue de l&apos;organisation (§10.3).
                </p>
              </div>
              <button 
                type="button"
                onClick={() => window.print()} 
                className="w-full py-3 md:py-4 lg:py-5 bg-black/40 hover:bg-white hover:text-slate-900 text-white rounded-xl md:rounded-2xl lg:rounded-3xl text-[9px] md:text-[10px] transition-all border-none cursor-pointer italic font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Exporter le bilan annuel en PDF"
              >
                Exporter Bilan Annuel
              </button>
            </article>
          </section>

        </div>
      </main>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.3);border-radius:10px}:focus-visible{outline:2px solid #6366f1;outline-offset:2px}`}</style>
    </div>
  );
}