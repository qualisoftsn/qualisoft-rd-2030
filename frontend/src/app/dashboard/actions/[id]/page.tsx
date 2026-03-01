/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * FICHIER : app/(dashboard)/actions/[id]/page.tsx
 * ===========================================================================
 * PAGE DÉTAIL D'UNE ACTION CORRECTIVE/PRÉVENTIVE (CAPA)
 * Rôle : Pilotage tactique et suivi d'exécution d'une action (ISO 9001 §10.2)
 * Design : Style ClickUp professionnel (sobre, épuré, orienté productivité)
 * Conformité : 100% schéma Prisma — zéro champ inventé
 * Dernière mise à jour : 2026-03-01 15:45 UTC+0 (Dakar)
 * ===========================================================================
 */

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  Printer,
  Save,
  Target,
  User as UserIcon,
  AlertCircle,
  X,
  TrendingUp,
  Info,
  FileText,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import {
  Action,
  ActionStatus,
  Priority,
  ActionOrigin,
  ActionType,
  User,
  PAQ,
  Preuve,
} from '@/types/elite-sde';

// --- UTILITAIRE CN ---
const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(' ');

export default function DetailActionPage() {
  const params = useParams();
  const router = useRouter();
  const actionId = params?.id as string;

  const [action, setAction] = useState<Action | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [paqs, setPaqs] = useState<PAQ[]>([]);
  const [preuves, setPreuves] = useState<Preuve[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    ACT_Description: '',
    ACT_Status: '' as ActionStatus,
  });

  // --- CHARGEMENT DES DONNÉES ---
  const fetchData = useCallback(async () => {
    if (!actionId) return;

    try {
      setLoading(true);
      const [actionRes, usersRes, paqsRes, preuvesRes] = await Promise.all([
        apiClient.get<Action>(`/actions/${actionId}`),
        apiClient.get<User[]>('/users'),
        apiClient.get<PAQ[]>('/paq'),
        apiClient.get<Preuve[]>(`/preuves?actionId=${actionId}`),
      ]);

      const actionData = actionRes.data;
      setAction(actionData);
      setUsers(usersRes.data || []);
      setPaqs(paqsRes.data || []);
      setPreuves(preuvesRes.data || []);
      setFormData({
        ACT_Description: actionData.ACT_Description || '',
        ACT_Status: actionData.ACT_Status,
      });
    } catch (err) {
      console.error('[ACTION_DETAIL] Failed to load ', err);
      toast.error('Échec du chargement des détails de l\'action');
      router.push('/dashboard/actions');
    } finally {
      setLoading(false);
    }
  }, [actionId, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- STATISTIQUES EN TEMPS RÉEL ---
  const stats = useMemo(() => {
    if (!action?.ACT_Deadline) return { daysLeft: 0, isOverdue: false };

    const deadline = new Date(action.ACT_Deadline).getTime();
    const now = new Date().getTime();
    const diff = deadline - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    return {
      daysLeft: days < 0 ? Math.abs(days) : days,
      isOverdue: days < 0 && action.ACT_Status !== 'TERMINEE',
    };
  }, [action]);

  // --- SOUMISSION DES MODIFICATIONS ---
  const handleSave = async () => {
    if (!action) return;

    setIsSaving(true);
    try {
      const payload: Partial<Action> = {
        ACT_Description: formData.ACT_Description.trim() || undefined,
        ACT_Status: formData.ACT_Status,
      };

      // Si l'action passe à "TERMINEE", on met à jour la date de complétion
      if (formData.ACT_Status === 'TERMINEE' && action.ACT_Status !== 'TERMINEE') {
        payload.ACT_CompletedAt = new Date().toISOString();
      }

      await apiClient.patch(`/actions/${action.ACT_Id}`, payload);
      toast.success('Action mise à jour avec succès');
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Échec de la mise à jour de l\'action';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsSaving(false);
    }
  };

  // --- GESTION DU CHARGEMENT ---
  if (loading || !action) {
    return (
      <div className="ml-72 flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative inline-block">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">Chargement des détails de l&apos;action...</p>
        </div>
      </div>
    );
  }

  // --- DONNÉES CONTEXTUELLES ---
  const responsible = users.find((u) => u.U_Id === action.ACT_ResponsableId);
  const creator = users.find((u) => u.U_Id === action.ACT_CreatorId);
  const paq = paqs.find((p) => p.PAQ_Id === action.ACT_PAQId);
  const isCompleted = action.ACT_Status === 'TERMINEE';

  return (
    <div className="ml-72 bg-gray-50 min-h-screen p-6">
      <Toaster position="top-right" richColors />

      <div className="mx-auto max-w-7xl space-y-8">
        {/* 🔝 HEADER */}
        <header className="border-b border-gray-200 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                aria-label="Retour"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                    Réf: {action.ACT_Id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm font-medium text-gray-700">
                    {action.ACT_Origin.replace('_', ' ')}
                  </span>
                </div>
                <h1 className="mt-2 text-2xl font-bold text-gray-900">{action.ACT_Title}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Target className="h-4 w-4 text-gray-400" />
                    <span>PAQ: {paq?.PAQ_Title || 'Non assigné'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                    <span>
                      Créée par {creator ? `${creator.U_FirstName} ${creator.U_LastName}` : 'Système'} le{' '}
                      {new Date(action.ACT_CreatedAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 sm:mt-0">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                aria-label="Imprimer le rapport"
              >
                <Printer className="h-4 w-4" />
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || isCompleted}
                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer les modifications
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* 📊 GRID PRINCIPAL */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* COLONNE 1 : MÉTADONNÉES ET STATUT */}
          <div className="lg:col-span-1 space-y-6">
            {/* STATUT DE L'ACTION */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-900">Statut de l&apos;action</h2>
              <div className="mt-4 space-y-3">
                {Object.values(ActionStatus).map((status) => (
                  <button
                    key={status}
                    onClick={() => !isCompleted && setFormData({ ...formData, ACT_Status: status })}
                    disabled={isCompleted}
                    className={cn(
                      'w-full flex items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors',
                      formData.ACT_Status === status
                        ? 'bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500'
                        : 'text-gray-700 hover:bg-gray-50',
                      isCompleted && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    <span>{status.replace('_', ' ')}</span>
                    {formData.ACT_Status === status && (
                      <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* INDICATEURS DE PERFORMANCE */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-900">Indicateurs de performance</h2>
              <div className="mt-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                    <span>Échéance</span>
                    <span
                      className={cn(
                        'font-medium',
                        stats.isOverdue ? 'text-red-600' : 'text-gray-900',
                      )}
                    >
                      {action.ACT_Deadline
                        ? new Date(action.ACT_Deadline).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Non définie'}
                    </span>
                  </div>
                  {stats.isOverdue && (
                    <div className="flex items-center gap-1.5 text-xs text-red-600">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>En retard de {stats.daysLeft} jour{stats.daysLeft > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                    <span>Priorité</span>
                    <PriorityBadge priority={action.ACT_Priority} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                    <span>Responsable</span>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-medium text-xs">
                        {responsible?.U_FirstName?.charAt(0) || '?'}
                        {responsible?.U_LastName?.charAt(0) || '?'}
                      </div>
                      <span className="text-sm text-gray-900">
                        {responsible
                          ? `${responsible.U_FirstName} ${responsible.U_LastName}`
                          : 'Non assigné'}
                      </span>
                    </div>
                  </div>
                </div>

                {action.ACT_CompletedAt && (
                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                      <span>Clôture</span>
                      <span className="text-sm text-gray-900">
                        {new Date(action.ACT_CompletedAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* COLONNES 2-3 : RAPPORT ET PREUVES */}
          <div className="lg:col-span-2 space-y-8">
            {/* RAPPORT D'EXÉCUTION */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Rapport d&apos;exécution</h2>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                  Preuve §10.2.1
                </span>
              </div>
              <textarea
                value={formData.ACT_Description}
                onChange={(e) => setFormData({ ...formData, ACT_Description: e.target.value })}
                disabled={isCompleted}
                placeholder="Saisissez le rapport d'exécution technique détaillant les actions menées, les résultats obtenus et les leçons apprises..."
                className={cn(
                  'mt-4 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500',
                  isCompleted ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : '',
                )}
                rows={10}
              />
              <p className="mt-2 text-xs text-gray-500">
                Ce rapport constitue une preuve objective de l&apos;efficacité de l&apos;action corrective/préventive
              </p>
            </div>

            {/* DOSSIER DE PREUVES */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Dossier de preuves</h2>
                <button className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  <FileText className="mr-1.5 h-3.5 w-3.5" />
                  Ajouter une preuve
                </button>
              </div>
              <div className="mt-6">
                {preuves.length > 0 ? (
                  <div className="space-y-4">
                    {preuves.map((preuve) => (
                      <div
                        key={preuve.PV_Id}
                        className="flex items-start justify-between rounded-lg border border-gray-200 bg-gray-50 p-4"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">{preuve.PV_FileName}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            {preuve.PV_Commentaire || 'Aucun commentaire'}
                          </p>
                        </div>
                        <button className="shrink-0 rounded bg-gray-100 p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-12">
                    <FileText className="h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-sm font-medium text-gray-900">Aucune preuve associée</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Ajoutez des documents, photos ou rapports pour justifier l&apos;efficacité de l&apos;action
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
                <h3 className="text-sm font-medium text-indigo-900">Exigence ISO 9001:2015 §10.2</h3>
                <p className="mt-1 text-sm text-indigo-800">
                  Lorsqu&apos;une non-conformité survient, l&apos;organisation doit réagir, évaluer la nécessité d&apos;agir pour éliminer la cause afin d&apos;éviter que la non-conformité ne se reproduise ou ne se produise ailleurs.
                </p>
                <p className="mt-2 text-xs text-indigo-700">
                  Cette action fait partie du Plan d&apos;Amélioration Continue (CAPA) et sa traçabilité est garantie pour les audits internes et externes.
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 md:mt-0">
              <button
                onClick={handleSave}
                disabled={isSaving || isCompleted}
                className={cn(
                  'inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                  isCompleted
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700',
                )}
              >
                <Save className="mr-1.5 h-4 w-4" />
                {isCompleted ? 'Action clôturée' : 'Valider les modifications'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANTS RÉUTILISABLES
// ============================================================================

function PriorityBadge({ priority }: { priority: Priority }) {
  const config: Record<Priority, { label: string; color: string }> = {
    LOW: { label: 'Basse', color: 'text-gray-800' },
    MEDIUM: { label: 'Moyenne', color: 'text-blue-800' },
    HIGH: { label: 'Haute', color: 'text-amber-800' },
    URGENT: { label: 'Urgente', color: 'text-orange-800' },
    CRITICAL: { label: 'Critique', color: 'text-red-800' },
  };

  const { label, color } = config[priority] || config.MEDIUM;
  return (
    <span className={`inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}