/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 ARCHITECTURE : COCKPIT DE DIRECTION ELITE (SDE-CORE)
 * -------------------------------------------------------------------------
 * RÔLE : Centre de commandement consolidant Qualité (NC), Sécurité (SSE) et Risques.
 * FIX : Layout 100dvh (Zéro Scroll), Intégration PWA, Souveraineté API.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 01:08 GMT
 */

'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';
import { 
  BarChart3, TrendingUp, AlertCircle, CheckCircle2, Users, 
  ShieldAlert, ArrowUpRight, Target, Clock, ChevronRight, 
  Activity, Zap, Globe, Loader2, ShieldCheck, ZapOff
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function DirectionDashboard() {
  const { user } = useAuthStore() as any;
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/analyses/dashboard');
      setStats(res.data?.data || res.data);
    } catch (err) {
      toast.info("Mode local activé - Données de simulation.");
      setStats({ resolutionRate: 88, ncCount: 14, sseRate: 1.8, activeUsers: 156 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading && !stats) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-6">
      <Loader2 className="animate-spin text-blue-600" size={60} strokeWidth={1} />
      <p className="text-[10px] font-black uppercase tracking-[1em] text-blue-500 animate-pulse">Synchronisation Master Node...</p>
    </div>
  );

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans overflow-hidden flex flex-col selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🔝 TOP NAVIGATION / STATUS */}
      <header className="shrink-0 px-6 py-4 md:px-10 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-3xl z-50 flex flex-col md:flex-row justify-between items-center gap-6 mt-12 lg:mt-0">
        <div className="text-left">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic m-0 leading-none">
            Cockpit <span className="text-blue-600 font-black">Direction</span>
          </h1>
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] mt-2 italic m-0">
            Performance & Gouvernance Souveraine • Elite-SDE
          </p>
        </div>

        <div className="flex items-center gap-6 bg-white/5 p-4 rounded-4xl border border-white/5 shadow-inner">
          <div className="text-right hidden sm:block">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest m-0">Horloge Système</p>
            <p className="text-xs font-black text-white uppercase italic m-0">{formatDate()}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-600/30">
            <Clock className="text-blue-500" size={20} />
          </div>
        </div>
      </header>

      {/* 📜 SCROLLABLE AREA (Zero Global Scroll) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 space-y-10">
        
        {/* 📊 ROW 1: STRATEGIC KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
          <KpiTile title="Taux Résolution" val={`${stats?.resolutionRate}%`} sub="Performance ACT" icon={CheckCircle2} color="emerald" />
          <KpiTile title="Incidences NC" val={stats?.ncCount} sub="Seuil critique: 20" icon={AlertCircle} color="amber" />
          <KpiTile title="Indice SSE" val={stats?.sseRate} sub="Objectif < 2.0" icon={ShieldAlert} color="rose" />
          <KpiTile title="Utilisateurs" val={stats?.activeUsers} sub="Connexions actives" icon={Users} color="blue" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          
          {/* 🏛️ AXES STRATÉGIQUES (§6.2) */}
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-[#151B2B] border-2 border-white/5 p-8 lg:p-10 rounded-[3rem] shadow-4xl relative overflow-hidden group transition-all hover:border-blue-600/20">
              <div className="absolute top-0 right-0 p-10 opacity-[0.02] text-white pointer-events-none group-hover:scale-110 transition-transform">
                <Target size={250} />
              </div>
              <div className="flex justify-between items-center mb-10 relative z-10">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-600/30 text-blue-500 shadow-lg">
                    <TrendingUp size={28} />
                  </div>
                  <h2 className="text-2xl font-black uppercase italic m-0">Axe Stratégique 2026</h2>
                </div>
                <button className="bg-white/5 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-600 hover:text-white transition-all border-none cursor-pointer italic">Analytique</button>
              </div>
              
              <div className="space-y-8 relative z-10">
                <ObjectiveProgress label="Conformité Réglementaire" current={94} color="bg-emerald-500" />
                <ObjectiveProgress label="Avancement Plan d'Actions" current={68} color="bg-blue-600" />
                <ObjectiveProgress label="Maitrise des Risques (SDE)" current={45} color="bg-amber-500" />
              </div>
            </div>

            {/* ⚡ FLUX CRITIQUE */}
            <div className="bg-[#0B0F1A] border-2 border-rose-500/20 p-8 lg:p-10 rounded-[3rem] shadow-2xl relative group">
              <h2 className="text-[10px] font-black uppercase italic tracking-[0.4em] text-rose-500 mb-8 flex items-center gap-3 m-0">
                <Zap size={18} className="animate-pulse" /> Alertes Critiques Système
              </h2>
              <div className="divide-y divide-white/5">
                <CriticalItem type="NC_MAJOR" desc="Rupture process de contrôle - Site A" time="14 min ago" />
                <CriticalItem type="SSE_RISK" desc="Écart protection EPI détecté" time="2h ago" />
                <CriticalItem type="SDE_LOCK" desc="Accès non-autorisé registre Risques" time="Hier" />
              </div>
            </div>
          </div>

          {/* 🔑 NODE IDENTITY & PWA STATUS */}
          <aside className="space-y-8">
            <div className="bg-linear-to-br from-[#151B2B] to-[#0B0F1A] p-8 rounded-[3rem] border-2 border-white/5 shadow-3xl relative group overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-5 text-blue-600 group-hover:rotate-12 transition-transform">
                 <Globe size={100} />
               </div>
               <h3 className="text-[9px] font-black uppercase italic tracking-widest text-slate-500 border-b border-white/10 pb-4 mb-8">Master Node Identity</h3>
               <div className="space-y-6">
                 <IdentityRow label="Organisation" val="QUALISOFT CORE" />
                 <IdentityRow label="Instance" val="ELITE SDE v3.0" />
                 <IdentityRow label="Statut Réseau" val="OPÉRATIONNEL" statusColor="text-emerald-500" />
               </div>
               <button className="w-full mt-10 py-5 bg-blue-600 hover:bg-white hover:text-blue-600 text-white rounded-2xl text-[10px] font-black uppercase transition-all shadow-xl cursor-pointer border-none italic">
                 Détails de l&apos;Abonnement
               </button>
            </div>

            <div className="bg-white/2 border border-white/5 p-6 rounded-3xl flex flex-col gap-3 shadow-inner">
               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest text-center m-0">Raccourcis Direction</p>
               <ShortcutBtn label="Cartographie Risques" />
               <ShortcutBtn label="Revue de Direction" />
               <ShortcutBtn label="Matrice de Compétence" />
            </div>
          </aside>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(37,99,235,0.2); border-radius: 10px; }` }} />
    </div>
  );
}

// --- SUB-COMPONENTS ---

function formatDate() {
  return new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' });
}

const KpiTile = ({ title, val, sub, icon: Icon, color }: any) => {
  const themes: any = { emerald: "text-emerald-400 border-emerald-500/10", amber: "text-amber-400 border-amber-500/10", rose: "text-rose-400 border-rose-500/10", blue: "text-blue-400 border-blue-500/10" };
  return (
    <div className={cn("bg-[#151B2B] border-2 p-8 rounded-[2.5rem] shadow-2xl transition-all hover:scale-105 hover:border-opacity-30 cursor-pointer group", themes[color])}>
      <div className="flex justify-between items-start mb-6">
        <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-current group-hover:bg-opacity-10 transition-colors">
          <Icon size={24} />
        </div>
        <ArrowUpRight size={18} className="text-slate-700 group-hover:text-white" />
      </div>
      <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] mb-2">{title}</p>
      <h3 className="text-4xl font-black text-white italic tracking-tighter m-0">{val}</h3>
      <p className="text-[8px] font-bold text-slate-600 mt-4 uppercase tracking-widest italic">{sub}</p>
    </div>
  );
};

const ObjectiveProgress = ({ label, current, color }: any) => (
  <div className="space-y-3">
    <div className="flex justify-between items-end">
      <span className="text-[10px] font-black text-slate-400 uppercase italic tracking-widest">{label}</span>
      <span className="text-xl font-black italic text-white leading-none">{current}%</span>
    </div>
    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
      <div className={cn("h-full rounded-full transition-all duration-1000", color)} style={{ width: `${current}%` }} />
    </div>
  </div>
);

const CriticalItem = ({ type, desc, time }: any) => (
  <div className="py-6 flex justify-between items-center group cursor-pointer hover:translate-x-2 transition-all">
    <div className="space-y-1">
      <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest italic leading-none">{type}</span>
      <p className="text-sm font-black text-white uppercase italic m-0 group-hover:text-rose-400 transition-colors">{desc}</p>
    </div>
    <div className="flex items-center gap-4">
      <span className="text-[9px] font-bold text-slate-600 italic uppercase">{time}</span>
      <ChevronRight size={16} className="text-slate-800 group-hover:text-white" />
    </div>
  </div>
);

const IdentityRow = ({ label, val, statusColor = "text-white" }: any) => (
  <div className="flex justify-between items-center py-1">
    <span className="text-[9px] font-black text-slate-600 uppercase italic tracking-widest">{label}</span>
    <span className={cn("text-[10px] font-black uppercase italic tracking-tight", statusColor)}>{val}</span>
  </div>
);

const ShortcutBtn = ({ label }: any) => (
  <button className="w-full flex justify-between items-center p-4 bg-white/2 hover:bg-blue-600/10 rounded-xl text-[9px] font-black text-slate-300 uppercase transition-all border-none cursor-pointer italic group">
    {label} <ArrowUpRight size={14} className="text-slate-700 group-hover:text-blue-500" />
  </button>
);