/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 MODULE : REGISTRE D'AMÉLIORATION CONTINUE (HUB)
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage des actions correctives, préventives et d'amélioration.
 * FIX : Ajout du responsive (lg:ml-72), sécurisation des retours API,
 * et intégration de schémas explicatifs pour la matrice d'Eisenhower.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 01:51 GMT
 */

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

// --- TYPES STRICTS ---
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

const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

export default function ContinuousImprovementHub() {
  const router = useRouter();

  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<{ source: ActionSource; status: ActionStatus; priority: ActionPriority }>({
    source: 'ALL', status: 'ALL', priority: 'ALL',
  });

  const loadActions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/continuous-improvement/actions');
      const data = res.data?.data || res.data;
      setActions(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("RUPTURE DE FLUX : REGISTRE D'AMÉLIORATION INACCESSIBLE.");
      setActions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadActions(); }, [loadActions]);

  const filteredActions = useMemo(() => {
    return actions.filter((action) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = action.title.toLowerCase().includes(searchLower) || action.reference.toLowerCase().includes(searchLower) || action.responsible.lastName.toLowerCase().includes(searchLower);
      const matchesSource = selectedFilters.source === 'ALL' || action.source === selectedFilters.source;
      const matchesStatus = selectedFilters.status === 'ALL' || action.status === selectedFilters.status;
      const matchesPriority = selectedFilters.priority === 'ALL' || action.priority === selectedFilters.priority;
      return matchesSearch && matchesSource && matchesStatus && matchesPriority;
    });
  }, [actions, searchTerm, selectedFilters]);

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
      case 'AUDIT_INTERNE': return <FileText size={16} className="text-purple-600" />;
      case 'AUDIT_EXTERNE': return <ShieldCheck size={16} className="text-indigo-600" />;
      case 'NC': return <AlertTriangle size={16} className="text-red-600" />;
      case 'COPIL': return <Users size={16} className="text-blue-600" />;
      case 'REVUE_DIRECTION': return <BarChart3 size={16} className="text-emerald-600" />;
      default: return <Target size={16} className="text-gray-600" />;
    }
  };

  if (loading && actions.length === 0) {
    return (
      <div className="ml-0 lg:ml-72 flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative inline-block">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
            <Fingerprint className="absolute inset-0 h-12 w-12 text-indigo-300 animate-pulse opacity-30" />
          </div>
          <p className="mt-4 text-sm font-black uppercase tracking-widest text-gray-600 italic">Chargement du registre...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-0 lg:ml-72 bg-gray-50 min-h-screen p-4 sm:p-6 pb-24 font-sans">
      <Toaster position="top-right" richColors />

      <div className="mx-auto max-w-7xl space-y-8 mt-12 lg:mt-0">
        {/* HEADER */}
        <header className="flex flex-col gap-6 border-b border-gray-200 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-800 border border-indigo-200">
                  ISO 9001:2015 §10
                </span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-800 border border-emerald-200">
                  {stats.active} actions actives
                </span>
              </div>
              <h1 className="mt-4 text-3xl font-black uppercase italic text-gray-900 tracking-tighter m-0">Amélioration Continue</h1>
              <p className="mt-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 m-0">
                <Activity className="h-4 w-4 text-indigo-500" /> Pilotage des actions correctives et préventives
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded-xl border border-gray-300 bg-white p-1 shadow-sm">
                {[
                  { id: 'kanban', icon: LayoutGrid, label: 'Kanban' },
                  { id: 'list', icon: List, label: 'Liste' },
                  { id: 'matrix', icon: Target, label: 'Matrice' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id as ViewMode)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-black uppercase tracking-widest transition-all cursor-pointer border-none',
                      viewMode === mode.id ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 bg-transparent'
                    )}
                  >
                    <mode.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{mode.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => router.push('/dashboard/continuous-improvement/actions/new')}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg hover:bg-indigo-700 transition-colors border-none cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Nouvelle action
              </button>
            </div>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <KPIStat title="Total actions" value={stats.total} icon={Target} color="indigo" />
            <KPIStat title="En cours" value={stats.active} icon={RefreshCcw} color="blue" subtext={`${Math.round((stats.active / (stats.total || 1)) * 100)}% du flux`} />
            <KPIStat title="En retard" value={stats.late} icon={AlertCircle} color={stats.late > 0 ? 'red' : 'emerald'} subtext={stats.late > 0 ? 'À traiter en urgence' : 'À jour'} />
            <KPIStat title="Clôturées" value={stats.completed} icon={CheckCircle2} color="emerald" subtext={`${Math.round((stats.completed / (stats.total || 1)) * 100)}% d'efficacité`} />
            <KPIStat title="Audits" value={stats.bySource.audit} icon={FileText} color="purple" subtext="Sources int/ext" />
            <KPIStat title="NC" value={stats.bySource.nc} icon={AlertTriangle} color="orange" subtext="Non-conformités" />
          </div>
        </header>

        {/* RECHERCHE ET FILTRES */}
        <div className="rounded-3xl bg-white shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Rechercher par référence, titre..."
                  className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-xs font-bold uppercase tracking-widest focus:border-indigo-500 focus:bg-white outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-black uppercase tracking-widest transition-all cursor-pointer',
                    showFilters || selectedFilters.source !== 'ALL' || selectedFilters.status !== 'ALL' || selectedFilters.priority !== 'ALL'
                      ? 'bg-indigo-50 text-indigo-700 border-2 border-indigo-200'
                      : 'text-gray-600 hover:bg-gray-100 border-2 border-gray-200 bg-white'
                  )}
                >
                  <Filter className="h-4 w-4" /> Filtres
                  {(selectedFilters.source !== 'ALL' || selectedFilters.status !== 'ALL' || selectedFilters.priority !== 'ALL') && (
                    <span className="ml-1 h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                  )}
                  {showFilters ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                </button>

                <button className="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">
                  <Download className="h-4 w-4" /> Exporter
                </button>

                <button onClick={loadActions} className="flex items-center justify-center rounded-xl border-2 border-gray-200 bg-white p-3 text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors" title="Actualiser">
                  <RefreshCcw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-6 grid grid-cols-1 gap-6 border-t border-gray-100 pt-6 md:grid-cols-3">
                {/* Sélecteurs de filtres */}
                <FilterSelect label="Source normative" value={selectedFilters.source} onChange={(v: string) => setSelectedFilters({ ...selectedFilters, source: v as ActionSource })} options={[{ value: 'ALL', label: 'Toutes les sources' }, { value: 'AUDIT_INTERNE', label: 'Audit interne' }, { value: 'NC', label: 'Non-conformité' }, { value: 'REVUE_DIRECTION', label: 'Revue de direction' }]} />
                <FilterSelect label="Statut" value={selectedFilters.status} onChange={(v: string) => setSelectedFilters({ ...selectedFilters, status: v as ActionStatus })} options={[{ value: 'ALL', label: 'Tous les statuts' }, { value: 'A_FAIRE', label: 'À faire' }, { value: 'EN_COURS', label: 'En cours' }, { value: 'TERMINEE', label: 'Terminée' }]} />
                <FilterSelect label="Priorité" value={selectedFilters.priority} onChange={(v: string) => setSelectedFilters({ ...selectedFilters, priority: v as ActionPriority })} options={[{ value: 'ALL', label: 'Toutes les priorités' }, { value: 'CRITICAL', label: 'Critique' }, { value: 'HIGH', label: 'Haute' }, { value: 'MEDIUM', label: 'Moyenne' }, { value: 'LOW', label: 'Basse' }]} />
              </div>
            )}
          </div>
        </div>

        {/* AFFICHAGE DES VUES */}
        {viewMode === 'kanban' && <KanbanView actions={filteredActions} router={router} />}
        {viewMode === 'list' && <ListView actions={filteredActions} router={router} getStatusColor={getStatusColor} getSourceIcon={getSourceIcon} />}
        {viewMode === 'matrix' && (
          <>
            

[Image of Eisenhower Decision Matrix]

            <MatrixView actions={filteredActions} router={router} />
          </>
        )}
      </div>
    </div>
  );
}

