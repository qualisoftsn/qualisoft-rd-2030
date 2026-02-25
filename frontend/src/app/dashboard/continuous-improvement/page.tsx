/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { differenceInDays, format, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast, Toaster } from 'sonner';
import {
  AlertCircle, AlertTriangle, BarChart3, Calendar,
  CheckCircle2, Clock, Download, FileText, Filter,
  LayoutGrid, List, Paperclip, Plus, RefreshCcw,
  Search, ShieldCheck, Target, Users, Zap, Activity,
  Fingerprint, Loader2, ChevronDown, ChevronUp
} from 'lucide-react';

// --- TYPES STRICTS (IDENTIQUES À L'ORIGINAL) ---
type ActionSource = 'AUDIT_INTERNE' | 'AUDIT_EXTERNE' | 'NC' | 'RECLAMATION' | 'COPIL' | 'REVUE_DIRECTION' | 'ANALYSE_RISQUE' | 'SUGGESTION' | 'AUTRE' | 'ALL';
type ActionStatus = 'A_FAIRE' | 'EN_COURS' | 'A_VALIDER' | 'TERMINEE' | 'ANNULEE' | 'EN_RETARD' | 'ALL';
type ActionPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'ALL';
type ViewMode = 'kanban' | 'list' | 'matrix';

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
  source: Exclude<ActionSource, 'ALL'>;
  sourceRef?: string;
  status: Exclude<ActionStatus, 'ALL'>;
  priority: Exclude<ActionPriority, 'ALL'>;
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

// --- UTILITAIRE CN ---
const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(' ');

