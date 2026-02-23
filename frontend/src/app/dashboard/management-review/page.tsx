//* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🏛️ MODULE : REVUE DE DIRECTION (MANAGEMENT REVIEW ENGINE)
 * -------------------------------------------------------------------------
 * RÔLE : Arbitrage stratégique et validation de l'efficacité du SMI.
 * RÉFÉRENTIEL : types/elite-sde.ts (SCELLAGE PRISMA).
 * CONFORMITÉ : ISO 9001:2015 §9.3 (Éléments d'entrée et de sortie).
 * DESIGN : Cockpit Matrix Full-Space (max-w-500).
 * -------------------------------------------------------------------------
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FileBarChart, Download, Printer, ShieldCheck, TrendingUp, 
  AlertTriangle, CheckCircle2, Loader2, Target, Users, 
  ClipboardCheck, Calendar, ArrowUpRight, ArrowDownRight, 
  Minus, Plus, Edit3, Save, X, ChevronRight, Flag,
  FileText, BarChart3, Activity, Lock, LucideIcon, Fingerprint, Zap
} from 'lucide-react';
import { usePermissions } from '@/core/hooks/usePermissions';
import apiClient from '@/core/api/api-client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast, Toaster } from 'sonner';

// --- 🏗️ RÉFÉRENTIEL ÉLITE-SDE (PRISMA SCHEMA) ---
import { 
  NonConformite, 
  Action, 
  Processus, 
  NCStatus, 
  ActionStatus,
  Priority 
} from '@/types/elite-sde';

// --- 🔒 INTERFACES DE PRODUCTION ---

interface ReviewData {
  MR_Id?: string;
  MR_Period: string; // ex: "S1 2026"
  MR_Date: string;
  MR_Status: 'DRAFT' | 'VALIDATED' | 'ARCHIVED';
  MR_Summary: string;
  // Agrégations calculées en temps réel (Production)
  metrics: {
    globalPerformance: number;
    customerSatisfaction: number;
    auditMajor: number;
    auditMinor: number;
    processCount: number;
    criticalRisksCount: number;
  };
  previousPerformance?: number;
}

const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