// --- COMPOSANTS INTERNES ---

function FilterSelect({ label, value, onChange, options }: any) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">{label}</label>
      <select
        className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 py-3 pl-4 pr-10 text-xs font-bold uppercase text-gray-900 focus:border-indigo-500 outline-none cursor-pointer appearance-none transition-colors"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}

function KPIStat({ title, value, icon: Icon, color, subtext }: any) {
  const colorMap: Record<string, string> = {
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    red: 'text-red-600 bg-red-50 border-red-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100',
    orange: 'text-orange-600 bg-orange-50 border-orange-100',
  };

  return (
    <div className={`rounded-2xl p-5 border shadow-sm ${colorMap[color]}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-white rounded-lg shadow-sm"><Icon size={18} /></div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-80 m-0">{title}</p>
      </div>
      <p className="text-3xl font-black italic m-0 leading-none">{value}</p>
      {subtext && <p className="mt-2 text-[10px] font-bold uppercase tracking-widest opacity-70 m-0">{subtext}</p>}
    </div>
  );
}

function KanbanView({ actions, router }: any) {
  const columns = [
    { id: 'A_FAIRE', title: 'À faire', icon: Clock, color: 'text-gray-500' },
    { id: 'EN_COURS', title: 'En cours', icon: RefreshCcw, color: 'text-blue-500' },
    { id: 'A_VALIDER', title: 'À valider', icon: CheckCircle2, color: 'text-amber-500' },
    { id: 'TERMINEE', title: 'Terminée', icon: ShieldCheck, color: 'text-emerald-500' },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 items-start">
      {columns.map((col) => {
        const colActions = actions.filter((a: any) => a.status === col.id);
        const isLate = col.id === 'A_FAIRE' && colActions.some((a: any) => isPast(new Date(a.deadline)));

        return (
          <div key={col.id} className="rounded-3xl bg-gray-100 border border-gray-200 flex flex-col max-h-200">
            <div className="p-4 border-b border-gray-200 bg-white rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <col.icon className={`h-4 w-4 ${col.color}`} />
                  <h2 className="text-xs font-black uppercase tracking-widest text-gray-900 m-0">{col.title}</h2>
                </div>
                <span className="rounded-lg bg-gray-100 px-3 py-1 text-[10px] font-black text-gray-600">{colActions.length}</span>
              </div>
              {isLate && (
                <div className="mt-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 p-2 rounded-lg">
                  <AlertCircle size={14} /> Actions en retard
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {colActions.length > 0 ? colActions.map((action: any) => (
                <KanbanCard key={action.id} action={action} onClick={() => router.push(`/dashboard/continuous-improvement/${action.id}`)} />
              )) : (
                <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gray-300 rounded-2xl">
                  <Target className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 m-0">Vide</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KanbanCard({ action, onClick }: any) {
  const isLate = isPast(new Date(action.deadline)) && action.status !== 'TERMINEE';
  const daysLeft = differenceInDays(new Date(action.deadline), new Date());

  return (
    <div onClick={onClick} className="cursor-pointer rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-gray-600 border border-gray-200 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
          {action.reference}
        </span>
        <div className={`h-2.5 w-2.5 rounded-full ${action.priority === 'CRITICAL' ? 'bg-red-500' : action.priority === 'HIGH' ? 'bg-orange-500' : action.priority === 'MEDIUM' ? 'bg-blue-500' : 'bg-gray-300'}`} />
      </div>
      <h3 className="text-sm font-bold text-gray-900 leading-snug m-0 line-clamp-2">{action.title}</h3>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-700 border border-indigo-200">
            {action.responsible.firstName[0]}{action.responsible.lastName[0]}
          </div>
        </div>
        <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${isLate ? 'bg-red-50 text-red-600' : daysLeft <= 7 ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-500'}`}>
          {isLate ? `Retard: ${Math.abs(daysLeft)}j` : `J-${daysLeft}`}
        </div>
      </div>
      <div className="mt-4 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${action.progress}%` }} />
      </div>
    </div>
  );
}

