/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🏛️ MODULE : REVUE DE DIRECTION STRATÉGIQUE §9.3 (ISO 9001)
 * RÔLE : Analyse directionnelle scellée et calcul de maturité
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useState, useEffect, useMemo, useCallback, ChangeEvent } from 'react';
import { 
  FileBarChart, Download, Printer, ShieldCheck, TrendingUp, 
  Loader2, Target, Users, ClipboardCheck, Calendar, ArrowUpRight, 
  ArrowDownRight, Minus, Edit3, Save, X, Zap, Fingerprint, RefreshCcw
} from 'lucide-react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export type ReviewStatus = 'DRAFT' | 'IN_PROGRESS' | 'VALIDATED' | 'ARCHIVED';
export type TabType = 'overview' | 'processes' | 'risks' | 'decisions';

export interface ReviewMetrics {
  globalPerformance: number;
  customerSatisfaction: number;
  processCount: number;
  auditMajor: number;
  auditMinor: number;
  criticalRisksCount: number;
}

export interface ManagementReview {
  MR_Id: string;
  MR_Status: ReviewStatus;
  MR_Period: string;
  MR_Summary: string;
  MR_DateCreated: string;
  MR_DateValidated?: string;
  MR_ValidatedBy?: string;
  metrics: ReviewMetrics;
  previousPerformance?: number;
}

export interface KPIBoxProps {
  label: string;
  val: string | number;
  icon: React.ElementType;
  color: 'emerald' | 'blue' | 'indigo' | 'amber';
  trend?: { val: string; color: string; Icon: React.ElementType };
  sub?: string;
}

export interface AuditItemProps {
  label: string;
  val: number;
  color: 'rose' | 'amber' | 'indigo';
}

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCcw className="animate-spin text-blue-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : KPI BOX
// ============================================================================

