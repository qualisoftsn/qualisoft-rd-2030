/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🏛️ MODULE : GOUVERNANCE STRATÉGIQUE §9.3 (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage de la performance direction et maturité du SMI.
 * DESIGN : 100dvh, Dark Matrix, ClickUp Density.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 14:42 GMT
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, Gavel, Calendar, MessageSquare, Award, 
  ChevronRight, LayoutDashboard, Download, RefreshCcw, 
  AlertTriangle} from 'lucide-react';
import { Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

export default function GovernancePage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [stats, setStats] = useState({
    complianceScore: 92, planningCompletion: 78, maturityLevel: 'Niveau 3',
    upcomingMeetings: 4, decisionsPending: 17, regulatoryUpdates: 3,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  if (loading) return <LoadingScreen label="Calcul de Maturité §9.3..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-indigo-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center gap-6 mt-12 lg:mt-0 bg-[#0B0F1A]/95 backdrop-blur-xl z-40">
        <div className="text-left space-y-2">
          <div className="flex items-center gap-3">
            <span className="bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-[8px] text-indigo-400 tracking-[0.3em]">ISO 9001:2015 §9.3</span>
            <span className="bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-[8px] text-blue-400 tracking-[0.3em]">MATURITÉ : {stats.maturityLevel}</span>
          </div>
          <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0">Gouvernance <span className="text-indigo-500">Stratégique</span></h1>
          <p className="text-slate-500 text-[9px] tracking-[0.4em] m-0 italic">Pilotage du Capital Qualité • Master Node</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-[10px] flex items-center gap-3 hover:bg-white/10 transition-all border-none cursor-pointer text-white italic">
            <Download size={16} /> Rapport Revue
          </button>
          <Link href="/dashboard/gouvernance/copil" className="bg-indigo-600 px-8 py-4 rounded-2xl text-[10px] flex items-center gap-3 shadow-2xl hover:bg-white hover:text-indigo-600 transition-all border-none no-underline text-white italic">
            <LayoutDashboard size={16} /> Dashboard COPIL
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
          <KPIBadge label="Conformité" value={`${stats.complianceScore}%`} icon={ShieldCheck} color="indigo" />
          <KPIBadge label="Planning" value={`${stats.planningCompletion}%`} icon={Calendar} color="blue" />
          <KPIBadge label="Décisions" value={stats.decisionsPending} icon={MessageSquare} color="amber" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <GovPilier href="/dashboard/gouvernance/compliance" icon={Gavel} title="Veille Légale" desc="Surveillance des exigences ANSD et ISO (§6.1.3)." val={stats.complianceScore} color="indigo" alert={`${stats.regulatoryUpdates} MAJ ce mois`} />
          <GovPilier href="/dashboard/gouvernance/planning" icon={Calendar} title="Chronogramme" desc="Pilotage temporel des revues critiques (§9.3)." val={stats.planningCompletion} color="emerald" alert={`${stats.upcomingMeetings} Instances`} />
          <GovPilier href="/dashboard/gouvernance/sessions" icon={MessageSquare} title="Séances & Décisions" desc="Traçabilité et scellage des arbitrages Matrix." val={65} color="amber" alert="124 Archivées" />
        </div>

        {/* Maturity Matrix Box */}
        <div className="bg-[#151B2B] border-2 border-white/5 rounded-[3.5rem] p-12 flex flex-col lg:flex-row items-center justify-between gap-12 shadow-4xl">
          <div className="text-left space-y-6 flex-1">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-500 border border-indigo-500/20"><Award size={32} /></div>
              <h2 className="text-3xl tracking-tighter m-0 leading-none">Maturité du <span className="text-indigo-500">SMI</span></h2>
            </div>
            <p className="text-slate-500 text-[10px] tracking-[0.2em] m-0 font-black italic">Évaluation ISO 9004:2018 — Objectif Excellence Opérationnelle.</p>
            <div className="space-y-4 pt-4">
              <div className="flex justify-between text-[10px] text-slate-400"><span>TRANSITION VERS NIVEAU 4</span><span>78%</span></div>
              <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden p-1 border border-white/5"><div className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] rounded-full" style={{ width: '78%' }} /></div>
            </div>
          </div>
          <div className="h-48 w-48 rounded-full border-12 border-indigo-500/10 flex items-center justify-center bg-black/20 shadow-4xl shrink-0 group">
             <span className="text-6xl font-black text-indigo-500 group-hover:scale-110 transition-transform">3</span>
          </div>
        </div>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 10px; }` }} />
    </div>
  );
}

function KPIBadge({ label, value, icon: Icon, color }: any) {
  const colors: any = { indigo: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20', blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20', amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
  return (
    <div className="bg-[#151B2B] border border-white/5 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-2xl group hover:border-indigo-500/30 transition-all">
      <div className={cn("p-5 rounded-2xl transition-transform group-hover:scale-110", colors[color])}><Icon size={24} /></div>
      <div>
        <p className="text-[9px] text-slate-500 tracking-[0.3em] mb-2 m-0">{label}</p>
        <p className="text-4xl font-black italic tracking-tighter leading-none m-0 text-white">{value}</p>
      </div>
    </div>
  );
}

function GovPilier({ href, icon: Icon, title, desc, val, color, alert }: any) {
  const themes: any = { indigo: 'text-indigo-500 border-indigo-500/20', emerald: 'text-emerald-500 border-emerald-500/20', amber: 'text-amber-500 border-amber-500/20' };
  const bars: any = { indigo: 'bg-indigo-500', emerald: 'bg-emerald-500', amber: 'bg-amber-500' };
  return (
    <Link href={href} className="no-underline bg-[#151B2B] p-10 rounded-[3rem] border border-white/5 hover:border-indigo-500/40 transition-all flex flex-col shadow-3xl group">
      <div className="flex justify-between items-start mb-8">
        <div className={cn("p-4 bg-white/5 rounded-2xl", themes[color])}><Icon size={24} /></div>
        <ChevronRight size={20} className="text-slate-700 group-hover:text-white" />
      </div>
      <h3 className="text-xl font-black text-white m-0 mb-4 tracking-tighter group-hover:text-indigo-400">{title}</h3>
      <p className="text-[10px] text-slate-500 font-black tracking-wide leading-relaxed m-0 h-10 mb-8 italic line-clamp-2">{desc}</p>
      <div className="space-y-3 mb-8">
        <div className="flex justify-between text-[9px] font-black italic"><span>INDEX</span><span className="text-white">{val}%</span></div>
        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden"><div className={cn("h-full", bars[color])} style={{ width: `${val}%` }} /></div>
      </div>
      <div className="flex items-center gap-2 text-[8px] text-slate-600 tracking-widest"><AlertTriangle size={14} className="text-amber-500" /> {alert}</div>
    </Link>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6 lg:pl-72">
      <RefreshCcw className="animate-spin text-indigo-500" size={60} strokeWidth={1} />
      <span className="text-[10px] font-black uppercase tracking-[1em] text-indigo-500 animate-pulse italic text-center px-10">{label}</span>
    </div>
  );
}