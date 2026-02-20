/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 CE QUE FAIT CETTE PAGE :
 * --------------------------
 * Fichier : app/dashboard/continuous-improvement/page.tsx
 * Rôle : Hub centralisé pour l'Amélioration Continue (ISO 9001 §10).
 * Fonctionnalités clés :
 * 1. Suivi multi-sources : Centralise les actions issues d'audits, NC, réclamations, COPIL.
 * 2. Vues multiples : Kanban (gestion de flux), Liste (détails et tri), Matrice d'Eisenhower (arbitrage stratégique).
 * 3. Filtrage dynamique : Par source, statut, priorité et recherche textuelle.
 * 4. KPIs en temps réel : Mesure de la réactivité (retards) et du taux d'avancement.
 */

"use client";

import apiClient from "@/core/api/api-client";
import { differenceInDays, format, isPast } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Filter,
  LayoutGrid,
  List,
  Paperclip,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

// --- TYPES SCELLÉS (STRICTS) ---
type ActionSource =
  | "AUDIT_INTERNE"
  | "AUDIT_EXTERNE"
  | "NC"
  | "RECLAMATION"
  | "COPIL"
  | "REVUE_DIRECTION"
  | "ANALYSE_RISQUE"
  | "SUGGESTION"
  | "AUTRE"
  | "ALL"; // Ajout de 'ALL' pour simplifier la logique de filtrage

type ActionStatus =
  | "A_FAIRE"
  | "EN_COURS"
  | "A_VALIDER"
  | "TERMINEE"
  | "ANNULEE"
  | "EN_RETARD"
  | "ALL";

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

