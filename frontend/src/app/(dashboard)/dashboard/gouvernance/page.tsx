/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🏛️ MODULE : GOUVERNANCE STRATÉGIQUE §9.3 (ISO 9001)
 * RÔLE : Pilotage de la performance direction et maturité du SMI
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, Gavel, Calendar, MessageSquare, Award, 
  ChevronRight, LayoutDashboard, Download, RefreshCcw, 
  AlertTriangle
} from 'lucide-react';
import { Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface GovernanceStats {
  complianceScore: number;
  planningCompletion: number;
  maturityLevel: string;
  upcomingMeetings: number;
  decisionsPending: number;
  regulatoryUpdates: number;
}

export interface KPIBadgeProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: 'indigo' | 'blue' | 'amber';
}

export interface GovPilierProps {
  href: string;
  icon: React.ElementType;
  title: string;
  desc: string;
  val: number;
  color: 'indigo' | 'emerald' | 'amber';
  alert: string;
}

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCcw className="animate-spin text-indigo-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : KPI BADGE
// ============================================================================

function KPIBadge({ label, value, icon: Icon, color }: KPIBadgeProps) {
  const colors: Record<KPIBadgeProps['color'], string> = { 
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', 
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20', 
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20' 
  };
  
  return (
    <article className="bg-[#0F172A] border border-white/5 p-6 md:p-8 rounded-2xl md:rounded-3xl flex items-center gap-4 md:gap-6 shadow-2xl group hover:border-indigo-500/30 transition-all focus-within:ring-2 focus-within:ring-indigo-400">
      <div className={cn("p-3 md:p-4 md:p-5 rounded-xl md:rounded-2xl transition-transform group-hover:scale-110", colors[color])}>
        <Icon size={20} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
      </div>
      <div>
        <p className="text-[8px] md:text-[9px] text-slate-500 tracking-widest mb-1 md:mb-2 m-0">{label}</p>
        <p className="text-3xl md:text-4xl font-black italic tracking-tighter leading-none m-0 text-white">{value}</p>
      </div>
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : GOUVERNANCE PILIER
// ============================================================================

function GovPilier({ href, icon: Icon, title, desc, val, color, alert }: GovPilierProps) {
  const themes: Record<GovPilierProps['color'], string> = { 
    indigo: 'text-indigo-400 border-indigo-500/20', 
    emerald: 'text-emerald-400 border-emerald-500/20', 
    amber: 'text-amber-400 border-amber-500/20' 
  };
  const bars: Record<GovPilierProps['color'], string> = { 
    indigo: 'bg-indigo-500', 
    emerald: 'bg-emerald-500', 
    amber: 'bg-amber-500' 
  };
  
  return (
    <Link 
      href={href} 
      className="no-underline bg-[#0F172A] p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl border border-white/5 hover:border-indigo-500/40 transition-all flex flex-col shadow-2xl group focus:outline-none focus:ring-2 focus:ring-indigo-400"
      aria-label={`${title}: ${val}% complété`}
    >
      <div className="flex justify-between items-start mb-6 md:mb-8">
        <div className={cn("p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl", themes[color])}>
          <Icon size={20} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
        </div>
        <ChevronRight size={20} className="w-5 h-5 text-slate-700 group-hover:text-white" aria-hidden="true" />
      </div>
      <h3 className="text-lg md:text-xl font-black text-white m-0 mb-3 md:mb-4 tracking-tighter group-hover:text-indigo-400">{title}</h3>
      <p className="text-[9px] md:text-[10px] text-slate-500 font-black tracking-widest leading-relaxed m-0 h-8 md:h-10 mb-6 md:mb-8 italic line-clamp-2">{desc}</p>
      <div className="space-y-2 md:space-y-3 mb-6 md:mb-8">
        <div className="flex justify-between text-[8px] md:text-[9px] font-black italic">
          <span>INDEX</span>
          <span className="text-white">{val}%</span>
        </div>
        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden" role="progressbar" aria-valuenow={val} aria-valuemin={0} aria-valuemax={100}>
          <div className={cn("h-full", bars[color])} style={{ width: `${val}%` }} aria-hidden="true" />
        </div>
      </div>
      <div className="flex items-center gap-1.5 md:gap-2 text-[7px] md:text-[8px] text-slate-600 tracking-widest">
        <AlertTriangle size={10} className="w-2.5 h-2.5 text-amber-400" aria-hidden="true" /> 
        {alert}
      </div>
    </Link>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function GovernancePage() {
  const [stats, setStats] = useState<GovernanceStats>({
    complianceScore: 92, 
    planningCompletion: 78, 
    maturityLevel: 'Niveau 3',
    upcomingMeetings: 4, 
    decisionsPending: 17, 
    regulatoryUpdates: 3,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Calcul de Maturité §9.3..." />;
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-indigo-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center gap-4 md:gap-6 mt-12 lg:mt-0 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40">
        <div className="text-left space-y-2 w-full xl:w-auto">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <span className="bg-indigo-500/10 border border-indigo-500/20 px-2.5 md:px-3 py-1 rounded-full text-[7px] md:text-[8px] text-indigo-400 tracking-widest">ISO 9001:2015 §9.3</span>
            <span className="bg-blue-500/10 border border-blue-500/20 px-2.5 md:px-3 py-1 rounded-full text-[7px] md:text-[8px] text-blue-400 tracking-widest">MATURITÉ : {stats.maturityLevel}</span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl tracking-tighter leading-none m-0">Gouvernance <span className="text-indigo-400">Stratégique</span></h1>
          <p className="text-slate-500 text-[8px] md:text-[9px] tracking-widest m-0 italic">Pilotage du Capital Qualité • Master Node</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-center xl:justify-end">
          <button className="bg-white/5 border border-white/10 px-4 md:px-6 py-2.5 md:py-4 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] flex items-center gap-2 md:gap-3 hover:bg-white/10 transition-all border-none cursor-pointer text-white italic focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <Download size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> Rapport Revue
          </button>
          <Link href="/dashboard/gouvernance/copil" className="bg-indigo-600 px-4 md:px-6 lg:px-8 py-2.5 md:py-3 lg:py-4 rounded-xl md:rounded-2xl text-[8px] md:text-[9px] lg:text-[10px] flex items-center gap-2 md:gap-3 shadow-2xl hover:bg-white hover:text-indigo-600 transition-all border-none no-underline text-white italic focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <LayoutDashboard size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> Dashboard COPIL
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-10 py-5 md:py-6 space-y-6 md:space-y-8 lg:space-y-10">
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8" aria-label="Indicateurs de gouvernance">
          <KPIBadge label="Conformité" value={`${stats.complianceScore}%`} icon={ShieldCheck} color="indigo" />
          <KPIBadge label="Planning" value={`${stats.planningCompletion}%`} icon={Calendar} color="blue" />
          <KPIBadge label="Décisions" value={stats.decisionsPending} icon={MessageSquare} color="amber" />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8" aria-label="Piliers de gouvernance">
          <GovPilier href="/dashboard/gouvernance/compliance" icon={Gavel} title="Veille Légale" desc="Surveillance des exigences ANSD et ISO (§6.1.3)." val={stats.complianceScore} color="indigo" alert={`${stats.regulatoryUpdates} MAJ ce mois`} />
          <GovPilier href="/dashboard/gouvernance/planning" icon={Calendar} title="Chronogramme" desc="Pilotage temporel des revues critiques (§9.3)." val={stats.planningCompletion} color="emerald" alert={`${stats.upcomingMeetings} Instances`} />
          <GovPilier href="/dashboard/gouvernance/sessions" icon={MessageSquare} title="Séances & Décisions" desc="Traçabilité et scellage des arbitrages Matrix." val={65} color="amber" alert="124 Archivées" />
        </section>

        {/* Maturity Matrix */}
        <article className="bg-[#0F172A] border-2 border-white/5 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8 lg:gap-12 shadow-2xl" aria-label="Évaluation de maturité du SMI">
          <div className="text-left space-y-4 md:space-y-6 flex-1 min-w-0">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-3 md:p-4 bg-indigo-500/10 rounded-xl md:rounded-2xl text-indigo-400 border border-indigo-500/20">
                <Award size={24} className="w-6 h-6 md:w-8 md:h-8" aria-hidden="true" />
              </div>
              <h2 className="text-xl md:text-2xl lg:text-3xl tracking-tighter m-0 leading-none">Maturité du <span className="text-indigo-400">SMI</span></h2>
            </div>
            <p className="text-slate-500 text-[9px] md:text-[10px] tracking-widest m-0 font-black italic">Évaluation ISO 9004:2018 — Objectif Excellence Opérationnelle.</p>
            <div className="space-y-2 md:space-y-4 pt-2 md:pt-4">
              <div className="flex justify-between text-[8px] md:text-[10px] text-slate-400">
                <span>TRANSITION VERS NIVEAU 4</span>
                <span>78%</span>
              </div>
              <div className="h-2 md:h-3 w-full bg-black/40 rounded-full overflow-hidden p-0.5 md:p-1 border border-white/5" role="progressbar" aria-valuenow={78} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] rounded-full" style={{ width: '78%' }} aria-hidden="true" />
              </div>
            </div>
          </div>
          <div className="h-32 md:h-40 lg:h-48 w-32 md:w-40 lg:w-48 rounded-full border-4 md:border-8 lg:border-12 border-indigo-500/10 flex items-center justify-center bg-black/20 shadow-2xl shrink-0 group" aria-label={`Niveau de maturité actuel : ${stats.maturityLevel}`}>
             <span className="text-4xl md:text-5xl lg:text-6xl font-black text-indigo-400 group-hover:scale-110 transition-transform">{stats.maturityLevel.split(' ')[1]}</span>
          </div>
        </article>
      </main>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.3);border-radius:10px}:focus-visible{outline:2px solid #6366f1;outline-offset:2px}`}</style>
    </div>
  );
}