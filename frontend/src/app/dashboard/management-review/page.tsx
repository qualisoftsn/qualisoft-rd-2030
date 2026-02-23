/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🏛️ MODULE : REVUE DE DIRECTION STRATÉGIQUE (SMI MATRIX)
 * -------------------------------------------------------------------------
 * NORME : ISO 9001:2015 §9.3 (Management Review).
 * LOGIQUE : Zéro "Undefined" - Remplacement systématique par 0.
 * DESIGN : Elite High-Density / No-Scroll / Sovereign SDE.
 * -------------------------------------------------------------------------
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FileBarChart, Download, Printer, ShieldCheck, TrendingUp, 
  Loader2, Target, Users, ClipboardCheck, Calendar, ArrowUpRight, 
  ArrowDownRight, Minus, Edit3, Save, X, Zap, Fingerprint, Activity
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast, Toaster } from 'sonner';

// --- 🏗️ TYPES DE PRODUCTION ---
interface ReviewData {
  MR_Id: string;
  MR_Period: string;
  MR_Date: string;
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

  // --- 📡 SYNCHRONISATION KERNEL ---
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
      toast.error("AUCUNE REVUE ACTIVE DÉTECTÉE.");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { loadReview(); }, [loadReview]);

  // --- 📊 CALCULS DE TENDANCES (§9.1.3) ---
  const trend = useMemo(() => {
    const current = review?.metrics.globalPerformance ?? 0;
    const previous = review?.previousPerformance ?? 0;
    const diff = current - previous;
    return {
      val: `${diff > 0 ? '+' : ''}${diff}%`,
      color: diff > 0 ? 'text-emerald-500' : diff < 0 ? 'text-red-500' : 'text-slate-500',
      Icon: diff > 0 ? ArrowUpRight : diff < 0 ? ArrowDownRight : Minus
    };
  }, [review]);

  const handleSaveSummary = async () => {
    if (!review?.MR_Id) return;
    setIsSaving(true);
    const tid = toast.loading("Scellage directionnel...");
    try {
      await apiClient.patch(`/smi/management-review/${review.MR_Id}`, { MR_Summary: editedSummary });
      setReview(prev => prev ? { ...prev, MR_Summary: editedSummary } : null);
      setIsEditing(false);
      toast.success("ANALYSE SCELLÉE §9.3.2", { id: tid });
    } catch (e) { toast.error("ERREUR DE PERSISTANCE", { id: tid }); }
    finally { setIsSaving(false); }
  };

  if (fetching) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-600 animate-pulse">Extraction Strategic Core...</p>
    </div>
  );

  return (
    <div className="ml-72 h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col p-6 overflow-hidden selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER TACTIQUE (Fixe) */}
      <header className="flex justify-between items-center border-b border-white/10 pb-4 mb-6 shrink-0">
        <div className="text-left">
          <div className="flex items-center gap-3 mb-1">
            <span className={`px-3 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${review?.MR_Status === 'VALIDATED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-600/10 text-blue-500 border-blue-600/20'}`}>
              STATUS : {review?.MR_Status || 'SCELLAGE REQUIS'}
            </span>
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 leading-none">
              <Calendar size={12}/> {review?.MR_Period || 'N/A'} • {format(new Date(), 'dd MMMM yyyy', { locale: fr })}
            </span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter m-0 leading-none">Revue de <span className="text-blue-600">Direction</span></h1>
        </div>

        <div className="flex gap-3">
          <button onClick={() => window.print()} className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-white border border-white/10 transition-all cursor-pointer"><Printer size={18}/></button>
          <button className="bg-blue-600 hover:bg-white hover:text-blue-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 border-none transition-all cursor-pointer italic shadow-lg">
            <Download size={16}/> Export PDF
          </button>
        </div>
      </header>

      {/* 🧭 NAVIGATION DENSE (Fixe) */}
      <nav className="flex gap-2 mb-6 shrink-0 no-scrollbar overflow-x-auto pb-1">
        {(['overview', 'processes', 'risks', 'decisions'] as const).map((t) => (
          <button 
            key={t} onClick={() => setActiveTab(t)}
            className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-none cursor-pointer italic whitespace-nowrap ${activeTab === t ? 'bg-white text-black shadow-lg' : 'bg-white/5 text-slate-500 hover:text-white'}`}
          >
            {t === 'overview' ? 'Synthèse Globale' : t === 'processes' ? 'Performance Processus' : t === 'risks' ? 'Analyse des Risques' : 'Décisions & CAPA'}
          </button>
        ))}
      </nav>

      {/* 📊 KPI ROW (Fixe) */}
      <div className="grid grid-cols-4 gap-4 mb-6 shrink-0">
        <KPIBox label="Indice de Maturité" value={`${review?.metrics.globalPerformance ?? 0}%`} icon={<TrendingUp size={16}/>} color="emerald" trend={trend} />
        <KPIBox label="Satisfaction Client" value={`${review?.metrics.customerSatisfaction ?? 0}%`} icon={<Users size={16}/>} color="blue" sub="ISO §9.1.2" />
        <KPIBox label="Unités de Pilotage" value={review?.metrics.processCount ?? 0} icon={<Target size={16}/>} color="indigo" sub="Processus Actifs" />
        <KPIBox label="Écarts Audit" value={(review?.metrics.auditMajor ?? 0) + (review?.metrics.auditMinor ?? 0)} icon={<ClipboardCheck size={16}/>} color="amber" sub={`${review?.metrics.auditMajor ?? 0} Majeur(s)`} />
      </div>

      {/* 🧩 ZONE D'ANALYSE (Expandable & Scrollable) */}
      <main className="flex-1 min-h-0 grid grid-cols-12 gap-6 overflow-hidden">
        
        {/* COL 1: CONSTAT DE DIRECTION (§9.3.2) */}
        <div className="col-span-8 bg-[#151A2D] border border-white/5 rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none"><FileBarChart size={300}/></div>
          
          <header className="p-5 border-b border-white/5 flex justify-between items-center shrink-0 bg-black/20">
            <h3 className="text-sm font-black uppercase italic flex items-center gap-4 m-0 leading-none">
              <Zap className="text-blue-500" size={18}/> Analyse Directionnelle §9.3.2
            </h3>
            <div className="flex gap-2">
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="p-2 bg-white/5 hover:bg-blue-600 rounded-lg transition-all border-none cursor-pointer text-white shadow-lg"><Edit3 size={14}/></button>
              ) : (
                <div className="flex gap-2 animate-in fade-in zoom-in-95">
                  <button onClick={handleSaveSummary} disabled={isSaving} className="p-2 bg-emerald-600 hover:bg-white hover:text-emerald-600 rounded-lg transition-all border-none cursor-pointer shadow-lg">{isSaving ? <Loader2 className="animate-spin" size={14}/> : <Save size={14}/>}</button>
                  <button onClick={() => {setIsEditing(false); setEditedSummary(review?.MR_Summary || '')}} className="p-2 bg-rose-600/10 hover:bg-rose-600 rounded-lg border-none cursor-pointer text-white shadow-lg"><X size={14}/></button>
                </div>
              )}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 text-left">
            {!isEditing ? (
              <div className="text-lg text-slate-300 font-medium leading-relaxed italic whitespace-pre-wrap first-letter:text-6xl first-letter:font-black first-letter:text-blue-600 first-letter:mr-4 first-letter:float-left first-letter:leading-none">
                {review?.MR_Summary || "EN ATTENTE D'ANALYSE STRATÉGIQUE..."}
              </div>
            ) : (
              <textarea 
                value={editedSummary} onChange={(e) => setEditedSummary(e.target.value)} 
                className="w-full h-full bg-black/40 border-2 border-white/10 rounded-3xl p-6 text-sm text-white font-medium italic focus:border-blue-600 outline-none resize-none transition-all shadow-inner leading-relaxed" 
                placeholder="SAISIR LA SYNTHÈSE DE DIRECTION (§9.3.3)..."
              />
            )}
          </div>
        </div>

        {/* COL 2: FOCUS CONFORMITÉ (§9.2) */}
        <div className="col-span-4 flex flex-col gap-6 overflow-hidden">
          <div className="bg-[#151A2D] border border-white/5 rounded-4xl p-6 shadow-2xl shrink-0 text-left">
            <h3 className="text-[10px] font-black uppercase text-white mb-6 flex items-center gap-3 italic">
              <ShieldCheck className="text-blue-500" size={14}/> Bilan Audit Interne
            </h3>
            <div className="space-y-3">
              <AuditItem label="Écarts Majeurs" val={review?.metrics.auditMajor ?? 0} color="rose" />
              <AuditItem label="Écarts Mineurs" val={review?.metrics.auditMinor ?? 0} color="amber" />
              <AuditItem label="Risques Critiques" val={review?.metrics.criticalRisksCount ?? 0} color="indigo" />
            </div>
          </div>

          <div className="flex-1 bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-4xl flex flex-col justify-between text-left">
            <div className="relative z-10">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-100 italic mb-2">Certification Active</p>
              <h4 className="text-2xl font-black italic tracking-tighter m-0 leading-none">ISO 9001:2015</h4>
            </div>
            <div className="relative z-10 flex justify-between items-end">
               <div className="text-[8px] font-bold uppercase tracking-widest leading-relaxed">
                 Prochaine Échéance :<br/>Septembre 2026
               </div>
               <Fingerprint size={48} className="text-white/20 group-hover:scale-110 transition-transform" />
            </div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          </div>
        </div>
      </main>

      {/* 🧩 FORMULE MATHÉMATIQUE SDE (CORRIGÉE) */}
      <div className="mt-4 flex justify-center shrink-0 border-t border-white/5 pt-4">
        <p className="text-[10px] text-slate-600 font-mono italic m-0">
          {"$$Maturité = \\frac{\\sum_{p=1}^{n} (Performance_{p} \\times Importance_{p})}{Total_{Unités}}$$"}
        </p>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2563eb; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

// --- 🧩 COMPOSANTS DENSE SDE ---

function KPIBox({ label, value, icon, color, trend, sub }: any) {
  const c: any = { 
    emerald: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10", 
    blue: "text-blue-500 bg-blue-500/5 border-blue-500/10", 
    indigo: "text-indigo-500 bg-indigo-500/5 border-indigo-500/10", 
    amber: "text-amber-500 bg-amber-500/5 border-amber-500/10" 
  };
  return (
    <div className={`p-4 rounded-3xl border flex items-center justify-between shadow-xl backdrop-blur-md transition-transform hover:scale-[1.02] ${c[color]}`}>
      <div className="flex items-center gap-3 text-left">
        <div className="p-2 bg-black/20 rounded-xl">{icon}</div>
        <div className="flex flex-col">
          <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest leading-none mb-1 italic">{label}</span>
          <span className="text-[7px] font-bold uppercase text-slate-600 tracking-widest italic leading-none">{sub || "Calculé"}</span>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-2xl font-black italic m-0 text-white leading-none tracking-tighter">{value}</span>
        {trend && (
          <div className={`flex items-center gap-1 text-[8px] font-black mt-1 ${trend.color}`}>
            <trend.Icon size={10}/> {trend.val}
          </div>
        )}
      </div>
    </div>
  );
}

function AuditItem({ label, val, color }: any) {
  const c: any = { rose: "border-rose-500/20 text-rose-500", amber: "border-amber-500/20 text-amber-500", indigo: "border-indigo-500/20 text-indigo-500" };
  return (
    <div className={`p-4 bg-black/40 rounded-2xl border flex justify-between items-center italic transition-all hover:bg-white/5 ${c[color]}`}>
      <span className="text-[9px] font-black uppercase tracking-widest leading-none">{label}</span>
      <span className="text-2xl font-black text-white leading-none">{val}</span>
    </div>
  );
}