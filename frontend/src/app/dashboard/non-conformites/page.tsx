/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * FICHIER : app/(dashboard)/non-conformites/page.tsx
 * ===========================================================================
 * PAGE LISTE DES NON-CONFORMITÉS
 * Rôle : Pilotage centralisé des écarts système (ISO 9001 §10.2)
 * Design : Style ClickUp professionnel (sobre, épuré, orienté productivité)
 * Conformité : 100% schéma Prisma — zéro champ inventé
 * ===========================================================================
 */

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import {
  AlertOctagon,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  Filter,
  Loader2,
  MessageSquare,
  Plus,
  Search,
  ShieldAlert,
  Target,
  Truck,
  X,
  XCircle,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import {
  NonConformite,
  Processus,
  User,
  NCGravity,
  NCSource,
  NCStatus,
} from '@/types/elite-sde';
import { NCGravity as NCGravityEnum, NCSource as NCSourceEnum, NCStatus as NCStatusEnum } from '@/types/elite-sde';

// --- UTILITAIRE CN ---
const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(' ');

// --- CONFIGURATION SOURCES ---
const SOURCE_CONFIG: Record<NCSource, { label: string; icon: React.ElementType; color: string }> = {
  [NCSourceEnum.CLIENT_COMPLAINT]: {
    label: 'Réclamation client',
    icon: MessageSquare,
    color: 'text-rose-600',
  },
  [NCSourceEnum.INTERNAL_AUDIT]: {
    label: 'Audit interne',
    icon: Target,
    color: 'text-blue-600',
  },
  [NCSourceEnum.EXTERNAL_AUDIT]: {
    label: 'Audit externe',
    icon: ShieldAlert,
    color: 'text-indigo-600',
  },
  [NCSourceEnum.SUPPLIER]: {
    label: 'Fournisseur',
    icon: Truck,
    color: 'text-amber-600',
  },
  [NCSourceEnum.INCIDENT_SAFETY]: {
    label: 'Incident SST',
    icon: AlertOctagon,
    color: 'text-orange-600',
  },
  [NCSourceEnum.PROCESS_REVIEW]: {
    label: 'Revue processus',
    icon: BarChart3,
    color: 'text-emerald-600',
  },
  [NCSourceEnum.MANAGEMENT_REVIEW]: {
    label: 'Revue direction',
    icon: Clock,
    color: 'text-slate-600',
  },
};

export default function NonConformitesListPage() {
  const router = useRouter();
  const [ncs, setNcs] = useState<NonConformite[]>([]);
  const [processes, setProcesses] = useState<Processus[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'ALL' as NCStatus | 'ALL',
    gravity: 'ALL' as NCGravity | 'ALL',
    source: 'ALL' as NCSource | 'ALL',
    processusId: 'ALL' as string | 'ALL',
  });

  // --- CHARGEMENT DES DONNÉES ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [ncRes, prRes, uRes] = await Promise.all([
        apiClient.get<NonConformite[]>('/non-conformites'),
        apiClient.get<Processus[]>('/processes'),
        apiClient.get<User[]>('/users'),
      ]);
      setNcs(ncRes.data || []);
      setProcesses(prRes.data || []);
      setUsers(uRes.data || []);
    } catch (err) {
      console.error('[NON_CONFORMITES] Failed to load data:', err);
      toast.error('Échec du chargement du registre des non-conformités');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- STATISTIQUES EN TEMPS RÉEL ---
  const stats = useMemo(() => {
    const total = ncs.length;
    const closed = ncs.filter((nc) => nc.NC_Statut === NCStatusEnum.CLOTURE).length;
    const open = ncs.filter((nc) => nc.NC_Statut !== NCStatusEnum.CLOTURE).length;
    const critical = ncs.filter((nc) => nc.NC_Gravite === NCGravityEnum.CRITIQUE).length;
    const closureRate = total > 0 ? Math.round((closed / total) * 100) : 0;

    return { total, closed, open, critical, closureRate };
  }, [ncs]);

  // --- FILTRAGE DES NC ---
  const filteredNcs = useMemo(() => {
    return ncs.filter((nc) => {
      const matchesSearch =
        nc.NC_Libelle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nc.NC_Code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nc.NC_Description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filters.status === 'ALL' || nc.NC_Statut === filters.status;
      const matchesGravity = filters.gravity === 'ALL' || nc.NC_Gravite === filters.gravity;
      const matchesSource = filters.source === 'ALL' || nc.NC_Source === filters.source;
      const matchesProcessus =
        filters.processusId === 'ALL' || nc.NC_ProcessusId === filters.processusId;

      return matchesSearch && matchesStatus && matchesGravity && matchesSource && matchesProcessus;
    });
  }, [ncs, searchQuery, filters]);

  // --- OUVERTURE MODAL CRÉATION ---
  const openCreateModal = () => {
    // Récupération de l'utilisateur connecté depuis localStorage
    const storedAuth = localStorage.getItem('qualisoft-auth-storage');
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        const userId = authData?.state?.user?.U_Id;
        if (userId) {
          // Pré-remplissage du détecteur avec l'utilisateur connecté
          // (sera utilisé dans le modal de création)
        }
      } catch (e) {
        console.warn('[NON_CONFORMITES] Failed to parse auth storage:', e);
      }
    }
    setIsModalOpen(true);
  };

  // --- GESTION DU CHARGEMENT ---
  if (loading) {
    return (
      <div className="ml-72 flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative inline-block">
            <Loader2 className="h-10 w-10 animate-spin text-red-600" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">Chargement du registre des non-conformités...</p>
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
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                  ISO 9001:2015 §10.2
                </span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                  {stats.closureRate}% de clôture
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-bold text-gray-900">Non-conformités</h1>
              <p className="mt-1 text-sm text-gray-600">
                Pilotage centralisé des écarts système et des actions correctives
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 sm:mt-0">
              <button
                onClick={fetchData}
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Actualiser les données"
              >
                <RefreshIcon className="h-4 w-4" />
              </button>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Déclarer une NC
              </button>
            </div>
          </div>

          {/* 🔍 BARRE DE RECHERCHE ET FILTRES */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par libellé, code ou description..."
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value as NCStatus | 'ALL',
                }))
              }
              className="rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500"
            >
              <option value="ALL">Tous statuts</option>
              <option value={NCStatusEnum.DETECTION}>Détection</option>
              <option value={NCStatusEnum.ANALYSE}>Analyse</option>
              <option value={NCStatusEnum.ACTION_EN_COURS}>Action en cours</option>
              <option value={NCStatusEnum.VERIFICATION}>Vérification</option>
              <option value={NCStatusEnum.CLOTURE}>Clôturée</option>
            </select>
            <select
              value={filters.gravity}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  gravity: e.target.value as NCGravity | 'ALL',
                }))
              }
              className="rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500"
            >
              <option value="ALL">Toutes gravités</option>
              <option value={NCGravityEnum.MINEURE}>Mineure</option>
              <option value={NCGravityEnum.MAJEURE}>Majeure</option>
              <option value={NCGravityEnum.CRITIQUE}>Critique</option>
            </select>
            <select
              value={filters.processusId}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  processusId: e.target.value,
                }))
              }
              className="rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500"
            >
              <option value="ALL">Tous processus</option>
              {processes
                .filter((p) => p.PR_IsActive)
                .map((process) => (
                  <option key={process.PR_Id} value={process.PR_Id}>
                    {process.PR_Code} — {process.PR_Libelle}
                  </option>
                ))}
            </select>
          </div>
        </header>

        {/* 📊 TABLEAU DE BORD KPI */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPIStat
            title="Total NC"
            value={stats.total.toString()}
            icon={AlertOctagon}
            color="red"
            subtext="Depuis le dernier audit"
          />
          <KPIStat
            title="NC ouvertes"
            value={stats.open.toString()}
            icon={XCircle}
            color="amber"
            subtext="En cours de traitement"
          />
          <KPIStat
            title="NC clôturées"
            value={stats.closed.toString()}
            icon={CheckCircle2}
            color="emerald"
            subtext="Actions correctives validées"
          />
          <KPIStat
            title="Taux de clôture"
            value={`${stats.closureRate}%`}
            icon={Target}
            color={stats.closureRate >= 90 ? 'emerald' : stats.closureRate >= 75 ? 'blue' : 'amber'}
            subtext="Objectif: ≥85%"
          />
        </div>

        {/* 📋 TABLEAU DES NON-CONFORMITÉS */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Registre des non-conformités ({filteredNcs.length})
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {stats.critical} NC{stats.critical > 1 ? 's' : ''} critique{stats.critical > 1 ? 's' : ''} nécessitent une attention immédiate
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Libellé
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Processus
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gravité
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Détection
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredNcs.map((nc) => {
                  const process = processes.find((p) => p.PR_Id === nc.NC_ProcessusId);
                  const detector = users.find((u) => u.U_Id === nc.NC_DetectorId);
                  const sourceConfig = SOURCE_CONFIG[nc.NC_Source] || SOURCE_CONFIG[NCSourceEnum.INTERNAL_AUDIT];
                  const Icon = sourceConfig.icon;

                  return (
                    <tr
                      key={nc.NC_Id}
                      onClick={() => router.push(`/dashboard/non-conformites/${nc.NC_Id}`)}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {nc.NC_Code || `NC-${nc.NC_Id.slice(0, 6).toUpperCase()}`}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{nc.NC_Libelle}</div>
                        <div className="mt-1 text-xs text-gray-500 line-clamp-1">{nc.NC_Description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-blue-600 mr-2" />
                          <span className="text-sm text-gray-900">{process?.PR_Libelle || 'Non assigné'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${sourceConfig.color}`} aria-hidden="true" />
                          <span className="text-xs font-medium text-gray-900">{sourceConfig.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                            nc.NC_Gravite === NCGravityEnum.CRITIQUE
                              ? 'bg-red-100 text-red-800'
                              : nc.NC_Gravite === NCGravityEnum.MAJEURE
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-yellow-100 text-yellow-800',
                          )}
                        >
                          {nc.NC_Gravite}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={nc.NC_Statut} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(nc.NC_CreatedAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredNcs.length === 0 && (
            <div className="p-12 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <AlertOctagon className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="mt-4 text-sm font-medium text-gray-900">Aucune non-conformité trouvée</h3>
              <p className="mt-1 text-sm text-gray-500">
                Aucune non-conformité ne correspond à vos critères de recherche ou filtres.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilters({ status: 'ALL', gravity: 'ALL', source: 'ALL', processusId: 'ALL' });
                }}
                className="mt-4 rounded-md bg-white px-3 py-2 text-sm font-medium text-red-600 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}

          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="h-2 w-48 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-red-600 transition-all duration-500"
                  style={{ width: `${stats.closureRate}%` }}
                />
              </div>
              <div className="text-sm font-medium text-gray-700">
                Taux de clôture :{' '}
                <span className="text-red-700">{stats.closureRate}%</span> ({stats.closed} / {stats.total} NC clôturées)
              </div>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Déclarer une nouvelle NC
              </button>
            </div>
          </div>
        </div>

        {/* 🛡️ BLOC DE CONFORMITÉ ISO */}
        <div className="rounded-xl bg-red-50 p-6 border border-red-100">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-red-600">
                <span className="text-xs font-bold text-white">§</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-900">Exigence ISO 9001:2015 §10.2</h3>
                <p className="mt-1 text-sm text-red-800">
                  Lorsqu&apos;une non-conformité survient, l&apos;organisation doit réagir, évaluer la nécessité d&apos;agir pour éliminer la cause afin d&apos;éviter que la non-conformité ne se reproduise ou ne se produise ailleurs.
                </p>
                <p className="mt-2 text-xs text-red-700">
                  Ce registre centralise toutes les non-conformités détectées et les actions correctives associées pour garantir la traçabilité et l&apos;efficacité du système de management.
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 md:mt-0">
              <button
                onClick={openCreateModal}
                className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Déclarer une NC maintenant
              </button>
              <button className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                <Download className="mr-1.5 h-4 w-4" />
                Exporter le registre
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🧾 MODAL DE CRÉATION */}
      {isModalOpen && <CreateNCModal onClose={() => setIsModalOpen(false)} onCreated={fetchData} processes={processes} />}
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
  color: 'red' | 'amber' | 'emerald' | 'blue';
  subtext: string;
}) {
  const colorClasses = {
    red: 'text-red-700 bg-red-50',
    amber: 'text-amber-700 bg-amber-50',
    emerald: 'text-emerald-700 bg-emerald-50',
    blue: 'text-blue-700 bg-blue-50',
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

function StatusBadge({ status }: { status: NCStatus }) {
  const config: Record<NCStatus, { label: string; color: string }> = {
    [NCStatusEnum.DETECTION]: { label: 'Détection', color: 'bg-blue-100 text-blue-800' },
    [NCStatusEnum.ANALYSE]: { label: 'Analyse', color: 'bg-amber-100 text-amber-800' },
    [NCStatusEnum.ACTION_EN_COURS]: { label: 'Action en cours', color: 'bg-red-100 text-red-800' },
    [NCStatusEnum.VERIFICATION]: { label: 'Vérification', color: 'bg-purple-100 text-purple-800' },
    [NCStatusEnum.CLOTURE]: { label: 'Clôturée', color: 'bg-emerald-100 text-emerald-800' },
    [NCStatus.EN_COURS]: {
      label: '',
      color: ''
    }
  };

  const { label, color } = config[status] || config[NCStatusEnum.DETECTION];
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>{label}</span>;
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={cn('h-4 w-4', className)}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

// ============================================================================
// MODAL DE CRÉATION DE NC
// ============================================================================

function CreateNCModal({
  onClose,
  onCreated,
  processes,
}: {
  onClose: () => void;
  onCreated: () => void;
  processes: Processus[];
}) {
  const [formData, setFormData] = useState({
    NC_Libelle: '',
    NC_Description: '',
    NC_Source: NCSourceEnum.INTERNAL_AUDIT,
    NC_Gravite: NCGravityEnum.MINEURE,
    NC_ProcessusId: '',
    NC_DetectorId: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  // Chargement des utilisateurs
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await apiClient.get<User[]>('/users');
        setUsers(res.data || []);
        
        // Pré-remplissage avec l'utilisateur connecté
        const storedAuth = localStorage.getItem('qualisoft-auth-storage');
        if (storedAuth) {
          try {
            const authData = JSON.parse(storedAuth);
            const userId = authData?.state?.user?.U_Id;
            if (userId) {
              setFormData((prev) => ({ ...prev, NC_DetectorId: userId }));
            }
          } catch (e) {
            console.warn('[CREATE_NC] Failed to parse auth storage:', e);
          }
        }
      } catch (err) {
        console.error('[CREATE_NC] Failed to load users:', err);
        toast.error('Échec du chargement des utilisateurs');
      }
    };
    loadUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.NC_Libelle.trim()) {
      toast.error('Le libellé de la non-conformité est obligatoire');
      return;
    }
    if (!formData.NC_Description.trim()) {
      toast.error('La description de la non-conformité est obligatoire');
      return;
    }
    if (!formData.NC_ProcessusId) {
      toast.error('Le processus rattaché est obligatoire (exigence ISO 9001 §4.4)');
      return;
    }
    if (!formData.NC_DetectorId) {
      toast.error('Le détecteur de la non-conformité est obligatoire');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post<NonConformite>('/non-conformites', {
        NC_Libelle: formData.NC_Libelle.trim(),
        NC_Description: formData.NC_Description.trim(),
        NC_Source: formData.NC_Source,
        NC_Gravite: formData.NC_Gravite,
        NC_Statut: NCStatusEnum.DETECTION,
        NC_ProcessusId: formData.NC_ProcessusId,
        NC_DetectorId: formData.NC_DetectorId,
      });

      toast.success('Non-conformité déclarée avec succès');
      onCreated();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Échec de la déclaration de la non-conformité';
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
                <div className="rounded-lg bg-red-100 p-2">
                  <AlertOctagon className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Déclarer une non-conformité</h3>
                  <p className="mt-1 text-sm text-gray-500">Conforme à l&apos;exigence ISO 9001:2015 §10.2</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <span className="sr-only">Fermer</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="libelle" className="block text-sm font-medium text-gray-700">
                    Libellé de la non-conformité <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="libelle"
                    type="text"
                    required
                    value={formData.NC_Libelle}
                    onChange={(e) => setFormData({ ...formData, NC_Libelle: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    placeholder="Ex: Déviation du procédure de réception des marchandises"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description détaillée <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    required
                    value={formData.NC_Description}
                    onChange={(e) => setFormData({ ...formData, NC_Description: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    placeholder="Décrivez précisément l'écart observé, le contexte et les impacts potentiels..."
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="source" className="block text-sm font-medium text-gray-700">
                      Source de détection
                    </label>
                    <select
                      id="source"
                      value={formData.NC_Source}
                      onChange={(e) => setFormData({ ...formData, NC_Source: e.target.value as NCSource })}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    >
                      {Object.entries(SOURCE_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="gravite" className="block text-sm font-medium text-gray-700">
                      Gravité
                    </label>
                    <select
                      id="gravite"
                      value={formData.NC_Gravite}
                      onChange={(e) => setFormData({ ...formData, NC_Gravite: e.target.value as NCGravity })}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    >
                      <option value={NCGravityEnum.MINEURE}>Mineure</option>
                      <option value={NCGravityEnum.MAJEURE}>Majeure</option>
                      <option value={NCGravityEnum.CRITIQUE}>Critique</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="processus" className="block text-sm font-medium text-gray-700">
                      Processus rattaché <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="processus"
                      required
                      value={formData.NC_ProcessusId}
                      onChange={(e) => setFormData({ ...formData, NC_ProcessusId: e.target.value })}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    >
                      <option value="">Sélectionner un processus...</option>
                      {processes
                        .filter((p) => p.PR_IsActive)
                        .map((process) => (
                          <option key={process.PR_Id} value={process.PR_Id}>
                            {process.PR_Code} — {process.PR_Libelle}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="detector" className="block text-sm font-medium text-gray-700">
                      Détecteur <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="detector"
                      required
                      value={formData.NC_DetectorId}
                      onChange={(e) => setFormData({ ...formData, NC_DetectorId: e.target.value })}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    >
                      <option value="">Sélectionner un détecteur...</option>
                      {users
                        .filter((u) => u.U_IsActive)
                        .map((user) => (
                          <option key={user.U_Id} value={user.U_Id}>
                            {user.U_FirstName} {user.U_LastName} ({user.U_Role})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Déclaration en cours...
                    </>
                  ) : (
                    <>
                      <AlertOctagon className="mr-2 h-4 w-4" />
                      Déclarer la NC
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