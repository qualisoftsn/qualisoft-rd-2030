/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import {
  Target, CheckCircle2, XCircle, Clock, AlertTriangle,
  Plus, Search, Calendar, User, RefreshCw, Trash2,
  Edit3, ChevronRight, Flag, Activity, LayoutGrid, List, X,
  Save, BarChart2, ChevronDown, Filter, Download
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { format, isPast, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type {
  QualityObjective as QualityObjectiveType,
  User as UserType,
  Processus as ProcessusType,
  ActionStatus,
  Priority
} from '@/types/elite-sde';

// --- UTILITAIRE CN ---
const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(' ');

export default function QualityObjectivesPage() {
  // --- ÉTATS ---
  const [objectives, setObjectives] = useState<QualityObjectiveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedObjective, setSelectedObjective] = useState<QualityObjectiveType | null>(null);
  const [filters, setFilters] = useState({ status: 'ALL', search: '' });
  const [users, setUsers] = useState<UserType[]>([]);
  const [processes, setProcesses] = useState<ProcessusType[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // --- CHARGEMENT DES RÉFÉRENTIELS ---
  useEffect(() => {
    const loadReferentials = async () => {
      try {
        const [uRes, pRes] = await Promise.all([
          apiClient.get<UserType[]>('/users'),
          apiClient.get<ProcessusType[]>('/processes'),
        ]);
        setUsers(uRes.data || []);
        setProcesses(pRes.data || []);
      } catch (err) {
        console.error('[OBJECTIVES] Failed to load referentials:', err);
        toast.error('Échec du chargement des référentiels');
      }
    };
    loadReferentials();
  }, []);

  // --- CHARGEMENT DES OBJECTIFS ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filters.status !== 'ALL') params.status = filters.status;
      if (filters.search) params.search = filters.search;

      const res = await apiClient.get<QualityObjectiveType[]>('/quality-objectives', { params });
      setObjectives(res.data || []);
    } catch (error) {
      console.error('[OBJECTIVES] API error:', error);
      toast.error('Échec de la synchronisation des objectifs');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- MISE À JOUR RAPIDE DE LA PROGRESSION ---
  const handleQuickProgress = async (id: string, progress: number) => {
    try {
      await apiClient.patch(`/quality-objectives/${id}/progress`, { progress });
      toast.success(`Progression mise à jour à ${progress}%`);
      fetchData();
    } catch (e) {
      toast.error('Échec de la mise à jour de la progression');
    }
  };

  // --- ARCHIVAGE (SOFT DELETE) ---
  const handleDelete = async (id: string) => {
    if (!confirm("Archiver cet objectif stratégique ?\n\nCette action désactive l'objectif mais conserve toutes les données pour audit (RGPD/ANSD).")) return;
    
    try {
      await apiClient.delete(`/quality-objectives/${id}`);
      toast.success('Objectif archivé avec succès');
      fetchData();
    } catch (e) {
      toast.error('Échec de l\'archivage : des indicateurs dépendent peut-être de cet objectif');
    }
  };

  // --- STATISTIQUES EN TEMPS RÉEL ---
  const stats = useMemo(() => {
    const total = objectives.length;
    const active = objectives.filter(o => o.QO_Status === 'EN_COURS' || o.QO_Status === 'BROUILLON').length;
    const achieved = objectives.filter(o => o.QO_Status === 'ATTEINT').length;
    const overdue = objectives.filter(
      o => o.QO_Status !== 'ATTEINT' && o.QO_Status !== 'ANNULE' && o.QO_Deadline && isPast(new Date(o.QO_Deadline))
    ).length;
    const avg = total > 0 ? Math.round(objectives.reduce((acc, o) => acc + o.QO_Progress, 0) / total) : 0;
    
    return { total, active, achieved, overdue, avg };
  }, [objectives]);

  // --- RENDU ---
  if (loading) {
    return (
      <div className="ml-72 flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative inline-block">
            <RefreshCw className="h-10 w-10 animate-spin text-indigo-600" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">Chargement des objectifs stratégiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-72 bg-gray-50 min-h-screen p-6">
      <Toaster position="top-right" richColors />

      <div className="mx-auto max-w-7xl space-y-8">
        {/* HEADER */}
        <header className="border-b border-gray-200 pb-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800">
                  ISO 9001:2015 §6.2
                </span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                  {stats.active} objectifs actifs
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-bold text-gray-900">Pilotage des objectifs qualité</h1>
              <p className="mt-1 text-sm text-gray-500">
                Définition, suivi et mesure de l&apos;efficacité des objectifs stratégiques du Système de Management Intégré
              </p>
            </div>

            <button
              onClick={() => { setSelectedObjective(null); setModalMode('create'); }}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4" />
              Nouvel objectif
            </button>
          </div>

          {/* KPI CARDS */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <KPIStat title="Volume total" value={stats.total} icon={Target} color="gray" />
            <KPIStat title="En cours" value={stats.active} icon={Activity} color="blue" />
            <KPIStat title="Atteints" value={stats.achieved} icon={CheckCircle2} color="emerald" />
            <KPIStat
              title="En retard"
              value={stats.overdue}
              icon={AlertTriangle}
              color={stats.overdue > 0 ? 'red' : 'gray'}
              alert={stats.overdue > 0}
            />
            <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Progression globale</p>
                  <p className="mt-1 text-2xl font-bold text-indigo-700">{stats.avg}%</p>
                </div>
                <BarChart2 className="h-6 w-6 text-indigo-500" aria-hidden="true" />
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                  style={{ width: `${stats.avg}%` }}
                />
              </div>
            </div>
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
                  placeholder="Rechercher par titre, cible ou pilote..."
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex rounded-lg border border-gray-300 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                      viewMode === 'grid'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span className="hidden sm:inline">Grille</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                      viewMode === 'list'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <List className="h-4 w-4" />
                    <span className="hidden sm:inline">Liste</span>
                  </button>
                </div>

                <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Download className="h-4 w-4" />
                  Exporter
                </button>

                <button
                  onClick={fetchData}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  title="Actualiser"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* VUE GRILLE */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {objectives.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-16">
                <div className="rounded-full bg-gray-200 p-4">
                  <Target className="h-8 w-8 text-gray-500" />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-900">Aucun objectif stratégique défini</p>
                <p className="mt-1 text-sm text-gray-500">Commencez par créer votre premier objectif qualité</p>
                <button
                  onClick={() => { setSelectedObjective(null); setModalMode('create'); }}
                  className="mt-4 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Créer un objectif
                </button>
              </div>
            ) : (
              objectives.map((obj) => (
                <ObjectiveCard
                  key={obj.QO_Id}
                  objective={obj}
                  users={users}
                  processes={processes}
                  onQuickProgress={handleQuickProgress}
                  onEdit={() => { setSelectedObjective(obj); setModalMode('edit'); }}
                  onDelete={() => handleDelete(obj.QO_Id)}
                />
              ))
            )}
          </div>
        )}

        {/* VUE LISTE */}
        {viewMode === 'list' && (
          <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objectif</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cible</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pilote</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Échéance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progression</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {objectives.map((obj) => {
                    const isOverdue = obj.QO_Status !== 'ATTEINT' && obj.QO_Status !== 'ANNULE' && obj.QO_Deadline && isPast(new Date(obj.QO_Deadline));
                    const owner = users.find(u => u.U_Id === obj.QO_OwnerId);
                    const process = processes.find(p => p.PR_Id === obj.QO_ProcessusId);
                    
                    return (
                      <tr key={obj.QO_Id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{obj.QO_Title}</div>
                          {obj.QO_Description && (
                            <div className="mt-1 text-xs text-gray-500 line-clamp-1">{obj.QO_Description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{obj.QO_Target}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700 border border-gray-300">
                              {owner?.U_FirstName?.[0] || '?'}
                              {owner?.U_LastName?.[0] || '?'}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {owner ? `${owner.U_FirstName} ${owner.U_LastName}` : 'Non assigné'}
                              </div>
                              {process && (
                                <div className="text-xs text-gray-500">{process.PR_Code}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                            <Calendar className="mr-1.5 inline h-3.5 w-3.5 text-gray-400" />
                            {obj.QO_Deadline ? format(new Date(obj.QO_Deadline), 'dd MMM yyyy', { locale: fr }) : 'Non définie'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-24">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                                <div
                                  className={`h-full rounded-full ${
                                    obj.QO_Progress >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                                  }`}
                                  style={{ width: `${Math.min(obj.QO_Progress, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-600 w-8 text-right">{obj.QO_Progress}%</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn(
                            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                            obj.QO_Status === 'ATTEINT' ? 'bg-emerald-100 text-emerald-800' :
                            obj.QO_Status === 'ANNULE' ? 'bg-gray-100 text-gray-800' :
                            isOverdue ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          )}>
                            {obj.QO_Status === 'BROUILLON' ? 'Brouillon' :
                             obj.QO_Status === 'EN_COURS' ? 'En cours' :
                             obj.QO_Status === 'ATTEINT' ? 'Atteint' :
                             obj.QO_Status === 'NON_ATTEINT' ? 'Non atteint' :
                             obj.QO_Status === 'REPORTE' ? 'Reporté' : 'Annulé'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => { setSelectedObjective(obj); setModalMode('edit'); }}
                              className="text-gray-400 hover:text-indigo-600"
                              aria-label={`Modifier ${obj.QO_Title}`}
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(obj.QO_Id)}
                              className="text-gray-400 hover:text-red-600"
                              aria-label={`Archiver ${obj.QO_Title}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL */}
        {modalMode && (
          <ObjectiveModal
            mode={modalMode}
            objective={selectedObjective}
            users={users}
            processes={processes}
            onClose={() => { setModalMode(null); setSelectedObjective(null); }}
            onRefresh={fetchData}
          />
        )}
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
  alert = false,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  alert?: boolean;
}) {
  const colorClasses = {
    gray: 'text-gray-700 bg-gray-50',
    blue: 'text-blue-700 bg-blue-50',
    emerald: 'text-emerald-700 bg-emerald-50',
    red: 'text-red-700 bg-red-50',
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div
          className={cn(
            'rounded-lg p-2',
            colorClasses[color as keyof typeof colorClasses],
            alert && 'ring-2 ring-red-500 animate-pulse'
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

function ObjectiveCard({
  objective,
  users,
  processes,
  onQuickProgress,
  onEdit,
  onDelete,
}: {
  objective: QualityObjectiveType;
  users: UserType[];
  processes: ProcessusType[];
  onQuickProgress: (id: string, progress: number) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isOverdue = objective.QO_Status !== 'ATTEINT' && objective.QO_Status !== 'ANNULE' && objective.QO_Deadline && isPast(new Date(objective.QO_Deadline));
  const owner = users.find(u => u.U_Id === objective.QO_OwnerId);
  const process = processes.find(p => p.PR_Id === objective.QO_ProcessusId);

  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden transition-shadow hover:shadow-md">
      <div className="border-b border-gray-200 p-5">
        <div className="flex items-start justify-between">
          <span className={cn(
            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
            objective.QO_Status === 'ATTEINT' ? 'bg-emerald-100 text-emerald-800' :
            objective.QO_Status === 'ANNULE' ? 'bg-gray-100 text-gray-800' :
            isOverdue ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          )}>
            {objective.QO_Status === 'BROUILLON' ? 'Brouillon' :
             objective.QO_Status === 'EN_COURS' ? 'En cours' :
             objective.QO_Status === 'ATTEINT' ? 'Atteint' :
             objective.QO_Status === 'NON_ATTEINT' ? 'Non atteint' :
             objective.QO_Status === 'REPORTE' ? 'Reporté' : 'Annulé'}
          </span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100">
            <button
              onClick={onEdit}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-indigo-600"
              aria-label="Modifier"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600"
              aria-label="Archiver"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{objective.QO_Title}</h3>
        
        {objective.QO_Description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{objective.QO_Description}</p>
        )}

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-700">
          <Flag className="h-4 w-4 text-indigo-600" />
          <span className="font-medium">Cible :</span>
          <span>{objective.QO_Target}</span>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm font-medium text-gray-700">
            <span>Progression</span>
            <span className="text-indigo-700">{objective.QO_Progress}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full rounded-full ${
                objective.QO_Progress >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${Math.min(objective.QO_Progress, 100)}%` }}
            />
          </div>
        </div>

        {(objective.QO_Status === 'EN_COURS' || objective.QO_Status === 'BROUILLON') && (
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[25, 50, 75, 100].map(p => (
              <button
                key={p}
                onClick={() => onQuickProgress(objective.QO_Id, p)}
                className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
              >
                {p}%
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 bg-gray-50 p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-gray-700">
              {owner ? `${owner.U_FirstName} ${owner.U_LastName}` : 'Non assigné'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className={cn(
              'text-gray-700',
              isOverdue && 'text-red-600 font-medium'
            )}>
              {objective.QO_Deadline ? format(new Date(objective.QO_Deadline), 'dd MMM yyyy', { locale: fr }) : 'Sans échéance'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ObjectiveModal({
  mode,
  objective,
  users,
  processes,
  onClose,
  onRefresh,
}: {
  mode: 'create' | 'edit';
  objective: QualityObjectiveType | null;
  users: UserType[];
  processes: ProcessusType[];
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [form, setForm] = useState({
    QO_Title: objective?.QO_Title || '',
    QO_Description: objective?.QO_Description || '',
    QO_Target: objective?.QO_Target || '',
    QO_Deadline: objective?.QO_Deadline ? format(new Date(objective.QO_Deadline), 'yyyy-MM-dd') : '',
    QO_OwnerId: objective?.QO_OwnerId || '',
    QO_ProcessusId: objective?.QO_ProcessusId || '',
    QO_Status: objective?.QO_Status || 'BROUILLON',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!form.QO_Title.trim()) {
      toast.error('Le titre de l\'objectif est obligatoire');
      return;
    }
    if (!form.QO_Target.trim()) {
      toast.error('La valeur cible est obligatoire');
      return;
    }
    if (!form.QO_Deadline) {
      toast.error('L\'échéance est obligatoire (ISO 9001 §6.2.1)');
      return;
    }
    if (!form.QO_OwnerId) {
      toast.error('Un pilote responsable doit être désigné');
      return;
    }
    if (!form.QO_ProcessusId) {
      toast.error('Le rattachement à un processus est obligatoire');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'create') {
        await apiClient.post<QualityObjectiveType>('/quality-objectives', form);
        toast.success('Objectif créé avec succès');
      } else if (objective) {
        await apiClient.patch<QualityObjectiveType>(`/quality-objectives/${objective.QO_Id}`, form);
        toast.success('Objectif mis à jour avec succès');
      }
      
      onRefresh();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Échec de l\'opération';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          <div className="px-6 pb-6 pt-6 sm:px-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-100 p-2">
                  <Target className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {mode === 'create' ? 'Nouvel objectif qualité' : 'Modifier l\'objectif'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">Conforme à l&apos;exigence ISO 9001:2015 §6.2</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span className="sr-only">Fermer</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Titre de l&apos;objectif <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    required
                    value={form.QO_Title}
                    onChange={(e) => setForm({ ...form, QO_Title: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Ex: Réduire le taux de rebuts industriels"
                  />
                </div>

                <div>
                  <label htmlFor="target" className="block text-sm font-medium text-gray-700">
                    Valeur cible <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="target"
                    type="text"
                    required
                    value={form.QO_Target}
                    onChange={(e) => setForm({ ...form, QO_Target: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Ex: Inférieur à 2,5 %"
                  />
                </div>

                <div>
                  <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                    Échéance <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="deadline"
                    type="date"
                    required
                    value={form.QO_Deadline}
                    onChange={(e) => setForm({ ...form, QO_Deadline: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="owner" className="block text-sm font-medium text-gray-700">
                    Pilote responsable <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="owner"
                    required
                    value={form.QO_OwnerId}
                    onChange={(e) => setForm({ ...form, QO_OwnerId: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Sélectionner un pilote...</option>
                    {users
                      .filter(u => u.U_IsActive)
                      .map(user => (
                        <option key={user.U_Id} value={user.U_Id}>
                          {user.U_FirstName} {user.U_LastName} ({user.U_Role})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="process" className="block text-sm font-medium text-gray-700">
                    Processus rattaché <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="process"
                    required
                    value={form.QO_ProcessusId}
                    onChange={(e) => setForm({ ...form, QO_ProcessusId: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Sélectionner un processus...</option>
                    {processes
                      .filter(p => p.PR_IsActive)
                      .map(proc => (
                        <option key={proc.PR_Id} value={proc.PR_Id}>
                          {proc.PR_Code} — {proc.PR_Libelle}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description détaillée (optionnel)
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={form.QO_Description}
                    onChange={(e) => setForm({ ...form, QO_Description: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Précisez le contexte, les ressources nécessaires et les indicateurs de suivi..."
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {mode === 'create' ? 'Créer l\'objectif' : 'Mettre à jour'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}