export default function ManagementReviewPage() {
  const { user } = usePermissions();
  
  // --- ÉTATS DU NOYAU ---
  const [fetching, setFetching] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'processes' | 'risks' | 'decisions'>('overview');
  
  // --- DONNÉES SDE ---
  const [review, setReview] = useState<ReviewData | null>(null);
  const [editedSummary, setEditedSummary] = useState<string>('');

  /**
   * 📡 SYNCHRONISATION KERNEL
   * @description Extraction des indicateurs agrégés pour la période 2026.
   */
  const loadReview = useCallback(async () => {
    try {
      setFetching(true);
      const res = await apiClient.get('/smi/management-review/active');
      const data = res.data?.data || res.data;
      
      setReview(data);
      setEditedSummary(data?.MR_Summary || '');
    } catch (error) {
      toast.error("RUPTURE DE LIAISON STRATÉGIQUE : AUCUNE REVUE ACTIVE.");
      // Note : En production, on n'injecte plus de simulation ici.
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { loadReview(); }, [loadReview]);

  /**
   * 💾 SCELLAGE DE LA SYNTHÈSE (§9.3.2)
   */
  const handleSaveSummary = async () => {
    if (!review?.MR_Id) return;
    setIsSaving(true);
    const tid = toast.loading("Scellage de l'analyse directionnelle...");
    try {
      await apiClient.patch(`/smi/management-review/${review.MR_Id}`, { MR_Summary: editedSummary });
      setReview(prev => prev ? { ...prev, MR_Summary: editedSummary } : null);
      setIsEditing(false);
      toast.success("Analyse scellée avec succès.", { id: tid });
    } catch (error) {
      toast.error("Erreur de persistance SDE.", { id: tid });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 📊 CALCULATEUR DE TENDANCE SDE
   */
  const trend = useMemo(() => {
    const current = review?.metrics.globalPerformance ?? 0;
    const previous = review?.previousPerformance ?? 0;
    if (previous === 0) return { icon: Minus, color: 'text-slate-500', value: 'BASE' };
    const diff = current - previous;
    return {
      icon: diff > 0 ? ArrowUpRight : diff < 0 ? ArrowDownRight : Minus,
      color: diff > 0 ? 'text-emerald-500' : diff < 0 ? 'text-red-500' : 'text-slate-500',
      value: `${diff > 0 ? '+' : ''}${diff}%`
    };
  }, [review]);

  if (fetching) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-8">
      <Loader2 className="animate-spin text-blue-600" size={80} strokeWidth={1.5} />
      <p className="text-[11px] font-black uppercase text-blue-600 italic tracking-[1em] animate-pulse">Scanning Strategic Core...</p>
    </div>
  );

  return (
    <div className="p-16 bg-[#0B0F1A] min-h-screen ml-72 text-white italic font-sans text-left relative selection:bg-blue-600/30 overflow-x-hidden">
      <Toaster position="top-right" richColors />
      
      {/* 🔝 HEADER SOUVERAIN (max-w-500) */}
      <header className="mb-20 flex justify-between items-center w-full max-w-500 mx-auto border-b-4 border-white/5 pb-16">
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <span className={cn(
              "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.4em] border shadow-2xl italic",
              review?.MR_Status === 'VALIDATED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-600/10 text-blue-600 border-blue-600/20 animate-pulse'
            )}>
              STATUS : {review?.MR_Status || 'INITIALISATION'}
            </span>
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] flex items-center gap-4 italic">
              <Calendar size={18} className="text-blue-600" />
              INSTANCE : {review?.MR_Period || 'S1 2026'} • {format(new Date(), 'dd MMMM yyyy', { locale: fr })}
            </span>
          </div>
          <h1 className="text-8xl font-black uppercase italic tracking-tighter leading-none text-white">
            Revue de <span className="text-blue-600">Direction</span>
          </h1>
          <p className="text-slate-500 text-[13px] font-black uppercase tracking-[0.6em] italic">Qualisoft Elite RD 2030 • Décision Stratégique §9.3</p>
        </div>
        
        <div className="flex gap-8">
          <button onClick={() => window.print()} className="px-14 py-7 bg-white/5 border-2 border-white/10 rounded-[3rem] text-[12px] font-black uppercase flex items-center gap-6 hover:bg-white/10 transition-all cursor-pointer italic shadow-xl">
            <Printer size={28} /> Print Matrix
          </button>
          <button className="px-16 py-7 bg-blue-600 text-white rounded-[3rem] text-[12px] font-black uppercase flex items-center gap-6 shadow-4xl hover:bg-white hover:text-blue-600 transition-all border-none cursor-pointer italic">
            <Download size={28} /> Export Scellé PDF
          </button>
        </div>
      </header>

      {/* 🧭 NAVIGATION DYNAMIQUE */}
      <nav className="flex gap-6 mb-20 max-w-500 mx-auto w-full overflow-x-auto no-scrollbar">
        {(['overview', 'processes', 'risks', 'decisions'] as const).map((tabId) => {
          const icons = { overview: BarChart3, processes: Target, risks: AlertTriangle, decisions: Flag };
          const labels = { overview: "Synthèse Globale", processes: "Performance Processus", risks: "Analyse des Risques", decisions: "décisions & CAPA" };
          const Icon = icons[tabId];
          return (
            <button 
              key={tabId} 
              onClick={() => setActiveTab(tabId)} 
              className={cn(
                "flex items-center gap-5 px-12 py-5 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.3em] transition-all whitespace-nowrap border-none cursor-pointer italic shadow-inner",
                activeTab === tabId ? 'bg-white text-[#0B0F1A] shadow-4xl scale-105' : 'bg-white/5 text-slate-500 hover:text-white hover:bg-white/10'
              )}
            >
              <Icon size={20} /> {labels[tabId]}
            </button>
          );
        })}
      </nav>

      <div className="max-w-500 mx-auto w-full space-y-20">
        
        {/* 📊 GRILLE KPI PRODUCTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {[
            { label: "Indice de Maturité", value: `${review?.metrics.globalPerformance ?? 0}%`, icon: TrendingUp, color: "text-emerald-500", trend: trend.value, trendIcon: trend.icon, trendColor: trend.color },
            { label: "Satisfaction Client", value: `${review?.metrics.customerSatisfaction ?? 0}%`, icon: Users, color: "text-blue-500", trend: "ISO §9.1.2", trendIcon: CheckCircle2, trendColor: "text-blue-400" },
            { label: "Unités de Pilotage", value: review?.metrics.processCount ?? 0, icon: Target, color: "text-indigo-500", trend: "Processus", trendIcon: Activity, trendColor: "text-indigo-400" },
            { label: "Écarts d'Audit", value: (review?.metrics.auditMajor ?? 0) + (review?.metrics.auditMinor ?? 0), icon: ClipboardCheck, color: "text-amber-500", trend: `${review?.metrics.auditMajor ?? 0} Majeur(s)`, trendIcon: AlertTriangle, trendColor: "text-red-500" },
          ].map((stat, i) => (
            <div key={i} className="bg-[#151A2D] p-10 rounded-[4rem] border-2 border-white/5 shadow-4xl relative group overflow-hidden transition-all hover:border-blue-600/30">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                  <div className={cn("p-6 rounded-3xl bg-black/40 shadow-inner group-hover:scale-110 transition-transform", stat.color)}>
                    <stat.icon size={36} />
                  </div>
                  <div className={cn("flex items-center gap-3 text-[10px] font-black uppercase px-4 py-2 rounded-full border-2 border-white/5 bg-[#0B0F1A]", stat.trendColor)}>
                    <stat.trendIcon size={14} /> {stat.trend}
                  </div>
                </div>
                <p className="text-[12px] font-black text-slate-500 uppercase tracking-[0.5em] mb-4 italic leading-none">{stat.label}</p>
                <p className="text-7xl font-black text-white italic tracking-tighter leading-none">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 📄 ANALYSE RQ (§9.3.2) */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-12 gap-16 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            
            {/* SÉANCE DE RÉDACTION STRATÉGIQUE */}
            <div className="col-span-12 lg:col-span-8 bg-[#151A2D] rounded-[5rem] p-16 text-white relative overflow-hidden shadow-4xl border-2 border-white/5 group">
              <div className="relative z-10 space-y-12">
                <div className="flex items-center justify-between border-b-2 border-white/5 pb-10">
                  <h3 className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-8">
                    <Zap className="text-blue-500" size={40} /> Constat d&apos;Analyse de Direction
                  </h3>
                  <div className="flex gap-6">
                    {!isEditing ? (
                      <button onClick={() => setIsEditing(true)} className="p-6 bg-white/5 hover:bg-blue-600 rounded-3xl transition-all border-none cursor-pointer text-white shadow-xl">
                        <Edit3 size={24} />
                      </button>
                    ) : (
                      <div className="flex gap-4">
                        <button onClick={handleSaveSummary} disabled={isSaving} className="p-6 bg-emerald-600 hover:bg-white hover:text-emerald-600 rounded-3xl transition-all border-none cursor-pointer text-white shadow-xl">
                          {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                        </button>
                        <button onClick={() => {setIsEditing(false); setEditedSummary(review?.MR_Summary || '')}} className="p-6 bg-red-600/10 hover:bg-red-600 text-white rounded-3xl transition-all border-none cursor-pointer">
                          <X size={24} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {!isEditing ? (
                  <div className="text-3xl text-slate-300 font-medium leading-relaxed italic whitespace-pre-wrap first-letter:text-9xl first-letter:font-black first-letter:text-blue-600 first-letter:mr-8 first-letter:float-left first-letter:leading-none">
                    {review?.MR_Summary || "EN ATTENTE DE SCELLAGE PAR LE RESPONSABLE QUALITÉ."}
                  </div>
                ) : (
                  <textarea 
                    value={editedSummary} 
                    onChange={(e) => setEditedSummary(e.target.value)} 
                    className="w-full h-125 bg-black/40 border-4 border-white/5 rounded-[4rem] p-16 text-2xl text-white font-medium italic focus:border-blue-600 outline-none resize-none transition-all shadow-inner leading-relaxed" 
                    placeholder="RÉDIGER LA CONCLUSION STRATÉGIQUE (§9.3.3)..."
                  />
                )}
              </div>
              <FileBarChart className="absolute -right-40 -bottom-40 text-white/2 pointer-events-none" size={600} />
            </div>

            {/* FOCUS CONFORMITÉ & CERTIFICATION */}
            <div className="col-span-12 lg:col-span-4 space-y-12">
              <div className="bg-[#151A2D] rounded-[5rem] p-12 border-2 border-white/5 shadow-4xl relative overflow-hidden group">
                <h3 className="text-2xl font-black uppercase text-white mb-12 flex items-center gap-6 italic tracking-tight leading-none">
                  <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-600/20 shadow-lg group-hover:rotate-12 transition-transform">
                    <ShieldCheck size={32} className="text-blue-500" />
                  </div>
                  Conformité Audits
                </h3>
                <div className="space-y-6">
                  <div className="p-8 bg-black/40 rounded-[2.5rem] border-2 border-red-600/20 flex justify-between items-center italic">
                    <span className="text-[12px] font-black uppercase text-red-500">Majeurs</span>
                    <span className="text-5xl font-black text-white">{review?.metrics.auditMajor ?? 0}</span>
                  </div>
                  <div className="p-8 bg-black/40 rounded-[2.5rem] border-2 border-amber-600/20 flex justify-between items-center italic">
                    <span className="text-[12px] font-black uppercase text-amber-500">Mineurs</span>
                    <span className="text-5xl font-black text-white">{review?.metrics.auditMinor ?? 0}</span>
                  </div>
                  <div className="p-8 bg-black/40 rounded-[2.5rem] border-2 border-blue-600/20 flex justify-between items-center italic text-left">
                    <span className="text-[12px] font-black uppercase text-blue-500">Pistes Progrès</span>
                    <span className="text-5xl font-black text-white">0</span>
                  </div>
                </div>
              </div>

              {/* BADGE SDE RD 2030 */}
              <div className="bg-blue-600 rounded-[5rem] p-12 text-white shadow-4xl relative overflow-hidden group">
                 <div className="relative z-10 flex items-center justify-between">
                    <div className="space-y-4">
                      <p className="text-[12px] font-black uppercase tracking-[0.5em] text-blue-200 italic leading-none">Status Certification</p>
                      <p className="text-4xl font-black italic tracking-tighter leading-none">ISO 9001:2015</p>
                    </div>
                    <Fingerprint size={80} className="text-white/20 group-hover:text-white/40 transition-all" />
                 </div>
                 <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🔐 FOOTER SDE (§9.3.3) */}
      <footer className="mt-40 pt-16 border-t-8 border-white/5 flex flex-col md:flex-row justify-between items-center gap-12 max-w-500 mx-auto w-full opacity-40 group">
        <div className="flex items-center gap-10">
          <Fingerprint size={60} className="text-blue-600 group-hover:rotate-360 transition-all duration-4000" strokeWidth={2.5} />
          <div className="text-left">
            <p className="text-[16px] font-black uppercase tracking-[1.5em] text-slate-500 italic leading-none">Qualisoft Management Moteur</p>
            <p className="text-[12px] font-bold text-slate-700 uppercase tracking-[0.8em] mt-4 italic leading-none">Elite RD 2030 Matrix • Integrated Compliance Hub</p>
          </div>
        </div>
        <div className="flex items-center gap-10">
          <div className="flex flex-col items-end italic">
             <span className="text-[12px] font-black text-slate-600 uppercase tracking-widest mb-2">Elite Matrix BD</span>
             <div className="flex gap-4">
               <div className="w-4 h-4 rounded-full bg-blue-600 animate-pulse shadow-[0_0_15px_blue]" />
               <div className="w-4 h-4 rounded-full bg-emerald-600" />
             </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        textarea::placeholder { font-style: italic; opacity: 0.1; font-weight: 900; text-transform: uppercase; letter-spacing: 0.4em; color: white; }
      `}</style>
    </div>
  );
}