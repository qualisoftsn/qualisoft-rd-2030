/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛡️ NOM ABSOLU : src/app/dashboard/tb-certif/page.tsx
 * FONCTION : Dashboard de Pilotage de la Certification et Conformité SMI.
 * RÔLE : Monitoring §9.1 (Surveillance) et §10.2 (Amélioration continue).
 * ARCHITECTURE : One-Pager (No-Scroll Global), Densité Haute.
 * DONNÉES : 100% Production. Requêtes agrégées via apiClient.
 */

"use client";

import {
  Activity, AlertTriangle, Calendar, CheckCircle, ChevronDown, Clock,
  Download, FileText, Globe, Leaf, Plus, Recycle, Search,
  ShieldCheck, Target, TrendingUp, Users, Zap, Loader2, RefreshCw
} from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { toast, Toaster } from "sonner";
import apiClient from "@/core/api/api-client";

// --- TYPES DE L'AGRÉGATEUR ---
interface CertifData {
  scores: any;
  clauses: any[];
  kpis: any;
  actions: any[];
  timeline: any[];
  docs: any[];
}

export default function CertificationDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CertifData | null>(null);
  const [activeTab, setActiveTab] = useState<"GLOBAL" | "QUALITY" | "ENVIRONMENT">("GLOBAL");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  /**
   * 📡 SYNCHRONISATION DU NOYAU MASTER (PRODUCTION)
   * Agrégation en temps réel des données d'audit, PAQ, Indicateurs et GED.
   */
  const fetchProductionData = useCallback(async () => {
    try {
      setLoading(true);
      // Exécution concurrente pour maximiser les performances de la page
      const [resScores, resClauses, resKpis, resActions, resTimeline, resDocs] = await Promise.all([
        apiClient.get('/smi/compliance-scores').catch(() => ({ data: [] })),
        apiClient.get('/smi/clauses-compliance').catch(() => ({ data: [] })),
        apiClient.get('/indicators/dashboard-stats').catch(() => ({ data: null })),
        apiClient.get('/actions?status=EN_COURS&priority=CRITICAL').catch(() => ({ data: [] })),
        apiClient.get('/audits/planning').catch(() => ({ data: [] })),
        apiClient.get('/ged/documents?limit=5').catch(() => ({ data: [] }))
      ]);

      // Mappage robuste pour le Dashboard (Adaptateur SDE)
      const rawScores = resScores.data || [];
      
      setData({
        scores: {
          iso9001: rawScores.find((s: any) => s.standard.includes('9001')) || { score: 0, status: 'EN ATTENTE', requirementsMet: 0, total: 100 },
          iso14001: rawScores.find((s: any) => s.standard.includes('14001')) || { score: 0, status: 'EN ATTENTE', requirementsMet: 0, total: 100 },
          legal: rawScores.find((s: any) => s.standard.includes('LÉGAL') || s.standard.includes('LEGAL')) || { score: 0, status: 'EN ATTENTE', requirementsMet: 0, total: 100 },
        },
        clauses: resClauses.data || [],
        kpis: resKpis.data || { globalPerformance: 0, completionRate: 0 },
        actions: resActions.data || [],
        timeline: resTimeline.data || [],
        docs: resDocs.data || []
      });
    } catch (error) {
      toast.error("ÉCHEC DE L'AGRÉGATION DES DONNÉES DE CERTIFICATION.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProductionData(); }, [fetchProductionData]);

  /**
   * 📊 LOGIQUE DE FILTRAGE
   */
  const filteredClauses = useMemo(() => {
    if (!data?.clauses) return [];
    if (activeTab === "GLOBAL") return data.clauses;
    const standardMap: any = { QUALITY: "ISO 9001", ENVIRONMENT: "ISO 14001" };
    return data.clauses.filter((c: any) => c.standard === standardMap[activeTab]);
  }, [activeTab, data]);

  if (loading || !data) {
    return (
      <div className="ml-80 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="text-blue-500 font-black uppercase italic text-[10px] tracking-[0.5em] animate-pulse">
          Calcul de conformité des référentiels en cours...
        </p>
      </div>
    );
  }

  return (
    // 📏 ONE-PAGER CADRAGE (h-screen, overflow-hidden)
    <div className="ml-80 h-screen flex flex-col bg-[#0B0F1A] text-white font-sans p-6 italic text-left selection:bg-blue-600/30 overflow-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🚀 HEADER STRATÉGIQUE (COMPACT) */}
      <header className="shrink-0 mb-4 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600/20 p-3 rounded-2xl border border-blue-500/30 shadow-inner">
            <ShieldCheck size={28} className="text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter leading-none m-0 flex items-center gap-3">
              Pilotage <span className="text-blue-600">Certification</span>
              <button onClick={fetchProductionData} className="p-1.5 bg-white/5 rounded-lg hover:text-blue-500 cursor-pointer border-none transition-colors"><RefreshCw size={14}/></button>
            </h1>
            <p className="text-slate-500 font-black text-[9px] uppercase tracking-[0.4em] italic m-0 mt-1">
              ISO 9001 • ISO 14001 • Conformité Légale Sénégal
            </p>
          </div>
        </div>

        <div className="flex bg-black/40 border border-white/5 rounded-xl p-1 shadow-inner">
          {(["GLOBAL", "QUALITY", "ENVIRONMENT"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 text-[9px] font-black uppercase tracking-widest transition-all rounded-lg border-none cursor-pointer italic ${activeTab === tab ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-white hover:bg-white/5"}`}
            >
              {tab === "GLOBAL" ? "SMI Intégré" : tab === "QUALITY" ? "ISO 9001" : "ISO 14001"}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button className="bg-white/5 border border-white/10 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-black uppercase text-[9px] flex items-center gap-2 transition-all cursor-pointer">
            <FileText size={14} /> Rapport
          </button>
          <button 
            onClick={() => { setIsExporting(true); toast.info("Génération archive..."); setTimeout(() => setIsExporting(false), 2000); }}
            className="bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 px-4 py-2 rounded-xl font-black uppercase text-[9px] flex items-center gap-2 transition-all cursor-pointer"
          >
            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Preuves
          </button>
        </div>
      </header>

      {/* 🏅 BADGES DE PROGRESSION GLOBALE (Ligne très fine) */}
      <div className="shrink-0 flex gap-4 mb-4 h-16">
        <CertificationBadge standard="ISO 9001" score={data.scores.iso9001.score} status={data.scores.iso9001.status} color="blue" />
        <CertificationBadge standard="ISO 14001" score={data.scores.iso14001.score} status={data.scores.iso14001.status} color="emerald" />
        <CertificationBadge standard="LÉGAL SÉNÉGAL" score={data.scores.legal.score} status={data.scores.legal.status} color="amber" />
        
        {/* KPI Rapide Global */}
        <div className="flex-1 bg-[#151A2D] border border-white/5 rounded-2xl flex items-center justify-between px-6 shadow-inner">
           <div className="flex items-center gap-3">
             <Activity className="text-purple-500" size={24} />
             <div>
               <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] m-0">Performance SMI</p>
               <p className="text-xl font-black italic m-0">{data.kpis.globalPerformance || 0}%</p>
             </div>
           </div>
           <div className="h-2 w-24 bg-black/50 rounded-full overflow-hidden">
             <div className="h-full bg-purple-500" style={{ width: `${data.kpis.globalPerformance || 0}%` }}/>
           </div>
        </div>
      </div>

      {/* 🧩 GRILLE PRINCIPALE (3 Colonnes) */}
      <div className="flex-1 min-h-0 flex gap-4">
        
        {/* COLONNE 1 : MATURITÉ & CHRONOLOGIE (25%) */}
        <div className="w-1/4 flex flex-col gap-4 min-h-0">
          <div className="flex-1 bg-[#151A2D] border border-white/5 rounded-3xl p-5 flex flex-col shadow-4xl overflow-hidden">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-4 flex items-center gap-2 shrink-0 m-0"><Globe size={14}/> Maturité Système</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
               <MaturityCard title="Qualité (9001)" data={data.scores.iso9001} color="bg-blue-600" />
               <MaturityCard title="Environnement (14001)" data={data.scores.iso14001} color="bg-emerald-600" />
               <MaturityCard title="Légal & Compliance" data={data.scores.legal} color="bg-amber-600" />
            </div>
          </div>
          
          <div className="h-1/3 bg-[#151A2D] border border-white/5 rounded-3xl p-5 flex flex-col shadow-4xl">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-3 flex items-center gap-2 shrink-0 m-0"><Calendar size={14}/> Jalons Audit</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
              {data.timeline.length > 0 ? data.timeline.map((event: any, idx: number) => (
                <div key={idx} className="flex gap-3 items-start border-l-2 border-white/10 pl-3 relative">
                  <div className="absolute -left-2.25 top-1 w-4 h-4 rounded-full bg-blue-600 border-[3px] border-[#151A2D]" />
                  <div>
                    <p className="text-[10px] font-black italic uppercase leading-tight m-0">{event.title || event.GA_Title}</p>
                    <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mt-0.5 m-0">
                      {event.date || (event.GA_Deadline ? new Date(event.GA_Deadline).toLocaleDateString() : 'N/A')}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-[9px] text-slate-500 uppercase font-black italic">Aucun audit planifié.</p>
              )}
            </div>
          </div>
        </div>

        {/* COLONNE 2 : ANALYSE DES CLAUSES & KPIS (50%) */}
        <div className="w-2/4 bg-[#151A2D] border border-white/5 rounded-3xl p-5 flex flex-col shadow-4xl min-h-0">
          <div className="flex justify-between items-center shrink-0 mb-4">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] flex items-center gap-2 m-0"><Target size={14}/> Analyse Granulaire des Clauses</h3>
            <span className="px-3 py-1 bg-white/5 rounded-lg text-[8px] font-black uppercase text-slate-500 tracking-widest">{filteredClauses.length} Analysées</span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {filteredClauses.length > 0 ? filteredClauses.map((clause: any, idx: number) => (
              <ClauseComplianceCard
                key={clause.id || idx}
                clause={clause}
                onExpand={() => setExpandedSection(expandedSection === (clause.id || idx.toString()) ? null : (clause.id || idx.toString()))}
                isExpanded={expandedSection === (clause.id || idx.toString())}
              />
            )) : (
              // Fallback si pas de données formatées "clauses"
              <div className="flex flex-col items-center justify-center h-full opacity-40">
                 <Target size={40} className="mb-3" />
                 <p className="text-[10px] font-black uppercase tracking-[0.3em]">En attente de l&apos;audit interne</p>
              </div>
            )}
          </div>
        </div>

        {/* COLONNE 3 : GAPS CRITIQUES & PREUVES (25%) */}
        <div className="w-1/4 flex flex-col gap-4 min-h-0">
          <div className="flex-3 bg-[#151A2D] border border-white/5 rounded-3xl p-5 flex flex-col shadow-4xl min-h-0">
            <h3 className="text-[10px] font-black uppercase text-rose-500 tracking-[0.3em] mb-4 flex items-center gap-2 shrink-0 m-0"><AlertTriangle size={14}/> Gaps & Non-Conformités</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
              {data.actions.length > 0 ? data.actions.map((action: any, idx: number) => (
                <div key={idx} className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[7px] font-black uppercase tracking-widest leading-none">CRITIQUE</span>
                    <span className="text-[8px] font-black text-slate-500 italic">{action.deadline || (action.AC_Deadline ? new Date(action.AC_Deadline).toLocaleDateString() : '')}</span>
                  </div>
                  <p className="text-[10px] font-black italic leading-tight uppercase line-clamp-2 m-0 text-rose-100">{action.title || action.AC_Title}</p>
                </div>
              )) : (
                 <div className="flex flex-col items-center justify-center h-full opacity-40">
                    <CheckCircle size={32} className="text-emerald-500 mb-2" />
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-center">Aucun gap critique</p>
                 </div>
              )}
            </div>
          </div>

          <div className="flex-2 bg-[#151A2D] border border-white/5 rounded-3xl p-5 flex flex-col shadow-4xl min-h-0">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-3 flex items-center gap-2 shrink-0 m-0"><FileText size={14}/> Preuves Scellées (GED)</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
              {data.docs.length > 0 ? data.docs.map((doc: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-2 bg-black/40 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group border border-transparent hover:border-white/10">
                  <div className="p-1.5 bg-blue-600/20 text-blue-500 rounded border border-blue-500/20 shrink-0"><FileText size={12}/></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-black uppercase italic truncate m-0 group-hover:text-blue-400">{doc.title || doc.DOC_Title}</p>
                    <p className="text-[7px] text-slate-500 uppercase tracking-widest m-0">{doc.status || doc.DOC_Status}</p>
                  </div>
                </div>
              )) : (
                <p className="text-[9px] text-slate-500 uppercase font-black italic">Aucun document validé.</p>
              )}
            </div>
          </div>
        </div>

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37,99,235,0.5); }
      `}</style>
    </div>
  );
}

// ============================================================================
// 🧩 SOUS-COMPOSANTS ULTRA-COMPACTS
// ============================================================================

function CertificationBadge({ standard, score, status, color }: any) {
  const colors: any = {
    blue: "bg-blue-600/10 border-blue-500/30 text-blue-400",
    emerald: "bg-emerald-600/10 border-emerald-500/30 text-emerald-500",
    amber: "bg-amber-600/10 border-amber-500/30 text-amber-500",
  };
  const barColors: any = { blue: "bg-blue-500", emerald: "bg-emerald-500", amber: "bg-amber-500" };

  return (
    <div className={`flex-1 p-3 rounded-2xl border flex flex-col justify-center shadow-inner ${colors[color]}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] italic leading-none">{standard}</span>
        <span className="text-sm font-black italic leading-none">{score || 0}%</span>
      </div>
      <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden mb-1.5">
        <div className={`h-full ${barColors[color]}`} style={{ width: `${score || 0}%` }} />
      </div>
      <p className="text-[7px] font-black uppercase tracking-widest opacity-80 m-0 truncate text-white">{status || 'EN ATTENTE'}</p>
    </div>
  );
}

function MaturityCard({ title, data, color }: any) {
  const score = data?.score || 0;
  return (
    <div className="bg-black/30 border border-white/5 p-4 rounded-2xl relative overflow-hidden group">
      <div className="flex justify-between items-end mb-2 relative z-10">
        <h4 className="text-[11px] font-black uppercase italic text-white m-0 leading-none">{title}</h4>
        <span className="text-xl font-black italic leading-none">{score}%</span>
      </div>
      <div className="h-2 w-full bg-black/60 rounded-full overflow-hidden relative z-10 shadow-inner">
        <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${score}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-[8px] font-black uppercase text-slate-500 tracking-widest relative z-10">
        <span>Couverture</span>
        <span>{data?.requirementsMet || 0} / {data?.total || 100}</span>
      </div>
    </div>
  );
}

function ClauseComplianceCard({ clause, onExpand, isExpanded }: any) {
  const compliance = clause.compliance || 0;
  return (
    <div className={`bg-black/20 border rounded-2xl overflow-hidden transition-all duration-300 ${isExpanded ? "border-blue-500/30 bg-blue-900/10" : "border-white/5 hover:border-white/10"}`}>
      <button onClick={onExpand} className="w-full p-4 text-left flex justify-between items-center border-none bg-transparent cursor-pointer">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-[8px] font-black bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded border border-blue-600/30 italic tracking-widest">
              {clause.standard} §{clause.number || 'X'}
            </span>
            <h4 className="text-[12px] font-black uppercase italic tracking-tighter text-white truncate m-0">
              {clause.title || clause.REQ_Title || 'Exigence'}
            </h4>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex-1 h-1.5 bg-black/60 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${compliance >= 85 ? "bg-emerald-500" : compliance >= 60 ? "bg-blue-500" : "bg-amber-500"}`} style={{ width: `${compliance}%` }} />
            </div>
            <span className="text-[10px] font-black italic w-8 text-right text-slate-300 leading-none">{compliance}%</span>
          </div>
        </div>
        <ChevronDown size={16} className={`text-slate-500 transition-transform ${isExpanded ? "rotate-180 text-blue-400" : ""}`} />
      </button>

      {isExpanded && (
        <div className="p-4 bg-black/40 border-t border-white/5 text-[10px] font-bold italic text-slate-400 space-y-3">
          {clause.gaps && clause.gaps.length > 0 ? (
            <div>
               <p className="text-[8px] font-black uppercase tracking-widest text-amber-500 mb-1">Gaps Identifiés :</p>
               <ul className="list-disc pl-4 m-0 space-y-1 text-amber-400/80">
                 {clause.gaps.map((g: any, i: number) => <li key={i}>{g.description || g}</li>)}
               </ul>
            </div>
          ) : (
             <p className="text-emerald-500 flex items-center gap-2 m-0"><CheckCircle size={12}/> Aucun écart majeur détecté.</p>
          )}
          {clause.description && <p className="m-0 pt-2 border-t border-white/5">{clause.description}</p>}
        </div>
      )}
    </div>
  );
}