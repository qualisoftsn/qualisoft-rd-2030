/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛡️ NOM ABSOLU : src/app/dashboard/tb-certif/page.tsx
 * -------------------------------------------------------------------------
 * FONCTION : Dashboard de Pilotage de la Certification et Conformité SMI.
 * RÔLE : Monitoring §9.1 (Surveillance) et §10.2 (Amélioration continue).
 * ARCHITECTURE : One-Pager (No-Scroll Global), Densité Haute, Multi-Tenant.
 * SÉCURITÉ : Zéro NextAuth. Synchronisation via apiClient & LocalStorage.
 * DATE DE RÉVISION : 02 Mars 2026 | 16:05 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Activity, AlertTriangle, Calendar, CheckCircle, ChevronDown, Clock,
  Download, FileText, Globe, RefreshCw, ShieldCheck, Target, 
  Loader2, Zap, ArrowUpRight
} from "lucide-react";
import { toast, Toaster } from "sonner";
import apiClient from "@/core/api/api-client";

// --- INTERFACES STRICTES (COMPLIANCE CORE) ---

interface StandardScore {
  standard: string;
  score: number;
  status: string;
  requirementsMet: number;
  total: number;
}

interface Clause {
  id: string;
  number: string;
  title: string;
  standard: string;
  compliance: number;
  description?: string;
  gaps?: { description: string }[];
}

interface ActionGap {
  AC_Id: string;
  AC_Title: string;
  AC_Deadline: string;
  AC_Priority: string;
}

interface TimelineEvent {
  GA_Id: string;
  GA_Title: string;
  GA_Deadline: string;
}

interface GedDoc {
  DOC_Id: string;
  DOC_Title: string;
  DOC_Status: string;
}

interface CertifData {
  scores: {
    iso9001: StandardScore;
    iso14001: StandardScore;
    legal: StandardScore;
  };
  clauses: Clause[];
  kpis: { globalPerformance: number; completionRate: number };
  actions: ActionGap[];
  timeline: TimelineEvent[];
  docs: GedDoc[];
}

