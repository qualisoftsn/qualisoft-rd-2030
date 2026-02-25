/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * FICHIER : app/(dashboard)/paq/page.tsx
 * ===========================================================================
 * PAGE PILOTAGE DES PLANS D'ACTIONS QUALITÉ (PAQ)
 * Rôle : Pilotage du cycle d'amélioration continue (ISO 9001 §10.3)
 * Design : Style ClickUp professionnel (sobre, épuré, orienté productivité)
 * Conformité : 100% schéma Prisma — zéro champ inventé
 * ===========================================================================
 */

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Edit3,
  LayoutGrid,
  Loader2,
  Plus,
  Printer,
  ShieldAlert,
  ShieldCheck,
  Target,
  Users,
  X,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import type {
  Action,
  PAQ,
  User,
  Processus,
  ActionStatus,
  Priority,
} from '@/types/elite-sde';
import { ActionStatus as ActionStatusEnum, Priority as PriorityEnum } from '@/types/elite-sde';

// --- UTILITAIRE CN ---
const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(' ');

// --- TYPES ---
interface PAQDashboardData {
  total: number;
  enRetard: Action[];
  aValider: Action[];
  cloturees: Action[];
  tauxEfficacite: number;
  chargeTravail: Array<{ name: string; count: number }>;
}

