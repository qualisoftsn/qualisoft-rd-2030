'use client';

import React from 'react';
import { useDashboard } from '@/core/hooks/use-dashboard';
import { StatCard } from '@/components/dashboard/stat-card';
import { SSEChart } from '@/components/dashboard/sse-chart';
import { NotificationCenter } from '@/components/layout/notification-center';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Activity, 
  Loader2, 
  TrendingUp,
  Clock,
  ChevronRight,
  RefreshCcw,
  Zap
} from 'lucide-react';

/**
 * DashboardView - Cockpit de Pilotage Qualisoft RD 2030
 * Intègre les KPIs, le monitoring SSE et le centre d'alertes.
 */
export function DashboardView() {
  const { data, isLoading, isError, refetch, isFetching } = useDashboard();

  // Écran de chargement haute fidélité
  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-[#f8fafc]">
        <div className="relative">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 stroke-3" />
          <div className="absolute inset-0 h-16 w-16 animate-pulse rounded-full bg-blue-100/50 scale-150" />
        </div>
        <div className="text-center">
          <p className="text-slate-900 font-black text-xl italic tracking-tight">QUALISOFT <span className="text-blue-600">RD 2030</span></p>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.3em]">Synchronisation moteur...</p>
        </div>
      </div>
    );
  }

  // Écran d'erreur résilient
  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center p-8 bg-slate-50">
        <div className="bg-white p-12 rounded-[3rem] border border-red-100 shadow-2xl text-center max-w-lg">
          <div className="h-24 w-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <AlertTriangle className="text-red-500" size={48} />
          </div>
          <h2 className="text-slate-900 font-black text-3xl mb-4 tracking-tight">Flux API Interrompu</h2>
          <p className="text-slate-500 mb-10 leading-relaxed font-medium">
            Impossible de joindre le serveur NestJS. Vérifiez votre connexion réseau ou l&apos;état du service backend.
          </p>
          <button 
            onClick={() => refetch()}
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-xl"
          >
            <RefreshCcw size={18} /> Reconnecter le système
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-12">
      <div className="max-w-425 mx-auto space-y-12">
        
        {/* --- HEADER STRATÉGIQUE --- */}
        <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] bg-blue-50 w-fit px-4 py-1.5 rounded-full">
              <Zap size={12} fill="currentColor" />
              <span>Système de Monitoring Actif</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter italic">
              Intelligence <span className="text-blue-600 not-italic">Dashboard</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* CENTRE DE NOTIFICATIONS INTEGRÉ */}
            <NotificationCenter />

            {/* BARRE DE SYNCHRONISATION */}
            <div className="flex items-center gap-6 bg-white p-2 pl-6 rounded-2xl border border-slate-200 shadow-sm">
               <div className="flex flex-col items-end">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dernière Mise à Jour</span>
                 <span className="text-sm font-mono font-bold text-slate-800 tabular-nums">
                   {isFetching ? 'Chargement...' : new Date().toLocaleTimeString()}
                 </span>
               </div>
               <button 
                 onClick={() => refetch()}
                 className={`p-4 rounded-xl transition-all ${isFetching ? 'animate-spin bg-blue-50 text-blue-600' : 'bg-slate-900 text-white hover:bg-blue-600 shadow-lg shadow-slate-200'}`}
               >
                 <RefreshCcw size={20} />
               </button>
            </div>
          </div>
        </header>

        {/* --- KPI GRID : LES PILIERS QSE --- */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard 
            title="Risques Identifiés" 
            value={data?.indicateursCles?.risquesActifs || 0} 
            icon={Activity} 
            variant="info" 
            trend="ISO 9001"
          />
          <StatCard 
            title="Non-Conformités" 
            value={data?.indicateursCles?.ncNonTraitees || 0} 
            icon={AlertTriangle} 
            variant="warning" 
            trend="En attente"
          />
          <StatCard 
            title="Événements SSE" 
            value={data?.securite?.length || 0} 
            icon={ShieldAlert} 
            variant="danger" 
            trend="Veille MASE"
          />
          <StatCard 
            title="Statut Conformité" 
            value={data?.statutGlobal || 'Stable'} 
            icon={CheckCircle2} 
            variant="success" 
            trend="Certifié"
          />
        </section>

        {/* --- SECTION ANALYTIQUE : GRAPHIQUES ET ACTIONS --- */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          
          {/* ANALYSE SSE VOLUMÉTRIQUE */}
          <div className="xl:col-span-2 bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Accidentologie & Incidents</h3>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Répartition par catégorie de risque</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                <TrendingUp size={24} />
              </div>
            </div>
            <SSEChart data={data?.securite || []} />
          </div>

          {/* SIDEBAR D'ALERTES CRITIQUES */}
          <aside className="space-y-8">
            <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <h3 className="text-xl font-black uppercase tracking-widest">Urgence QSE</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-3 py-1 bg-red-500 text-[10px] font-black rounded-lg uppercase tracking-widest">Critique</span>
                      <ChevronRight size={16} className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-sm font-bold leading-snug">Seuil de rejet dépassé : Zone Industrielle Sud</p>
                  </div>

                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10 opacity-40">
                    <p className="text-[10px] font-black text-slate-500 mb-2 uppercase italic tracking-widest">Il y a 2 heures</p>
                    <p className="text-sm font-medium">Maintenance préventive extincteurs</p>
                  </div>
                </div>

                <button className="w-full py-5 bg-blue-600 hover:bg-blue-500 rounded-4xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/30 transition-all active:scale-95">
                  Gestion de Crise
                </button>
              </div>
              {/* Effet visuel de fond */}
              <div className="absolute -bottom-24 -right-24 h-80 w-80 bg-blue-600/20 rounded-full blur-[120px]" />
            </div>

            {/* ACCÈS RAPIDE AUX FLUX */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 flex items-center justify-between group cursor-pointer hover:border-blue-400 hover:shadow-lg transition-all">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                  <Clock size={28} />
                </div>
                <div>
                  <p className="text-slate-900 font-black text-lg tracking-tight leading-none mb-1">Historique</p>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Journal des modifications</p>
                </div>
              </div>
              <ChevronRight size={24} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-2 transition-all" />
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}