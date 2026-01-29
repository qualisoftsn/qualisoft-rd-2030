/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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

// Types unifiés pour toutes les sources d'actions
type ActionSource =
  | "AUDIT_INTERNE"
  | "AUDIT_EXTERNE"
  | "NC"
  | "RECLAMATION"
  | "COPIL"
  | "REVUE_DIRECTION"
  | "ANALYSE_RISQUE"
  | "SUGGESTION"
  | "AUTRE";
type ActionStatus =
  | "A_FAIRE"
  | "EN_COURS"
  | "A_VALIDER"
  | "TERMINEE"
  | "ANNULEE"
  | "EN_RETARD";
type ActionPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

interface ActionItem {
  id: string;
  reference: string; // Ex: AC-2024-001
  title: string;
  description?: string;
  source: ActionSource;
  sourceRef?: string; // Référence de l'audit/NC d'origine
  status: ActionStatus;
  priority: ActionPriority;
  progress: number; // 0-100%
  responsible: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  deadline: string;
  createdAt: string;
  evidencesCount: number;
  commentsCount: number;
  processus?: string;
  paqId?: string;
  planId?: string; // Liens vers plans d'action spécifiques
}

export default function ContinuousImprovementHub() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"kanban" | "list" | "matrix">(
    "kanban",
  );
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<{
    source: ActionSource | "ALL";
    status: ActionStatus | "ALL";
    priority: ActionPriority | "ALL";
  }>({ source: "ALL", status: "ALL", priority: "ALL" });
  const [showFilters, setShowFilters] = useState(false);

  // Chargement unifié de toutes les actions (quelque soit la source)
  const loadActions = useCallback(async () => {
    try {
      setLoading(true);
      // Endpoint unifié qui agrège actions, action-items, et plans
      const res = await apiClient.get("/continuous-improvement/actions");
      setActions(res.data || []);
    } catch (err) {
      console.error("Erreur chargement amélioration continue:", err);
      // Données de démo cohérentes
      setActions([
        {
          id: "1",
          reference: "AC-2024-089",
          title: "Mise à jour procédure gestion des changements",
          description: "Suite audit interne Q4",
          source: "AUDIT_INTERNE",
          sourceRef: "AI-2024-045",
          status: "EN_COURS",
          priority: "HIGH",
          progress: 65,
          responsible: { id: "1", firstName: "Marie", lastName: "Diallo" },
          deadline: "2024-12-15",
          createdAt: "2024-11-01",
          evidencesCount: 3,
          commentsCount: 5,
          processus: "Management Qualité",
        },
        {
          id: "2",
          reference: "NC-2024-012-AC",
          title: "Corrective sécurité accès serveur",
          source: "NC",
          sourceRef: "NC-2024-012",
          status: "A_FAIRE",
          priority: "CRITICAL",
          progress: 0,
          responsible: { id: "2", firstName: "Jean", lastName: "Ndiaye" },
          deadline: "2024-11-20",
          createdAt: "2024-11-10",
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

  // Filtrage intelligent
  const filteredActions = useMemo(() => {
    return actions.filter((action) => {
      const matchesSearch =
        action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.responsible.lastName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesSource =
        selectedFilters.source === "ALL" ||
        action.source === selectedFilters.source;
      const matchesStatus =
        selectedFilters.status === "ALL" ||
        action.status === selectedFilters.status;
      const matchesPriority =
        selectedFilters.priority === "ALL" ||
        action.priority === selectedFilters.priority;

      return matchesSearch && matchesSource && matchesStatus && matchesPriority;
    });
  }, [actions, searchTerm, selectedFilters]);

  // Statistiques globales
  const stats = useMemo(
    () => ({
      total: actions.length,
      active: actions.filter((a) =>
        ["A_FAIRE", "EN_COURS", "A_VALIDER"].includes(a.status),
      ).length,
      late: actions.filter(
        (a) => isPast(new Date(a.deadline)) && a.status !== "TERMINEE",
      ).length,
      completed: actions.filter((a) => a.status === "TERMINEE").length,
      bySource: {
        audit: actions.filter((a) =>
          ["AUDIT_INTERNE", "AUDIT_EXTERNE"].includes(a.source),
        ).length,
        nc: actions.filter((a) => a.source === "NC").length,
        copil: actions.filter((a) =>
          ["COPIL", "REVUE_DIRECTION"].includes(a.source),
        ).length,
      },
    }),
    [actions],
  );

  // Helper couleurs
  const getStatusColor = (status: ActionStatus) => {
    const colors = {
      A_FAIRE: "bg-slate-500/20 text-slate-400 border-slate-500/30",
      EN_COURS: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      A_VALIDER: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      TERMINEE: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      ANNULEE: "bg-red-500/20 text-red-400 border-red-500/30",
      EN_RETARD: "bg-red-600/20 text-red-500 border-red-600/30 animate-pulse",
    };
    return colors[status] || colors["A_FAIRE"];
  };

  const getPriorityColor = (priority: ActionPriority) => {
    const colors = {
      CRITICAL: "text-red-500",
      HIGH: "text-orange-400",
      MEDIUM: "text-blue-400",
      LOW: "text-slate-400",
    };
    return colors[priority];
  };

  const getSourceIcon = (source: ActionSource) => {
    switch (source) {
      case "AUDIT_INTERNE":
        return <FileText size={14} />;
      case "AUDIT_EXTERNE":
        return <ShieldCheck size={14} />;
      case "NC":
        return <AlertTriangle size={14} />;
      case "COPIL":
        return <Users size={14} />;
      case "REVUE_DIRECTION":
        return <BarChart3 size={14} />;
      default:
        return <Target size={14} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans p-6 lg:p-10 ml-72">
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
            <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
              Amélioration <span className="text-blue-500">Continue</span>
            </h1>
            <p className="text-slate-500 font-bold text-[11px] uppercase tracking-[0.4em] mt-3">
              Gestion Unifiée des Actions Correctives • Préventives •
              d&apos;Amélioration
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
              {[
                { id: "kanban", icon: LayoutGrid, label: "Kanban" },
                { id: "list", icon: List, label: "Liste" },
                { id: "matrix", icon: Target, label: "Matrice" },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
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
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40"
            >
              <Plus size={16} /> Nouvelle Action
            </button>
          </div>
        </header>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total Actions"
            value={stats.total}
            icon={Target}
            color="blue"
            subtext="Toutes sources confondues"
          />
          <StatCard
            title="En Cours"
            value={stats.active}
            icon={RefreshCcw}
            color="amber"
            subtext={`${Math.round((stats.active / stats.total) * 100)}% du portefeuille`}
          />
          <StatCard
            title="En Retard"
            value={stats.late}
            icon={AlertCircle}
            color={stats.late > 0 ? "red" : "emerald"}
            subtext={stats.late > 0 ? "Action immédiate requise" : "À jour"}
          />
          <StatCard
            title="Complétées"
            value={stats.completed}
            icon={CheckCircle2}
            color="emerald"
            subtext={`${Math.round((stats.completed / stats.total) * 100)}% taux réalisation`}
          />
          <StatCard
            title="Sources Audits"
            value={stats.bySource.audit}
            icon={FileText}
            color="purple"
            subtext="Internes & Externes"
          />
          <StatCard
            title="Sources NC"
            value={stats.bySource.nc}
            icon={AlertTriangle}
            color="orange"
            subtext="Non-conformités"
          />
        </div>

        {/* FILTRES ET RECHERCHE */}
        <div className="bg-slate-900/50 border border-white/10 rounded-4xl p-6 space-y-4 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Rechercher par référence, titre, responsable..."
                className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all border ${
                  showFilters
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                <Filter size={14} />
                Filtres{" "}
                {(selectedFilters.source !== "ALL" ||
                  selectedFilters.status !== "ALL") &&
                  "•"}
              </button>

              <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white font-black uppercase text-[10px] tracking-widest transition-all">
                <Download size={14} /> Export
              </button>
            </div>
          </div>

          {/* PANEL FILTRES AVANCÉS */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                  Source
                </label>
                <select
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500"
                  value={selectedFilters.source}
                  onChange={(e) =>
                    setSelectedFilters({
                      ...selectedFilters,
                      source: e.target.value as any,
                    })
                  }
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
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                  Statut
                </label>
                <select
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500"
                  value={selectedFilters.status}
                  onChange={(e) =>
                    setSelectedFilters({
                      ...selectedFilters,
                      status: e.target.value as any,
                    })
                  }
                >
                  <option value="ALL">Tous statuts</option>
                  <option value="A_FAIRE">À faire</option>
                  <option value="EN_COURS">En cours</option>
                  <option value="A_VALIDER">À valider</option>
                  <option value="TERMINEE">Terminée</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                  Priorité
                </label>
                <select
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500"
                  value={selectedFilters.priority}
                  onChange={(e) =>
                    setSelectedFilters({
                      ...selectedFilters,
                      priority: e.target.value as any,
                    })
                  }
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

        {/* CONTENT PAR VUE */}
        {viewMode === "kanban" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {["A_FAIRE", "EN_COURS", "A_VALIDER", "TERMINEE"].map((status) => {
              const statusActions = filteredActions.filter(
                (a) => a.status === status,
              );
              const isLate =
                status === "A_FAIRE" &&
                statusActions.some((a) => isPast(new Date(a.deadline)));

              return (
                <div
                  key={status}
                  className="bg-slate-900/30 rounded-[2.5rem] border border-white/5 p-6 space-y-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className={`text-[11px] font-black uppercase tracking-widest flex items-center gap-2 ${
                        status === "A_FAIRE"
                          ? "text-slate-400"
                          : status === "EN_COURS"
                            ? "text-blue-400"
                            : status === "A_VALIDER"
                              ? "text-amber-400"
                              : "text-emerald-400"
                      }`}
                    >
                      {status === "A_FAIRE" && <Clock size={14} />}
                      {status === "EN_COURS" && <RefreshCcw size={14} />}
                      {status === "A_VALIDER" && <CheckCircle2 size={14} />}
                      {status === "TERMINEE" && <ShieldCheck size={14} />}
                      {status.replace("_", " ")}
                      {isLate && (
                        <span className="ml-2 text-red-500 animate-pulse">
                          !
                        </span>
                      )}
                    </h3>
                    <span className="text-[10px] font-black text-slate-500 bg-white/5 px-3 py-1 rounded-full">
                      {statusActions.length}
                    </span>
                  </div>

                  <div className="space-y-3 max-h-150 overflow-y-auto custom-scrollbar pr-1">
                    {statusActions.map((action) => (
                      <ActionCard
                        key={action.id}
                        action={action}
                        onClick={() =>
                          router.push(
                            `/dashboard/continuous-improvement/${action.id}`,
                          )
                        }
                      />
                    ))}
                    {statusActions.length === 0 && (
                      <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-2xl">
                        <p className="text-[10px] font-black uppercase text-slate-600">
                          Aucune action
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {viewMode === "list" && (
          <div className="bg-slate-900/30 rounded-[2.5rem] border border-white/5 overflow-hidden">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/5">
                <tr>
                  <th className="p-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Référence / Action
                  </th>
                  <th className="p-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Source
                  </th>
                  <th className="p-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Responsable
                  </th>
                  <th className="p-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Échéance
                  </th>
                  <th className="p-6 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Progression
                  </th>
                  <th className="p-6 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredActions.map((action) => (
                  <tr
                    key={action.id}
                    onClick={() =>
                      router.push(
                        `/dashboard/continuous-improvement/${action.id}`,
                      )
                    }
                    className="border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer group"
                  >
                    <td className="p-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">
                          {action.reference}
                        </p>
                        <p className="text-sm font-black uppercase italic text-white group-hover:text-blue-400 transition-colors">
                          {action.title}
                        </p>
                        <div className="flex items-center gap-2">
                          {action.evidencesCount > 0 && (
                            <span className="text-[9px] text-slate-500 flex items-center gap-1">
                              <Paperclip size={10} /> {action.evidencesCount}
                            </span>
                          )}
                          {action.commentsCount > 0 && (
                            <span className="text-[9px] text-slate-500 flex items-center gap-1">
                              <FileText size={10} /> {action.commentsCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                        {getSourceIcon(action.source)}
                        {action.source.replace("_", " ")}
                      </div>
                      {action.sourceRef && (
                        <p className="text-[9px] text-slate-600 mt-1">
                          Ref: {action.sourceRef}
                        </p>
                      )}
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-600 to-blue-800 flex items-center justify-center text-[10px] font-black">
                          {action.responsible.firstName[0]}
                          {action.responsible.lastName[0]}
                        </div>
                        <span className="text-xs font-bold uppercase">
                          {action.responsible.firstName}{" "}
                          {action.responsible.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div
                        className={`text-xs font-black uppercase ${isPast(new Date(action.deadline)) && action.status !== "TERMINEE" ? "text-red-500" : "text-slate-400"}`}
                      >
                        {format(new Date(action.deadline), "dd MMM yyyy", {
                          locale: fr,
                        })}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${action.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 w-8">
                          {action.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <span
                        className={`px-4 py-2 rounded-full text-[9px] font-black uppercase border ${getStatusColor(action.status)}`}
                      >
                        {action.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === "matrix" && (
          <div className="bg-slate-900/30 rounded-[3rem] border border-white/5 p-10 relative overflow-hidden">
            <h3 className="text-lg font-black uppercase italic mb-8 flex items-center gap-3">
              <Target className="text-blue-500" size={24} />
              Matrice de Priorité (Impact vs Urgence)
            </h3>

            <div className="grid grid-cols-2 gap-4 h-150">
              {/* Quadrant Haute Priorité */}
              <div className="bg-red-500/5 border border-red-500/10 rounded-4xl p-6 relative overflow-hidden">
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <AlertTriangle className="text-red-500" size={16} />
                  <span className="text-xs font-black uppercase text-red-500">
                    Urgent / Important
                  </span>
                </div>
                <div className="mt-12 space-y-2 overflow-y-auto max-h-full custom-scrollbar">
                  {filteredActions
                    .filter(
                      (a) =>
                        ["CRITICAL", "HIGH"].includes(a.priority) &&
                        (a.status === "EN_RETARD" ||
                          isPast(new Date(a.deadline))),
                    )
                    .map((action) => (
                      <MiniActionCard key={action.id} action={action} />
                    ))}
                </div>
              </div>

              {/* Quadrant Planifié */}
              <div className="bg-blue-500/5 border border-blue-500/10 rounded-4xl p-6 relative">
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <Calendar className="text-blue-400" size={16} />
                  <span className="text-xs font-black uppercase text-blue-400">
                    Non Urgent / Important
                  </span>
                </div>
                <div className="mt-12 space-y-2 overflow-y-auto max-h-full custom-scrollbar">
                  {filteredActions
                    .filter(
                      (a) =>
                        ["HIGH", "MEDIUM"].includes(a.priority) &&
                        !isPast(new Date(a.deadline)),
                    )
                    .map((action) => (
                      <MiniActionCard key={action.id} action={action} />
                    ))}
                </div>
              </div>

              {/* Quadrant Délégable */}
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-4xl p-6 relative">
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <Users className="text-amber-400" size={16} />
                  <span className="text-xs font-black uppercase text-amber-400">
                    Urgent / Peu Important
                  </span>
                </div>
                <div className="mt-12 space-y-2 overflow-y-auto max-h-full custom-scrollbar">
                  {filteredActions
                    .filter(
                      (a) =>
                        ["LOW", "MEDIUM"].includes(a.priority) &&
                        a.status === "A_FAIRE",
                    )
                    .map((action) => (
                      <MiniActionCard key={action.id} action={action} />
                    ))}
                </div>
              </div>

              {/* Quadrant Éliminer */}
              <div className="bg-slate-500/5 border border-slate-500/10 rounded-4xl p-6 relative">
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <Zap className="text-slate-400" size={16} />
                  <span className="text-xs font-black uppercase text-slate-400">
                    Non Urgent / Peu Important
                  </span>
                </div>
                <div className="mt-12 space-y-2 overflow-y-auto max-h-full custom-scrollbar">
                  {filteredActions
                    .filter(
                      (a) => a.priority === "LOW" && a.status === "A_FAIRE",
                    )
                    .map((action) => (
                      <MiniActionCard key={action.id} action={action} />
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Composants internes

function StatCard({ title, value, icon: Icon, color, subtext }: any) {
  const colorClasses = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    red: "text-red-400 bg-red-500/10 border-red-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    orange: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  };

  return (
    <div className="bg-slate-900/40 border border-white/5 p-6 rounded-4xl hover:bg-white/5 transition-all group">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${colorClasses[color as keyof typeof colorClasses]}`}
      >
        <Icon size={20} />
      </div>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">
        {title}
      </p>
      <p className="text-3xl font-black italic tracking-tight mb-2">{value}</p>
      <p className="text-[9px] font-bold text-slate-600 uppercase leading-tight">
        {subtext}
      </p>
    </div>
  );
}

function ActionCard({
  action,
  onClick,
}: {
  action: ActionItem;
  onClick: () => void;
}) {
  const isLate =
    isPast(new Date(action.deadline)) && action.status !== "TERMINEE";
  const daysLeft = differenceInDays(new Date(action.deadline), new Date());

  return (
    <div
      onClick={onClick}
      className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl hover:border-blue-500/30 hover:bg-slate-800/60 transition-all cursor-pointer group space-y-3"
    >
      <div className="flex justify-between items-start">
        <span
          className={`text-[9px] font-black uppercase px-2 py-1 rounded border ${
            action.priority === "CRITICAL"
              ? "bg-red-500/10 text-red-400 border-red-500/20"
              : action.priority === "HIGH"
                ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                : "bg-slate-500/10 text-slate-400 border-slate-500/20"
          }`}
        >
          {action.reference}
        </span>
        {isLate && (
          <AlertCircle size={16} className="text-red-500 animate-pulse" />
        )}
      </div>

      <h4 className="text-sm font-black uppercase italic leading-tight group-hover:text-blue-400 transition-colors line-clamp-2">
        {action.title}
      </h4>

      <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase">
        {action.source === "AUDIT_INTERNE" && (
          <FileText size={12} className="text-purple-400" />
        )}
        {action.source === "NC" && (
          <AlertTriangle size={12} className="text-red-400" />
        )}
        {action.source}
      </div>

      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center text-[8px] font-black text-blue-400">
            {action.responsible.firstName[0]}
            {action.responsible.lastName[0]}
          </div>
          <span className="text-[9px] font-bold text-slate-400 uppercase">
            {action.responsible.lastName}
          </span>
        </div>

        <div
          className={`text-[9px] font-black uppercase ${isLate ? "text-red-400" : daysLeft <= 7 ? "text-amber-400" : "text-slate-500"}`}
        >
          {isLate ? `${Math.abs(daysLeft)}j retard` : `${daysLeft}j restants`}
        </div>
      </div>

      {action.progress > 0 && action.status !== "TERMINEE" && (
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${action.progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

function MiniActionCard({ action }: { action: ActionItem }) {
  return (
    <div className="bg-black/20 border border-white/5 p-3 rounded-xl flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        <div
          className={`w-2 h-2 rounded-full ${
            action.priority === "CRITICAL"
              ? "bg-red-500"
              : action.priority === "HIGH"
                ? "bg-orange-400"
                : action.priority === "MEDIUM"
                  ? "bg-blue-400"
                  : "bg-slate-400"
          }`}
        />
        <span className="text-xs font-bold uppercase italic text-slate-300 truncate max-w-50">
          {action.title}
        </span>
      </div>
      <span className="text-[9px] font-black text-slate-600">
        {action.reference}
      </span>
    </div>
  );
}