export default function PAQPage() {
  const router = useRouter();
  const [data, setData] = useState<PAQDashboardData | null>(null);
  const [paqs, setPaqs] = useState<PAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAction, setEditingAction] = useState<Action | null>(null);

  // --- CHARGEMENT DES DONNÉES ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resStats, resPaqs] = await Promise.all([
        apiClient.get<PAQDashboardData>('/paq/dashboard'),
        apiClient.get<PAQ[]>('/paq'),
      ]);
      setData(resStats.data);
      setPaqs(resPaqs.data || []);
    } catch (err) {
      console.error('[PAQ] Failed to load data:', err);
      toast.error('Échec du chargement des plans d\'actions qualité');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- MISE À JOUR RAPIDE D'ACTION ---
  const handleQuickUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAction?.ACT_Id) return;

    try {
      await apiClient.patch(`/paq/actions/${editingAction.ACT_Id}`, {
        ACT_Status: editingAction.ACT_Status,
        ACT_Priority: editingAction.ACT_Priority,
        ACT_Title: editingAction.ACT_Title,
      });
      toast.success('Action mise à jour avec succès');
      setEditingAction(null);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Échec de la mise à jour de l\'action';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  // --- GESTION DU CHARGEMENT ---
  if (loading) {
    return (
      <div className="ml-72 flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative inline-block">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">Chargement des plans d&apos;actions qualité...</p>
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
                  ISO 9001:2015 §10.3
                </span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                  {data?.total || 0} actions actives
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-bold text-gray-900">Plans d&apos;actions qualité</h1>
              <p className="mt-1 text-sm text-gray-600">
                Pilotage du cycle d&apos;amélioration continue et suivi des mesures correctives/préventives
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 sm:mt-0">
              <button className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <Printer className="mr-1.5 h-4 w-4" />
                Exporter le rapport
              </button>
              <button
                onClick={() => router.push('/dashboard/paq/nouveau')}
                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Nouveau plan annuel
              </button>
            </div>
          </div>

          {/* 📊 KPI CARDS */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KPIStat
              title="Actions totales"
              value={data?.total.toString() || '0'}
              icon={Target}
              color="blue"
              subtext="Volume SMI"
            />
            <KPIStat
              title="Retards critiques"
              value={data?.enRetard.length.toString() || '0'}
              icon={ShieldAlert}
              color="red"
              subtext="Alerte §10.2"
            />
            <KPIStat
              title="Taux d'efficacité"
              value={`${data?.tauxEfficacite || 0}%`}
              icon={CheckCircle2}
              color={data?.tauxEfficacite && data.tauxEfficacite >= 85 ? 'emerald' : 'amber'}
              subtext="Performance §9.1.3"
            />
            <KPIStat
              title="Pilotes actifs"
              value={data?.chargeTravail.length.toString() || '0'}
              icon={Users}
              color="indigo"
              subtext="Affectation ressources"
            />
          </div>
        </header>

        {/* 🏛️ GRID PRINCIPALE */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* COLONNE 1-2 : LISTE DES PAQ */}
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Plans annuels</h2>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    {paqs.length} plans scellés
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Plans d&apos;actions qualité structurés par processus et année d&apos;exécution
                </p>
              </div>

              <div className="divide-y divide-gray-200">
                {paqs.length > 0 ? (
                  paqs.map((paq) => (
                    <PAQCard
                      key={paq.PAQ_Id}
                      paq={paq}
                      onClick={() => router.push(`/dashboard/paq/${paq.PAQ_Id}`)}
                    />
                  ))
                ) : (
                  <div className="p-16 text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <LayoutGrid className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="mt-4 text-sm font-medium text-gray-900">Aucun plan d&apos;actions qualité</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Commencez par créer votre premier plan annuel pour structurer vos actions d&apos;amélioration
                    </p>
                    <button
                      onClick={() => router.push('/dashboard/paq/nouveau')}
                      className="mt-4 rounded-md bg-white px-3 py-2 text-sm font-medium text-indigo-600 shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Créer un plan annuel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* COLONNE 3 : RADAR DES URGENCES + CHARGE PILOTES */}
          <div className="space-y-8">
            {/* RADAR DES URGENCES */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 bg-rose-50 px-6 py-4">
                <h2 className="text-lg font-semibold text-rose-800 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5" />
                  Actions en retard
                </h2>
                <p className="mt-1 text-sm text-rose-700">
                  Actions dont l&apos;échéance est dépassée et le statut n&apos;est pas &quot;Terminée&quot;
                </p>
              </div>

              <div className="p-6">
                {data?.enRetard && data.enRetard.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {data.enRetard.slice(0, 7).map((action) => {
                      const deadline = action.ACT_Deadline
                        ? new Date(action.ACT_Deadline)
                        : null;
                      const formattedDate = deadline && !isNaN(deadline.getTime())
                        ? deadline.toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Non définie';

                      return (
                        <div
                          key={action.ACT_Id}
                          className="flex items-start justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 hover:border-rose-300"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-sm text-rose-700">
                              <Calendar className="h-4 w-4" />
                              <span>Échéance : {formattedDate}</span>
                            </div>
                            <p className="mt-1 truncate text-sm font-medium text-gray-900">
                              {action.ACT_Title}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              Processus : {action.ACT_PAQ?.PAQ_Processus?.PR_Libelle || 'Non spécifié'}
                            </p>
                          </div>
                          <button
                            onClick={() => setEditingAction(action)}
                            className="rounded p-2 text-gray-400 hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                            aria-label={`Modifier l'action ${action.ACT_Title}`}
                          >
                            <Edit3 className="h-5 w-5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-12">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                    <p className="mt-3 text-sm font-medium text-emerald-800">Aucune action en retard</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Toutes les actions sont à jour ou terminées
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* CHARGE PAR PILOTE */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 bg-indigo-50 px-6 py-4">
                <h2 className="text-lg font-semibold text-indigo-800 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Charge par pilote
                </h2>
                <p className="mt-1 text-sm text-indigo-700">
                  Répartition des actions actives par responsable qualité
                </p>
              </div>

              <div className="p-6">
                {data?.chargeTravail && data.chargeTravail.length > 0 ? (
                  <div className="space-y-6">
                    {data.chargeTravail.map(({ name, count }) => (
                      <div key={name} className="space-y-2">
                        <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                          <span>{name}</span>
                          <span className="text-indigo-600">{count} actions</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-indigo-600"
                            style={{ width: `${(count / (data.total || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BarChart3 className="h-10 w-10 text-gray-400" />
                    <p className="mt-3 text-sm font-medium text-gray-900">Aucune donnée de charge</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Les actions doivent être affectées à des pilotes pour visualiser la charge
                    </p>
                  </div>
                )}
              </div>
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
                <h3 className="text-sm font-medium text-indigo-900">Exigence ISO 9001:2015 §10.3</h3>
                <p className="mt-1 text-sm text-indigo-800">
                  L&apos;organisation doit améliorer continuellement l&apos;adéquation, la pertinence et l&apos;efficacité du système de management de la qualité.
                </p>
                <p className="mt-2 text-xs text-indigo-700">
                  Les plans d&apos;actions qualité (PAQ) structurent les initiatives d&apos;amélioration continue et garantissent leur traçabilité dans le temps.
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 md:mt-0">
              <button
                onClick={() => router.push('/dashboard/paq/nouveau')}
                className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Créer un nouveau PAQ
              </button>
              <button className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <DownloadIcon className="mr-1.5 h-4 w-4" />
                Exporter le registre
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 📟 MODAL D'ÉDITION D'ACTION */}
      {editingAction && (
        <EditActionModal
          action={editingAction}
          onClose={() => setEditingAction(null)}
          onSubmit={handleQuickUpdate}
          onChange={(field, value) =>
            setEditingAction((prev) => (prev ? { ...prev, [field]: value } : null))
          }
        />
      )}
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
  color: 'blue' | 'red' | 'emerald' | 'amber' | 'indigo';
  subtext: string;
}) {
  const colorClasses = {
    blue: 'text-blue-700 bg-blue-50',
    red: 'text-rose-700 bg-rose-50',
    emerald: 'text-emerald-700 bg-emerald-50',
    amber: 'text-amber-700 bg-amber-50',
    indigo: 'text-indigo-700 bg-indigo-50',
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

function PAQCard({
  paq,
  onClick,
}: {
  paq: PAQ & { PAQ_Processus?: Processus; PAQ_QualityManager?: User };
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full px-6 py-5 text-left transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
              Exercice {paq.PAQ_Year}
            </span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs font-medium text-gray-700">
              {paq.PAQ_Processus?.PR_Libelle || 'Processus non spécifié'}
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-gray-900">{paq.PAQ_Title}</p>
          <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-gray-400" />
              <span>
                Pilote :{' '}
                {paq.PAQ_QualityManager
                  ? `${paq.PAQ_QualityManager.U_FirstName} ${paq.PAQ_QualityManager.U_LastName}`
                  : 'Non assigné'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-gray-400" />
              <span>{(paq as any)._count?.PAQ_Actions || 0} actions</span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between sm:mt-0">
          <span
            className={cn(
              'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
              paq.PAQ_Status === 'EN_COURS'
                ? 'bg-blue-100 text-blue-800'
                : paq.PAQ_Status === 'CLOTURE'
                  ? 'bg-emerald-100 text-emerald-800'
                  : paq.PAQ_Status === 'ARCHIVE'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-amber-100 text-amber-800',
            )}
          >
            {paq.PAQ_Status === 'BROUILLON'
              ? 'Brouillon'
              : paq.PAQ_Status === 'EN_COURS'
                ? 'En cours'
                : paq.PAQ_Status === 'CLOTURE'
                  ? 'Clôturé'
                  : 'Archivé'}
          </span>
          <ArrowRight className="ml-4 h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
      </div>
    </button>
  );
}

function EditActionModal({
  action,
  onClose,
  onSubmit,
  onChange,
}: {
  action: Action;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (field: string, value: any) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
          <div className="px-6 pb-6 pt-6 sm:px-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-100 p-2">
                  <Edit3 className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Modifier l&apos;action</h3>
                  <p className="mt-1 text-sm text-gray-500">Mise à jour rapide du statut et de la priorité</p>
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

            <form onSubmit={onSubmit} className="mt-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Titre de l&apos;action
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={action.ACT_Title}
                    onChange={(e) => onChange('ACT_Title', e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Statut
                  </label>
                  <select
                    id="status"
                    value={action.ACT_Status}
                    onChange={(e) => onChange('ACT_Status', e.target.value as ActionStatus)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value={ActionStatusEnum.A_FAIRE}>À faire</option>
                    <option value={ActionStatusEnum.EN_COURS}>En cours</option>
                    <option value={ActionStatusEnum.A_VALIDER}>À valider</option>
                    <option value={ActionStatusEnum.TERMINEE}>Terminée</option>
                    <option value={ActionStatusEnum.NON_EFFICACE}>Non efficace</option>
                    <option value={ActionStatusEnum.ANNULEE}>Annulée</option>
                    <option value={ActionStatusEnum.EN_RETARD}>En retard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Priorité</label>
                  <div className="mt-2 grid grid-cols-3 gap-3">
                    {[
                      { value: PriorityEnum.LOW, label: 'Basse', color: 'bg-gray-100 text-gray-800' },
                      { value: PriorityEnum.MEDIUM, label: 'Moyenne', color: 'bg-blue-100 text-blue-800' },
                      { value: PriorityEnum.HIGH, label: 'Haute', color: 'bg-amber-100 text-amber-800' },
                      { value: PriorityEnum.URGENT, label: 'Urgente', color: 'bg-orange-100 text-orange-800' },
                      { value: PriorityEnum.CRITICAL, label: 'Critique', color: 'bg-rose-100 text-rose-800' },
                    ].map((prio) => (
                      <button
                        key={prio.value}
                        type="button"
                        onClick={() => onChange('ACT_Priority', prio.value)}
                        className={cn(
                          'rounded-lg py-2 text-xs font-medium uppercase',
                          action.ACT_Priority === prio.value
                            ? `${prio.color} ring-2 ring-indigo-500`
                            : 'bg-white text-gray-700 hover:bg-gray-50',
                        )}
                      >
                        {prio.label}
                      </button>
                    ))}
                  </div>
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
                  className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <CheckCircle2 className="mr-1.5 h-4 w-4" />
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
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