/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { format, isPast, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast, Toaster } from 'sonner';
import {
  AlertCircle, AlertTriangle, BarChart3, Calendar, CheckCircle2,
  Clock, FileText, History, Loader2, Paperclip, Plus, RefreshCcw, ShieldCheck,
  Target, Users, Download, MessageSquare, ArrowLeft, Pencil, Archive, Eye,
  FileQuestion, Link as LinkIconComponent
} from 'lucide-react';
import {
  type Action,
  type User,
  type PAQ,
  type NonConformite,
  type Audit,
  type Processus,
  type Preuve,
  type ChangeLog,
  type ProcessType,
  ActionOrigin,
  ActionStatus,
  ActionType,
  ChangeAction,
  Priority,
  Role
} from '@/types/elite-sde';

// --- UTILITAIRE CN ---
const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(' ');

// --- TYPES SPÉCIFIQUES À LA PAGE (CONFORMES PRISMA) ---
interface ActionDetail extends Action {
  ACT_Responsable: User;
  ACT_Creator: User;
  ACT_PAQ: PAQ & { PAQ_Processus: Processus & { PR_Type: ProcessType } };
  ACT_NC?: NonConformite | null;
  ACT_Audit?: Audit | null;
  ACT_Preuves: Preuve[];
  ACT_ChangeLogs: ChangeLog[];
}