export default function ContinuousImprovementHub() {
  const router = useRouter();
  
  // --- ÉTATS ---
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedFilters, setSelectedFilters] = useState<{
    source: ActionSource;
    status: ActionStatus;
    priority: ActionPriority;
  }>({ source: "ALL", status: "ALL", priority: "ALL" });

  // --- CHARGEMENT DES DONNÉES ---
  const loadActions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<ActionItem[]>("/continuous-improvement/actions");
      setActions(res.data || []);
    } catch (err) {
      console.error("Erreur chargement amélioration continue:", err);
      // Fallback : Données de démonstration cohérentes
      setActions([
        {
          id: "1",
          reference: "AC-2026-089",
          title: "Mise à jour procédure gestion des changements",
          description: "Suite audit interne Q1 2026",
          source: "AUDIT_INTERNE",
          sourceRef: "AI-2026-045",
          status: "EN_COURS",
          priority: "HIGH",
          progress: 65,
          responsible: { id: "1", firstName: "Marie", lastName: "Diallo" },
          deadline: "2026-03-15",
          createdAt: "2026-01-01",
          evidencesCount: 3,
          commentsCount: 5,
          processus: "Management Qualité",
        },
        {
          id: "2",
          reference: "NC-2026-012-AC",
          title: "Corrective sécurité accès serveur Matrix",
          source: "NC",
          sourceRef: "NC-2026-012",
          status: "A_FAIRE",
          priority: "CRITICAL",
          progress: 0,
          responsible: { id: "2", firstName: "Jean", lastName: "Ndiaye" },
          deadline: "2026-02-20",
          createdAt: "2026-02-10",
          evidencesCount: 0,
          commentsCount: 2,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActions();
  }, [loadActions]);

  // --- FILTRAGE INTELLIGENT ---
  const filteredActions = useMemo(() => {
    return actions.filter((action) => {
      const matchesSearch =
        action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.responsible.lastName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSource = selectedFilters.source === "ALL" || action.source === selectedFilters.source;
      const matchesStatus = selectedFilters.status === "ALL" || action.status === selectedFilters.status;
      const matchesPriority = selectedFilters.priority === "ALL" || action.priority === selectedFilters.priority;

      return matchesSearch && matchesSource && matchesStatus && matchesPriority;
    });
  }, [actions, searchTerm, selectedFilters]);

  // --- STATISTIQUES GLOBALES ---
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

  // --- HELPERS UI ---
  const getStatusColor = (status: ActionStatus) => {
    const colors: Record<string, string> = {
      A_FAIRE: "bg-slate-500/20 text-slate-400 border-slate-500/30",
      EN_COURS: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      A_VALIDER: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      TERMINEE: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      ANNULEE: "bg-red-500/20 text-red-400 border-red-500/30",
      EN_RETARD: "bg-red-600/20 text-red-500 border-red-600/30 animate-pulse",
    };
    return colors[status as string] || colors["A_FAIRE"];
  };

  const getSourceIcon = (source: ActionSource) => {
    switch (source) {
      case "AUDIT_INTERNE": return <FileText size={14} />;
      case "AUDIT_EXTERNE": return <ShieldCheck size={14} />;
      case "NC": return <AlertTriangle size={14} />;
      case "COPIL": return <Users size={14} />;
      case "REVUE_DIRECTION": return <BarChart3 size={14} />;
      default: return <Target size={14} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans p-6 lg:p-10 ml-72 selection:bg-blue-600/30">
      <div className="max-w-400 mx-auto space-y-8">
        
        {/* HEADER FÉDÉRATEUR */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest">
                ISO 9001:2015 §10
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest">
                {stats.active} actives
              </span>
            </div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
              Amélioration <span className="text-blue-500">Continue</span>
            </h1>
            <p className="text-slate-500 font-bold text-[11px] uppercase tracking-[0.4em] mt-3 italic">
              Gestion Unifiée des Actions Correctives • Préventives • d&apos;Amélioration
            </p>
          </div>

          {/* ACTIONS D'EN-TÊTE */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
              {[
                { id: "kanban", icon: LayoutGrid, label: "Kanban" },
                { id: "list", icon: List, label: "Liste" },
                { id: "matrix", icon: Target, label: "Matrice" },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id as ViewMode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-none cursor-pointer ${
                    viewMode === mode.id
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <mode.icon size={14} />
                  {mode.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => router.push("/dashboard/improvement/actions/new/")}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 border-none cursor-pointer"
            >
              <Plus size={16} /> Nouvelle Action
            </button>
          </div>
        </header>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <StatCard title="Total Actions" value={stats.total} icon={Target} color="blue" subtext="Toutes sources confondues" />
          <StatCard title="En Cours" value={stats.active} icon={RefreshCcw} color="amber" subtext={`${Math.round((stats.active / (stats.total || 1)) * 100)}% du portefeuille`} />
          <StatCard title="En Retard" value={stats.late} icon={AlertCircle} color={stats.late > 0 ? "red" : "emerald"} subtext={stats.late > 0 ? "Action immédiate requise" : "À jour"} />
          <StatCard title="Complétées" value={stats.completed} icon={CheckCircle2} color="emerald" subtext={`${Math.round((stats.completed / (stats.total || 1)) * 100)}% réalisation`} />
          <StatCard title="Sources Audits" value={stats.bySource.audit} icon={FileText} color="purple" subtext="Internes & Externes" />
          <StatCard title="Sources NC" value={stats.bySource.nc} icon={AlertTriangle} color="orange" subtext="Non-conformités" />
        </div>

        {/* FILTRES ET RECHERCHE */}
        <div className="bg-slate-900/50 border border-white/10 rounded-4xl p-6 space-y-4 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Rechercher par référence, titre, responsable..."
                className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600 text-white italic"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all border cursor-pointer ${
                  showFilters
                    ? "bg-blue-600 border-blue-500 text-white shadow-xl"
                    : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                <Filter size={14} /> Filtres {(selectedFilters.source !== "ALL" || selectedFilters.status !== "ALL") && "•"}
              </button>
              <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white font-black uppercase text-[10px] tracking-widest border-none cursor-pointer">
                <Download size={14} /> Export
              </button>
            </div>
          </div>

          {/* PANNEAU DÉROULANT DES FILTRES */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2 duration-500">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic">Source</label>
                <select
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500 text-white italic"
                  value={selectedFilters.source}
                  onChange={(e) => setSelectedFilters({ ...selectedFilters, source: e.target.value as ActionSource })}
                >
                  <option value="ALL">Toutes sources</option>
                  <option value="AUDIT_INTERNE">Audit Interne</option>
                  <option value="AUDIT_EXTERNE">Audit Externe</option>
                  <option value="NC">Non-Conformité</option>
                  <option value="RECLAMATION">Réclamation</option>
                  <option value="COPIL">COPIL</option>
                  <option value="REVUE_DIRECTION">Revue Direction</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic">Statut</label>
                <select
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500 text-white italic"
                  value={selectedFilters.status}
                  onChange={(e) => setSelectedFilters({ ...selectedFilters, status: e.target.value as ActionStatus })}
                >
                  <option value="ALL">Tous statuts</option>
                  <option value="A_FAIRE">À faire</option>
                  <option value="EN_COURS">En cours</option>
                  <option value="A_VALIDER">À valider</option>
                  <option value="TERMINEE">Terminée</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic">Priorité</label>
                <select
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500 text-white italic"
                  value={selectedFilters.priority}
                  onChange={(e) => setSelectedFilters({ ...selectedFilters, priority: e.target.value as ActionPriority })}
                >
                  <option value="ALL">Toutes priorités</option>
                  <option value="CRITICAL">Critique</option>
                  <option value="HIGH">Haute</option>
                  <option value="MEDIUM">Moyenne</option>
                  <option value="LOW">Basse</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* CONTENT PAR VUE : KANBAN */}
        {viewMode === "kanban" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
            {(["A_FAIRE", "EN_COURS", "A_VALIDER", "TERMINEE"] as const).map((status) => {
              const statusActions = filteredActions.filter((a) => a.status === status);
              const isLateColumn = status === "A_FAIRE" && statusActions.some((a) => isPast(new Date(a.deadline)));

              return (
                <div key={status} className="bg-slate-900/30 rounded-[2.5rem] border border-white/5 p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-[11px] font-black uppercase tracking-widest flex items-center gap-2 ${status === "A_FAIRE" ? "text-slate-400" : status === "EN_COURS" ? "text-blue-400" : status === "A_VALIDER" ? "text-amber-400" : "text-emerald-400"}`}>
                      {status === "A_FAIRE" && <Clock size={14} />}
                      {status === "EN_COURS" && <RefreshCcw size={14} />}
                      {status === "A_VALIDER" && <CheckCircle2 size={14} />}
                      {status === "TERMINEE" && <ShieldCheck size={14} />}
                      {status.replace("_", " ")}
                      {isLateColumn && <span className="ml-2 text-red-500 animate-pulse">!</span>}
                    </h3>
                    <span className="text-[10px] font-black text-slate-500 bg-white/5 px-3 py-1 rounded-full">
                      {statusActions.length}
                    </span>
                  </div>
                  <div className="space-y-3 max-h-150 overflow-y-auto custom-scrollbar pr-1">
                    {statusActions.map((action) => (
                      <ActionCard key={action.id} action={action} onClick={() => router.push(`/dashboard/continuous-improvement/${action.id}`)} />
                    ))}
                    {statusActions.length === 0 && (
                      <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-20">
                        <p className="text-[10px] font-black uppercase italic">Flux vide</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CONTENT PAR VUE : LISTE */}
        {viewMode === "list" && (
          <div className="bg-slate-900/30 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/5">
                <tr>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Référence / Action</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Source</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Responsable</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Échéance</th>
                  <th className="p-6 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Progression</th>
                  <th className="p-6 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredActions.map((action) => (
                  <tr key={action.id} onClick={() => router.push(`/dashboard/continuous-improvement/${action.id}`)} className="hover:bg-white/5 transition-all cursor-pointer group">
                    <td className="p-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-blue-400 uppercase leading-none tracking-tighter">{action.reference}</p>
                        <p className="text-sm font-black uppercase italic text-white group-hover:text-blue-400 transition-colors leading-tight">{action.title}</p>
                        <div className="flex items-center gap-3 mt-2">
                          {action.evidencesCount > 0 && <span className="text-[9px] text-slate-600 flex items-center gap-1 font-bold italic"><Paperclip size={10} /> {action.evidencesCount} preuve(s)</span>}
                          {action.commentsCount > 0 && <span className="text-[9px] text-slate-600 flex items-center gap-1 font-bold italic"><FileText size={10} /> {action.commentsCount} note(s)</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 italic">
                        {getSourceIcon(action.source)} {action.source.replace("_", " ")}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-[10px] font-black text-blue-500">
                          {action.responsible.firstName[0]}{action.responsible.lastName[0]}
                        </div>
                        <span className="text-xs font-black uppercase italic">{action.responsible.firstName} {action.responsible.lastName}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className={`text-xs font-black uppercase italic ${isPast(new Date(action.deadline)) && action.status !== "TERMINEE" ? "text-red-500" : "text-slate-500"}`}>
                        {format(new Date(action.deadline), "dd MMM yyyy", { locale: fr })}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${action.progress}%` }} />
                        </div>
                        <span className="text-[10px] font-black text-slate-500">{action.progress}%</span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase border italic ${getStatusColor(action.status)}`}>
                        {action.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CONTENT PAR VUE : MATRICE D'EISENHOWER */}
        {viewMode === "matrix" && (
          <div className="bg-slate-900/30 rounded-[4rem] border border-white/5 p-12 shadow-2xl animate-in zoom-in duration-500 overflow-hidden">
            <h3 className="text-2xl font-black uppercase italic mb-6 flex items-center gap-4 tracking-tighter">
              <Target className="text-blue-500" size={32} /> Arbitrage Stratégique (Eisenhower Matrix)
            </h3>
            
            
            
            <div className="grid grid-cols-2 gap-8 h-150 mt-8">
              {/* QUADRANT 1: DO (Urgent & Important) */}
              <div className="bg-red-500/5 border border-red-500/10 rounded-[3rem] p-8 relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-6 left-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20"><AlertTriangle className="text-red-500" size={16} /></div>
                  <span className="text-xs font-black uppercase text-red-500 tracking-widest italic leading-none">DO : Urgent / Critique</span>
                </div>
                <div className="mt-14 space-y-3 overflow-y-auto max-h-full custom-scrollbar pr-2">
                  {filteredActions.filter(a => ["CRITICAL", "HIGH"].includes(a.priority) && (a.status === "EN_RETARD" || isPast(new Date(a.deadline)))).map(action => <MiniActionCard key={action.id} action={action} />)}
                </div>
              </div>

              {/* QUADRANT 2: SCHEDULE (Important, Non Urgent) */}
              <div className="bg-blue-500/5 border border-blue-500/10 rounded-[3rem] p-8 relative backdrop-blur-md">
                <div className="absolute top-6 left-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20"><Calendar className="text-blue-400" size={16} /></div>
                  <span className="text-xs font-black uppercase text-blue-400 tracking-widest italic leading-none">SCHEDULE : Planification</span>
                </div>
                <div className="mt-14 space-y-3 overflow-y-auto max-h-full custom-scrollbar pr-2">
                  {filteredActions.filter(a => ["HIGH", "MEDIUM"].includes(a.priority) && !isPast(new Date(a.deadline))).map(action => <MiniActionCard key={action.id} action={action} />)}
                </div>
              </div>

              {/* QUADRANT 3: DELEGATE (Urgent, Non Important) */}
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-[3rem] p-8 relative backdrop-blur-md">
                <div className="absolute top-6 left-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20"><Users className="text-amber-400" size={16} /></div>
                  <span className="text-xs font-black uppercase text-amber-400 tracking-widest italic leading-none">DELEGATE : Délégation</span>
                </div>
                <div className="mt-14 space-y-3 overflow-y-auto max-h-full custom-scrollbar pr-2">
                  {filteredActions.filter(a => ["LOW", "MEDIUM"].includes(a.priority) && a.status === "A_FAIRE").map(action => <MiniActionCard key={action.id} action={action} />)}
                </div>
              </div>

              {/* QUADRANT 4: DELETE (Ni Urgent, Ni Important) */}
              <div className="bg-slate-500/5 border border-slate-500/10 rounded-[3rem] p-8 relative backdrop-blur-md">
                <div className="absolute top-6 left-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-500/10 rounded-xl flex items-center justify-center border border-slate-500/20"><Zap className="text-slate-400" size={16} /></div>
                  <span className="text-xs font-black uppercase text-slate-400 tracking-widest italic leading-none">DELETE : Éliminer</span>
                </div>
                <div className="mt-14 space-y-3 overflow-y-auto max-h-full custom-scrollbar pr-2">
                  {filteredActions.filter(a => a.priority === "LOW" && a.status === "A_FAIRE").map(action => <MiniActionCard key={action.id} action={action} />)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANTS INTERNES
// ============================================================================

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: "blue" | "emerald" | "amber" | "red" | "purple" | "orange";
  subtext: string;
}

function StatCard({ title, value, icon: Icon, color, subtext }: StatCardProps) {
  const colorClasses = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    red: "text-red-400 bg-red-500/10 border-red-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    orange: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  };

  return (
    <div className="bg-slate-900/60 border border-white/5 p-8 rounded-[2.5rem] hover:border-blue-500/30 transition-all group shadow-2xl backdrop-blur-md">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border group-hover:scale-110 transition-transform duration-500 ${colorClasses[color]}`}>
        <Icon size={24} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 italic leading-none">{title}</p>
      <p className="text-4xl font-black italic tracking-tighter mb-4 leading-none">{value}</p>
      <p className="text-[9px] font-bold text-slate-600 uppercase italic tracking-widest">{subtext}</p>
    </div>
  );
}

interface ActionCardProps {
  action: ActionItem;
  onClick: () => void;
}

function ActionCard({ action, onClick }: ActionCardProps) {
  const isLate = isPast(new Date(action.deadline)) && action.status !== "TERMINEE";
  const daysLeft = differenceInDays(new Date(action.deadline), new Date());

  return (
    <div onClick={onClick} className="bg-white/5 border border-white/5 p-6 rounded-3xl hover:border-blue-500/40 hover:bg-white/10 transition-all cursor-pointer group space-y-4 shadow-xl backdrop-blur-md">
      <div className="flex justify-between items-start">
        <span className={`text-[9px] font-black uppercase px-2.5 py-1.5 rounded-xl border italic tracking-widest ${action.priority === "CRITICAL" ? "bg-red-500/10 text-red-400 border-red-500/20" : action.priority === "HIGH" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}>
          {action.reference}
        </span>
        {isLate && <AlertCircle size={18} className="text-red-500 animate-pulse" />}
      </div>
      <h4 className="text-md font-black uppercase italic leading-tight group-hover:text-blue-400 transition-colors line-clamp-2 tracking-tight">
        {action.title}
      </h4>
      <div className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase italic tracking-tighter">
        {action.source === "AUDIT_INTERNE" && <FileText size={12} className="text-purple-500" />}
        {action.source === "NC" && <AlertTriangle size={12} className="text-red-500" />}
        {action.source.replace("_", " ")}
      </div>
      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-[10px] font-black text-blue-500 shadow-lg">
            {action.responsible.firstName[0]}{action.responsible.lastName[0]}
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase italic">{action.responsible.lastName}</span>
        </div>
        <div className={`text-[10px] font-black uppercase italic tracking-tighter ${isLate ? "text-red-400" : daysLeft <= 7 ? "text-amber-400" : "text-slate-600"}`}>
          {isLate ? `${Math.abs(daysLeft)}j retard` : `${daysLeft}j restants`}
        </div>
      </div>
    </div>
  );
}

interface MiniActionCardProps {
  action: ActionItem;
}

function MiniActionCard({ action }: MiniActionCardProps) {
  const priorityColor = action.priority === "CRITICAL" ? "bg-red-500" : action.priority === "HIGH" ? "bg-orange-400" : action.priority === "MEDIUM" ? "bg-blue-400" : "bg-slate-500";
  
  return (
    <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer shadow-md group">
      <div className="flex items-center gap-4 flex-1 truncate">
        <div className={`w-2.5 h-2.5 rounded-full shadow-lg shrink-0 ${priorityColor}`} />
        <span className="text-sm font-black uppercase italic text-slate-200 truncate group-hover:text-white transition-colors tracking-tight">
          {action.title}
        </span>
      </div>
      <span className="text-[10px] font-black text-slate-700 italic uppercase ml-4 tracking-tighter shrink-0">{action.reference}</span>
    </div>
  );
}