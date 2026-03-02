/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🏛️ MODULE : REVUE DE DIRECTION STRATÉGIQUE (MATRIX KERNEL)
 * -------------------------------------------------------------------------
 * NORME : ISO 9001:2015 §9.3 (Management Review).
 * LOGIQUE : Zéro "Undefined" - Sécurisation des metrics par fallback 0.
 * DESIGN : Elite High-Density / No-Scroll / Sovereign SDE.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 11:21 GMT
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FileBarChart, Download, Printer, ShieldCheck, TrendingUp, 
  Loader2, Target, Users, ClipboardCheck, Calendar, ArrowUpRight, 
  ArrowDownRight, Minus, Edit3, Save, X, Zap, Fingerprint
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast, Toaster } from 'sonner';

// --- 🏗️ INTERFACE DE DONNÉES SCELLÉES ---
interface ReviewData {
  MR_Id: string;
  MR_Period: string;
  MR_Status: 'DRAFT' | 'VALIDATED' | 'ARCHIVED';
  MR_Summary: string;
  metrics: {
    globalPerformance: number;
    customerSatisfaction: number;
    auditMajor: number;
    auditMinor: number;
    processCount: number;
    criticalRisksCount: number;
  };
  previousPerformance: number;
}

export default function ManagementReviewPage() {
  const [fetching, setFetching] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'processes' | 'risks' | 'decisions'>('overview');
  const [review, setReview] = useState<ReviewData | null>(null);
  const [editedSummary, setEditedSummary] = useState<string>('');

  // --- 📡 SYNCHRONISATION KERNEL SDE ---
  const loadReview = useCallback(async () => {
    try {
      setFetching(true);
      const res = await apiClient.get('/smi/management-review/active');
      const data = res.data?.data || res.data;
      if (data) {
        setReview(data);
        setEditedSummary(data.MR_Summary || '');
      }
    } catch (error) {
      toast.error("ÉCHEC DE RÉCUPÉRATION DU NOYAU STRATÉGIQUE");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { loadReview(); }, [loadReview]);

  // --- 📊 MOTEUR DE TENDANCE (§9.1.3) ---
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

  // --- 🛠️ ACTIONS DE SCELLAGE ---
  const handleSaveSummary = async () => {
    if (!review?.MR_Id) return;
    setIsSaving(true);
    const tid = toast.loading("Scellage directionnel en cours...");
    try {
      await apiClient.patch(`/smi/management-review/${review.MR_Id}`, { MR_Summary: editedSummary });
      setReview(prev => prev ? { ...prev, MR_Summary: editedSummary } : null);
      setIsEditing(false);
      toast.success("ANALYSE SCELLÉE CONFORME §9.3.2", { id: tid });
    } catch (e) { 
      toast.error("ERREUR DE PERSISTANCE MATRIX", { id: tid }); 
    } finally { 
      setIsSaving(false); 
    }
  };

  if (fetching) return (
    <div className="ml-0 lg:ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-6">
      <Loader2 className="animate-spin text-blue-600" size={48} />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-600 animate-pulse italic">
        Extraction du Noyau Stratégique...
      </p>
    </div>
  );

  return (
    <div className="ml-0 lg:ml-72 h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col p-8 overflow-hidden selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER TACTIQUE (No-Scroll) */}
      <header className="flex justify-between items-end border-b border-white/10 pb-6 mb-8 shrink-0">
        <div className="text-left">
          <div className="flex items-center gap-4 mb-3">
            <span className={`px-4 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border italic ${review?.MR_Status === 'VALIDATED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-600/10 text-blue-500 border-blue-600/20'}`}>
              SCELLEMENT : {review?.MR_Status || 'REQUIS'}
            </span>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 italic leading-none">
              <Calendar size={14}/> {review?.MR_Period || 'PÉRIODE INDÉFINIE'} • {format(new Date(), 'dd MMMM yyyy', { locale: fr })}
            </span>
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter m-0 leading-none">
            Revue de <span className="text-blue-600">Direction</span>
          </h1>
        </div>

        <div className="flex gap-4">
          <button onClick={() => window.print()} className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white border border-white/10 transition-all cursor-pointer shadow-xl">
            <Printer size={20}/>
          </button>
          <button className="bg-blue-600 hover:bg-white hover:text-blue-600 px-8 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-3 border-none transition-all cursor-pointer italic shadow-2xl">
            <Download size={18}/> Exporter le Rapport SDE
          </button>
        </div>
      </header>

      {/* 🧭 NAVIGATION DENSE */}
      <nav className="flex gap-3 mb-8 shrink-0 no-scrollbar overflow-x-auto pb-2">
        {(['overview', 'processes', 'risks', 'decisions'] as const).map((t) => (
          <button 
            key={t} onClick={() => setActiveTab(t)}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-none cursor-pointer italic whitespace-nowrap shadow-md ${activeTab === t ? 'bg-white text-black scale-105' : 'bg-white/5 text-slate-500 hover:text-white hover:bg-white/10'}`}
          >
            {t === 'overview' ? 'Synthèse Globale' : t === 'processes' ? 'Performance Processus' : t === 'risks' ? 'Analyse des Risques' : 'Décisions & CAPA'}
          </button>
        ))}
      </nav>

      {/* 📊 KPI ROW (Fixe) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 shrink-0">
        <KPIBox label="Indice de Maturité" value={`${review?.metrics?.globalPerformance ?? 0}%`} icon={<TrendingUp size={18}/>} color="emerald" trend={trend} />
        <KPIBox label="Satisfaction Client" value={`${review?.metrics?.customerSatisfaction ?? 0}%`} icon={<Users size={18}/>} color="blue" sub="ISO §9.1.2" />
        <KPIBox label="Unités de Pilotage" value={review?.metrics?.processCount ?? 0} icon={<Target size={18}/>} color="indigo" sub="Unités Actives" />
        <KPIBox label="Écarts Audit" value={(review?.metrics?.auditMajor ?? 0) + (review?.metrics?.auditMinor ?? 0)} icon={<ClipboardCheck size={18}/>} color="amber" sub={`${review?.metrics?.auditMajor ?? 0} Majeur(s)`} />
      </div>

      {/* 🧩 ZONE D'ANALYSE (Scrolled Area) */}
      <main className="flex-1 min-h-0 grid grid-cols-12 gap-8 overflow-hidden pb-4">
        
        {/* COL 1: CONSTAT DE DIRECTION (§9.3.2) */}
        <div className="col-span-12 lg:col-span-8 bg-slate-900/40 border border-white/5 rounded-[3.5rem] flex flex-col overflow-hidden shadow-3xl relative backdrop-blur-md">
          <div className="absolute -right-20 -bottom-20 opacity-[0.03] pointer-events-none rotate-12">
            <FileBarChart size={450}/>
          </div>
          
          <header className="p-8 border-b border-white/5 flex justify-between items-center shrink-0 bg-black/20">
            <h3 className="text-lg font-black uppercase italic flex items-center gap-4 m-0 leading-none">
              <Zap className="text-blue-500 animate-pulse" size={20}/> Analyse Directionnelle §9.3.2
            </h3>
            <div className="flex gap-3">
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="p-3 bg-white/5 hover:bg-blue-600 rounded-xl transition-all border-none cursor-pointer text-white shadow-xl">
                  <Edit3 size={16}/>
                </button>
              ) : (
                <div className="flex gap-3 animate-in fade-in zoom-in-95">
                  <button onClick={handleSaveSummary} disabled={isSaving} className="p-3 bg-emerald-600 hover:bg-white hover:text-emerald-600 rounded-xl transition-all border-none cursor-pointer shadow-xl">
                    {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
                  </button>
                  <button onClick={() => {setIsEditing(false); setEditedSummary(review?.MR_Summary || '')}} className="p-3 bg-rose-600/10 hover:bg-rose-600 rounded-xl border-none cursor-pointer text-white shadow-xl">
                    <X size={16}/>
                  </button>
                </div>
              )}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-10 text-left">
            {!isEditing ? (
              <div className="text-xl text-slate-300 font-medium leading-relaxed italic whitespace-pre-wrap first-letter:text-7xl first-letter:font-black first-letter:text-blue-600 first-letter:mr-5 first-letter:float-left first-letter:leading-none">
                {review?.MR_Summary || "EN ATTENTE D'ANALYSE STRATÉGIQUE POUR LA PÉRIODE ACTIVE..."}
              </div>
            ) : (
              <textarea 
                value={editedSummary} 
                onChange={(e) => setEditedSummary(e.target.value)} 
                className="w-full h-full bg-black/40 border-2 border-white/10 rounded-[2.5rem] p-10 text-lg text-white font-medium italic focus:border-blue-600 outline-none resize-none transition-all shadow-inner leading-relaxed" 
                placeholder="DÉTAILLER ICI LA SYNTHÈSE DE DIRECTION SELON L'ISO 9001:2015..."
              />
            )}
          </div>
        </div>

        {/* COL 2: FOCUS CONFORMITÉ (§9.2) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8 overflow-hidden">
          <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-8 shadow-3xl shrink-0 text-left backdrop-blur-md">
            <h3 className="text-[11px] font-black uppercase text-slate-500 mb-8 flex items-center gap-3 italic tracking-[0.2em]">
              <ShieldCheck className="text-blue-500" size={16}/> Bilan des Audits Internes
            </h3>
            <div className="space-y-4">
              <AuditItem label="Non-Conformités Majeures" val={review?.metrics?.auditMajor ?? 0} color="rose" />
              <AuditItem label="Non-Conformités Mineures" val={review?.metrics?.auditMinor ?? 0} color="amber" />
              <AuditItem label="Risques Critiques SMI" val={review?.metrics?.criticalRisksCount ?? 0} color="indigo" />
            </div>
          </div>

          <div className="flex-1 bg-blue-600 rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-4xl flex flex-col justify-between text-left transition-all hover:bg-blue-500">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-100 italic mb-3">Validation Certification</p>
              <h4 className="text-4xl font-black italic tracking-tighter m-0 leading-none">ISO 9001:2015</h4>
            </div>
            <div className="relative z-10 flex justify-between items-end">
               <div className="text-[9px] font-bold uppercase tracking-widest leading-relaxed opacity-80">
                 Cycle de Surveillance :<br/>Septembre 2026
               </div>
               <Fingerprint size={56} className="text-white/20 group-hover:scale-110 group-hover:text-white/40 transition-all duration-700" />
            </div>
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-[80px] pointer-events-none" />
          </div>
        </div>
      </main>

      {/* 🧩 FORMULE DE MATURITÉ PONDÉRÉE (RECTIFIÉE) */}
      <footer className="mt-auto flex justify-center shrink-0 border-t border-white/5 pt-6 pb-2">
        <p className="text-[11px] text-slate-600 font-mono italic m-0 tracking-widest">
          {"$$Maturité = \\frac{\\sum_{i=1}^{n} (Performance_{i} \\times Poids_{i})}{\\sum_{i=1}^{n} Poids_{i}}$$"}
        </p>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2563eb; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

// --- 🧩 COMPOSANTS D'ARCHITECTURE SDE ---

function KPIBox({ label, value, icon, color, trend, sub }: any) {
  const c: any = { 
    emerald: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10", 
    blue: "text-blue-500 bg-blue-500/5 border-blue-500/10", 
    indigo: "text-indigo-500 bg-indigo-500/5 border-indigo-500/10", 
    amber: "text-amber-500 bg-amber-500/5 border-amber-500/10" 
  };
  return (
    <div className={`p-6 rounded-4xl border flex items-center justify-between shadow-2xl backdrop-blur-md transition-all hover:-translate-y-1 ${c[color]}`}>
      <div className="flex items-center gap-4 text-left">
        <div className="p-3 bg-black/30 rounded-2xl shadow-inner">{icon}</div>
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest leading-none mb-2 italic">{label}</span>
          <span className="text-[8px] font-bold uppercase text-slate-600 tracking-widest italic leading-none">{sub || "Calcul Kernel"}</span>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-3xl font-black italic m-0 text-white leading-none tracking-tighter">{value}</span>
        {trend && (
          <div className={`flex items-center gap-1 text-[9px] font-black mt-2 ${trend.color}`}>
            <trend.Icon size={12}/> {trend.val}
          </div>
        )}
      </div>
    </div>
  );
}

function AuditItem({ label, val, color }: any) {
  const c: any = { rose: "border-rose-500/20 text-rose-500", amber: "border-amber-500/20 text-amber-500", indigo: "border-indigo-500/20 text-indigo-500" };
  return (
    <div className={`p-5 bg-black/40 rounded-2xl border flex justify-between items-center italic transition-all hover:bg-white/5 hover:translate-x-1 ${c[color]}`}>
      <span className="text-[10px] font-black uppercase tracking-widest leading-none">{label}</span>
      <span className="text-3xl font-black text-white leading-none tracking-tighter">{val}</span>
    </div>
  );
}