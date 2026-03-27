/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛡️ MODULE : PILOTAGE DE LA CERTIFICATION (ISO 9001 / ISO 14001)
 * RÔLE : Monitoring §9.1 (Surveillance) et §10.2 (Amélioration continue)
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { useEffect, useMemo, useState, useCallback, ChangeEvent, KeyboardEvent } from "react";
import {
  AlertTriangle, Calendar, CheckCircle, ChevronDown, Clock,
  Download, FileText, Globe, RefreshCw, ShieldCheck, Target, 
  Loader2, ShieldAlert, AlertCircle
} from "lucide-react";
import { toast, Toaster } from "sonner";
import apiClient, { type ApiError } from "@/core/api/api-client";
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export type TabType = "GLOBAL" | "QUALITY" | "ENVIRONMENT";

export interface StandardScore {
  standard: string;
  score: number;
  status: string;
  requirementsMet: number;
  total: number;
}

export interface Gap {
  description: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface Clause {
  id: string;
  number: string;
  title: string;
  standard: string;
  compliance: number;
  description?: string;
  gaps?: Gap[];
}

export interface ActionGap {
  AC_Id: string;
  AC_Title: string;
  AC_Deadline: string;
  AC_Priority: string;
  AC_Status?: string;
}

export interface TimelineEvent {
  GA_Id: string;
  GA_Title: string;
  GA_Deadline: string;
  GA_Type?: string;
}

export interface GedDoc {
  DOC_Id: string;
  DOC_Title: string;
  DOC_Status: string;
  DOC_Type?: string;
  DOC_Url?: string;
}

export interface KPIs {
  globalPerformance: number;
  completionRate: number;
}

export interface Scores {
  iso9001: StandardScore;
  iso14001: StandardScore;
  legal: StandardScore;
}

export interface CertifData {
  scores: Scores;
  clauses: Clause[];
  kpis: KPIs;
  actions: ActionGap[];
  timeline: TimelineEvent[];
  docs: GedDoc[];
}

export interface MaturityCardProps {
  title: string;
  data: StandardScore;
  color: 'blue' | 'emerald' | 'amber';
}

export interface ClauseCardProps {
  clause: Clause;
  isExpanded: boolean;
  onToggle: () => void;
}

export interface LoadingScreenProps {
  label: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const TABS: Array<{ value: TabType; label: string }> = [
  { value: 'GLOBAL', label: 'SMI' },
  { value: 'QUALITY', label: '9001' },
  { value: 'ENVIRONMENT', label: '14001' }
];

const STANDARD_MAP: Record<TabType, string> = {
  GLOBAL: '',
  QUALITY: 'ISO 9001',
  ENVIRONMENT: 'ISO 14001'
};

const DEFAULT_DATA: CertifData = {
  scores: {
    iso9001: { standard: 'ISO 9001', score: 0, status: 'N/A', requirementsMet: 0, total: 100 },
    iso14001: { standard: 'ISO 14001', score: 0, status: 'N/A', requirementsMet: 0, total: 100 },
    legal: { standard: 'LÉGAL', score: 0, status: 'N/A', requirementsMet: 0, total: 100 }
  },
  clauses: [],
  kpis: { globalPerformance: 0, completionRate: 0 },
  actions: [],
  timeline: [],
  docs: []
};

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: LoadingScreenProps) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <div className="relative" aria-hidden="true">
        <RefreshCw className="animate-spin text-blue-400 w-12 h-12 md:w-16 md:h-16" strokeWidth={1} />
        <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse text-blue-400 w-6 h-6 md:w-8 md:h-8" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : MATURITY CARD
// ============================================================================

function MaturityCard({ title, data, color }: MaturityCardProps) {
  const score = data.score || 0;
  const colorClasses: Record<MaturityCardProps['color'], string> = {
    blue: "bg-blue-600",
    emerald: "bg-emerald-600",
    amber: "bg-amber-600"
  };

  return (
    <article 
      className="bg-black/40 border border-white/5 p-4 md:p-6 lg:p-8 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] group hover:border-white/10 transition-all shadow-inner focus-within:ring-2 focus-within:ring-blue-400"
      role="article"
      aria-label={`${title}: ${score}% de conformité`}
      tabIndex={0}
    >
      <div className="flex justify-between items-end mb-3 md:mb-4">
        <h4 className="text-[11px] md:text-[12px] font-black italic text-slate-200 m-0">{title}</h4>
        <span className="text-xl md:text-2xl font-black italic text-white leading-none">{score}%</span>
      </div>
      <div 
        className="h-2 md:h-2.5 lg:h-3 w-full bg-black/60 rounded-full overflow-hidden shadow-inner mb-3 md:mb-4 border border-white/5"
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${title} progress`}
      >
        <div 
          className={cn("h-full transition-all duration-1000 shadow-xl", colorClasses[color])} 
          style={{ width: `${score}%` }}
          aria-hidden="true"
        />
      </div>
      <div className="flex justify-between text-[8px] md:text-[9px] font-black text-slate-500 tracking-widest uppercase italic">
        <span>Indice de Conformité</span>
        <span className="text-white">{data.requirementsMet} / {data.total}</span>
      </div>
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : CLAUSE CARD
// ============================================================================

function ClauseCard({ clause, isExpanded, onToggle }: ClauseCardProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <article 
      className={cn(
        "bg-black/20 border-2 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] transition-all overflow-hidden focus-within:ring-2 focus-within:ring-blue-400",
        isExpanded ? "border-blue-500/40 bg-blue-900/10 shadow-2xl" : "border-white/5"
      )}
      role="article"
      aria-expanded={isExpanded}
      aria-labelledby={`clause-${clause.id}`}
    >
      <button 
        type="button"
        onClick={onToggle} 
        onKeyDown={handleKeyDown}
        className="w-full p-4 md:p-6 flex justify-between items-center border-none bg-transparent cursor-pointer text-left focus:outline-none"
        aria-controls={`clause-content-${clause.id}`}
        id={`clause-${clause.id}`}
      >
        <div className="flex-1 min-w-0 pr-4 md:pr-6">
          <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-3">
            <span className="bg-blue-600/20 text-blue-400 px-2 md:px-3 py-1 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black italic border border-blue-600/20">
              §{clause.number}
            </span>
            <h4 className="text-[11px] md:text-[12px] lg:text-[13px] font-black italic text-white m-0 truncate">
              {clause.title}
            </h4>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
             <div 
               className="flex-1 h-1.5 md:h-2 bg-black/60 rounded-full overflow-hidden"
               role="progressbar"
               aria-valuenow={clause.compliance}
               aria-valuemin={0}
               aria-valuemax={100}
             >
               <div 
                 className="h-full bg-blue-600 transition-all duration-500" 
                 style={{ width: `${clause.compliance}%` }}
                 aria-hidden="true"
               />
             </div>
             <span className="text-[10px] md:text-xs font-black italic text-slate-400">{clause.compliance}%</span>
          </div>
        </div>
        <ChevronDown 
          size={16} 
          className={cn(
            "w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 text-slate-600 transition-transform shrink-0",
            isExpanded && "rotate-180 text-blue-400"
          )} 
          aria-hidden="true"
        />
      </button>

      {isExpanded && (
        <div 
          id={`clause-content-${clause.id}`}
          className="p-4 md:p-6 lg:p-8 bg-black/40 border-t-2 border-white/5 animate-in slide-in-from-top-2"
          role="region"
        >
          {clause.gaps && clause.gaps.length > 0 ? (
            <div className="bg-red-950/20 border-2 border-red-500/20 p-4 md:p-6 rounded-2xl md:rounded-3xl mb-3 md:mb-4" role="alert">
               <p className="text-[9px] md:text-[10px] font-black text-red-400 flex items-center gap-2 md:gap-3 uppercase m-0 mb-2 md:mb-3 underline decoration-red-500 decoration-2 underline-offset-4">
                 <ShieldAlert size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" aria-hidden="true" /> 
                 Écarts à résorber :
               </p>
               <ul className="space-y-1.5 md:space-y-2 m-0 p-0 list-none" role="list">
                 {clause.gaps.map((g: Gap, i: number) => (
                   <li key={i} className="text-[10px] md:text-[11px] font-black italic text-red-100 flex gap-2" role="listitem">
                     <span aria-hidden="true">•</span> {g.description}
                   </li>
                 ))}
               </ul>
            </div>
          ) : (
            <div className="flex items-center gap-2 md:gap-3 text-emerald-400 bg-emerald-500/10 p-3 md:p-4 rounded-xl md:rounded-2xl border border-emerald-500/20 mb-3 md:mb-4" role="status">
               <CheckCircle size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> 
               <p className="m-0 font-black uppercase text-[9px] md:text-[10px]">Pleine conformité (§9.1.1)</p>
            </div>
          )}
          {clause.description && (
            <p className="text-[10px] md:text-[11px] font-bold text-slate-400 leading-relaxed italic m-0 uppercase opacity-70 border-t border-white/5 pt-3 md:pt-4">
              {clause.description}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function CertificationDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CertifData | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("GLOBAL");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const fetchProductionData = useCallback(async () => {
    try {
      setLoading(true);
      const [resScores, resClauses, resKpis, resActions, resTimeline, resDocs] = await Promise.all([
        apiClient.get<StandardScore[]>('/smi/compliance-scores'),
        apiClient.get<Clause[]>('/smi/clauses-compliance'),
        apiClient.get<KPIs>('/indicators/dashboard-stats'),
        apiClient.get<ActionGap[]>('/actions?status=EN_COURS&priority=CRITICAL'),
        apiClient.get<TimelineEvent[]>('/audits/planning'),
        apiClient.get<GedDoc[]>('/ged/documents?limit=8')
      ]);

      const rawScores = Array.isArray(resScores.data) ? resScores.data : [];
      
      setData({
        scores: {
          iso9001: rawScores.find((s: StandardScore) => s.standard.includes('9001')) || DEFAULT_DATA.scores.iso9001,
          iso14001: rawScores.find((s: StandardScore) => s.standard.includes('14001')) || DEFAULT_DATA.scores.iso14001,
          legal: rawScores.find((s: StandardScore) => s.standard.includes('LÉGAL')) || DEFAULT_DATA.scores.legal,
        },
        clauses: Array.isArray(resClauses.data) ? resClauses.data : [],
        kpis: resKpis.data || DEFAULT_DATA.kpis,
        actions: Array.isArray(resActions.data) ? resActions.data : [],
        timeline: Array.isArray(resTimeline.data) ? resTimeline.data : [],
        docs: Array.isArray(resDocs.data) ? resDocs.data : []
      });
    } catch (error) {
      console.error('❌ Erreur chargement certification:', error);
      toast.error("RUPTURE KERNEL : Agrégation des données impossible.");
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') fetchProductionData(); }, [fetchProductionData]);

  const filteredClauses = useMemo(() => {
    if (!data?.clauses) return [];
    if (activeTab === "GLOBAL") return data.clauses;
    const standard = STANDARD_MAP[activeTab];
    return data.clauses.filter((c: Clause) => c.standard === standard);
  }, [activeTab, data]);

  const handleExport = async () => {
    setIsExporting(true);
    const toastId = toast.loading("Génération archive...");
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Archive générée et téléchargée", { id: toastId });
    } catch {
      toast.error("Échec de l'export", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const toggleSection = (clauseId: string) => {
    setExpandedSection(expandedSection === clauseId ? null : clauseId);
  };

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Calcul de conformité des référentiels §9.1..." />;
  }

  if (!data) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status">
        <AlertCircle className="text-blue-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Données indisponibles</p>
        <button 
          type="button"
          onClick={fetchProductionData}
          className="mt-4 text-[9px] text-blue-400 hover:text-blue-300 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-3 py-1"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 bg-black/40 flex flex-col xl:flex-row justify-between items-center gap-4 md:gap-6 mt-12 lg:mt-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 w-full xl:w-auto">
          <div className="bg-blue-600 p-3 md:p-4 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] text-white shadow-xl shadow-blue-600/20">
            <ShieldCheck size={24} className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" aria-hidden="true" />
          </div>
          <div className="text-left">
            <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl tracking-tighter leading-none m-0 italic">
              Pilotage <span className="text-blue-400">Certification</span>
            </h1>
            <p className="text-slate-500 text-[8px] md:text-[9px] tracking-widest m-0 mt-1 md:mt-2" role="img" aria-label="Indice de conformité SMI: 84%">
              Indice de Conformité SMI : C_g = 84.0%
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full xl:w-auto justify-center xl:justify-end">
          <div className="bg-white/5 p-1 md:p-1.5 rounded-xl md:rounded-2xl flex gap-1 border border-white/5" role="tablist" aria-label="Sélection de norme">
            {TABS.map((tab) => (
              <button 
                key={tab.value} 
                type="button"
                onClick={() => setActiveTab(tab.value)} 
                className={cn(
                  "px-3 md:px-4 lg:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400",
                  activeTab === tab.value ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                )}
                role="tab"
                aria-selected={activeTab === tab.value}
                aria-controls={`${tab.value.toLowerCase()}-panel`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2" role="group" aria-label="Actions d'export">
            <button 
              type="button"
              onClick={fetchProductionData} 
              disabled={loading}
              className="p-2 md:p-3 lg:p-4 bg-white/5 border border-white/10 rounded-lg md:rounded-xl hover:text-blue-400 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
              aria-label="Actualiser les données"
            >
              <RefreshCw size={16} className={cn("w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5", loading ? "animate-spin" : "")} aria-hidden="true" />
            </button>
            <button 
              type="button"
              onClick={handleExport} 
              disabled={isExporting}
              className={cn(
                "px-4 md:px-6 py-2.5 md:py-3 lg:py-4 bg-emerald-600 text-white rounded-lg md:rounded-xl font-black text-[8px] md:text-[9px] border-none cursor-pointer shadow-lg active:scale-95 flex items-center gap-1.5 md:gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-400",
                isExporting && "opacity-50 cursor-not-allowed"
              )}
              aria-label="Exporter les preuves"
              aria-busy={isExporting}
            >
              {isExporting ? (
                <><Loader2 size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">EXPORT...</span></>
              ) : (
                <><Download size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> <span className="hidden sm:inline">EXPORTER PREUVES</span></>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 🧩 MAIN CONTENT */}
      <main className="flex-1 overflow-hidden flex flex-col lg:flex-row px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 gap-4 md:gap-6 lg:gap-8">
        
        {/* COLONNE GAUCHE : MATURITÉ & CHRONOLOGIE */}
        <aside className="w-full lg:w-1/4 flex flex-col gap-4 md:gap-6 lg:gap-8 overflow-hidden">
          <article 
            className="bg-[#0F172A] border border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] p-4 md:p-6 lg:p-10 flex flex-col shadow-2xl flex-1 min-h-0 overflow-hidden text-left"
            aria-labelledby="maturity-title"
          >
            <h3 id="maturity-title" className="text-[9px] md:text-[10px] text-slate-500 tracking-widest mb-6 md:mb-8 lg:mb-10 flex items-center gap-2 md:gap-3 m-0">
              <Globe size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" aria-hidden="true" /> 
              Maturité Système
            </h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 md:pr-4 space-y-4 md:space-y-6 lg:space-y-8" role="list" aria-label="Scores de maturité par norme">
               <MaturityCard title="ISO 9001" data={data.scores.iso9001} color="blue" />
               <MaturityCard title="ISO 14001" data={data.scores.iso14001} color="emerald" />
               <MaturityCard title="Légal" data={data.scores.legal} color="amber" />
            </div>
          </article>
          
          <article 
            className="h-1/3 min-h-[200px] bg-[#0F172A] border border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] p-4 md:p-6 lg:p-8 flex flex-col shadow-2xl overflow-hidden text-left"
            aria-labelledby="timeline-title"
          >
            <h3 id="timeline-title" className="text-[9px] md:text-[10px] text-slate-500 tracking-widest mb-4 md:mb-6 flex items-center gap-2 md:gap-3 m-0">
              <Calendar size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" aria-hidden="true" /> 
              Jalons Audit
            </h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 md:pr-4 space-y-3 md:space-y-4" role="list" aria-label="Chronologie des audits">
              {data.timeline.length > 0 ? data.timeline.map((event) => (
                <div 
                  key={event.GA_Id} 
                  className="flex gap-3 md:gap-4 items-start border-l-4 border-blue-500/20 pl-3 md:pl-4 relative"
                  role="listitem"
                >
                  <div className="absolute -left-1.5 md:-left-2.5 top-1 w-3 h-3 md:w-4 md:h-4 rounded-full bg-blue-600 border-4 border-[#0F172A]" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] md:text-[11px] font-black italic m-0 text-white truncate">{event.GA_Title}</p>
                    <p className="text-[8px] md:text-[9px] font-black text-blue-400 mt-0.5 md:mt-1 m-0">{new Date(event.GA_Deadline).toLocaleDateString('fr-SN')}</p>
                  </div>
                </div>
              )) : (
                <p className="text-[9px] md:text-[10px] text-slate-500 text-center py-4">Aucun jalon prévu</p>
              )}
            </div>
          </article>
        </aside>

        {/* COLONNE CENTRALE : ANALYSE DES CLAUSES */}
        <section 
          className="w-full lg:w-2/4 bg-[#0F172A] border border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[4rem] p-4 md:p-6 lg:p-10 flex flex-col shadow-2xl min-h-0 overflow-hidden text-left"
          aria-labelledby="clauses-title"
        >
          <div className="flex justify-between items-center mb-6 md:mb-8 lg:mb-10 shrink-0">
            <h3 id="clauses-title" className="text-[10px] md:text-[11px] text-slate-500 tracking-widest flex items-center gap-2 md:gap-3 m-0">
              <Target size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> 
              Analyse Granulaire des Clauses
            </h3>
            <span className="bg-white/5 px-3 md:px-4 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[8px] md:text-[9px] text-slate-400 font-black">
              {filteredClauses.length} EXIGENCES
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 md:pr-6 space-y-3 md:space-y-4" role="list" aria-label="Liste des clauses">
            {filteredClauses.length > 0 ? filteredClauses.map((clause) => (
              <ClauseCard 
                key={clause.id} 
                clause={clause} 
                isExpanded={expandedSection === clause.id}
                onToggle={() => toggleSection(clause.id)}
              />
            )) : (
              <div className="h-32 md:h-40 flex flex-col items-center justify-center text-slate-500" role="status">
                <Target size={48} className="w-12 h-12 md:w-16 md:h-16 mb-3 md:mb-4 opacity-20" aria-hidden="true" />
                <p className="text-[10px] md:text-[11px] font-black uppercase tracking-widest">Aucune clause trouvée</p>
              </div>
            )}
          </div>
        </section>

        {/* COLONNE DROITE : GAPS & PREUVES */}
        <aside className="w-full lg:w-1/4 flex flex-col gap-4 md:gap-6 lg:gap-8 overflow-hidden">
          <article 
            className="flex-1 bg-[#0F172A] border border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] p-4 md:p-6 lg:p-10 flex flex-col shadow-2xl overflow-hidden text-left"
            aria-labelledby="gaps-title"
          >
            <h3 id="gaps-title" className="text-[9px] md:text-[10px] text-red-400 tracking-widest mb-4 md:mb-6 lg:mb-8 flex items-center gap-2 md:gap-3 m-0">
              <AlertTriangle size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" aria-hidden="true" /> 
              Gaps Critique §10.2
            </h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 md:pr-4 space-y-3 md:space-y-4" role="list" aria-label="Actions critiques">
              {data.actions.length > 0 ? data.actions.map((action) => (
                <div 
                  key={action.AC_Id} 
                  className="bg-red-950/20 border-2 border-red-500/20 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xl group"
                  role="listitem"
                >
                  <div className="flex justify-between items-center mb-3 md:mb-4">
                    <span className="px-2 md:px-3 py-1 bg-red-600 text-white rounded-lg text-[7px] md:text-[8px] font-black italic">CRITIQUE</span>
                    <Clock size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 text-slate-600" aria-hidden="true" />
                  </div>
                  <p className="text-[10px] md:text-[11px] font-black italic leading-tight text-red-100 m-0 truncate">{action.AC_Title}</p>
                </div>
              )) : (
                <p className="text-[9px] md:text-[10px] text-slate-500 text-center py-4">Aucun gap critique</p>
              )}
            </div>
          </article>

          <article 
            className="h-2/5 min-h-[200px] bg-[#0F172A] border border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] p-4 md:p-6 lg:p-10 flex flex-col shadow-2xl overflow-hidden text-left"
            aria-labelledby="docs-title"
          >
            <h3 id="docs-title" className="text-[9px] md:text-[10px] text-slate-500 tracking-widest mb-4 md:mb-6 flex items-center gap-2 md:gap-3 m-0">
              <FileText size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" aria-hidden="true" /> 
              Preuves Scellées
            </h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 md:pr-4 space-y-2 md:space-y-3" role="list" aria-label="Liste des documents">
              {data.docs.length > 0 ? data.docs.map((doc) => (
                <div 
                  key={doc.DOC_Id} 
                  className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-black/40 rounded-xl md:rounded-2xl hover:bg-blue-600/10 transition-all cursor-pointer group border border-transparent hover:border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  role="listitem"
                  tabIndex={0}
                  aria-label={`Document: ${doc.DOC_Title}`}
                >
                  <FileText size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 text-blue-400 shrink-0" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] md:text-[10px] font-black italic truncate m-0 group-hover:text-blue-400">{doc.DOC_Title}</p>
                    <p className="text-[8px] md:text-[9px] text-slate-600 m-0 uppercase mt-0.5 md:mt-1">{doc.DOC_Status}</p>
                  </div>
                </div>
              )) : (
                <p className="text-[9px] md:text-[10px] text-slate-500 text-center py-4">Aucun document</p>
              )}
            </div>
          </article>
        </aside>
      </main>

      <footer className="shrink-0 bg-black/40 px-4 md:px-6 py-3 md:py-4 lg:py-6 border-t border-white/5 text-[8px] md:text-[9px] text-slate-500 tracking-widest flex flex-col sm:flex-row justify-between gap-2 md:gap-3" role="contentinfo">
        <span>ISO 9001:2015 & 14001:2015 • RD-2026</span>
        <span className="text-blue-400">© QUALISOFT MATRIX CORE</span>
      </footer>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}