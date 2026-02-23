/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 MODULE : HUB DE L'AMÉLIORATION CONTINUE (SDE COMMAND CENTER)
 * -------------------------------------------------------------------------
 * RÔLE : Hub centralisé pour l'Amélioration Continue (ISO 9001 §10).
 * ARCHITECTURE : Zéro donnée factice (Repli sur données statiques désactivé).
 * CONSOLIDATION : Maintien intégral des 3 vues (Kanban, List, Matrix) et filtres.
 * DESIGN : Cockpit Matrix Full-Space (max-w-500).
 * -------------------------------------------------------------------------
 */

"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/core/api/api-client";
import { differenceInDays, format, isPast } from "date-fns";
import { fr } from "date-fns/locale";
import { toast, Toaster } from 'sonner';
import {
  AlertCircle, AlertTriangle, BarChart3, Calendar,
  CheckCircle2, Clock, Download, FileText, Filter,
  LayoutGrid, List, Paperclip, Plus, RefreshCcw,
  Search, ShieldCheck, Target, Users, Zap, Activity,
  Fingerprint, Loader2
} from "lucide-react";

// --- 🏗️ TYPES SCELLÉS SDE (STRICTS) ---
type ActionSource = "AUDIT_INTERNE" | "AUDIT_EXTERNE" | "NC" | "RECLAMATION" | "COPIL" | "REVUE_DIRECTION" | "ANALYSE_RISQUE" | "SUGGESTION" | "AUTRE" | "ALL";
type ActionStatus = "A_FAIRE" | "EN_COURS" | "A_VALIDER" | "TERMINEE" | "ANNULEE" | "EN_RETARD" | "ALL";
type ActionPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "ALL";
type ViewMode = "kanban" | "list" | "matrix";

interface Responsible {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

interface ActionItem {
  id: string;
  reference: string;
  title: string;
  description?: string;
  source: Exclude<ActionSource, "ALL">;
  sourceRef?: string;
  status: Exclude<ActionStatus, "ALL">;
  priority: Exclude<ActionPriority, "ALL">;
  progress: number;
  responsible: Responsible;
  deadline: string;
  createdAt: string;
  evidencesCount: number;
  commentsCount: number;
  processus?: string;
  paqId?: string;
  planId?: string;
}

// --- UTILITAIRE ---
const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

export default function ContinuousImprovementHub() {
  const router = useRouter();
  
  // --- ÉTATS SDE ---
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // --- ÉTATS FILTRAGE ---
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedFilters, setSelectedFilters] = useState<{
    source: ActionSource;
    status: ActionStatus;
    priority: ActionPriority;
  }>({ source: "ALL", status: "ALL", priority: "ALL" });