export default function ContinuousImprovementHub() {
  const router = useRouter();

  // --- ÉTATS ---
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<{
    source: ActionSource;
    status: ActionStatus;
    priority: ActionPriority;
  }>({
    source: 'ALL',
    status: 'ALL',
    priority: 'ALL',
  });

  // --- CHARGEMENT DES ACTIONS ---
  const loadActions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<ActionItem[]>('/continuous-improvement/actions');
      setActions(res.data || []);
    } catch (err) {
      toast.error("RUPTURE DE FLUX : REGISTRE D'AMÉLIORATION INACCESSIBLE.");
      setActions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActions();
  }, [loadActions]);

  // --- FILTRAGE ---
  const filteredActions = useMemo(() => {
    return actions.filter((action) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        action.title.toLowerCase().includes(searchLower) ||
        action.reference.toLowerCase().includes(searchLower) ||
        action.responsible.lastName.toLowerCase().includes(searchLower);

      const matchesSource = selectedFilters.source === 'ALL' || action.source === selectedFilters.source;
      const matchesStatus = selectedFilters.status === 'ALL' || action.status === selectedFilters.status;
      const matchesPriority = selectedFilters.priority === 'ALL' || action.priority === selectedFilters.priority;

      return matchesSearch && matchesSource && matchesStatus && matchesPriority;
    });
  }, [actions, searchTerm, selectedFilters]);

  // --- STATISTIQUES ---
  const stats = useMemo(() => ({
    total: actions.length,
    active: actions.filter((a) => ['A_FAIRE', 'EN_COURS', 'A_VALIDER'].includes(a.status)).length,
    late: actions.filter((a) => isPast(new Date(a.deadline)) && a.status !== 'TERMINEE').length,
    completed: actions.filter((a) => a.status === 'TERMINEE').length,
    bySource: {
      audit: actions.filter((a) => ['AUDIT_INTERNE', 'AUDIT_EXTERNE'].includes(a.source)).length,
      nc: actions.filter((a) => a.source === 'NC').length,
      copil: actions.filter((a) => ['COPIL', 'REVUE_DIRECTION'].includes(a.source)).length,
    },
  }), [actions]);

  // --- HELPERS VISUELS ---
  const getStatusColor = (status: ActionStatus) => {
    const colors: Record<string, string> = {
      A_FAIRE: 'bg-gray-100 text-gray-700 border-gray-200',
      EN_COURS: 'bg-blue-50 text-blue-700 border-blue-200',
      A_VALIDER: 'bg-amber-50 text-amber-800 border-amber-200',
      TERMINEE: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      ANNULEE: 'bg-red-50 text-red-700 border-red-200',
      EN_RETARD: 'bg-red-50 text-red-700 border-red-300 border-l-4',
    };
    return colors[status] || colors.A_FAIRE;
  };

  const getSourceIcon = (source: ActionSource) => {
    switch (source) {
      case 'AUDIT_INTERNE':
        return <FileText size={16} className="text-purple-600" />;
      case 'AUDIT_EXTERNE':
        return <ShieldCheck size={16} className="text-indigo-600" />;
      case 'NC':
        return <AlertTriangle size={16} className="text-red-600" />;
      case 'COPIL':
        return <Users size={16} className="text-blue-600" />;
      case 'REVUE_DIRECTION':
        return <BarChart3 size={16} className="text-emerald-600" />;
      default:
        return <Target size={16} className="text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority: ActionPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Critique</span>;
      case 'HIGH':
        return <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">Haute</span>;
      case 'MEDIUM':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Moyenne</span>;
      case 'LOW':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Basse</span>;
      default:
        return null;
    }
  };

  // --- CHARGEMENT ---
  if (loading) {
    return (
      <div className="ml-72 flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative inline-block">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
            <Fingerprint className="absolute inset-0 h-12 w-12 text-indigo-300 animate-pulse opacity-30" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">Chargement du registre d&apos;amélioration continue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-72 bg-gray-50 min-h-screen p-6">
      <Toaster position="top-right" richColors />

      <div className="mx-auto max-w-7xl space-y-8">
        {/* HEADER */}
        <header className="flex flex-col gap-6 border-b border-gray-200 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800">
                  ISO 9001:2015 §10
                </span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                  {stats.active} actions actives
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-bold text-gray-900">Amélioration Continue</h1>
              <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                <Activity className="h-4 w-4 text-indigo-500" />
                Pilotage des actions correctives et préventives
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex rounded-lg border border-gray-300 bg-white p-1">
                {[
                  { id: 'kanban', icon: LayoutGrid, label: 'Kanban' },
                  { id: 'list', icon: List, label: 'Liste' },
                  { id: 'matrix', icon: Target, label: 'Matrice' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id as ViewMode)}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                      viewMode === mode.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <mode.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{mode.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => router.push('/dashboard/improvement/actions/new/')}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Plus className="h-4 w-4" />
                Nouvelle action
              </button>
            </div>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            <KPIStat title="Total actions" value={stats.total} icon={Target} color="indigo" />
            <KPIStat title="En cours" value={stats.active} icon={RefreshCcw} color="blue" subtext={`${Math.round((stats.active / (stats.total || 1)) * 100)}% du flux`} />
            <KPIStat
              title="En retard"
              value={stats.late}
              icon={AlertCircle}
              color={stats.late > 0 ? 'red' : 'emerald'}
              subtext={stats.late > 0 ? 'À traiter en urgence' : 'À jour'}
            />
            <KPIStat
              title="Clôturées"
              value={stats.completed}
              icon={CheckCircle2}
              color="emerald"
              subtext={`${Math.round((stats.completed / (stats.total || 1)) * 100)}% d'efficacité`}
            />
            <KPIStat title="Audits" value={stats.bySource.audit} icon={FileText} color="purple" subtext="Sources internes/externes" />
            <KPIStat title="NC" value={stats.bySource.nc} icon={AlertTriangle} color="orange" subtext="Non-conformités" />
          </div>
        </header>

        {/* BARRE DE RECHERCHE & FILTRES */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par référence, titre ou responsable..."
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                    showFilters || selectedFilters.source !== 'ALL' || selectedFilters.status !== 'ALL' || selectedFilters.priority !== 'ALL'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'text-gray-700 hover:bg-gray-100 border border-gray-300'
                  )}
                >
                  <Filter className="h-4 w-4" />
                  Filtres
                  {selectedFilters.source !== 'ALL' || selectedFilters.status !== 'ALL' || selectedFilters.priority !== 'ALL' ? (
                    <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-700">
                      •
                    </span>
                  ) : null}
                  {showFilters ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                </button>

                <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Download className="h-4 w-4" />
                  Exporter
                </button>

                <button
                  onClick={loadActions}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  title="Actualiser"
                >
                  <RefreshCcw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* PANNEAU FILTRES */}
            {showFilters && (
              <div className="mt-6 grid grid-cols-1 gap-6 border-t border-gray-200 pt-6 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Source normative</label>
                  <select
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-10 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    value={selectedFilters.source}
                    onChange={(e) => setSelectedFilters({ ...selectedFilters, source: e.target.value as ActionSource })}
                  >
                    <option value="ALL">Toutes les sources</option>
                    <option value="AUDIT_INTERNE">Audit interne</option>
                    <option value="AUDIT_EXTERNE">Audit externe</option>
                    <option value="NC">Non-conformité (NC)</option>
                    <option value="RECLAMATION">Réclamation client</option>
                    <option value="COPIL">Comité de pilotage</option>
                    <option value="REVUE_DIRECTION">Revue de direction</option>
                    <option value="ANALYSE_RISQUE">Analyse des risques</option>
                    <option value="SUGGESTION">Suggestion d&apos;amélioration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Statut</label>
                  <select
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-10 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    value={selectedFilters.status}
                    onChange={(e) => setSelectedFilters({ ...selectedFilters, status: e.target.value as ActionStatus })}
                  >
                    <option value="ALL">Tous les statuts</option>
                    <option value="A_FAIRE">À faire</option>
                    <option value="EN_COURS">En cours</option>
                    <option value="A_VALIDER">À valider</option>
                    <option value="TERMINEE">Terminée</option>
                    <option value="ANNULEE">Annulée</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Priorité</label>
                  <select
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-10 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    value={selectedFilters.priority}
                    onChange={(e) => setSelectedFilters({ ...selectedFilters, priority: e.target.value as ActionPriority })}
                  >
                    <option value="ALL">Toutes les priorités</option>
                    <option value="CRITICAL">Critique</option>
                    <option value="HIGH">Haute</option>
                    <option value="MEDIUM">Moyenne</option>
                    <option value="LOW">Basse</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* VUES */}
        {viewMode === 'kanban' && <KanbanView actions={filteredActions} router={router} />}
        {viewMode === 'list' && <ListView actions={filteredActions} router={router} getStatusColor={getStatusColor} getSourceIcon={getSourceIcon} getPriorityBadge={getPriorityBadge} />}
        {viewMode === 'matrix' && <MatrixView actions={filteredActions} router={router} />}
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANTS CLICKUP-STYLE
// ============================================================================

function KPIStat({
  title,
  value,
  icon: Icon,
  color,
  subtext,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  subtext?: string;
}) {
  const colorClasses = {
    indigo: 'text-indigo-600 bg-indigo-50',
    blue: 'text-blue-600 bg-blue-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    red: 'text-red-600 bg-red-50',
    purple: 'text-purple-600 bg-purple-50',
    orange: 'text-orange-600 bg-orange-50',
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
      <div className={`inline-flex rounded-lg p-2 ${colorClasses[color as keyof typeof colorClasses]}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="mt-3">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        {subtext && <p className="mt-1 text-xs text-gray-500">{subtext}</p>}
      </div>
    </div>
  );
}

function KanbanView({
  actions,
  router,
}: {
  actions: ActionItem[];
  router: ReturnType<typeof useRouter>;
}) {
  const columns: { id: ActionStatus; title: string; icon: React.ElementType }[] = [
    { id: 'A_FAIRE', title: 'À faire', icon: Clock },
    { id: 'EN_COURS', title: 'En cours', icon: RefreshCcw },
    { id: 'A_VALIDER', title: 'À valider', icon: CheckCircle2 },
    { id: 'TERMINEE', title: 'Terminée', icon: ShieldCheck },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {columns.map((column) => {
        const columnActions = actions.filter((a) => a.status === column.id);
        const isLate = column.id === 'A_FAIRE' && columnActions.some((a) => isPast(new Date(a.deadline)));

        return (
          <div key={column.id} className="rounded-xl bg-white shadow-sm border border-gray-200 flex flex-col">
            <div className="border-b border-gray-200 px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <column.icon className={`h-4 w-4 ${column.id === 'A_FAIRE' ? 'text-gray-500' : column.id === 'EN_COURS' ? 'text-blue-600' : column.id === 'A_VALIDER' ? 'text-amber-600' : 'text-emerald-600'}`} />
                  <h2 className="text-sm font-medium text-gray-900">{column.title}</h2>
                </div>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                  {columnActions.length}
                </span>
              </div>
              {isLate && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Actions en retard
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-100">
              {columnActions.length > 0 ? (
                columnActions.map((action) => (
                  <KanbanCard key={action.id} action={action} onClick={() => router.push(`/dashboard/continuous-improvement/${action.id}`)} />
                ))
              ) : (
                <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-8 text-center">
                  <Target className="h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Aucune action</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KanbanCard({ action, onClick }: { action: ActionItem; onClick: () => void }) {
  const isLate = isPast(new Date(action.deadline)) && action.status !== 'TERMINEE';
  const daysLeft = differenceInDays(new Date(action.deadline), new Date());

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {action.priority === 'CRITICAL' && (
            <div className="h-2 w-2 rounded-full bg-red-500" />
          )}
          {action.priority === 'HIGH' && (
            <div className="h-2 w-2 rounded-full bg-orange-500" />
          )}
        </div>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">{action.reference}</span>
      </div>

      <h3 className="mt-2 line-clamp-2 text-sm font-medium text-gray-900">{action.title}</h3>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700 border border-gray-300">
            {action.responsible.firstName[0]}
            {action.responsible.lastName[0]}
          </div>
          <span className="text-xs text-gray-600">{action.responsible.lastName}</span>
        </div>
        <div
          className={`text-xs font-medium ${
            isLate ? 'text-red-600' : daysLeft <= 7 ? 'text-amber-600' : 'text-gray-600'
          }`}
        >
          {isLate ? `-${Math.abs(daysLeft)}j` : `${daysLeft}j`}
        </div>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-indigo-600"
          style={{ width: `${action.progress}%` }}
        />
      </div>
    </div>
  );
}

function ListView({
  actions,
  router,
  getStatusColor,
  getSourceIcon,
  getPriorityBadge,
}: {
  actions: ActionItem[];
  router: ReturnType<typeof useRouter>;
  getStatusColor: (status: ActionStatus) => string;
  getSourceIcon: (source: ActionSource) => React.ReactNode;
  getPriorityBadge: (priority: ActionPriority) => React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Échéance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progression</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {actions.map((action) => {
              const isLate = isPast(new Date(action.deadline)) && action.status !== 'TERMINEE';
              return (
                <tr
                  key={action.id}
                  onClick={() => router.push(`/dashboard/continuous-improvement/${action.id}`)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{action.reference}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{action.title}</div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                      {action.evidencesCount > 0 && (
                        <div className="flex items-center gap-1">
                          <Paperclip className="h-3.5 w-3.5" />
                          <span>{action.evidencesCount}</span>
                        </div>
                      )}
                      {action.commentsCount > 0 && (
                        <div className="flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5" />
                          <span>{action.commentsCount}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="rounded bg-gray-100 p-1">{getSourceIcon(action.source)}</div>
                      <span className="capitalize">{action.source.replace('_', ' ').toLowerCase()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700 border border-gray-300">
                        {action.responsible.firstName[0]}
                        {action.responsible.lastName[0]}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {action.responsible.firstName} {action.responsible.lastName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isLate ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                      <Calendar className="mr-1.5 inline h-3.5 w-3.5 text-gray-400" />
                      {format(new Date(action.deadline), 'dd MMM yyyy', { locale: fr })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-24">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-indigo-600"
                            style={{ width: `${action.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 w-8 text-right">{action.progress}%</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(action.status)}`}
                    >
                      {action.status.replace('_', ' ').toLowerCase()}
                    </span>
                  </td>
                </tr>
              );
            })}
            {actions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                  Aucune action ne correspond aux critères de filtrage
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MatrixView({ actions, router }: { actions: ActionItem[]; router: ReturnType<typeof useRouter> }) {
  const quadrants = [
    {
      id: 'urgent-important',
      title: 'Faire maintenant',
      description: 'Urgent & Important',
      color: 'bg-red-50 border-red-200',
      actions: actions.filter(
        (a) => ['CRITICAL', 'HIGH'].includes(a.priority) && (a.status === 'EN_RETARD' || isPast(new Date(a.deadline)))
      ),
    },
    {
      id: 'not-urgent-important',
      title: 'Planifier',
      description: 'Important, Non Urgent',
      color: 'bg-blue-50 border-blue-200',
      actions: actions.filter(
        (a) => ['HIGH', 'MEDIUM'].includes(a.priority) && !isPast(new Date(a.deadline)) && a.status !== 'EN_RETARD'
      ),
    },
    {
      id: 'urgent-not-important',
      title: 'Déléguer',
      description: 'Urgent, Non Important',
      color: 'bg-amber-50 border-amber-200',
      actions: actions.filter(
        (a) => ['LOW', 'MEDIUM'].includes(a.priority) && a.status === 'A_FAIRE' && isPast(new Date(a.deadline))
      ),
    },
    {
      id: 'not-urgent-not-important',
      title: 'Éliminer',
      description: 'Ni Urgent, Ni Important',
      color: 'bg-gray-50 border-gray-200',
      actions: actions.filter((a) => a.priority === 'LOW' && a.status === 'A_FAIRE' && !isPast(new Date(a.deadline))),
    },
  ];

  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-200 p-6">
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Target className="h-5 w-5 text-indigo-600" />
          Matrice d&apos;Eisenhower — Arbitrage stratégique
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Priorisez vos actions selon leur urgence et leur importance stratégique
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {quadrants.map((quadrant) => (
          <div
            key={quadrant.id}
            className={`rounded-xl border ${quadrant.color} p-5`}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">{quadrant.title}</h3>
                <p className="mt-0.5 text-sm text-gray-600">{quadrant.description}</p>
              </div>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-gray-700 border border-gray-300">
                {quadrant.actions.length}
              </span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {quadrant.actions.length > 0 ? (
                quadrant.actions.map((action) => (
                  <div
                    key={action.id}
                    onClick={() => router.push(`/dashboard/continuous-improvement/${action.id}`)}
                    className="cursor-pointer rounded-md border border-gray-200 bg-white p-3 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{action.title}</p>
                        <p className="mt-0.5 text-xs text-gray-500">{action.reference}</p>
                      </div>
                      <div className={`ml-3 flex h-2 w-2 shrink-0 rounded-full ${action.priority === 'CRITICAL' ? 'bg-red-500' : action.priority === 'HIGH' ? 'bg-orange-500' : action.priority === 'MEDIUM' ? 'bg-blue-500' : 'bg-gray-400'}`} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                  <CheckCircle2 className="h-6 w-6 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Aucune action</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}