export default function CertificationDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CertifData | null>(null);
  const [activeTab, setActiveTab] = useState<"GLOBAL" | "QUALITY" | "ENVIRONMENT">("GLOBAL");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  /**
   * 📡 SYNCHRONISATION DU NOYAU MASTER (PRODUCTION)
   * Extraction basée sur le TenantId stocké localement.
   */
  const fetchProductionData = useCallback(async () => {
    try {
      setLoading(true);
      
      const savedUser = localStorage.getItem('user');
      const tenantId = savedUser ? JSON.parse(savedUser).tenantId : null;

      const [resScores, resClauses, resKpis, resActions, resTimeline, resDocs] = await Promise.all([
        apiClient.get('/smi/compliance-scores'),
        apiClient.get('/smi/clauses-compliance'),
        apiClient.get('/indicators/dashboard-stats'),
        apiClient.get('/actions?status=EN_COURS&priority=CRITICAL'),
        apiClient.get('/audits/planning'),
        apiClient.get('/ged/documents?limit=8')
      ]);

      const rawScores = Array.isArray(resScores.data) ? resScores.data : [];
      
      setData({
        scores: {
          iso9001: rawScores.find((s: any) => s.standard.includes('9001')) || { score: 0, status: 'N/A', requirementsMet: 0, total: 100 },
          iso14001: rawScores.find((s: any) => s.standard.includes('14001')) || { score: 0, status: 'N/A', requirementsMet: 0, total: 100 },
          legal: rawScores.find((s: any) => s.standard.includes('LÉGAL') || s.standard.includes('LEGAL')) || { score: 0, status: 'N/A', requirementsMet: 0, total: 100 },
        },
        clauses: resClauses.data || [],
        kpis: resKpis.data || { globalPerformance: 0, completionRate: 0 },
        actions: resActions.data || [],
        timeline: resTimeline.data || [],
        docs: resDocs.data || []
      });
    } catch (error) {
      console.error("Master Sync Error:", error);
      toast.error("Échec de l'agrégation des données de certification.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProductionData(); }, [fetchProductionData]);

  /**
   * 📊 LOGIQUE DE FILTRAGE PAR RÉFÉRENTIEL
   */
  const filteredClauses = useMemo(() => {
    if (!data?.clauses) return [];
    if (activeTab === "GLOBAL") return data.clauses;
    const standardMap: Record<string, string> = { QUALITY: "ISO 9001", ENVIRONMENT: "ISO 14001" };
    return data.clauses.filter((c) => c.standard === standardMap[activeTab]);
  }, [activeTab, data]);

  if (loading || !data) {
    return (
      <div className="ml-0 lg:ml-80 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-6 p-4 text-center">
        <Loader2 className="animate-spin text-blue-500 w-12 h-12" />
        <p className="text-blue-500 font-black uppercase italic text-[10px] tracking-[0.5em] animate-pulse m-0">
          Calcul de conformité des référentiels en cours...
        </p>
      </div>
    );
  }

  return (
    <div className="ml-0 lg:ml-80 h-screen flex flex-col bg-[#0B0F1A] text-white font-sans p-4 lg:p-6 italic text-left selection:bg-blue-600/30 overflow-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🚀 HEADER STRATÉGIQUE (HAUTE DENSITÉ) */}
      <header className="shrink-0 mb-4 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600/20 p-3 rounded-2xl border border-blue-500/30 shadow-inner shrink-0">
            <ShieldCheck size={28} className="text-blue-500" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-black uppercase italic tracking-tighter leading-none m-0 flex items-center gap-3">
              Pilotage <span className="text-blue-600">Certification</span>
              <button onClick={fetchProductionData} className="p-1.5 bg-white/5 rounded-lg hover:text-blue-500 cursor-pointer border-none transition-colors"><RefreshCw size={14}/></button>
            </h1>
            <p className="text-slate-500 font-black text-[8px] lg:text-[9px] uppercase tracking-[0.4em] italic m-0 mt-1">
              SMI INTÉGRÉ • ISO 9001 & 14001 • VERSION 2026
            </p>
          </div>
        </div>

        {/* SÉLECTEUR DE RÉFÉRENTIEL */}
        <div className="flex bg-black/40 border border-white/5 rounded-xl p-1 shadow-inner w-full xl:w-auto overflow-x-auto custom-scrollbar-hide">
          {(["GLOBAL", "QUALITY", "ENVIRONMENT"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 xl:flex-none px-4 lg:px-6 py-2 text-[8px] lg:text-[9px] font-black uppercase tracking-widest transition-all rounded-lg border-none cursor-pointer italic whitespace-nowrap ${activeTab === tab ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-white hover:bg-white/5"}`}
            >
              {tab === "GLOBAL" ? "SMI Intégré" : tab === "QUALITY" ? "ISO 9001" : "ISO 14001"}
            </button>
          ))}
        </div>

        <div className="flex gap-2 w-full xl:w-auto">
          <button className="flex-1 xl:flex-none bg-white/5 border border-white/10 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-black uppercase text-[9px] flex items-center justify-center gap-2 transition-all cursor-pointer">
            <FileText size={14} /> Rapport
          </button>
          <button 
            onClick={() => { setIsExporting(true); toast.info("Génération archive des preuves..."); setTimeout(() => setIsExporting(false), 2000); }}
            className="flex-1 xl:flex-none bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 px-4 py-2 rounded-xl font-black uppercase text-[9px] flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Exporter Preuves
          </button>
        </div>
      </header>

      {/* 🏅 BADGES DE PROGRESSION GLOBALE (SLOT KPI) */}
      <div className="shrink-0 grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 mb-4">
        <CertificationBadge standard="ISO 9001" score={data.scores.iso9001.score} status={data.scores.iso9001.status} color="blue" />
        <CertificationBadge standard="ISO 14001" score={data.scores.iso14001.score} status={data.scores.iso14001.status} color="emerald" />
        <CertificationBadge standard="LÉGAL SÉNÉGAL" score={data.scores.legal.score} status={data.scores.legal.status} color="amber" />
        
        <div className="bg-[#151A2D] border border-white/5 rounded-2xl flex items-center justify-between px-4 lg:px-6 shadow-inner py-2">
           <div className="flex items-center gap-3 min-w-0">
             <Activity className="text-purple-500 shrink-0" size={24} />
             <div className="truncate">
               <p className="text-[8px] lg:text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] m-0">Indice SMI</p>
               <p className="text-lg lg:text-xl font-black italic m-0 text-white">{data.kpis.globalPerformance || 0}%</p>
             </div>
           </div>
           <div className="hidden sm:block h-1.5 w-16 xl:w-24 bg-black/50 rounded-full overflow-hidden shrink-0">
             <div className="h-full bg-purple-500 shadow-[0_0_10px_#a855f7]" style={{ width: `${data.kpis.globalPerformance || 0}%` }}/>
           </div>
        </div>
      </div>

      

      {/* 🧩 GRILLE PRINCIPALE DÉDIÉE (3 COLONNES) */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4">
        
        {/* COLONNE 1 : MATURITÉ & CHRONOLOGIE (25%) */}
        <div className="w-full lg:w-1/4 flex flex-col gap-4 min-h-0">
          <div className="flex-1 bg-[#151A2D] border border-white/5 rounded-3xl p-4 lg:p-5 flex flex-col shadow-2xl overflow-hidden">
            <h3 className="text-[9px] lg:text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-4 flex items-center gap-2 shrink-0 m-0"><Globe size={14}/> Maturité Système</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-4">
               <MaturityCard title="Qualité (ISO 9001)" data={data.scores.iso9001} color="bg-blue-600" />
               <MaturityCard title="Environnement (ISO 14001)" data={data.scores.iso14001} color="bg-emerald-600" />
               <MaturityCard title="Légal & Compliance" data={data.scores.legal} color="bg-amber-600" />
            </div>
          </div>
          
          <div className="h-1/3 bg-[#151A2D] border border-white/5 rounded-3xl p-4 lg:p-5 flex flex-col shadow-2xl overflow-hidden">
            <h3 className="text-[9px] lg:text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-3 flex items-center gap-2 shrink-0 m-0"><Calendar size={14}/> Jalons Audit</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3">
              {data.timeline.length > 0 ? data.timeline.map((event) => (
                <div key={event.GA_Id} className="flex gap-3 items-start border-l-2 border-blue-500/20 pl-3 relative">
                  <div className="absolute -left-1.5 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-[#151A2D] shadow-[0_0_8px_#2563eb]" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-black italic uppercase leading-tight m-0 text-slate-200 truncate">{event.GA_Title}</p>
                    <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mt-1 m-0">
                      {new Date(event.GA_Deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-[8px] text-slate-600 uppercase font-black italic m-0">Aucun jalon planifié.</p>
              )}
            </div>
          </div>
        </div>

        {/* COLONNE 2 : ANALYSE DES CLAUSES (50%) */}
        <div className="w-full lg:w-2/4 bg-[#151A2D] border border-white/5 rounded-3xl p-4 lg:p-5 flex flex-col shadow-2xl min-h-0">
          <div className="flex justify-between items-center shrink-0 mb-4">
            <h3 className="text-[9px] lg:text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] flex items-center gap-2 m-0"><Target size={14}/> Analyse Granulaire des Clauses</h3>
            <span className="px-2 py-0.5 bg-white/5 rounded-lg text-[7px] lg:text-[8px] font-black uppercase text-slate-500 tracking-widest">{filteredClauses.length} Exigences</span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {filteredClauses.length > 0 ? filteredClauses.map((clause) => (
              <ClauseComplianceCard
                key={clause.id}
                clause={clause}
                onExpand={() => setExpandedSection(expandedSection === clause.id ? null : clause.id)}
                isExpanded={expandedSection === clause.id}
              />
            )) : (
              <div className="flex flex-col items-center justify-center h-full opacity-30 text-center">
                 <Zap size={40} className="mb-3 text-slate-600" />
                 <p className="text-[9px] font-black uppercase tracking-[0.3em] m-0">En attente de l&apos;audit initial</p>
              </div>
            )}
          </div>
        </div>

        {/* COLONNE 3 : GAPS & PREUVES (25%) */}
        <div className="w-full lg:w-1/4 flex flex-col gap-4 min-h-0">
          <div className="flex-3 bg-[#151A2D] border border-white/5 rounded-3xl p-4 lg:p-5 flex flex-col shadow-2xl min-h-0">
            <h3 className="text-[9px] lg:text-[10px] font-black uppercase text-rose-500 tracking-[0.3em] mb-4 flex items-center gap-2 shrink-0 m-0"><AlertTriangle size={14}/> Gaps & Non-Conformités</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3">
              {data.actions.length > 0 ? data.actions.map((action) => (
                <div key={action.AC_Id} className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-3 hover:bg-rose-950/40 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[7px] font-black uppercase tracking-widest leading-none">CRITIQUE</span>
                    <span className="text-[8px] font-black text-slate-600 italic m-0">{new Date(action.AC_Deadline).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[9px] lg:text-[10px] font-black italic leading-tight uppercase line-clamp-2 m-0 text-rose-100">{action.AC_Title}</p>
                </div>
              )) : (
                 <div className="flex flex-col items-center justify-center h-full opacity-30">
                    <CheckCircle size={32} className="text-emerald-500 mb-2" />
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-center m-0">Aucune dérive signalée</p>
                 </div>
              )}
            </div>
          </div>

          <div className="flex-2 bg-[#151A2D] border border-white/5 rounded-3xl p-4 lg:p-5 flex flex-col shadow-2xl min-h-0">
            <h3 className="text-[9px] lg:text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-3 flex items-center gap-2 shrink-0 m-0"><FileText size={14}/> Preuves Scellées (GED)</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2">
              {data.docs.length > 0 ? data.docs.map((doc) => (
                <div key={doc.DOC_Id} className="flex items-center gap-3 p-2.5 bg-black/40 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group border border-transparent hover:border-white/10">
                  <div className="p-1.5 bg-blue-600/10 text-blue-500 rounded-lg border border-blue-500/10 shrink-0"><FileText size={12}/></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-black uppercase italic truncate m-0 group-hover:text-blue-400 transition-colors">{doc.DOC_Title}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <span className={`w-1.5 h-1.5 rounded-full ${doc.DOC_Status === 'VALIDE' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                       <span className="text-[7px] text-slate-600 uppercase tracking-widest m-0">{doc.DOC_Status}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-[8px] text-slate-600 uppercase font-black italic m-0">Registre GED vierge.</p>
              )}
            </div>
          </div>
        </div>

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37,99,235,0.4); }
        .custom-scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

// ============================================================================
// 🧩 COMPOSANTS D'INTERFACE (ATOMIQUES)
// ============================================================================

function CertificationBadge({ standard, score, status, color }: { standard: string, score: number, status: string, color: 'blue' | 'emerald' | 'amber' }) {
  const themes = {
    blue: { bg: "bg-blue-600/10 border-blue-500/20 text-blue-400", bar: "bg-blue-500" },
    emerald: { bg: "bg-emerald-600/10 border-emerald-500/20 text-emerald-500", bar: "bg-emerald-500" },
    amber: { bg: "bg-amber-600/10 border-amber-500/20 text-amber-500", bar: "bg-amber-500" },
  };

  return (
    <div className={`p-3 lg:p-4 rounded-2xl border flex flex-col justify-center shadow-inner ${themes[color].bg}`}>
      <div className="flex justify-between items-center mb-1.5 lg:mb-2">
        <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-[0.15em] lg:tracking-[0.2em] italic leading-none">{standard}</span>
        <span className="text-xs lg:text-sm font-black italic leading-none">{score}%</span>
      </div>
      <div className="h-1 lg:h-1.5 w-full bg-black/40 rounded-full overflow-hidden mb-1.5">
        <div className={`h-full ${themes[color].bar} transition-all duration-1000`} style={{ width: `${score}%` }} />
      </div>
      <p className="text-[7px] font-black uppercase tracking-widest opacity-90 m-0 truncate text-white">{status || 'EN ATTENTE'}</p>
    </div>
  );
}

function MaturityCard({ title, data, color }: { title: string, data: StandardScore, color: string }) {
  const score = data.score || 0;
  return (
    <div className="bg-black/40 border border-white/5 p-4 rounded-2xl group hover:border-white/10 transition-colors">
      <div className="flex justify-between items-end mb-3">
        <h4 className="text-[10px] lg:text-[11px] font-black uppercase italic text-slate-200 m-0 leading-none truncate pr-2">{title}</h4>
        <span className="text-lg font-black italic leading-none text-white shrink-0">{score}%</span>
      </div>
      <div className="h-2 w-full bg-black/60 rounded-full overflow-hidden shadow-inner mb-3">
        <div className={`h-full ${color} transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.1)]`} style={{ width: `${score}%` }} />
      </div>
      <div className="flex justify-between text-[8px] font-black uppercase text-slate-600 tracking-widest m-0">
        <span>Conformité</span>
        <span className="text-slate-400">{data.requirementsMet} / {data.total}</span>
      </div>
    </div>
  );
}

function ClauseComplianceCard({ clause, onExpand, isExpanded }: { clause: Clause, onExpand: () => void, isExpanded: boolean }) {
  const compliance = clause.compliance || 0;
  return (
    <div className={`bg-black/20 border rounded-2xl overflow-hidden transition-all duration-300 ${isExpanded ? "border-blue-500/40 bg-blue-900/10 shadow-lg" : "border-white/5 hover:border-white/10"}`}>
      <button onClick={onExpand} className="w-full p-4 text-left flex justify-between items-center border-none bg-transparent cursor-pointer group">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[7px] font-black bg-blue-600/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-600/30 italic tracking-widest shrink-0">
              §{clause.number}
            </span>
            <h4 className="text-[11px] lg:text-[12px] font-black uppercase italic tracking-tighter text-white truncate m-0">
              {clause.title}
            </h4>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1 bg-black/60 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ${compliance >= 85 ? "bg-emerald-500" : compliance >= 60 ? "bg-blue-500" : "bg-amber-500"}`} style={{ width: `${compliance}%` }} />
            </div>
            <span className={`text-[9px] font-black italic w-7 text-right leading-none ${compliance >= 85 ? "text-emerald-500" : "text-slate-400"}`}>{compliance}%</span>
          </div>
        </div>
        <ChevronDown size={16} className={`text-slate-600 transition-transform shrink-0 ${isExpanded ? "rotate-180 text-blue-400" : "group-hover:text-slate-400"}`} />
      </button>

      {isExpanded && (
        <div className="p-4 bg-black/40 border-t border-white/5 text-[9px] lg:text-[10px] font-bold italic text-slate-400 space-y-3 animate-in fade-in slide-in-from-top-2">
          {clause.gaps && clause.gaps.length > 0 ? (
            <div className="bg-amber-950/20 border border-amber-500/20 p-3 rounded-xl">
               <p className="text-[7px] font-black uppercase tracking-widest text-amber-500 mb-2 flex items-center gap-2">
                 <AlertTriangle size={10} /> Écarts Identifiés :
               </p>
               <ul className="list-disc pl-4 m-0 space-y-1.5 text-amber-200/70">
                 {clause.gaps.map((g, i) => <li key={i}>{g.description}</li>)}
               </ul>
            </div>
          ) : (
             <div className="flex items-center gap-2 text-emerald-500 px-1">
               <CheckCircle size={12}/>
               <p className="m-0 font-black uppercase text-[8px] tracking-widest">Pleine conformité (§9.1.1)</p>
             </div>
          )}
          {clause.description && <p className="m-0 pt-2 border-t border-white/5 leading-relaxed">{clause.description}</p>}
        </div>
      )}
    </div>
  );
}