function ListView({ actions, router, getStatusColor, getSourceIcon }: any) {
  return (
    <div className="rounded-3xl bg-white shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Référence', 'Action', 'Source', 'Responsable', 'Échéance', 'Statut'].map((h) => (
                <th key={h} className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {actions.map((action: any) => (
              <tr key={action.id} onClick={() => router.push(`/dashboard/continuous-improvement/${action.id}`)} className="cursor-pointer hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-xs font-black text-gray-900">{action.reference}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-gray-900 line-clamp-1">{action.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600">
                    <div className="rounded-lg bg-gray-100 p-1.5">{getSourceIcon(action.source)}</div>
                    {action.source.replace('_', ' ')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-700">
                  {action.responsible.lastName} {action.responsible.firstName[0]}.
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-700">
                  {format(new Date(action.deadline), 'dd/MM/yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex rounded-md px-3 py-1 text-[10px] font-black uppercase tracking-widest border ${getStatusColor(action.status)}`}>
                    {action.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MatrixView({ actions, router }: any) {
  const quadrants = [
    { id: 'q1', title: 'Faire (Prioritaire)', desc: 'Urgent & Important', color: 'bg-red-50 border-red-200', actions: actions.filter((a: any) => ['CRITICAL', 'HIGH'].includes(a.priority) && (a.status === 'EN_RETARD' || isPast(new Date(a.deadline)))) },
    { id: 'q2', title: 'Planifier (Stratégique)', desc: 'Important, Non Urgent', color: 'bg-blue-50 border-blue-200', actions: actions.filter((a: any) => ['HIGH', 'MEDIUM'].includes(a.priority) && !isPast(new Date(a.deadline))) },
    { id: 'q3', title: 'Déléguer (Opérationnel)', desc: 'Urgent, Non Important', color: 'bg-amber-50 border-amber-200', actions: actions.filter((a: any) => ['LOW'].includes(a.priority) && isPast(new Date(a.deadline))) },
    { id: 'q4', title: 'Éliminer / Postposer', desc: 'Ni Urgent, Ni Important', color: 'bg-gray-50 border-gray-200', actions: actions.filter((a: any) => a.priority === 'LOW' && !isPast(new Date(a.deadline))) },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {quadrants.map((q) => (
        <div key={q.id} className={`rounded-3xl border-2 p-6 ${q.color}`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-black uppercase italic text-gray-900 m-0">{q.title}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mt-1 m-0">{q.desc}</p>
            </div>
            <span className="bg-white border border-gray-200 text-gray-800 text-xs font-black px-3 py-1 rounded-lg">{q.actions.length}</span>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {q.actions.map((action: any) => (
              <div key={action.id} onClick={() => router.push(`/dashboard/continuous-improvement/${action.id}`)} className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow">
                <p className="text-xs font-bold text-gray-900 m-0 line-clamp-1">{action.title}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}