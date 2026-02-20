/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🚀 MODULE : DashboardView
 * -------------------------------------------------------------------------
 * FONCTION : Cockpit de Direction Générale (Revue de Direction §9.3).
 * RÔLE : Monitoring temps réel des indicateurs critiques (KPI) QSE.
 * ISOLATION : Synchronisation exclusive avec le SDE (Sovereign Data Environment) du client.
 */

'use client';

import React from 'react';
import { useDashboard } from '@/core/hooks/use-dashboard';
import { StatCard } from '@/components/dashboard/stat-card';
import { SSEChart } from '@/components/dashboard/sse-chart';
import { NotificationCenter } from '@/components/layout/notification-center';
import { 
  AlertTriangle, ShieldAlert, CheckCircle2, Activity, 
  Loader2, TrendingUp, Clock, ChevronRight, RefreshCcw, Zap, ShieldCheck
} from 'lucide-react';

export function DashboardView() {
  const { data, isLoading, isError, refetch, isFetching } = useDashboard();

  // --- ÉCRAN DE SYNCHRONISATION ÉLITE ---
  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-8 bg-[#f8fafc]">
        <div className="relative">
          <Loader2 className="h-20 w-20 animate-spin text-blue-600 stroke-[3px]" />
          <div className="absolute inset-0 h-20 w-20 animate-ping rounded-full bg-blue-100/50 scale-150" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-slate-900 font-black text-2xl italic tracking-tighter uppercase">
            Qualisoft <span className="text-blue-600">Elite RD 2026</span>
          </p>
          <div className="flex items-center justify-center gap-3">
             <div className="h-1 w-12 bg-blue-600 rounded-full animate-pulse" />
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.5em]">Initialisation Matrix...</p>
             <div className="h-1 w-12 bg-blue-600 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // --- ÉCRAN DE RUPTURE DE FLUX ---
  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center p-8 bg-slate-50 italic">
        <div className="bg-white p-16 rounded-[4rem] border border-red-100 shadow-4xl text-center max-w-xl">
          <div className="h-28 w-28 bg-red-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
            <ShieldAlert className="text-red-500" size={56} />
          </div>
          <h2 className="text-slate-900 font-black text-4xl mb-6 tracking-tighter uppercase leading-none">Rupture du Noyau</h2>
          <p className="text-slate-500 mb-12 text-lg font-bold leading-relaxed uppercase tracking-tight">
            Impossible d&apos;interroger le SDE NestJS. <br />
            Le périmètre de sécurité est peut-être inaccessible.
          </p>
          <button 
            onClick={() => refetch()}
            className="w-full py-6 bg-slate-950 text-white rounded-3xl font-black text-xs uppercase tracking-[0.4em] hover:bg-blue-600 transition-all flex items-center justify-center gap-4 shadow-2xl border-none cursor-pointer active:scale-95"
          >
            <RefreshCcw size={20} /> Restaurer la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 lg:p-14 italic">
      <div className="max-w-400 mx-auto space-y-16">
        
        {/* --- HEADER SOUVERAIN --- */}
        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] bg-blue-50/80 backdrop-blur-md w-fit px-6 py-2 rounded-full border border-blue-100">
              <Zap size={14} fill="currentColor" className="animate-pulse" />
              <span>Sovereign Monitoring Active</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-none">
              Intelligence <span className="text-blue-600">Dashboard</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <NotificationCenter />

            <div className="flex items-center gap-8 bg-white p-3 pl-8 rounded-[2.5rem] border border-slate-200 shadow-xl group">
               <div className="flex flex-col items-end">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none mb-1">Dernière Synchro</span>
                 <span className="text-lg font-black text-slate-900 tabular-nums italic">
                   {isFetching ? 'Refreshing...' : new Date().toLocaleTimeString('fr-FR')}
                 </span>
               </div>
               <button 
                 onClick={() => refetch()}
                 className={`p-5 rounded-2xl transition-all border-none cursor-pointer ${
                   isFetching ? 'animate-spin bg-blue-50 text-blue-600' : 'bg-slate-950 text-white hover:bg-blue-600 shadow-2xl'
                 }`}
               >
                 <RefreshCcw size={24} />
               </button>
            </div>
          </div>
        </header>

        {/* --- KPI GRID : PILIERS DU SMI --- */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <StatCard title="Risques Identifiés" value={data?.indicateursCles?.risquesActifs || 0} icon={Activity} variant="info" trend="ISO 9001" />
          <StatCard title="Non-Conformités" value={data?.indicateursCles?.ncNonTraitees || 0} icon={AlertTriangle} variant="warning" trend="En attente" />
          <StatCard title="Événements SSE" value={data?.securite?.length || 0} icon={ShieldAlert} variant="danger" trend="Veille MASE" />
          <StatCard title="Statut Conformité" value={data?.statutGlobal || 'Stable'} icon={CheckCircle2} variant="success" trend="Certifié" />
        </section>

        {/* --- SECTION ANALYTIQUE --- */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          
          {/* GRAPHIQUE SSE : ACCIDENTOLOGIE */}
          <div className="xl:col-span-2 bg-white p-12 rounded-[4rem] border border-slate-200 shadow-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-16">
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Accidentologie & Incidents</h3>
                <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.3em] italic">Analyse volumétrique des écarts sécurité</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                <TrendingUp size={28} />
              </div>
            </div>
            <SSEChart data={data?.securite || []} />
          </div>

          {/* SIDEBAR D'ALERTES CRITIQUES */}
          <aside className="space-y-10">
            <div className="bg-slate-950 rounded-[4rem] p-12 text-white shadow-4xl relative overflow-hidden">
              <div className="relative z-10 space-y-10">
                <div className="flex items-center gap-4">
                  <span className="relative flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                  </span>
                  <h3 className="text-2xl font-black uppercase tracking-widest italic">Urgence QSE</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="p-7 bg-white/5 rounded-4xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer group border-l-4 border-l-red-500">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-4 py-1.5 bg-red-500/20 text-red-500 text-[9px] font-black rounded-lg uppercase tracking-widest">Alerte Critique</span>
                      <ChevronRight size={18} className="text-white/20 group-hover:text-white group-hover:translate-x-2 transition-all" />
                    </div>
                    <p className="text-lg font-black leading-tight italic tracking-tighter">Seuil de rejet dépassé : Zone Sud</p>
                  </div>

                  <div className="p-7 bg-white/5 rounded-4xl border border-white/10 opacity-30 group">
                    <p className="text-[10px] font-black text-slate-500 mb-3 uppercase italic tracking-widest">Initialisé T-2h</p>
                    <p className="text-md font-bold italic">Maintenance préventive extincteurs</p>
                  </div>
                </div>

                <button className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-3xl shadow-blue-600/40 transition-all active:scale-95 border-none cursor-pointer italic">
                  Déclencher Plan de Crise
                </button>
              </div>
              <div className="absolute -bottom-24 -right-24 h-96 w-96 bg-blue-600/20 rounded-full blur-[140px] pointer-events-none" />
            </div>

            {/* JOURNAL DES ÉVÉNEMENTS */}
            <div className="bg-white border border-slate-200 rounded-[3rem] p-10 flex items-center justify-between group cursor-pointer hover:border-blue-500 hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                  <Clock size={32} />
                </div>
                <div>
                  <p className="text-slate-900 font-black text-2xl tracking-tighter leading-none mb-1 uppercase">Historique</p>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic opacity-70">Journal des modifications SDE</p>
                </div>
              </div>
              <ChevronRight size={28} className="text-slate-200 group-hover:text-blue-600 group-hover:translate-x-3 transition-all" />
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}