function KPIBox({ label, val, icon: Icon, color, trend, sub }: KPIBoxProps) {
  const colors: Record<KPIBoxProps['color'], string> = { 
    emerald: "text-emerald-400 border-emerald-500/10", 
    blue: "text-blue-400 border-blue-500/10", 
    indigo: "text-indigo-400 border-indigo-500/10", 
    amber: "text-amber-400 border-amber-500/10" 
  };
  
  return (
    <article className={cn("bg-[#0F172A] p-6 md:p-8 rounded-2xl md:rounded-3xl border-2 flex items-center justify-between shadow-2xl transition-all hover:-translate-y-1 focus-within:ring-2 focus-within:ring-blue-400", colors[color])}>
      <div className="flex items-center gap-4 md:gap-5 text-left">
        <div className="p-3 md:p-4 bg-black/40 rounded-xl md:rounded-2xl shadow-inner">
          <Icon size={20} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] md:text-[10px] text-slate-500 tracking-widest mb-0.5 md:mb-1 italic leading-none">{label}</span>
          <span className="text-[8px] md:text-[9px] text-slate-700 italic tracking-widest leading-none uppercase">{sub || "Calcul SDE"}</span>
        </div>
      </div>
      <div className="text-right flex flex-col items-end gap-1 md:gap-2">
        <span className="text-3xl md:text-4xl font-black italic m-0 tracking-tighter leading-none text-white">{val}</span>
        {trend && (
          <div className={cn("text-[9px] md:text-[10px] flex items-center gap-1", trend.color)}>
            <trend.Icon size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden="true"/> 
            {trend.val}
          </div>
        )}
      </div>
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : AUDIT ITEM
// ============================================================================

function AuditItem({ label, val, color }: AuditItemProps) {
  const colors: Record<AuditItemProps['color'], string> = { 
    rose: "border-rose-500/20 text-rose-400", 
    amber: "border-amber-500/20 text-amber-400", 
    indigo: "border-indigo-500/20 text-indigo-400" 
  };
  
  return (
    <div className={cn("p-4 md:p-6 bg-black/40 rounded-2xl md:rounded-3xl border flex justify-between items-center transition-all hover:translate-x-1 md:hover:translate-x-2", colors[color])}>
      <span className="text-[10px] md:text-[11px] font-black tracking-widest m-0 leading-none">{label}</span>
      <span className="text-3xl md:text-4xl font-black text-white leading-none tracking-tighter">{val}</span>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function ManagementReviewPage() {
  const [fetching, setFetching] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [review, setReview] = useState<ManagementReview | null>(null);
  const [editedSummary, setEditedSummary] = useState<string>('');

  const loadReview = useCallback(async () => {
    try {
      setFetching(true);
      const res = await apiClient.get<ManagementReview>('/smi/management-review/active');
      const data = res.data?.data || res.data;
      if (data) {
        setReview(data);
        setEditedSummary(data.MR_Summary || '');
      }
    } catch (error) {
      console.error('❌ Erreur chargement revue:', error);
      toast.error("ÉCHEC DE RÉCUPÉRATION DU NOYAU STRATÉGIQUE");
    } finally { 
      setFetching(false); 
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') loadReview(); }, [loadReview]);

  const trend = useMemo(() => {
    const current = review?.metrics?.globalPerformance ?? 0;
    const previous = review?.previousPerformance ?? 0;
    const diff = current - previous;
    return {
      val: `${diff > 0 ? '+' : ''}${diff}%`,
      color: diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-rose-400' : 'text-slate-500',
      Icon: diff > 0 ? ArrowUpRight : diff < 0 ? ArrowDownRight : Minus
    };
  }, [review]);

  const handleSaveSummary = async () => {
    if (!review) return;
    setIsSaving(true);
    const toastId = toast.loading("Enregistrement de l'analyse...");
    try {
      await apiClient.put(`/smi/management-review/${review.MR_Id}/summary`, { summary: editedSummary });
      toast.success("Analyse directionnelle enregistrée", { id: toastId });
      setIsEditing(false);
      loadReview();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "Erreur d'enregistrement", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  if (fetching && typeof window !== 'undefined') {
    return <LoadingScreen label="Extraction du Noyau Stratégique §9.3..." />;
  }

  const tabs: Array<{ id: TabType; label: string }> = [
    { id: 'overview', label: 'Synthèse Globale' },
    { id: 'processes', label: 'Performance Processus' },
    { id: 'risks', label: 'Analyse Risques' },
    { id: 'decisions', label: 'Décisions CAPA' },
  ];

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 gap-4 md:gap-6">
        <div className="text-left space-y-2 md:space-y-3 w-full xl:w-auto">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
             <span className={cn(
               "px-3 md:px-4 py-1 md:py-1.5 rounded-lg text-[8px] md:text-[9px] border italic",
               review?.MR_Status === 'VALIDATED' 
                 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                 : 'bg-blue-600/10 text-blue-400 border-blue-600/20'
             )}>
               SDE-STATUS : {review?.MR_Status || 'EN ATTENTE'}
             </span>
             <span className="text-[8px] md:text-[9px] text-slate-500 flex items-center gap-1.5 md:gap-2 italic tracking-widest">
               <Calendar size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden="true"/> 
               {review?.MR_Period || 'Q1-2026'}
             </span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter leading-none m-0">Revue de <span className="text-blue-400">Direction</span></h1>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-center xl:justify-end">
          <button 
            type="button"
            onClick={() => window.print()} 
            className="p-2.5 md:p-3 lg:p-4 bg-white/5 rounded-xl md:rounded-2xl text-slate-400 hover:text-white border border-white/10 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Imprimer le rapport"
            title="Imprimer"
          >
            <Printer size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
          </button>
          <button 
            type="button"
            className="bg-blue-600 hover:bg-white hover:text-blue-700 px-4 md:px-6 lg:px-8 lg:px-10 py-2.5 md:py-3 lg:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] flex items-center gap-2 md:gap-3 border-none shadow-2xl cursor-pointer text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Exporter le rapport SDE"
          >
            <Download size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-4.5 lg:h-4.5" aria-hidden="true"/> 
            <span className="hidden sm:inline">Exporter Rapport SDE</span>
          </button>
        </div>
      </header>

      {/* 🧭 NAVIGATION & KPI */}
      <div className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 pb-0 space-y-4 md:space-y-6 lg:space-y-8">
        <nav className="flex gap-2 md:gap-3 overflow-x-auto pb-2 custom-scrollbar" role="tablist" aria-label="Navigation des onglets de revue">
          {tabs.map((t) => (
            <button 
              key={t.id} 
              type="button"
              onClick={() => setActiveTab(t.id)} 
              className={cn(
                "px-4 md:px-6 lg:px-8 py-2 md:py-3 lg:py-4 rounded-xl md:rounded-2xl text-[8px] md:text-[9px] lg:text-[10px] transition-all border-none cursor-pointer italic whitespace-nowrap shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400",
                activeTab === t.id ? 'bg-white text-slate-900 scale-105' : 'bg-white/5 text-slate-500 hover:text-white'
              )}
              role="tab"
              aria-selected={activeTab === t.id}
              aria-controls={`${t.id}-panel`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6" aria-label="Indicateurs de performance">
          <KPIBox label="Maturité SMI" val={`${review?.metrics?.globalPerformance ?? 0}%`} icon={TrendingUp} color="emerald" trend={trend} />
          <KPIBox label="Satisfaction" val={`${review?.metrics?.customerSatisfaction ?? 0}%`} icon={Users} color="blue" sub="ISO §9.1.2" />
          <KPIBox label="Unités Pilotes" val={review?.metrics?.processCount ?? 0} icon={Target} color="indigo" sub="Unités Actives" />
          <KPIBox label="Gaps Audits" val={(review?.metrics?.auditMajor ?? 0) + (review?.metrics?.auditMinor ?? 0)} icon={ClipboardCheck} color="amber" sub={`${review?.metrics?.auditMajor ?? 0} Majeur(s)`} />
        </section>
      </div>

      {/* 🧩 ZONE D'ANALYSE */}
      <main className="flex-1 overflow-hidden px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8">
        <section className="col-span-12 lg:col-span-8 bg-[#0F172A] border-2 border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[4rem] flex flex-col overflow-hidden shadow-2xl relative">
          <header className="p-4 md:p-6 lg:p-8 border-b border-white/5 flex justify-between items-center bg-black/20 shrink-0">
            <h3 className="text-lg md:text-xl m-0 flex items-center gap-3 md:gap-4">
              <Zap className="text-blue-400 w-5 h-5 md:w-6 md:h-6 lg:w-6 lg:h-6 animate-pulse" aria-hidden="true"/> 
              Analyse Directionnelle §9.3.2
            </h3>
            {!isEditing ? (
              <button 
                type="button"
                onClick={() => setIsEditing(true)} 
                className="p-2 md:p-3 lg:p-4 bg-white/5 hover:bg-blue-600 rounded-xl md:rounded-2xl transition-all border-none cursor-pointer text-white shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Modifier l'analyse"
              >
                <Edit3 size={16} className="w-4 h-4 md:w-5 md:h-5 lg:w-4.5 lg:h-4.5" aria-hidden="true"/>
              </button>
            ) : (
              <div className="flex gap-2 md:gap-3 animate-in zoom-in-95">
                <button 
                  type="button"
                  onClick={handleSaveSummary} 
                  disabled={isSaving}
                  className={cn(
                    "p-2 md:p-3 lg:p-4 bg-emerald-600 rounded-xl md:rounded-2xl border-none cursor-pointer text-white shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-400",
                    isSaving && "opacity-70 cursor-wait"
                  )}
                  aria-label="Enregistrer l'analyse"
                >
                  <Save size={16} className="w-4 h-4 md:w-5 md:h-5 lg:w-4.5 lg:h-4.5" aria-hidden="true"/>
                </button>
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)} 
                  className="p-2 md:p-3 lg:p-4 bg-rose-600/20 rounded-xl md:rounded-2xl border-none cursor-pointer text-white shadow-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
                  aria-label="Annuler la modification"
                >
                  <X size={16} className="w-4 h-4 md:w-5 md:h-5 lg:w-4.5 lg:h-4.5" aria-hidden="true"/>
                </button>
              </div>
            )}
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 lg:p-12 text-left">
            {isEditing ? (
              <textarea
                value={editedSummary}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEditedSummary(e.target.value)}
                className="w-full h-full bg-transparent text-xl md:text-2xl text-slate-300 font-bold leading-relaxed italic whitespace-pre-wrap outline-none resize-none"
                placeholder="Saisir l'analyse stratégique..."
                aria-label="Zone de saisie de l'analyse directionnelle"
              />
            ) : (
              <div className="text-xl md:text-2xl text-slate-300 font-bold leading-relaxed italic whitespace-pre-wrap first-letter:text-5xl md:first-letter:text-6xl lg:first-letter:text-7xl first-letter:text-blue-400 first-letter:float-left first-letter:mr-3 md:first-letter:mr-4">
                {review?.MR_Summary || "EN ATTENTE D'ANALYSE STRATÉGIQUE POUR LA PÉRIODE ACTIVE..."}
              </div>
            )}
          </div>
        </section>

        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-4 md:gap-6 lg:gap-8">
           <article className="bg-[#0F172A] border-2 border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] p-6 md:p-8 lg:p-10 shadow-2xl text-left">
              <h3 className="text-[10px] md:text-[11px] text-slate-500 tracking-widest mb-6 md:mb-8 flex items-center gap-2 md:gap-3">
                <ShieldCheck className="text-blue-400 w-4 h-4 md:w-4.5 md:h-4.5 lg:w-4 lg:h-4" aria-hidden="true"/> 
                Bilan des Audits §9.2
              </h3>
              <div className="space-y-3 md:space-y-4">
                <AuditItem label="Écarts Majeurs" val={review?.metrics?.auditMajor ?? 0} color="rose" />
                <AuditItem label="Écarts Mineurs" val={review?.metrics?.auditMinor ?? 0} color="amber" />
                <AuditItem label="Risques Critiques" val={review?.metrics?.criticalRisksCount ?? 0} color="indigo" />
              </div>
           </article>
           <article className="flex-1 bg-blue-600 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] p-6 md:p-8 lg:p-12 relative overflow-hidden group shadow-2xl flex flex-col justify-between text-left">
              <div className="relative z-10">
                <h4 className="text-3xl md:text-4xl lg:text-5xl font-black italic tracking-tighter m-0 leading-none">ISO 9001:2015</h4>
              </div>
              <div className="relative z-10 flex justify-between items-end">
                 <p className="text-[9px] md:text-[10px] tracking-widest leading-relaxed opacity-80 m-0">
                   Cycle de Surveillance :<br/>Septembre 2026
                 </p>
                 <Fingerprint size={48} className="w-12 h-12 md:w-14 md:h-14 lg:w-15 lg:h-15 text-white/20 group-hover:scale-110 group-hover:text-white/40 transition-all duration-700" aria-hidden="true" />
              </div>
              <div className="absolute -left-10 md:-left-20 -bottom-10 md:-bottom-20 w-48 h-48 md:w-64 md:h-64 bg-white/10 rounded-full blur-[60px] md:blur-[80px] pointer-events-none" aria-hidden="true" />
           </article>
        </aside>
      </main>

      <footer className="shrink-0 px-4 md:px-6 py-3 md:py-4 border-t border-white/5 flex justify-center items-center">
         <p className="text-[10px] md:text-[11px] text-slate-700 font-mono italic tracking-widest m-0">
           MATURITÉ = SUM(PERF_i * POIDS_i) / SUM(POIDS_i)
         </p>
      </footer>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}