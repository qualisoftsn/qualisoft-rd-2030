/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🏛️ MODULE : REVUE DE DIRECTION STRATÉGIQUE §9.3 (ELITE-SDE)
 * -------------------------------------------------------------------------
 * NORME : ISO 9001:2015 (Management Review).
 * LOGIQUE : Analyse directionnelle scellée et calcul de maturité.
 * DESIGN : Elite High-Density, 100dvh, Zéro Scroll Global.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 16:12 GMT
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FileBarChart, Download, Printer, ShieldCheck, TrendingUp, 
  Loader2, Target, Users, ClipboardCheck, Calendar, ArrowUpRight, 
  ArrowDownRight, Minus, Edit3, Save, X, Zap, Fingerprint, RefreshCcw
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

export default function ManagementReviewPage() {
  const [fetching, setFetching] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'processes' | 'risks' | 'decisions'>('overview');
  const [review, setReview] = useState<any>(null);
  const [editedSummary, setEditedSummary] = useState<string>('');

  const loadReview = useCallback(async () => {
    try {
      setFetching(true);
      const res = await apiClient.get('/smi/management-review/active');
      const data = res.data?.data || res.data;
      if (data) {
        setReview(data);
        setEditedSummary(data.MR_Summary || '');
      }
    } catch {
      toast.error("ÉCHEC DE RÉCUPÉRATION DU NOYAU STRATÉGIQUE");
    } finally { setFetching(false); }
  }, []);

  useEffect(() => { loadReview(); }, [loadReview]);

  const trend = useMemo(() => {
    const current = review?.metrics?.globalPerformance ?? 0;
    const previous = review?.previousPerformance ?? 0;
    const diff = current - previous;
    return {
      val: `${diff > 0 ? '+' : ''}${diff}%`,
      color: diff > 0 ? 'text-emerald-500' : diff < 0 ? 'text-rose-500' : 'text-slate-500',
      Icon: diff > 0 ? ArrowUpRight : diff < 0 ? ArrowDownRight : Minus
    };
  }, [review]);

  if (fetching) return <LoadingScreen label="Extraction du Noyau Stratégique §9.3..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER DIRECTIONNEL */}
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-xl z-50 gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-3">
          <div className="flex items-center gap-3">
             <span className={`px-4 py-1 rounded-lg text-[9px] border italic ${review?.MR_Status === 'VALIDATED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-600/10 text-blue-500 border-blue-600/20'}`}>
               SDE-STATUS : {review?.MR_Status || 'EN ATTENTE'}
             </span>
             <span className="text-[9px] text-slate-500 flex items-center gap-2 italic tracking-[0.2em]"><Calendar size={14}/> {review?.MR_Period || 'Q1-2026'}</span>
          </div>
          <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0">Revue de <span className="text-blue-600">Direction</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => window.print()} className="p-4 bg-white/5 rounded-2xl text-slate-400 hover:text-white border border-white/10 transition-all cursor-pointer"><Printer size={20}/></button>
          <button className="bg-blue-600 hover:bg-white hover:text-blue-600 px-10 py-4 rounded-2xl text-[10px] flex items-center gap-3 border-none shadow-4xl cursor-pointer italic text-white transition-all">
            <Download size={18}/> Exporter Rapport SDE
          </button>
        </div>
      </header>

      {/* 🧭 NAVIGATION & KPI */}
      <div className="shrink-0 p-8 pb-0 space-y-8">
        <nav className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
          {['overview', 'processes', 'risks', 'decisions'].map((t: any) => (
            <button key={t} onClick={() => setActiveTab(t)} className={cn("px-8 py-4 rounded-2xl text-[10px] transition-all border-none cursor-pointer italic whitespace-nowrap shadow-xl", activeTab === t ? 'bg-white text-black scale-105' : 'bg-white/5 text-slate-500 hover:text-white')}>
              {t === 'overview' ? 'Synthèse Globale' : t === 'processes' ? 'Performance Processus' : t === 'risks' ? 'Analyse Risques' : 'Décisions CAPA'}
            </button>
          ))}
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <KPIBox label="Maturité SMI" val={`${review?.metrics?.globalPerformance ?? 0}%`} icon={TrendingUp} color="emerald" trend={trend} />
          <KPIBox label="Satisfaction" val={`${review?.metrics?.customerSatisfaction ?? 0}%`} icon={Users} color="blue" sub="ISO §9.1.2" />
          <KPIBox label="Unités Pilotes" val={review?.metrics?.processCount ?? 0} icon={Target} color="indigo" sub="Unités Actives" />
          <KPIBox label="Gaps Audits" val={(review?.metrics?.auditMajor ?? 0) + (review?.metrics?.auditMinor ?? 0)} icon={ClipboardCheck} color="amber" sub={`${review?.metrics?.auditMajor ?? 0} Majeur(s)`} />
        </div>
      </div>

      {/* 🧩 ZONE D'ANALYSE SCROLLABLE */}
      <main className="flex-1 overflow-hidden p-8 grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 bg-[#151B2B] border-2 border-white/5 rounded-[4rem] flex flex-col overflow-hidden shadow-4xl relative">
          <header className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20 shrink-0">
            <h3 className="text-xl m-0 flex items-center gap-4"><Zap className="text-blue-500 animate-pulse" size={24}/> Analyse Directionnelle §9.3.2</h3>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="p-4 bg-white/5 hover:bg-blue-600 rounded-2xl transition-all border-none cursor-pointer text-white shadow-xl"><Edit3 size={18}/></button>
            ) : (
              <div className="flex gap-3 animate-in zoom-in-95">
                <button onClick={() => {}} className="p-4 bg-emerald-600 rounded-2xl border-none cursor-pointer text-white shadow-xl"><Save size={18}/></button>
                <button onClick={() => setIsEditing(false)} className="p-4 bg-rose-600/20 rounded-2xl border-none cursor-pointer text-white shadow-xl"><X size={18}/></button>
              </div>
            )}
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-12 text-left">
            <div className="text-xl text-slate-300 font-bold leading-relaxed italic whitespace-pre-wrap first-letter:text-7xl first-letter:text-blue-600 first-letter:float-left first-letter:mr-4">
              {review?.MR_Summary || "EN ATTENTE D'ANALYSE STRATÉGIQUE POUR LA PÉRIODE ACTIVE..."}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
           <div className="bg-[#151B2B] border-2 border-white/5 rounded-[3.5rem] p-10 shadow-4xl text-left">
              <h3 className="text-[11px] text-slate-500 tracking-[0.4em] mb-8 flex items-center gap-3"><ShieldCheck className="text-blue-500" size={16}/> Bilan des Audits §9.2</h3>
              <div className="space-y-4">
                <AuditItem label="Écarts Majeurs" val={review?.metrics?.auditMajor ?? 0} color="rose" />
                <AuditItem label="Écarts Mineurs" val={review?.metrics?.auditMinor ?? 0} color="amber" />
                <AuditItem label="Risques Critiques" val={review?.metrics?.criticalRisksCount ?? 0} color="indigo" />
              </div>
           </div>
           <div className="flex-1 bg-blue-600 rounded-[3.5rem] p-12 relative overflow-hidden group shadow-4xl flex flex-col justify-between text-left">
              <div className="relative z-10"><h4 className="text-5xl font-black italic tracking-tighter m-0 leading-none">ISO 9001:2015</h4></div>
              <div className="relative z-10 flex justify-between items-end">
                 <p className="text-[10px] tracking-widest leading-relaxed opacity-80 m-0">Cycle de Surveillance :<br/>Septembre 2026</p>
                 <Fingerprint size={60} className="text-white/20 group-hover:scale-110 group-hover:text-white/40 transition-all duration-700" />
              </div>
              <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-[80px] pointer-events-none" />
           </div>
        </div>
      </main>

      <footer className="shrink-0 p-4 border-t border-white/5 flex justify-center items-center">
         <p className="text-[11px] text-slate-700 font-mono italic tracking-[0.2em] m-0">MATURITÉ = SUM(PERF_i * POIDS_i) / SUM(POIDS_i)</p>
      </footer>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.2); border-radius: 10px; }` }} />
    </div>
  );
}

function KPIBox({ label, val, icon: Icon, color, trend, sub }: any) {
  const c: any = { emerald: "text-emerald-500 border-emerald-500/10", blue: "text-blue-500 border-blue-500/10", indigo: "text-indigo-500 border-indigo-500/10", amber: "text-amber-500 border-amber-500/10" };
  return (
    <div className={cn("bg-[#151B2B] p-8 rounded-[2.5rem] border-2 flex items-center justify-between shadow-2xl transition-all hover:-translate-y-1", c[color])}>
      <div className="flex items-center gap-5 text-left">
        <div className="p-4 bg-black/40 rounded-2xl shadow-inner"><Icon size={24} /></div>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 tracking-widest mb-1 italic leading-none">{label}</span>
          <span className="text-[9px] text-slate-700 italic tracking-[0.2em] leading-none uppercase">{sub || "Calcul SDE"}</span>
        </div>
      </div>
      <div className="text-right flex flex-col items-end gap-2">
        <span className="text-4xl font-black italic m-0 tracking-tighter leading-none text-white">{val}</span>
        {trend && <div className={cn("text-[10px] flex items-center gap-1", trend.color)}><trend.Icon size={14}/> {trend.val}</div>}
      </div>
    </div>
  );
}

function AuditItem({ label, val, color }: any) {
  const c: any = { rose: "border-rose-500/20 text-rose-500", amber: "border-amber-500/20 text-amber-500", indigo: "border-indigo-500/20 text-indigo-500" };
  return (
    <div className={cn("p-6 bg-black/40 rounded-3xl border flex justify-between items-center transition-all hover:translate-x-2", c[color])}>
      <span className="text-[11px] font-black tracking-widest m-0 leading-none">{label}</span>
      <span className="text-4xl font-black text-white leading-none tracking-tighter">{val}</span>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-blue-500 italic font-black uppercase tracking-[0.5em]">
      <RefreshCcw className="animate-spin" size={60} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center">{label}</span>
    </div>
  );
}