  /**
   * 📡 SYNCHRONISATION DES ACTIONS KERNEL
   */
  const loadActions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<ActionItem[]>("/continuous-improvement/actions");
      setActions(res.data || []);
    } catch (err) {
      toast.error("RUPTURE DE FLUX : REGISTRE D'AMÉLIORATION INACCESSIBLE.");
      setActions([]); // Pas de données fantômes en Prod SDE
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadActions(); }, [loadActions]);

  // --- FILTRAGE INTELLIGENT (Moteur Conservé) ---
  const filteredActions = useMemo(() => {
    return actions.filter((action) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        action.title.toLowerCase().includes(searchLower) ||
        action.reference.toLowerCase().includes(searchLower) ||
        action.responsible.lastName.toLowerCase().includes(searchLower);

      const matchesSource = selectedFilters.source === "ALL" || action.source === selectedFilters.source;
      const matchesStatus = selectedFilters.status === "ALL" || action.status === selectedFilters.status;
      const matchesPriority = selectedFilters.priority === "ALL" || action.priority === selectedFilters.priority;

      return matchesSearch && matchesSource && matchesStatus && matchesPriority;
    });
  }, [actions, searchTerm, selectedFilters]);

  // --- STATISTIQUES EN TEMPS RÉEL ---
  const stats = useMemo(() => ({
    total: actions.length,
    active: actions.filter((a) => ["A_FAIRE", "EN_COURS", "A_VALIDER"].includes(a.status)).length,
    late: actions.filter((a) => isPast(new Date(a.deadline)) && a.status !== "TERMINEE").length,
    completed: actions.filter((a) => a.status === "TERMINEE").length,
    bySource: {
      audit: actions.filter((a) => ["AUDIT_INTERNE", "AUDIT_EXTERNE"].includes(a.source)).length,
      nc: actions.filter((a) => a.source === "NC").length,
      copil: actions.filter((a) => ["COPIL", "REVUE_DIRECTION"].includes(a.source)).length,
    },
  }), [actions]);

  // --- HELPERS VISUELS ---
  const getStatusColor = (status: ActionStatus) => {
    const colors: Record<string, string> = {
      A_FAIRE: "bg-slate-500/10 text-slate-400 border-slate-500/20",
      EN_COURS: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      A_VALIDER: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      TERMINEE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
      ANNULEE: "bg-red-500/10 text-red-400 border-red-500/20",
      EN_RETARD: "bg-red-600/10 text-red-500 border-red-600/20 animate-pulse",
    };
    return colors[status as string] || colors["A_FAIRE"];
  };

  const getSourceIcon = (source: ActionSource) => {
    switch (source) {
      case "AUDIT_INTERNE": return <FileText size={16} />;
      case "AUDIT_EXTERNE": return <ShieldCheck size={16} />;
      case "NC": return <AlertTriangle size={16} />;
      case "COPIL": return <Users size={16} />;
      case "REVUE_DIRECTION": return <BarChart3 size={16} />;
      default: return <Target size={16} />;
    }
  };

  if (loading) return (
    <div className="ml-72 flex h-screen flex-col items-center justify-center bg-[#0B0F1A] gap-12">
      <div className="relative flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={120} strokeWidth={1} />
        <Fingerprint className="absolute text-blue-600/20 animate-pulse" size={48} />
      </div>
      <p className="text-blue-500 font-black uppercase italic text-[14px] tracking-[1.5em]">
        Scan du Flux d&apos;Amélioration...
      </p>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-16 ml-72 text-white font-sans italic text-left selection:bg-blue-600/30 overflow-x-hidden">
      <Toaster position="top-right" richColors theme="dark" />
      
      <div className="w-full max-w-500 mx-auto space-y-20 animate-in fade-in duration-1000">
        
        {/* 🔝 EN-TÊTE FÉDÉRATEUR (§10) */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 border-b-4 border-white/5 pb-16">
          <div className="space-y-8">
            <div className="flex items-center gap-5 mb-4">
              <span className="px-6 py-2 rounded-2xl bg-blue-600/10 border-2 border-blue-600/20 text-blue-500 text-[12px] font-black uppercase tracking-[0.5em] shadow-inner">
                ISO 9001:2015 §10
              </span>
              <span className="px-6 py-2 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-500 text-[12px] font-black uppercase tracking-[0.5em] shadow-inner">
                {stats.active} Actions Actives
              </span>
            </div>
            <h1 className="text-8xl font-black uppercase italic tracking-tighter leading-none">
              Amélioration <span className="text-blue-600">Continue</span>
            </h1>
            <p className="text-slate-500 font-black text-[14px] uppercase tracking-[0.8em] mt-6 italic flex items-center gap-6 opacity-60">
              <Activity size={20} className="text-blue-600" /> Pilotage des Actions Correctives & Préventives SDE
            </p>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 bg-black/40 p-2 rounded-4xl border-2 border-white/5 backdrop-blur-3xl shadow-inner">
              {[
                { id: "kanban", icon: LayoutGrid, label: "Kanban" },
                { id: "list", icon: List, label: "Liste" },
                { id: "matrix", icon: Target, label: "Matrice SDE" },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id as ViewMode)}
                  className={cn(
                    "flex items-center gap-4 px-8 py-4 rounded-3xl text-[12px] font-black uppercase tracking-[0.4em] transition-all border-none cursor-pointer",
                    viewMode === mode.id
                      ? "bg-blue-600 text-white shadow-[0_10px_30px_rgba(37,99,235,0.4)]"
                      : "text-slate-500 hover:text-white hover:bg-white/10 bg-transparent"
                  )}
                >
                  <mode.icon size={20} /> {mode.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => router.push("/dashboard/improvement/actions/new/")}
              className="bg-blue-600 hover:bg-white hover:text-blue-600 text-white px-12 py-6 rounded-4xl font-black uppercase text-[12px] tracking-[0.5em] flex items-center gap-5 transition-all shadow-[0_15px_40px_rgba(37,99,235,0.4)] border-none cursor-pointer active:scale-95 group"
            >
              <Plus size={24} strokeWidth={4} className="group-hover:rotate-90 transition-transform" /> Nouvelle Action
            </button>
          </div>
        </header>

        {/* 📊 KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          <StatCard title="Total Actions" value={stats.total} icon={Target} color="blue" subtext="Flux Complet" />
          <StatCard title="En Cours" value={stats.active} icon={RefreshCcw} color="amber" subtext={`${Math.round((stats.active / (stats.total || 1)) * 100)}% du flux`} />
          <StatCard title="En Retard" value={stats.late} icon={AlertCircle} color={stats.late > 0 ? "red" : "emerald"} subtext={stats.late > 0 ? "Alerte Critique" : "À Jour"} />
          <StatCard title="Clôturées" value={stats.completed} icon={CheckCircle2} color="emerald" subtext={`${Math.round((stats.completed / (stats.total || 1)) * 100)}% d'efficacité`} />
          <StatCard title="Audit Data" value={stats.bySource.audit} icon={FileText} color="purple" subtext="Int/Ext. Source" />
          <StatCard title="NC Master" value={stats.bySource.nc} icon={AlertTriangle} color="orange" subtext="Non-Conformités" />
        </div>

        {/* 🔍 MOTEUR DE RECHERCHE ET FILTRES */}
        <div className="bg-[#151A2D] border-4 border-white/5 rounded-[4rem] p-10 space-y-8 backdrop-blur-3xl shadow-4xl relative z-20">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="relative flex-1">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
              <input
                type="text"
                placeholder="RECHERCHE PAR RÉFÉRENCE, TITRE, RESPONSABLE..."
                className="w-full bg-black/60 border-4 border-white/5 rounded-[3rem] py-8 pl-20 pr-10 text-[16px] font-black outline-none focus:border-blue-600 transition-all placeholder:text-slate-600 text-white italic tracking-widest shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-4 px-12 py-8 rounded-[3rem] font-black uppercase text-[12px] tracking-[0.5em] transition-all border-4 cursor-pointer",
                  showFilters
                    ? "bg-blue-600 border-blue-600 text-white shadow-3xl"
                    : "bg-black/40 border-white/5 text-slate-400 hover:text-white"
                )}
              >
                <Filter size={20} /> Filtres SDE {(selectedFilters.source !== "ALL" || selectedFilters.status !== "ALL") && "•"}
              </button>
              <button className="flex items-center gap-4 px-12 py-8 rounded-[3rem] bg-black/40 border-4 border-white/5 text-slate-400 hover:text-white hover:bg-white/5 font-black uppercase text-[12px] tracking-[0.5em] cursor-pointer transition-all">
                <Download size={20} /> Export
              </button>
            </div>
          </div>

          {/* PANNEAU DÉROULANT DES FILTRES SDE */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-10 border-t-4 border-white/5 animate-in slide-in-from-top-4 duration-500">
              <div className="space-y-5">
                <label className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-500 italic ml-4">Source Normative</label>
                <select
                  className="w-full bg-black/60 border-4 border-white/5 rounded-[2.5rem] px-8 py-6 text-[14px] font-black uppercase outline-none focus:border-blue-600 text-white italic cursor-pointer appearance-none shadow-inner"
                  value={selectedFilters.source}
                  onChange={(e) => setSelectedFilters({ ...selectedFilters, source: e.target.value as ActionSource })}
                >
                  <option value="ALL">TOUTES SOURCES</option>
                  <option value="AUDIT_INTERNE">AUDIT INTERNE</option>
                  <option value="AUDIT_EXTERNE">AUDIT EXTERNE</option>
                  <option value="NC">NON-CONFORMITÉ (NC)</option>
                  <option value="RECLAMATION">RÉCLAMATION CLIENT</option>
                  <option value="COPIL">COMITÉ DE PILOTAGE</option>
                  <option value="REVUE_DIRECTION">REVUE DE DIRECTION</option>
                </select>
              </div>

              <div className="space-y-5">
                <label className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-500 italic ml-4">Statut SDE</label>
                <select
                  className="w-full bg-black/60 border-4 border-white/5 rounded-[2.5rem] px-8 py-6 text-[14px] font-black uppercase outline-none focus:border-blue-600 text-white italic cursor-pointer appearance-none shadow-inner"
                  value={selectedFilters.status}
                  onChange={(e) => setSelectedFilters({ ...selectedFilters, status: e.target.value as ActionStatus })}
                >
                  <option value="ALL">TOUS STATUTS</option>
                  <option value="A_FAIRE">À FAIRE</option>
                  <option value="EN_COURS">EN COURS</option>
                  <option value="A_VALIDER">À VALIDER</option>
                  <option value="TERMINEE">TERMINÉE</option>
                </select>
              </div>

              <div className="space-y-5">
                <label className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-500 italic ml-4">Priorité Stratégique</label>
                <select
                  className="w-full bg-black/60 border-4 border-white/5 rounded-[2.5rem] px-8 py-6 text-[14px] font-black uppercase outline-none focus:border-blue-600 text-white italic cursor-pointer appearance-none shadow-inner"
                  value={selectedFilters.priority}
                  onChange={(e) => setSelectedFilters({ ...selectedFilters, priority: e.target.value as ActionPriority })}
                >
                  <option value="ALL">TOUTES PRIORITÉS</option>
                  <option value="CRITICAL">CRITIQUE</option>
                  <option value="HIGH">HAUTE</option>
                  <option value="MEDIUM">MOYENNE</option>
                  <option value="LOW">BASSE</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 1️⃣ VUE KANBAN MASTER */}
        {viewMode === "kanban" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 animate-in fade-in duration-700">
            {(["A_FAIRE", "EN_COURS", "A_VALIDER", "TERMINEE"] as const).map((status) => {
              const statusActions = filteredActions.filter((a) => a.status === status);
              const isLateColumn = status === "A_FAIRE" && statusActions.some((a) => isPast(new Date(a.deadline)));

              return (
                <div key={status} className="bg-[#151A2D] rounded-[4rem] border-4 border-white/5 p-10 space-y-8 shadow-4xl backdrop-blur-3xl flex flex-col h-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={cn(
                      "text-[14px] font-black uppercase tracking-[0.4em] flex items-center gap-4 italic",
                      status === "A_FAIRE" ? "text-slate-400" : status === "EN_COURS" ? "text-blue-500" : status === "A_VALIDER" ? "text-amber-500" : "text-emerald-500"
                    )}>
                      {status === "A_FAIRE" && <Clock size={20} />}
                      {status === "EN_COURS" && <RefreshCcw size={20} />}
                      {status === "A_VALIDER" && <CheckCircle2 size={20} />}
                      {status === "TERMINEE" && <ShieldCheck size={20} />}
                      {status.replace("_", " ")}
                      {isLateColumn && <span className="ml-3 text-red-500 animate-pulse text-xl">!</span>}
                    </h3>
                    <span className="text-[12px] font-black text-slate-500 bg-black/40 px-5 py-2 rounded-3xl shadow-inner border border-white/5">
                      {statusActions.length}
                    </span>
                  </div>
                  
                  <div className="space-y-6 overflow-y-auto custom-scrollbar flex-1 pr-4">
                    {statusActions.map((action) => (
                      <ActionCard key={action.id} action={action} onClick={() => router.push(`/dashboard/continuous-improvement/${action.id}`)} />
                    ))}
                    {statusActions.length === 0 && (
                      <div className="py-24 text-center border-4 border-dashed border-white/5 rounded-[3rem] opacity-20">
                        <Target size={64} className="mx-auto mb-6 text-slate-500" />
                        <p className="text-[12px] font-black uppercase italic tracking-[0.5em] leading-relaxed">Flux<br/>Vide</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 2️⃣ VUE LISTE DE DÉTAILS */}
        {viewMode === "list" && (
          <div className="bg-[#151A2D] rounded-[5rem] border-4 border-white/5 overflow-hidden shadow-4xl animate-in slide-in-from-bottom-8 duration-700">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-black/60 border-b-4 border-white/5">
                  <tr>
                    <th className="p-10 text-[12px] font-black uppercase tracking-[0.4em] text-slate-500 italic">Référence & Action</th>
                    <th className="p-10 text-[12px] font-black uppercase tracking-[0.4em] text-slate-500 italic">Source SDE</th>
                    <th className="p-10 text-[12px] font-black uppercase tracking-[0.4em] text-slate-500 italic">Pilote</th>
                    <th className="p-10 text-[12px] font-black uppercase tracking-[0.4em] text-slate-500 italic">Échéance</th>
                    <th className="p-10 text-center text-[12px] font-black uppercase tracking-[0.4em] text-slate-500 italic">Progression</th>
                    <th className="p-10 text-center text-[12px] font-black uppercase tracking-[0.4em] text-slate-500 italic">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-white/5">
                  {filteredActions.map((action) => (
                    <tr key={action.id} onClick={() => router.push(`/dashboard/continuous-improvement/${action.id}`)} className="hover:bg-white/5 transition-all cursor-pointer group bg-transparent">
                      <td className="p-10">
                        <div className="space-y-3">
                          <p className="text-[11px] font-black text-blue-500 uppercase leading-none tracking-[0.4em]">{action.reference}</p>
                          <p className="text-[18px] font-black uppercase italic text-white group-hover:text-blue-400 transition-colors leading-tight tracking-tighter">{action.title}</p>
                          <div className="flex items-center gap-5 mt-4">
                            {action.evidencesCount > 0 && <span className="text-[11px] text-slate-500 flex items-center gap-2 font-black italic tracking-widest"><Paperclip size={14} /> {action.evidencesCount} preuve(s)</span>}
                            {action.commentsCount > 0 && <span className="text-[11px] text-slate-500 flex items-center gap-2 font-black italic tracking-widest"><FileText size={14} /> {action.commentsCount} note(s)</span>}
                          </div>
                        </div>
                      </td>
                      <td className="p-10">
                        <div className="flex items-center gap-4 text-[11px] font-black uppercase text-slate-400 italic tracking-[0.3em]">
                          <div className="p-3 bg-white/5 rounded-xl">{getSourceIcon(action.source)}</div> 
                          {action.source.replace("_", " ")}
                        </div>
                      </td>
                      <td className="p-10">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-[#0B0F1A] border-2 border-white/10 flex items-center justify-center text-[12px] font-black text-blue-500 shadow-xl">
                            {action.responsible.firstName[0]}{action.responsible.lastName[0]}
                          </div>
                          <span className="text-[14px] font-black uppercase italic tracking-widest text-slate-300">{action.responsible.firstName} {action.responsible.lastName}</span>
                        </div>
                      </td>
                      <td className="p-10">
                        <div className={`text-[13px] font-black uppercase italic tracking-[0.3em] flex items-center gap-3 ${isPast(new Date(action.deadline)) && action.status !== "TERMINEE" ? "text-red-500" : "text-slate-400"}`}>
                          <Calendar size={16} className="opacity-50" />
                          {format(new Date(action.deadline), "dd MMM yyyy", { locale: fr })}
                        </div>
                      </td>
                      <td className="p-10">
                        <div className="flex items-center gap-5">
                          <div className="flex-1 h-3 bg-black/60 rounded-full overflow-hidden border border-white/5 shadow-inner p-0.5">
                            <div className="h-full bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all" style={{ width: `${action.progress}%` }} />
                          </div>
                          <span className="text-[12px] font-black text-slate-400 w-10 text-right">{action.progress}%</span>
                        </div>
                      </td>
                      <td className="p-10 text-center">
                        <span className={`px-6 py-3 rounded-3xl text-[10px] font-black uppercase border-2 italic tracking-[0.4em] ${getStatusColor(action.status)}`}>
                          {action.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredActions.length === 0 && (
                     <tr>
                        <td colSpan={6} className="p-32 text-center text-slate-500 font-black italic tracking-[0.5em] uppercase">
                            Aucune action ne correspond aux critères.
                        </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3️⃣ VUE MATRICE D'EISENHOWER (ARBITRAGE SDE) */}
        {viewMode === "matrix" && (
          <div className="bg-[#151A2D] rounded-[6rem] border-4 border-white/5 p-20 shadow-4xl animate-in zoom-in duration-700 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none"><Target size={400} /></div>
            
            <h3 className="text-4xl font-black uppercase italic mb-16 flex items-center gap-8 tracking-tighter relative z-10 text-white leading-none">
              <Target className="text-blue-500" size={48} /> Arbitrage Stratégique <span className="text-slate-500 text-2xl tracking-[0.5em]">(Eisenhower Matrix)</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-12 h-200 mt-12 relative z-10">
              
              {/* QUADRANT 1: DO (Urgent & Important) */}
              <div className="bg-red-600/5 border-4 border-red-600/10 rounded-[4rem] p-12 relative overflow-hidden backdrop-blur-md shadow-inner flex flex-col">
                <div className="flex items-center gap-5 mb-10">
                  <div className="w-14 h-14 bg-red-600/10 rounded-3xl flex items-center justify-center border-2 border-red-600/20 shadow-lg"><AlertTriangle className="text-red-500" size={24} /></div>
                  <span className="text-[14px] font-black uppercase text-red-500 tracking-[0.5em] italic leading-none">DO : Urgent / Critique</span>
                </div>
                <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-4">
                  {filteredActions.filter(a => ["CRITICAL", "HIGH"].includes(a.priority) && (a.status === "EN_RETARD" || isPast(new Date(a.deadline)))).map(action => <MiniActionCard key={action.id} action={action} />)}
                  {filteredActions.filter(a => ["CRITICAL", "HIGH"].includes(a.priority) && (a.status === "EN_RETARD" || isPast(new Date(a.deadline)))).length === 0 && <EmptyQuadrant />}
                </div>
              </div>

              {/* QUADRANT 2: SCHEDULE (Important, Non Urgent) */}
              <div className="bg-blue-600/5 border-4 border-blue-600/10 rounded-[4rem] p-12 relative overflow-hidden backdrop-blur-md shadow-inner flex flex-col">
                <div className="flex items-center gap-5 mb-10">
                  <div className="w-14 h-14 bg-blue-600/10 rounded-3xl flex items-center justify-center border-2 border-blue-600/20 shadow-lg"><Calendar className="text-blue-500" size={24} /></div>
                  <span className="text-[14px] font-black uppercase text-blue-500 tracking-[0.5em] italic leading-none">SCHEDULE : Planification</span>
                </div>
                <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-4">
                  {filteredActions.filter(a => ["HIGH", "MEDIUM"].includes(a.priority) && !isPast(new Date(a.deadline))).map(action => <MiniActionCard key={action.id} action={action} />)}
                  {filteredActions.filter(a => ["HIGH", "MEDIUM"].includes(a.priority) && !isPast(new Date(a.deadline))).length === 0 && <EmptyQuadrant />}
                </div>
              </div>

              {/* QUADRANT 3: DELEGATE (Urgent, Non Important) */}
              <div className="bg-amber-500/5 border-4 border-amber-500/10 rounded-[4rem] p-12 relative overflow-hidden backdrop-blur-md shadow-inner flex flex-col">
                <div className="flex items-center gap-5 mb-10">
                  <div className="w-14 h-14 bg-amber-500/10 rounded-3xl flex items-center justify-center border-2 border-amber-500/20 shadow-lg"><Users className="text-amber-500" size={24} /></div>
                  <span className="text-[14px] font-black uppercase text-amber-500 tracking-[0.5em] italic leading-none">DELEGATE : Délégation</span>
                </div>
                <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-4">
                  {filteredActions.filter(a => ["LOW", "MEDIUM"].includes(a.priority) && a.status === "A_FAIRE").map(action => <MiniActionCard key={action.id} action={action} />)}
                  {filteredActions.filter(a => ["LOW", "MEDIUM"].includes(a.priority) && a.status === "A_FAIRE").length === 0 && <EmptyQuadrant />}
                </div>
              </div>

              {/* QUADRANT 4: DELETE (Ni Urgent, Ni Important) */}
              <div className="bg-slate-500/5 border-4 border-slate-500/10 rounded-[4rem] p-12 relative overflow-hidden backdrop-blur-md shadow-inner flex flex-col">
                <div className="flex items-center gap-5 mb-10">
                  <div className="w-14 h-14 bg-slate-500/10 rounded-3xl flex items-center justify-center border-2 border-slate-500/20 shadow-lg"><Zap className="text-slate-400" size={24} /></div>
                  <span className="text-[14px] font-black uppercase text-slate-400 tracking-[0.5em] italic leading-none">DELETE : Éliminer (Standby)</span>
                </div>
                <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-4">
                  {filteredActions.filter(a => a.priority === "LOW" && a.status === "A_FAIRE").map(action => <MiniActionCard key={action.id} action={action} />)}
                  {filteredActions.filter(a => a.priority === "LOW" && a.status === "A_FAIRE").length === 0 && <EmptyQuadrant />}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
      `}</style>
    </div>
  );
}

// ============================================================================
// COMPOSANTS INTERNES HAUTE FIDÉLITÉ
// ============================================================================

function StatCard({ title, value, icon: Icon, color, subtext }: { title: string; value: number; icon: React.ElementType; color: string; subtext: string }) {
  const colorClasses: Record<string, string> = {
    blue: "text-blue-500 bg-blue-600/10 border-blue-600/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    red: "text-red-500 bg-red-600/10 border-red-600/20 shadow-[0_0_30px_rgba(220,38,38,0.1)]",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    orange: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  };

  return (
    <div className="bg-[#151A2D] border-4 border-white/5 p-10 rounded-[3.5rem] hover:border-blue-600/30 transition-all group shadow-4xl backdrop-blur-3xl text-left">
      <div className={`w-20 h-20 rounded-4xl flex items-center justify-center mb-10 border-2 group-hover:scale-110 transition-transform duration-700 ${colorClasses[color]}`}>
        <Icon size={36} strokeWidth={2.5} />
      </div>
      <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-500 mb-4 italic leading-none">{title}</p>
      <p className="text-6xl font-black italic tracking-tighter mb-6 leading-none text-white">{value}</p>
      <p className="text-[10px] font-black text-slate-600 uppercase italic tracking-widest border-t-2 border-white/5 pt-6">{subtext}</p>
    </div>
  );
}

function ActionCard({ action, onClick }: { action: ActionItem; onClick: () => void }) {
  const isLate = isPast(new Date(action.deadline)) && action.status !== "TERMINEE";
  const daysLeft = differenceInDays(new Date(action.deadline), new Date());

  return (
    <div onClick={onClick} className="bg-black/40 border-2 border-white/5 p-8 rounded-[2.5rem] hover:border-blue-600/40 hover:bg-white/5 transition-all cursor-pointer group space-y-6 shadow-2xl backdrop-blur-md">
      <div className="flex justify-between items-start">
        <span className={`text-[10px] font-black uppercase px-4 py-2 rounded-xl border-2 italic tracking-widest shadow-inner ${action.priority === "CRITICAL" ? "bg-red-500/10 text-red-400 border-red-500/20" : action.priority === "HIGH" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}>
          {action.reference}
        </span>
        {isLate && <AlertCircle size={24} className="text-red-500 animate-pulse drop-shadow-[0_0_10px_red]" />}
      </div>
      
      <h4 className="text-xl font-black uppercase italic leading-tight group-hover:text-blue-400 transition-colors line-clamp-2 tracking-tight text-white">
        {action.title}
      </h4>
      
      <div className="flex items-center gap-4 text-[11px] font-black text-slate-500 uppercase italic tracking-[0.3em]">
        <div className="p-2 bg-white/5 rounded-lg border border-white/5">
            {action.source === "AUDIT_INTERNE" && <FileText size={14} className="text-purple-500" />}
            {action.source === "NC" && <AlertTriangle size={14} className="text-red-500" />}
            {(!["AUDIT_INTERNE", "NC"].includes(action.source)) && <Target size={14} className="text-slate-400" />}
        </div>
        {action.source.replace("_", " ")}
      </div>
      
      <div className="pt-6 border-t-2 border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0B0F1A] border border-white/10 flex items-center justify-center text-[11px] font-black text-blue-500 shadow-xl">
            {action.responsible.firstName[0]}{action.responsible.lastName[0]}
          </div>
          <span className="text-[11px] font-black text-slate-400 uppercase italic tracking-widest">{action.responsible.lastName}</span>
        </div>
        <div className={`text-[11px] font-black uppercase italic tracking-[0.3em] bg-black/40 px-4 py-2 rounded-xl border border-white/5 ${isLate ? "text-red-400" : daysLeft <= 7 ? "text-amber-400" : "text-emerald-500"}`}>
          {isLate ? `${Math.abs(daysLeft)}j retard` : `${daysLeft}j restants`}
        </div>
      </div>
    </div>
  );
}

function MiniActionCard({ action }: { action: ActionItem }) {
  const priorityColor = action.priority === "CRITICAL" ? "bg-red-500" : action.priority === "HIGH" ? "bg-orange-500" : action.priority === "MEDIUM" ? "bg-blue-500" : "bg-slate-500";
  
  return (
    <div className="bg-black/40 border-2 border-white/5 p-6 rounded-4xl flex items-center justify-between hover:bg-white/10 hover:border-white/20 transition-all shadow-inner group">
      <div className="flex items-center gap-5 flex-1 truncate">
        <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] shrink-0 ${priorityColor}`} />
        <span className="text-[14px] font-black uppercase italic text-slate-300 truncate group-hover:text-white transition-colors tracking-tight">
          {action.title}
        </span>
      </div>
      <span className="text-[10px] font-black text-slate-600 italic uppercase ml-6 tracking-[0.3em] shrink-0 bg-white/5 px-3 py-1 rounded-lg">
        {action.reference}
      </span>
    </div>
  );
}

function EmptyQuadrant() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center opacity-20 py-10">
            <CheckCircle2 size={40} className="mb-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] italic text-center leading-relaxed">
                Zone dégagée<br/>Aucune action
            </span>
        </div>
    );
}