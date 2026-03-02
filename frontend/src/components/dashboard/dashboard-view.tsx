/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🚀 MODULE : DashboardView.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Centre de commandement QHSE (Revue de Direction).
 * SYNC : Liaison directe avec le Noyau NestJS via useDashboard.
 * RÉVISION : 02 Mars 2026 | 18:35 GMT
 */

"use client";

import React from 'react';
import { useDashboard } from '@/core/hooks/use-dashboard';
import { StatCard } from './stat-card';
import { SSEChart } from './sse-chart';
import { ActionPlan } from './actions-plan';
import { 
  AlertTriangle, ShieldAlert, CheckCircle2, Activity, 
  Loader2, RefreshCcw, Zap, TrendingUp 
} from 'lucide-react';

export function DashboardView() {
  const { data, isLoading, isError, refetch, isFetching } = useDashboard();
  
  // Cast de sécurité pour l'intégrité Matrix
  const mData = data as any;

  if (isLoading) return (
    <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-6 italic">
      <div className="relative">
        <Loader2 className="h-16 w-16 animate-spin text-blue-600 stroke-[3px]" />
        <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full bg-blue-500/20 scale-150" />
      </div>
      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Initialisation du Noyau Matrix...</p>
    </div>
  );

  if (isError) return (
    <div className="h-[70vh] flex items-center justify-center p-8">
      <div className="bg-white p-12 rounded-[3.5rem] border border-red-100 shadow-4xl text-center max-w-lg italic">
        <ShieldAlert className="text-red-500 mx-auto mb-6" size={50} />
        <h2 className="text-2xl font-black text-slate-900 uppercase m-0 leading-none">Rupture du Flux SDE</h2>
        <p className="text-slate-500 my-6 text-xs font-bold uppercase tracking-tight leading-relaxed">
          Le périmètre multi-tenant est inaccessible. Vérifiez votre accréditation Matrix.
        </p>
        <button onClick={() => refetch()} className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 border-none cursor-pointer">
          <RefreshCcw size={16} /> Restaurer la Connexion
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      
      {/* 🛡️ HEADER DE SESSION */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-3 text-blue-600 font-black text-[9px] uppercase tracking-[0.4em] bg-blue-50 w-fit px-5 py-2 rounded-full border border-blue-100 italic">
            <Zap size={12} fill="currentColor" className="animate-pulse" />
            <span>Sovereign Monitoring Active</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none m-0 italic">
            Intelligence <span className="text-blue-600">Dashboard</span>
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="bg-white p-2 pl-6 rounded-2xl border border-slate-200 flex items-center gap-6 shadow-xl">
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic m-0">Refresh Core</p>
              <p className="text-xs font-black text-slate-900 tabular-nums italic m-0">{isFetching ? 'Sync...' : 'Stable'}</p>
            </div>
            <button onClick={() => refetch()} disabled={isFetching} className="p-4 bg-slate-950 text-white rounded-xl hover:bg-blue-600 transition-all border-none cursor-pointer">
              <RefreshCcw size={18} className={isFetching ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </header>

      {/* 📊 GRID KPI */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Risques Actifs" value={mData?.risquesCount ?? 0} icon={Activity} variant="info" trend="ISO 31000" />
        <StatCard title="Non-Conformités" value={mData?.ncCount ?? 0} icon={AlertTriangle} variant="warning" trend="§10.2" />
        <StatCard title="Accidents SSE" value={mData?.sseCount ?? 0} icon={ShieldAlert} variant="danger" trend="LTI : 0" />
        <StatCard title="Conformité Globale" value={`${mData?.complianceScore ?? 0}%`} icon={CheckCircle2} variant="success" trend="Stable" />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 text-left">
        <div className="xl:col-span-2 space-y-10">
          {/* GRAPHIQUE ACCIDENTOLOGIE */}
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 uppercase italic m-0 tracking-tighter leading-none">Analyse Accidentologie</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest m-0">Flux des événements §10.2 ISO 45001</p>
              </div>
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <SSEChart data={mData?.sseData || []} />
          </div>

          {/* PLAN D'ACTIONS PRIORITAIRES */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-900 uppercase italic ml-4 tracking-widest">Dernières Actions PAQ</h3>
            <ActionPlan actions={mData?.recentActions} />
          </div>
        </div>

        {/* SIDEBAR D'ALERTES */}
        <aside className="space-y-8">
          <div className="bg-slate-950 rounded-[3rem] p-10 text-white shadow-3xl relative overflow-hidden group border-none">
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 bg-red-500 rounded-full animate-ping" />
                <h3 className="text-lg font-black uppercase italic m-0">Urgence QSE</h3>
              </div>
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10 border-l-4 border-l-red-500">
                <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-2 italic">Alerte Critique</p>
                <p className="text-sm font-black italic tracking-tighter leading-tight m-0 uppercase">Suspension de production : Zone Nord</p>
              </div>
              <button className="w-full py-5 bg-blue-600 hover:bg-white hover:text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all border-none cursor-pointer italic">
                Déclencher Protocole
              </button>
            </div>
            <div className="absolute -bottom-20 -right-20 h-64 w-64 bg-blue-600/20 rounded-full blur-[100px]" />
          </div>
        </aside>
      </div>
    </div>
  );
}