export default function ActionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const actionId = params?.id as string;

  const [action, setAction] = useState<ActionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userRole, setUserRole] = useState<Role>(Role.USER); // ✅ CORRECTION ICI : Role.USER au lieu de 'USER'
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<ActionStatus>(ActionStatus.A_FAIRE);

  // --- INITIALISATION RÔLE UTILISATEUR ---
  useEffect(() => {
    const storedUser = localStorage.getItem('qualisoft_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        setUserRole(user.U_Role || Role.USER);
      } catch (e) {
        console.warn('[ACTION_DETAIL] Impossible de lire le rôle utilisateur');
      }
    }
  }, []);

  // --- CHARGEMENT DE L'ACTION ---
  const loadAction = useCallback(async () => {
    if (!actionId) return;
    
    try {
      setLoading(true);
      const res = await apiClient.get<ActionDetail>(`/actions/${actionId}`);
      setAction(res.data);
      setNewStatus(res.data.ACT_Status);
    } catch (err: any) {
      console.error('[ACTION_DETAIL] Fetch error:', err);
      const msg = err.response?.data?.message || 'Action introuvable';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
      router.push('/dashboard/continuous-improvement');
    } finally {
      setLoading(false);
    }
  }, [actionId, router]);

  useEffect(() => {
    loadAction();
  }, [loadAction]);

  // --- MISE À JOUR DU STATUT ---
  const updateStatus = async () => {
    if (!action || !canEdit) return;
    
    setSubmitting(true);
    try {
      await apiClient.patch(`/actions/${action.ACT_Id}/status`, { ACT_Status: newStatus });
      toast.success('Statut mis à jour avec succès');
      setAction(prev => prev ? { ...prev, ACT_Status: newStatus } : null);
      setIsEditingStatus(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Échec de la mise à jour';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSubmitting(false);
    }
  };

  // --- ARCHIVAGE (SOFT DELETE) ---
  const archiveAction = async () => {
    if (!action || !canEdit) return;
    
    if (!confirm(`Archiver l'action "${action.ACT_Title}" ?\n\nCette action sera désactivée mais conservée pour audit (RGPD/ANSD).`)) {
      return;
    }
    
    setSubmitting(true);
    try {
      await apiClient.delete(`/actions/${action.ACT_Id}`);
      toast.success('Action archivée avec succès');
      router.push('/dashboard/continuous-improvement');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Échec de l\'archivage';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSubmitting(false);
    }
  };

  // --- RBAC ---
  const canEdit = useMemo(() => {
    return [Role.ADMIN, Role.SUPER_ADMIN, Role.PILOTE, Role.RQ].includes(userRole);
  }, [userRole]);

  // --- HELPERS VISUELS ---
  const getStatusBadge = (status: ActionStatus) => {
    const config: Record<ActionStatus, { label: string; color: string }> = {
      [ActionStatus.A_FAIRE]: { label: 'À faire', color: 'bg-gray-100 text-gray-800 border-gray-200' },
      [ActionStatus.EN_COURS]: { label: 'En cours', color: 'bg-blue-50 text-blue-800 border-blue-200' },
      [ActionStatus.A_VALIDER]: { label: 'À valider', color: 'bg-amber-50 text-amber-800 border-amber-200' },
      [ActionStatus.TERMINEE]: { label: 'Terminée', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
      [ActionStatus.NON_EFFICACE]: { label: 'Non efficace', color: 'bg-red-50 text-red-800 border-red-200' },
      [ActionStatus.ANNULEE]: { label: 'Annulée', color: 'bg-gray-200 text-gray-700 border-gray-300' },
      [ActionStatus.EN_RETARD]: { label: 'En retard', color: 'bg-red-50 text-red-800 border-red-300 border-l-4' },
    };
    const { label, color } = config[status] || config[ActionStatus.A_FAIRE];
    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${color}`}>
        {label}
      </span>
    );
  };

  const getPriorityBadge = (priority: Priority) => {
    const config: Record<Priority, { label: string; color: string }> = {
      [Priority.CRITICAL]: { label: 'Critique', color: 'bg-red-100 text-red-800' },
      [Priority.URGENT]: { label: 'Urgent', color: 'bg-red-100 text-red-800' },
      [Priority.HIGH]: { label: 'Haute', color: 'bg-orange-100 text-orange-800' },
      [Priority.MEDIUM]: { label: 'Moyenne', color: 'bg-blue-100 text-blue-800' },
      [Priority.LOW]: { label: 'Basse', color: 'bg-gray-100 text-gray-800' },
    };
    const { label, color } = config[priority] || config[Priority.MEDIUM];
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
        {label}
      </span>
    );
  };

  const getTypeBadge = (type: ActionType) => {
    const config: Record<ActionType, { label: string; color: string }> = {
      [ActionType.CORRECTIVE]: { label: 'Corrective', color: 'bg-red-50 text-red-800' },
      [ActionType.PREVENTIVE]: { label: 'Préventive', color: 'bg-emerald-50 text-emerald-800' },
      [ActionType.AMELIORATION]: { label: 'Amélioration', color: 'bg-blue-50 text-blue-800' },
    };
    const { label, color } = config[type] || config[ActionType.CORRECTIVE];
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
        {label}
      </span>
    );
  };

  const getSourceBadge = (origin: ActionOrigin) => {
    const config: Record<ActionOrigin, { label: string; icon: React.ReactNode }> = {
      [ActionOrigin.AUDIT]: { label: 'Audit', icon: <FileText className="h-3.5 w-3.5 text-purple-600" /> },
      [ActionOrigin.NON_CONFORMITE]: { label: 'NC', icon: <AlertTriangle className="h-3.5 w-3.5 text-red-600" /> },
      [ActionOrigin.RECLAMATION]: { label: 'Réclamation', icon: <MessageSquare className="h-3.5 w-3.5 text-amber-600" /> },
      [ActionOrigin.REVUE_DIRECTION]: { label: 'Revue Dir.', icon: <BarChart3 className="h-3.5 w-3.5 text-emerald-600" /> },
      [ActionOrigin.COPIL]: { label: 'COPIL', icon: <Users className="h-3.5 w-3.5 text-blue-600" /> },
      [ActionOrigin.RISQUE]: { label: 'Risque', icon: <Target className="h-3.5 w-3.5 text-orange-600" /> },
      [ActionOrigin.SSE]: { label: 'SST', icon: <AlertCircle className="h-3.5 w-3.5 text-rose-600" /> },
      [ActionOrigin.OBJECTIF]: { label: 'Objectif', icon: <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" /> },
      [ActionOrigin.LEGAL]: { label: 'Légal', icon: <FileQuestion className="h-3.5 w-3.5 text-gray-600" /> },
      [ActionOrigin.ALERTE]: { label: 'Alerte', icon: <AlertCircle className="h-3.5 w-3.5 text-red-600" /> },
      [ActionOrigin.AUTRE]: { label: 'Autre', icon: <Tag className="h-3.5 w-3.5 text-gray-500" /> },
    };
    const { label, icon } = config[origin] || config[ActionOrigin.AUTRE];
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
        {icon}
        {label}
      </span>
    );
  };

  const isLate = action && action.ACT_Deadline && isPast(new Date(action.ACT_Deadline)) && action.ACT_Status !== ActionStatus.TERMINEE;
  const daysLeft = action && action.ACT_Deadline ? differenceInDays(new Date(action.ACT_Deadline), new Date()) : 0;

  // --- CHARGEMENT ---
  if (loading) {
    return (
      <div className="ml-72 flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative inline-block">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">Chargement de l&apos;action...</p>
        </div>
      </div>
    );
  }

  if (!action) {
    return (
      <div className="ml-72 flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm font-medium text-gray-900">Action non trouvée</p>
          <button
            onClick={() => router.push('/dashboard/continuous-improvement')}
            className="mt-4 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Retour au registre
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-72 bg-gray-50 min-h-screen p-6">
      <Toaster position="top-right" richColors />

      <div className="mx-auto max-w-7xl">
        {/* BREADCRUMB & ACTIONS */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au registre
            </button>
            <div className="hidden h-6 w-px bg-gray-200 sm:block" />
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                Réf: {action.ACT_Id.substring(0, 8).toUpperCase()}
              </span>
              <span className="text-sm text-gray-500">•</span>
              {getSourceBadge(action.ACT_Origin)}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {canEdit && (
              <button
                onClick={() => router.push(`/dashboard/continuous-improvement/actions/${action.ACT_Id}/edit`)}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Pencil className="h-4 w-4" />
                Modifier
              </button>
            )}
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Exporter
            </button>
            {canEdit && (
              <button
                onClick={archiveAction}
                disabled={submitting}
                className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
              >
                <Archive className="h-4 w-4" />
                Archiver
              </button>
            )}
          </div>
        </div>

        {/* HEADER PRINCIPAL */}
        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* COLONNE GAUCHE : TITRE & MÉTADONNÉES */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              {getPriorityBadge(action.ACT_Priority)}
              {getTypeBadge(action.ACT_Type)}
              {isLate && (
                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                  <AlertCircle className="mr-1 h-3.5 w-3.5" />
                  {Math.abs(daysLeft)}j de retard
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{action.ACT_Title}</h1>
            {action.ACT_Description && (
              <p className="mt-2 text-gray-600">{action.ACT_Description}</p>
            )}

            {/* PROGRESSION */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Progression</span>
                <span className="text-sm font-medium text-gray-900">0%</span>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                  style={{ width: `0%` }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 italic">
                * La progression est calculée automatiquement via les jalons d&apos;action (à venir dans v2.1)
              </p>
            </div>
          </div>

          {/* COLONNE DROITE : STATUT & RESPONSABLE */}
          <div className="space-y-6">
            {/* STATUT */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-700">Statut actuel</h2>
                {canEdit && (
                  <button
                    onClick={() => setIsEditingStatus(true)}
                    className="text-xs text-indigo-600 hover:text-indigo-900"
                  >
                    Modifier
                  </button>
                )}
              </div>
              <div className="mt-2">
                {isEditingStatus ? (
                  <div className="space-y-3">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as ActionStatus)}
                      className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value={ActionStatus.A_FAIRE}>À faire</option>
                      <option value={ActionStatus.EN_COURS}>En cours</option>
                      <option value={ActionStatus.A_VALIDER}>À valider</option>
                      <option value={ActionStatus.TERMINEE}>Terminée</option>
                      <option value={ActionStatus.NON_EFFICACE}>Non efficace</option>
                      <option value={ActionStatus.ANNULEE}>Annulée</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={updateStatus}
                        disabled={submitting || newStatus === action.ACT_Status}
                        className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        {submitting ? (
                          <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                        ) : (
                          'Enregistrer'
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingStatus(false);
                          setNewStatus(action.ACT_Status);
                        }}
                        className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  getStatusBadge(action.ACT_Status)
                )}
              </div>
            </div>

            {/* RESPONSABLE */}
            <div>
              <h2 className="text-sm font-medium text-gray-700">Responsable</h2>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700 border border-gray-300">
                  {action.ACT_Responsable.U_FirstName?.[0] || '?'}
                  {action.ACT_Responsable.U_LastName?.[0] || '?'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {action.ACT_Responsable.U_FirstName} {action.ACT_Responsable.U_LastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {action.ACT_Responsable.U_Role === Role.PILOTE ? 'Pilote processus' : 'Responsable qualité'}
                  </p>
                </div>
              </div>
            </div>

            {/* ÉCHÉANCE */}
            <div>
              <h2 className="text-sm font-medium text-gray-700">Échéance</h2>
              <div className={`mt-2 flex items-center gap-2 ${isLate ? 'text-red-600' : daysLeft <= 7 ? 'text-amber-600' : 'text-gray-900'}`}>
                <Calendar className="h-4 w-4 shrink-0" />
                <span className="font-medium">
                  {action.ACT_Deadline 
                    ? format(new Date(action.ACT_Deadline), 'dd MMMM yyyy', { locale: fr })
                    : 'Non définie'}
                </span>
                {action.ACT_Deadline && !isLate && daysLeft >= 0 && (
                  <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                    daysLeft <= 3 ? 'bg-red-100 text-red-800' : 
                    daysLeft <= 7 ? 'bg-amber-100 text-amber-800' : 
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {daysLeft}j restants
                  </span>
                )}
              </div>
            </div>

            {/* PAQ & PROCESSUS */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div>
                <h2 className="text-sm font-medium text-gray-700">Plan d&apos;actions qualité</h2>
                <p className="mt-1 text-sm font-medium text-indigo-700">
                  {action.ACT_PAQ.PAQ_Title} ({action.ACT_PAQ.PAQ_Year})
                </p>
              </div>
              <div className="mt-4">
                <h2 className="text-sm font-medium text-gray-700">Processus rattaché</h2>
                <p className="mt-1 text-sm text-gray-900">
                  {action.ACT_PAQ.PAQ_Processus.PR_Code} — {action.ACT_PAQ.PAQ_Processus.PR_Libelle}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Type: {action.ACT_PAQ.PAQ_Processus.PR_Type.PT_Label} ({action.ACT_PAQ.PAQ_Processus.PR_Type.PT_Family})
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENU PRINCIPAL */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* COLONNE GAUCHE : ORIGINE & PREUVES */}
          <div className="lg:col-span-2 space-y-8">
            {/* SECTION ORIGINE & LIENS */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-gray-500" />
                Origine et liens métier
              </h2>
              <div className="space-y-4">
                {action.ACT_NC && (
                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Issue d&apos;une non-conformité</p>
                        <p className="mt-1 text-sm text-gray-700">
                          <span className="font-medium text-red-600">{action.ACT_NC.NC_Libelle}</span>
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Gravité: {action.ACT_NC.NC_Gravite} • Statut: {action.ACT_NC.NC_Statut}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {action.ACT_Audit && (
                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Issue d&apos;un audit</p>
                        <p className="mt-1 text-sm text-gray-700">
                          <span className="font-medium text-purple-700">{action.ACT_Audit.AU_Reference}</span> — {action.ACT_Audit.AU_Title}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Type: {action.ACT_Audit.AU_Type} • Date: {format(new Date(action.ACT_Audit.AU_DateAudit), 'dd/MM/yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {!action.ACT_NC && !action.ACT_Audit && (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                    <Tag className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Cette action n&apos;est pas encore rattachée à une NC ou un audit
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* SECTION PREUVES */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Paperclip className="h-5 w-5 text-gray-500" />
                  Preuves associées ({action.ACT_Preuves.length})
                </h2>
                {canEdit && (
                  <button className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    Ajouter
                  </button>
                )}
              </div>
              {action.ACT_Preuves.length > 0 ? (
                <div className="space-y-3">
                  {action.ACT_Preuves.map((preuve) => (
                    <div
                      key={preuve.PV_Id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                          <FileText className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{preuve.PV_FileName}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(preuve.PV_CreatedAt), 'dd MMM yyyy', { locale: fr })}
                          </p>
                        </div>
                      </div>
                      <a
                        href={preuve.PV_FileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                      >
                        Voir
                        <Eye className="h-4 w-4 ml-1" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-12">
                  <FileText className="h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Aucune preuve associée</p>
                  {canEdit && (
                    <button className="mt-3 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-indigo-600 shadow-sm hover:bg-gray-100">
                      Ajouter une preuve
                    </button>
                  )}
                </div>
              )}
            </section>

            {/* SECTION AUDIT TRAIL */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <History className="h-5 w-5 text-gray-500" />
                Historique des modifications ({action.ACT_ChangeLogs.length})
              </h2>
              <div className="space-y-4">
                {action.ACT_ChangeLogs.length > 0 ? (
                  action.ACT_ChangeLogs.slice(0, 5).map((log) => (
                    <div key={log.CL_Id} className="relative pl-5 pb-6 border-l-2 border-gray-200">
                      <div className="absolute -left-1 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                        <div className="h-2 w-2 rounded-full bg-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {log.CL_Action === ChangeAction.UPDATE ? 'Mise à jour' : 'Création'}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        par {log.CL_UserId} • {format(new Date(log.CL_Timestamp), 'dd MMM yyyy HH:mm', { locale: fr })}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-sm text-gray-500">
                    Aucune modification enregistrée
                  </div>
                )}
                {action.ACT_ChangeLogs.length > 5 && (
                  <button className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Voir tout l&apos;historique ({action.ACT_ChangeLogs.length})
                  </button>
                )}
              </div>
            </section>
          </div>

          {/* COLONNE DROITE : ACTIONS RAPIDES & CONFORMITÉ */}
          <div className="space-y-8">
            {/* SECTION ACTIONS RAPIDES */}
            {canEdit && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
                <div className="space-y-3">
                  <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <RefreshCcw className="h-4 w-4" />
                    Relancer le responsable
                  </button>
                  <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <Target className="h-4 w-4" />
                    Créer une action dérivée
                  </button>
                  <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <Eye className="h-4 w-4" />
                    Masquer aux rapports
                  </button>
                </div>
              </section>
            )}

            {/* SECTION CONFORMITÉ ISO */}
            <section>
              <div className="rounded-xl bg-indigo-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600">
                    <span className="text-xs font-bold text-white">§</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-indigo-900">Conformité ISO 9001:2015</h3>
                    <p className="mt-1 text-sm text-indigo-800">
                      Cette action contribue à l&apos;exigence §10.2 (Actions correctives) et §6.1 (Actions pour traiter les risques).
                    </p>
                    <button className="mt-3 text-xs font-medium text-indigo-700 hover:text-indigo-900">
                      Voir les exigences associées
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION CRÉATEUR */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Création</h2>
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700 border border-gray-300">
                    {action.ACT_Creator.U_FirstName?.[0] || '?'}
                    {action.ACT_Creator.U_LastName?.[0] || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {action.ACT_Creator.U_FirstName} {action.ACT_Creator.U_LastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Créée le {format(new Date(action.ACT_CreatedAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ICÔNES CUSTOM POUR CLARTÉ
// ============================================================================

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={cn("w-5 h-5", className)}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
      />
    </svg>
  );
}

function Tag({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={cn("w-8 h-8", className)}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 6h.008v.008H6V6z"
      />
    </svg>
  );
}