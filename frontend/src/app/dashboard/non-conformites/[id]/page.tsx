/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * FICHIER : app/(dashboard)/non-conformites/[id]/page.tsx
 * ===========================================================================
 * PAGE DÉTAIL D'UNE NON-CONFORMITÉ
 * Rôle : Investigation RCA et pilotage des actions correctives (ISO 9001 §10.2)
 * Design : Style ClickUp professionnel (sobre, épuré, orienté qualité)
 * Conformité : 100% schéma Prisma — zéro champ inventé
 * ===========================================================================
 */

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import {
  AlertOctagon,
  ArrowLeft,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Edit3,
  Hammer,
  Loader2,
  MessageSquare,
  Plus,
  Printer,
  Save,
  ShieldCheck,
  Target,
  Truck,
  User,
  X,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import {
  NonConformite,
  Processus,
  User as UserType,
  Action,
  NCStatus,
  NCGravity,
  NCSource,
  ActionStatus,
  Priority,
} from '@/types/elite-sde';
import { NCStatus as NCStatusEnum, NCGravity as NCGravityEnum, NCSource as NCSourceEnum } from '@/types/elite-sde';

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
    icon: ShieldCheck,
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

export default function NonConformiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ncId = params?.id as string;

  const [nc, setNc] = useState<NonConformite | null>(null);
  const [process, setProcess] = useState<Processus | null>(null);
  const [detector, setDetector] = useState<UserType | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [newAction, setNewAction] = useState({ title: '', deadline: '' });

  // --- CHARGEMENT DES DONNÉES ---
  const fetchData = useCallback(async () => {
    if (!ncId) return;
    
    try {
      setLoading(true);
      
      // Chargement simultané de la NC, ses actions et les données associées
      const [ncRes, actionsRes] = await Promise.all([
        apiClient.get<NonConformite>(`/non-conformites/${ncId}`),
        apiClient.get<Action[]>(`/actions?ncId=${ncId}`),
      ]);
      
      const ncData = ncRes.data;
      setNc(ncData);
      setActions(actionsRes.data || []);
      
      // Chargement des relations
      if (ncData.NC_ProcessusId) {
        const processRes = await apiClient.get<Processus>(`/processes/${ncData.NC_ProcessusId}`);
        setProcess(processRes.data);
      }
      
      if (ncData.NC_DetectorId) {
        const detectorRes = await apiClient.get<UserType>(`/users/${ncData.NC_DetectorId}`);
        setDetector(detectorRes.data);
      }
    } catch (err) {
      console.error('[NC_DETAIL] Failed to load data:', err);
      toast.error('Échec du chargement des détails de la non-conformité');
      router.push('/dashboard/non-conformites');
    } finally {
      setLoading(false);
    }
  }, [ncId, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- SAUVEGARDE DU DIAGNOSTIC RCA ---
  const saveRCA = async () => {
    if (!nc || !nc.NC_Diagnostic?.trim()) {
      toast.error('Le diagnostic RCA est obligatoire');
      return;
    }
    
    setIsSaving(true);
    try {
      await apiClient.patch(`/non-conformites/${nc.NC_Id}`, {
        NC_Diagnostic: nc.NC_Diagnostic,
        NC_Statut: NCStatusEnum.ANALYSE,
      });
      
      toast.success('Diagnostic RCA enregistré avec succès');
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Échec de l\'enregistrement du diagnostic RCA';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsSaving(false);
    }
  };

  // --- CRÉATION D'UNE ACTION CORRECTIVE ---
  const createAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nc || !newAction.title.trim() || !newAction.deadline) return;
    
    try {
      const actionRes = await apiClient.post<Action>('/actions', {
        ACT_Title: newAction.title.trim(),
        ACT_Description: `Action corrective pour la NC ${nc.NC_Code || nc.NC_Id.slice(0, 8)}`,
        ACT_Origin: 'NON_CONFORMITE',
        ACT_Type: 'CORRECTIVE',
        ACT_Status: 'A_FAIRE',
        ACT_Priority: 'HIGH',
        ACT_Deadline: newAction.deadline,
        ACT_ResponsableId: detector?.U_Id || '',
        ACT_CreatorId: detector?.U_Id || '',
        ACT_PAQId: '', // À remplir selon votre logique métier
        ACT_NCId: nc.NC_Id,
      });
      
      // Mise à jour du statut de la NC si nécessaire
      if (nc.NC_Statut !== NCStatusEnum.ACTION_EN_COURS && nc.NC_Statut !== NCStatusEnum.CLOTURE) {
        await apiClient.patch(`/non-conformites/${nc.NC_Id}`, {
          NC_Statut: NCStatusEnum.ACTION_EN_COURS,
        });
      }
      
      toast.success('Action corrective créée avec succès');
      setIsActionModalOpen(false);
      setNewAction({ title: '', deadline: '' });
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Échec de la création de l\'action corrective';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  // --- CLOTURE DE LA NC ---
  const closeNC = async () => {
    if (!nc) return;
    if (!confirm('Confirmer la clôture définitive de cette non-conformité ?\n\nCette action valide que toutes les actions correctives ont été mises en œuvre et sont efficaces.')) {
      return;
    }
    
    try {
      await apiClient.patch(`/non-conformites/${nc.NC_Id}`, {
        NC_Statut: NCStatusEnum.CLOTURE,
      });
      
      toast.success('Non-conformité clôturée avec succès');
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Échec de la clôture de la non-conformité';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  // --- GESTION DU CHARGEMENT ---
  if (loading || !nc) {
    return (
      <div className="ml-72 flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative inline-block">
            <Loader2 className="h-10 w-10 animate-spin text-red-600" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">Chargement des détails de la non-conformité...</p>
        </div>
      </div>
    );
  }

  // --- CONFIGURATION VISUELLE ---
  const sourceConfig = SOURCE_CONFIG[nc.NC_Source] || SOURCE_CONFIG[NCSourceEnum.INTERNAL_AUDIT];
  const Icon = sourceConfig.icon;
  const gravityColor = 
    nc.NC_Gravite === NCGravityEnum.CRITIQUE ? 'text-red-600' :
    nc.NC_Gravite === NCGravityEnum.MAJEURE ? 'text-orange-600' : 'text-yellow-600';
  const statusConfig: Record<NCStatus, { label: string; color: string; icon: React.ElementType }> = {
    [NCStatusEnum.DETECTION]: { label: 'Détection', color: 'bg-blue-100 text-blue-800', icon: Target },
    [NCStatusEnum.ANALYSE]: { label: 'Analyse RCA', color: 'bg-amber-100 text-amber-800', icon: Target },
    [NCStatusEnum.ACTION_EN_COURS]: { label: 'Actions en cours', color: 'bg-red-100 text-red-800', icon: Hammer },
    [NCStatusEnum.VERIFICATION]: { label: 'Vérification', color: 'bg-purple-100 text-purple-800', icon: CheckCircle2 },
    [NCStatusEnum.CLOTURE]: { label: 'Clôturée', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
    [NCStatus.EN_COURS]: {
      label: '',
      color: '',
      icon: 'symbol'
    }
  };
  const status = statusConfig[nc.NC_Statut] || statusConfig[NCStatusEnum.DETECTION];

  return (
    <div className="ml-72 bg-gray-50 min-h-screen p-6">
      <Toaster position="top-right" richColors />

      <div className="mx-auto max-w-7xl space-y-8">
        {/* 🔝 HEADER STRATÉGIQUE */}
        <header className="border-b border-gray-200 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour au registre
              </button>
              <div className="h-4 w-px bg-gray-200 hidden sm:block" />
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium',
                    nc.NC_Statut === NCStatusEnum.CLOTURE ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  )}
                >
                  {nc.NC_Statut === NCStatusEnum.CLOTURE ? 'Clôturée' : 'En cours'}
                </span>
                <span className="text-sm font-medium text-gray-500">
                  NC-{nc.NC_Code || nc.NC_Id.slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 sm:mt-0">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Imprimer le rapport"
              >
                <Printer className="h-4 w-4" />
              </button>
              <button
                onClick={() => {}}
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Exporter en PDF"
              >
                <Download className="h-4 w-4" />
              </button>
              {nc.NC_Statut !== NCStatusEnum.CLOTURE && (
                <button
                  onClick={closeNC}
                  className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  <ShieldCheck className="mr-1.5 h-4 w-4" />
                  Clôturer la NC
                </button>
              )}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{nc.NC_Libelle}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${sourceConfig.color}`} aria-hidden="true" />
                    <span className="text-sm text-gray-600">{sourceConfig.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${gravityColor}`} aria-hidden="true" />
                    <span className="text-sm text-gray-600">{nc.NC_Gravite}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" aria-hidden="true" />
                    <span className="text-sm text-gray-600">{process?.PR_Libelle || 'Processus non assigné'}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 sm:mt-0">
                <status.icon className={`h-5 w-5 ${status.color.split(' ')[1]}`} aria-hidden="true" />
                <span className={`text-lg font-semibold ${status.color.split(' ')[1]}`}>{status.label}</span>
              </div>
            </div>
          </div>
        </header>

        {/* 📊 GRID PRINCIPAL */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* COLONNE 1 : CONTEXTE FACTUEL */}
          <div className="lg:col-span-1">
            <div className="rounded-xl bg-white shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-900">Contexte factuel</h2>
              <div className="mt-6 space-y-6">
                <DataField
                  icon={<Clock className="h-4 w-4 text-gray-400" />}
                  label="Date de détection"
                  value={new Date(nc.NC_CreatedAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                />
                <DataField
                  icon={<User className="h-4 w-4 text-gray-400" />}
                  label="Détecteur"
                  value={
                    detector
                      ? `${detector.U_FirstName} ${detector.U_LastName} (${detector.U_Role})`
                      : 'Non spécifié'
                  }
                />
                <DataField
                  icon={<Target className="h-4 w-4 text-gray-400" />}
                  label="Processus concerné"
                  value={process?.PR_Libelle || 'Non assigné'}
                />
                <DataField
                  icon={<AlertOctagon className={`h-4 w-4 ${gravityColor}`} />}
                  label="Gravité"
                  value={nc.NC_Gravite}
                />
                <div>
                  <p className="text-xs font-medium text-gray-500">Description de l&apos;écart</p>
                  <p className="mt-2 text-sm text-gray-700 italic">&quot;{nc.NC_Description}&quot;</p>
                </div>
              </div>
            </div>
          </div>

          {/* COLONNE 2 : INVESTIGATION RCA */}
          <div className="lg:col-span-1">
            <div className="rounded-xl bg-white shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Analyse des causes racines (RCA)</h2>
                {nc.NC_Statut !== NCStatusEnum.CLOTURE && (
                  <button
                    onClick={saveRCA}
                    disabled={isSaving || !nc.NC_Diagnostic?.trim()}
                    className="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    ) : (
                      <Save className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    Enregistrer le diagnostic
                  </button>
                )}
              </div>
              <div className="mt-6">
                <textarea
                  value={nc.NC_Diagnostic || ''}
                  onChange={(e) => setNc((prev) => (prev ? { ...prev, NC_Diagnostic: e.target.value } : null))}
                  disabled={nc.NC_Statut === NCStatusEnum.CLOTURE}
                  placeholder="Documentez ici l'analyse des causes racines (méthode 5P, Ishikawa, etc.)..."
                  className={cn(
                    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
                    nc.NC_Statut === NCStatusEnum.CLOTURE ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'focus:border-red-500'
                  )}
                  rows={10}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Cette analyse doit identifier les causes profondes de l&apos;écart et non seulement les symptômes (ISO 9001 §10.2.1.b)
                </p>
              </div>
            </div>
          </div>

          {/* COLONNE 3 : ACTIONS CAPA */}
          <div className="lg:col-span-1">
            <div className="rounded-xl bg-white shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Actions correctives (CAPA)</h2>
                {nc.NC_Statut !== NCStatusEnum.CLOTURE && (
                  <button
                    onClick={() => setIsActionModalOpen(true)}
                    className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Nouvelle action
                  </button>
                )}
              </div>
              <div className="mt-6">
                {actions.length > 0 ? (
                  <div className="space-y-4">
                    {actions.map((action) => (
                      <div
                        key={action.ACT_Id}
                        className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Hammer className="h-4 w-4 text-blue-600" aria-hidden="true" />
                              <h3 className="text-sm font-medium text-gray-900">{action.ACT_Title}</h3>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>
                                  Échéance :{' '}
                                  {action.ACT_Deadline
                                    ? new Date(action.ACT_Deadline).toLocaleDateString('fr-FR')
                                    : 'Non définie'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-3.5 w-3.5" />
                                <span>
                                  {action.ACT_Responsable?.U_FirstName} {action.ACT_Responsable?.U_LastName}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <StatusBadge status={action.ACT_Status} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-12">
                    <Hammer className="h-8 w-8 text-gray-400" aria-hidden="true" />
                    <p className="mt-2 text-sm font-medium text-gray-900">Aucune action corrective</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {nc.NC_Statut !== NCStatusEnum.CLOTURE
                        ? 'Créez une action corrective pour résoudre cette non-conformité'
                        : 'Cette NC a été clôturée sans actions correctives documentées'}
                    </p>
                    {nc.NC_Statut !== NCStatusEnum.CLOTURE && (
                      <button
                        onClick={() => setIsActionModalOpen(true)}
                        className="mt-4 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-blue-600 shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Ajouter une action
                      </button>
                    )}
                  </div>
                )}
              </div>
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
                  Ce dossier documente l&apos;ensemble du processus de traitement de la non-conformité : détection, analyse des causes racines, actions correctives et vérification de leur efficacité.
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 md:mt-0">
              <button
                onClick={() => setIsActionModalOpen(true)}
                disabled={nc.NC_Statut === NCStatusEnum.CLOTURE}
                className={cn(
                  'inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
                  nc.NC_Statut === NCStatusEnum.CLOTURE
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-red-700 hover:bg-red-50'
                )}
              >
                <Hammer className="mr-1.5 h-4 w-4" />
                Ajouter une action corrective
              </button>
              <button
                onClick={closeNC}
                disabled={nc.NC_Statut === NCStatusEnum.CLOTURE}
                className={cn(
                  'inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
                  nc.NC_Statut === NCStatusEnum.CLOTURE
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                )}
              >
                <ShieldCheck className="mr-1.5 h-4 w-4" />
                Clôturer la non-conformité
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🧾 MODAL CRÉATION ACTION CORRECTIVE */}
      {isActionModalOpen && (
        <CreateActionModal
          onClose={() => setIsActionModalOpen(false)}
          onSubmit={createAction}
          newAction={newAction}
          setNewAction={setNewAction}
          detector={detector}
        />
      )}
    </div>
  );
}

// ============================================================================
// COMPOSANTS RÉUTILISABLES
// ============================================================================

function DataField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-gray-900 wrap-break-word">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ActionStatus }) {
  const config: Record<ActionStatus, { label: string; color: string }> = {
    A_FAIRE: { label: 'À faire', color: 'bg-gray-100 text-gray-800' },
    EN_COURS: { label: 'En cours', color: 'bg-blue-100 text-blue-800' },
    A_VALIDER: { label: 'À valider', color: 'bg-amber-100 text-amber-800' },
    TERMINEE: { label: 'Terminée', color: 'bg-emerald-100 text-emerald-800' },
    NON_EFFICACE: { label: 'Non efficace', color: 'bg-red-100 text-red-800' },
    ANNULEE: { label: 'Annulée', color: 'bg-gray-200 text-gray-700' },
    EN_RETARD: { label: 'En retard', color: 'bg-red-100 text-red-800 animate-pulse' },
  };

  const { label, color } = config[status] || config.A_FAIRE;
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>{label}</span>;
}

function CreateActionModal({
  onClose,
  onSubmit,
  newAction,
  setNewAction,
  detector,
}: {
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newAction: { title: string; deadline: string };
  setNewAction: React.Dispatch<React.SetStateAction<{ title: string; deadline: string }>>;
  detector: UserType | null;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
          <div className="px-6 pb-6 pt-6 sm:px-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <Hammer className="h-6 w-6 text-blue-600" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Nouvelle action corrective</h3>
                  <p className="mt-1 text-sm text-gray-500">Conforme à l&apos;exigence ISO 9001:2015 §10.2.1.c</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span className="sr-only">Fermer</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Intitulé de l&apos;action <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    required
                    value={newAction.title}
                    onChange={(e) => setNewAction({ ...newAction, title: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Ex: Mettre à jour la procédure de réception"
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
                    value={newAction.deadline}
                    onChange={(e) => setNewAction({ ...newAction, deadline: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Responsable :</strong> {detector ? `${detector.U_FirstName} ${detector.U_LastName}` : 'Non spécifié'}{' '}
                    (détecteur de la NC)
                  </p>
                  <p className="mt-2 text-xs text-blue-700">
                    Par défaut, le détecteur de la non-conformité est désigné responsable de l&apos;action corrective. Vous pouvez
                    modifier ce responsable depuis la page de détail de l&apos;action une fois créée.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Hammer className="mr-2 h-4 w-4" />
                  Créer l&apos;action corrective
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}