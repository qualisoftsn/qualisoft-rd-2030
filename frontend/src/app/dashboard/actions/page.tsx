/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * FICHIER : app/(dashboard)/actions/page.tsx
 * ===========================================================================
 * PAGE REGISTRE DES ACTIONS CORRECTIVES ET PRÉVENTIVES (CAPA)
 * Rôle : Centralisation du Plan d'Amélioration Continue (ISO 9001 §10.2)
 * Design : Style ClickUp professionnel (sobre, épuré, orienté productivité)
 * Conformité : 100% schéma Prisma — zéro champ inventé
 * Dernière mise à jour : 2026-03-01 15:45 UTC+0 (Dakar)
 * ===========================================================================
 */

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import {
  CheckSquare,
  Filter,
  Search,
  Plus,
  ChevronRight,
  Clock,
  CheckCircle2,
  Calendar,
  User as UserIcon,
  AlertCircle,
  Zap,
  X,
  Target,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import {
  Action,
  ActionStatus,
  Priority,
  ActionOrigin,
  User,
  PAQ,
} from '@/types/elite-sde';

// --- UTILITAIRE CN ---
const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(' ');

// --- CONFIGURATION DES STATUTS ---
const STATUS_CONFIG: Record<ActionStatus, { label: string; color: string; icon: React.ReactNode }> = {
  A_FAIRE: { label: 'À faire', color: 'bg-blue-100 text-blue-800', icon: <Clock className="h-4 w-4" /> },
  EN_COURS: { label: 'En cours', color: 'bg-amber-100 text-amber-800', icon: <Zap className="h-4 w-4" /> },
  A_VALIDER: { label: 'À valider', color: 'bg-purple-100 text-purple-800', icon: <AlertCircle className="h-4 w-4" /> },
  TERMINEE: { label: 'Terminée', color: 'bg-emerald-100 text-emerald-800', icon: <CheckCircle2 className="h-4 w-4" /> },
  NON_EFFICACE: { label: 'Non efficace', color: 'bg-red-100 text-red-800', icon: <AlertCircle className="h-4 w-4" /> },
  ANNULEE: { label: 'Annulée', color: 'bg-gray-100 text-gray-800', icon: <X className="h-4 w-4" /> },
  EN_RETARD: { label: 'En retard', color: 'bg-red-100 text-red-800 animate-pulse', icon: <Clock className="h-4 w-4" /> },
};

export default function ActionsPage() {
  const router = useRouter();
  const [actions, setActions] = useState<Action[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [paqs, setPaqs] = useState<PAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ActionStatus | 'ALL'>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'ALL'>('ALL');

  // --- CHARGEMENT DES DONNÉES ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [actionsRes, usersRes, paqsRes] = await Promise.all([
        apiClient.get<Action[]>('/actions'),
        apiClient.get<User[]>('/users'),
        apiClient.get<PAQ[]>('/paq'),
      ]);
      setActions(actionsRes.data || []);
      setUsers(usersRes.data || []);
      setPaqs(paqsRes.data || []);
    } catch (err) {
      console.error('[ACTIONS] Failed to load data:', err);
      toast.error('Échec du chargement du registre des actions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- STATISTIQUES EN TEMPS RÉEL ---
  const stats = useMemo(() => {
    const total = actions.length;
    const completed = actions.filter((a) => a.ACT_Status === 'TERMINEE').length;
    const overdue = actions.filter((a) => {
      if (a.ACT_Status === 'TERMINEE') return false;
      if (!a.ACT_Deadline) return false;
      return new Date(a.ACT_Deadline) < new Date();
    }).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, overdue, completionRate };
  }, [actions]);

  // --- FILTRAGE DES ACTIONS ---
  const filteredActions = useMemo(() => {
    return actions.filter((action) => {
      const matchesSearch =
        action.ACT_Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.ACT_Id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.ACT_Origin.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = selectedStatus === 'ALL' || action.ACT_Status === selectedStatus;
      const matchesPriority = selectedPriority === 'ALL' || action.ACT_Priority === selectedPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [actions, searchTerm, selectedStatus, selectedPriority]);

  // --- GESTION DU CHARGEMENT ---
  if (loading) {
    return (
      <div className="ml-72 flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative inline-block">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">Chargement du registre des actions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-72 bg-gray-50 min-h-screen p-6">
      <Toaster position="top-right" richColors />

      <div className="mx-auto max-w-7xl space-y-8">
        {/* 🔝 HEADER STRATÉGIQUE */}
        <header className="border-b border-gray-200 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800">
                  ISO 9001:2015 §10.2
                </span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                  {stats.completionRate}% terminées
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-bold text-gray-900">Registre des actions CAPA</h1>
              <p className="mt-1 text-sm text-gray-600">
                Plan d&apos;Amélioration Continue : actions correctives, préventives et d&apos;amélioration
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 sm:mt-0">
              <button
                onClick={() => router.push('/dashboard/actions/new')}
                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Nouvelle action
              </button>
            </div>
          </div>

          {/* 📊 KPI CARDS */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KPIStat
              title="Actions totales"
              value={stats.total.toString()}
              icon={Target}
              color="blue"
              subtext="Volume SMI"
            />
            <KPIStat
              title="Actions terminées"
              value={stats.completed.toString()}
              icon={CheckCircle2}
              color="emerald"
              subtext="Efficacité §10.2"
            />
            <KPIStat
              title="Actions en retard"
              value={stats.overdue.toString()}
              icon={Clock}
              color="red"
              subtext="Alerte non-conformité"
            />
            <KPIStat
              title="Taux de complétion"
              value={`${stats.completionRate}%`}
              icon={ShieldCheck}
              color={stats.completionRate >= 85 ? 'emerald' : stats.completionRate >= 75 ? 'blue' : 'amber'}
              subtext="Objectif: ≥85%"
            />
          </div>
        </header>

        {/* 🔍 BARRE DE RECHERCHE ET FILTRES */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par titre, référence ou origine..."
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="w-full sm:w-48">
                <label htmlFor="status-filter" className="sr-only">
                  Filtrer par statut
                </label>
                <select
                  id="status-filter"
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(e.target.value as ActionStatus | 'ALL')
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="ALL">Tous statuts</option>
                  {Object.values(ActionStatus).map((status) => (
                    <option key={status} value={status}>
                      {STATUS_CONFIG[status]?.label || status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-48">
                <label htmlFor="priority-filter" className="sr-only">
                  Filtrer par priorité
                </label>
                <select
                  id="priority-filter"
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value as Priority | 'ALL')}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="ALL">Toutes priorités</option>
                  {Object.values(Priority).map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 📋 TABLEAU DES ACTIONS */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Actions ({filteredActions.length})
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {stats.completionRate}% de complétion globale • {stats.overdue} actions en retard nécessitent une attention immédiate
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Origine
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responsable
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Échéance
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priorité
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredActions.map((action) => {
                  const responsible = users.find((u) => u.U_Id === action.ACT_ResponsableId);
                  const paq = paqs.find((p) => p.PAQ_Id === action.ACT_PAQId);
                  const isOverdue =
                    action.ACT_Status !== 'TERMINEE' &&
                    action.ACT_Deadline &&
                    new Date(action.ACT_Deadline) < new Date();

                  return (
                    <tr
                      key={action.ACT_Id}
                      onClick={() => router.push(`/dashboard/actions/${action.ACT_Id}`)}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{action.ACT_Title}</div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                          <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 font-medium">
                            {action.ACT_Id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span>{paq?.PAQ_Title || 'PAQ non assigné'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {action.ACT_Origin}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-medium">
                            {responsible?.U_FirstName?.charAt(0) || '?'}
                            {responsible?.U_LastName?.charAt(0) || '?'}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {responsible ? `${responsible.U_FirstName} ${responsible.U_LastName}` : 'Non assigné'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className={cn(isOverdue ? 'text-red-600 font-medium' : '')}>
                            {action.ACT_Deadline
                              ? new Date(action.ACT_Deadline).toLocaleDateString('fr-FR')
                              : 'Non définie'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PriorityBadge priority={action.ACT_Priority} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={action.ACT_Status} isOverdue={!!isOverdue} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <ChevronRight className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredActions.length === 0 && (
            <div className="p-12 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <CheckSquare className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="mt-4 text-sm font-medium text-gray-900">Aucune action trouvée</h3>
              <p className="mt-1 text-sm text-gray-500">
                Aucune action ne correspond à vos critères de recherche ou filtres.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('ALL');
                  setSelectedPriority('ALL');
                }}
                className="mt-4 rounded-md bg-white px-3 py-2 text-sm font-medium text-indigo-600 shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}

          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-gray-700">
                {filteredActions.length} action{filteredActions.length > 1 ? 's' : ''} sur {actions.length} au total
              </p>
              <button
                onClick={() => router.push('/dashboard/actions/new')}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Ajouter une action
              </button>
            </div>
          </div>
        </div>

        {/* 🛡️ BLOC DE CONFORMITÉ ISO */}
        <div className="rounded-xl bg-indigo-50 p-6 border border-indigo-100">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600">
                <span className="text-xs font-bold text-white">§</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-indigo-900">Exigence ISO 9001:2015 §10.2</h3>
                <p className="mt-1 text-sm text-indigo-800">
                  Lorsqu&apos;une non-conformité survient, l&apos;organisation doit réagir, évaluer la nécessité d&apos;agir pour éliminer la cause afin d&apos;éviter que la non-conformité ne se reproduise ou ne se produise ailleurs.
                </p>
                <p className="mt-2 text-xs text-indigo-700">
                  Ce registre centralise toutes les actions correctives, préventives et d&apos;amélioration avec suivi des échéances et statut de complétion pour garantir la traçabilité lors des audits.
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 md:mt-0">
              <button
                onClick={() => router.push('/dashboard/actions/new')}
                className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Créer une action
              </button>
              <button className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <DownloadIcon className="mr-1.5 h-4 w-4" />
                Exporter le registre
              </button>
            </div>
          </div>
        </div>
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
  value: string;
  icon: React.ElementType;
  color: 'blue' | 'emerald' | 'red' | 'amber';
  subtext: string;
}) {
  const colorClasses = {
    blue: 'text-blue-700 bg-blue-50',
    emerald: 'text-emerald-700 bg-emerald-50',
    red: 'text-red-700 bg-red-50',
    amber: 'text-amber-700 bg-amber-50',
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">{title}</p>
            <p className="mt-0.5 text-2xl font-bold text-gray-900">{value}</p>
            <p className="mt-1 text-[10px] font-medium text-gray-500 uppercase tracking-wider">{subtext}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, isOverdue }: { status: ActionStatus; isOverdue: boolean }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.A_FAIRE;
  const { label, color, icon } = config;

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {icon}
      <span className="ml-1">{isOverdue && status !== 'EN_RETARD' ? 'En retard' : label}</span>
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const config: Record<Priority, { label: string; color: string }> = {
    LOW: { label: 'Basse', color: 'bg-gray-100 text-gray-800' },
    MEDIUM: { label: 'Moyenne', color: 'bg-blue-100 text-blue-800' },
    HIGH: { label: 'Haute', color: 'bg-amber-100 text-amber-800' },
    URGENT: { label: 'Urgente', color: 'bg-orange-100 text-orange-800' },
    CRITICAL: { label: 'Critique', color: 'bg-red-100 text-red-800' },
  };

  const { label, color } = config[priority] || config.MEDIUM;
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>{label}</span>;
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={cn('h-4 w-4', className)}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
      />
    </svg>
  );
}