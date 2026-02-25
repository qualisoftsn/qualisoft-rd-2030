/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';
import apiClient from '@/core/api/api-client';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Layers,
  Loader2,
  Plus,
  Save,
  Target,
  X,
} from 'lucide-react';
import {
  User,
  PAQ,
  Processus,
  Action,
  ActionStatus,
  Priority,
  ActionType,
  ActionOrigin,
} from '@/types/elite-sde';

// --- UTILITAIRE CN ---
const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(' ');

export default function NewActionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [paqs, setPaqs] = useState<PAQ[]>([]);
  const [processes, setProcesses] = useState<Processus[]>([]);

  const [formData, setFormData] = useState({
    ACT_Title: '',
    ACT_Description: '',
    ACT_Priority: Priority.MEDIUM,
    ACT_Origin: ActionOrigin.AUTRE,
    ACT_Type: ActionType.CORRECTIVE,
    ACT_ResponsableId: '',
    ACT_PAQId: '', // ✅ SEUL CHAMP DE RATTACHEMENT VALIDE (pas de ACT_ProcessusId !)
    ACT_Deadline: '',
    tasks: [] as { titre: string; responsableId: string }[],
  });

  // --- CHARGEMENT DES RÉFÉRENTIELS ---
  useEffect(() => {
    const loadRefs = async () => {
      try {
        const [resU, resP, resProc] = await Promise.all([
          apiClient.get<User[]>('/users'),
          apiClient.get<PAQ[]>('/paq'),
          apiClient.get<Processus[]>('/processes'),
        ]);
        setUsers(resU.data || []);
        setPaqs(resP.data || []);
        setProcesses(resProc.data || []);
      } catch (err) {
        console.error('[NEW_ACTION] Failed to load references:', err);
        toast.error('Échec du chargement des référentiels');
      }
    };
    loadRefs();
  }, []);

  // --- SOUMISSION ---
  const handleSubmit = async () => {
    if (!formData.ACT_PAQId) {
      toast.error('RATTACHEMENT AU PAQ OBLIGATOIRE (§10.2 ISO 9001)');
      return;
    }
    if (!formData.ACT_ResponsableId) {
      toast.error('RESPONSABLE DE L\'ACTION OBLIGATOIRE');
      return;
    }
    if (!formData.ACT_Deadline || new Date(formData.ACT_Deadline) <= new Date()) {
      toast.error('ÉCHÉANCE VALIDE OBLIGATOIRE (date future)');
      return;
    }

    setLoading(true);
    try {
      // 1. Création de l'action racine — STRICTEMENT CONFORME AU SCHÉMA PRISMA
      const actionRes = await apiClient.post<Action>('/actions', {
        ACT_Title: formData.ACT_Title.trim(),
        ACT_Description: formData.ACT_Description.trim() || undefined,
        ACT_Priority: formData.ACT_Priority,
        ACT_Origin: formData.ACT_Origin,
        ACT_Type: formData.ACT_Type,
        ACT_Status: ActionStatus.A_FAIRE,
        ACT_ResponsableId: formData.ACT_ResponsableId,
        ACT_PAQId: formData.ACT_PAQId, // ✅ SEUL CHAMP DE RATTACHEMENT EXISTANT
        ACT_Deadline: formData.ACT_Deadline ? new Date(formData.ACT_Deadline) : undefined,
        ACT_CreatorId: users.find(u => u.U_Role === 'ADMIN' || u.U_Role === 'SUPER_ADMIN')?.U_Id || users[0]?.U_Id,
        ACT_IsActive: true,
      });

      // 2. Création des tâches détaillées (si présentes) — OPTIONNEL
      if (formData.tasks.length > 0 && formData.tasks[0].titre.trim()) {
        await Promise.all(
          formData.tasks
            .filter(task => task.titre.trim())
            .map(task =>
              apiClient.post('/action-items', {
                itemTitre: task.titre.trim(),
                itemResponsableId: task.responsableId || formData.ACT_ResponsableId,
                itemEcheance: formData.ACT_Deadline ? new Date(formData.ACT_Deadline) : undefined,
                itemStatus: 'A_FAIRE',
                actionId: actionRes.data.ACT_Id,
              }),
            ),
        );
      }

      toast.success('Action corrective créée avec succès');
      router.push(`/dashboard/continuous-improvement/${actionRes.data.ACT_Id}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Échec de la création de l\'action';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  // --- VALIDATION DES ÉTAPES ---
  const canProceed = () => {
    if (step === 1) return formData.ACT_Title.trim().length >= 5;
    if (step === 2)
      return (
        formData.ACT_PAQId && // ✅ Obligatoire (pas de ACT_ProcessusId !)
        formData.ACT_ResponsableId &&
        formData.ACT_Deadline &&
        new Date(formData.ACT_Deadline) > new Date()
      );
    return true;
  };

  const selectedPAQ = paqs.find(p => p.PAQ_Id === formData.ACT_PAQId);
  const selectedProcess = selectedPAQ?.PAQ_ProcessusId;
  const selectedUser = users.find(u => u.U_Id === formData.ACT_ResponsableId);

  // --- ÉTAPES DU WIZARD ---
  const steps = [
    { id: 1, title: 'Identification', icon: Target, description: 'Titre, description et typologie' },
    { id: 2, title: 'Rattachement', icon: Layers, description: 'PAQ, responsable et échéance' },
    { id: 3, title: 'Décomposition', icon: CheckCircle2, description: 'Plan d\'actions détaillé' },
  ];

  return (
    <div className="ml-72 bg-gray-50 min-h-screen p-6">
      <Toaster position="top-right" richColors />

      <div className="mx-auto max-w-4xl">
        {/* BREADCRUMB */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au registre
          </button>
        </div>

        {/* HEADER */}
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle action corrective</h1>
          <p className="mt-2 text-sm text-gray-600">
            Conformément à l&apos;exigence ISO 9001:2015 §10.2 — Actions correctives et préventives
          </p>
        </div>

        {/* PROGRESS INDICATOR */}
        <div className="mb-10">
          <div className="flex justify-between">
            {steps.map((s, index) => (
              <div key={s.id} className="flex flex-1 flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium',
                    step > s.id
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : step === s.id
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-gray-300 bg-white text-gray-500',
                  )}
                >
                  {step > s.id ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : s.id}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      'text-xs font-medium',
                      step >= s.id ? 'text-gray-900' : 'text-gray-500',
                    )}
                  >
                    {s.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{s.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'mt-4 h-1 w-full',
                      step > s.id ? 'bg-emerald-500' : step === s.id ? 'bg-indigo-600' : 'bg-gray-200',
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* FORMULAIRE CONDITIONNEL */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-200 p-8">
          {/* ÉTAPE 1 : IDENTIFICATION */}
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Titre de l&apos;action <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  autoFocus
                  required
                  value={formData.ACT_Title}
                  onChange={e => setFormData({ ...formData, ACT_Title: e.target.value })}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Ex: Correction du processus de réception des marchandises"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Minimum 5 caractères — décrivez l&apos;objectif principal de l&apos;action
                </p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description & analyse des causes
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.ACT_Description}
                  onChange={e => setFormData({ ...formData, ACT_Description: e.target.value })}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Décrivez le contexte, les causes racines identifiées et les objectifs attendus..."
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Origine de l&apos;action
                  </label>
                  <select
                    id="origin"
                    value={formData.ACT_Origin}
                    onChange={e => setFormData({ ...formData, ACT_Origin: e.target.value as ActionOrigin })}
                    className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-10 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value={ActionOrigin.AUDIT}>Audit interne ou externe</option>
                    <option value={ActionOrigin.NON_CONFORMITE}>Non-conformité détectée</option>
                    <option value={ActionOrigin.RECLAMATION}>Réclamation client</option>
                    <option value={ActionOrigin.REVUE_DIRECTION}>Revue de direction</option>
                    <option value={ActionOrigin.COPIL}>COPIL / Comité de pilotage</option>
                    <option value={ActionOrigin.RISQUE}>Analyse des risques</option>
                    <option value={ActionOrigin.SSE}>Sécurité Santé Environnement</option>
                    <option value={ActionOrigin.OBJECTIF}>Objectif qualité non atteint</option>
                    <option value={ActionOrigin.LEGAL}>Exigence légale</option>
                    <option value={ActionOrigin.AUTRE}>Autre source</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Typologie
                  </label>
                  <select
                    id="type"
                    value={formData.ACT_Type}
                    onChange={e => setFormData({ ...formData, ACT_Type: e.target.value as ActionType })}
                    className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-10 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value={ActionType.CORRECTIVE}>Action corrective</option>
                    <option value={ActionType.PREVENTIVE}>Action préventive</option>
                    <option value={ActionType.AMELIORATION}>Opportunité d&apos;amélioration</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priorité stratégique</label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { value: Priority.LOW, label: 'Basse', color: 'bg-gray-100 text-gray-800' },
                    { value: Priority.MEDIUM, label: 'Moyenne', color: 'bg-blue-50 text-blue-800' },
                    { value: Priority.HIGH, label: 'Haute', color: 'bg-orange-50 text-orange-800' },
                    { value: Priority.CRITICAL, label: 'Critique', color: 'bg-red-50 text-red-800' },
                  ].map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, ACT_Priority: p.value })}
                      className={cn(
                        'flex w-full flex-col items-center rounded-lg border px-3 py-4 text-sm font-medium transition-colors',
                        formData.ACT_Priority === p.value
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                          : `border-gray-300 ${p.color} hover:bg-gray-100`,
                      )}
                    >
                      <span className="text-xs uppercase tracking-wider">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 2 : RATTACHEMENT (CORRIGÉ) */}
          {step === 2 && (
            <div className="space-y-8">
              <div className="rounded-lg bg-indigo-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600">
                    <span className="text-xs font-bold text-white">§</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-indigo-900">Exigence ISO 9001:2015 §10.2</h3>
                    <p className="mt-1 text-sm text-indigo-800">
                      Toute action corrective doit être rattachée à un Plan d&apos;Actions Qualité (PAQ) pour assurer sa traçabilité dans le système de management.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="paq" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Plan d&apos;actions qualité (PAQ) <span className="text-red-500">*</span>
                </label>
                <select
                  id="paq"
                  required
                  value={formData.ACT_PAQId}
                  onChange={e => setFormData({ ...formData, ACT_PAQId: e.target.value })}
                  className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-10 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Sélectionnez un PAQ actif...</option>
                  {paqs
                    .filter(paq => paq.PAQ_IsActive && paq.PAQ_Status !== 'ARCHIVE')
                    .map(paq => (
                      <option key={paq.PAQ_Id} value={paq.PAQ_Id}>
                        {paq.PAQ_Title} ({paq.PAQ_Year}) — Processus: {paq.PAQ_ProcessusId}
                      </option>
                    ))}
                </select>
                {selectedPAQ && (
                  <div className="mt-3 rounded-md bg-gray-50 p-4">
                    <p className="text-sm font-medium text-gray-900">{selectedPAQ.PAQ_Title}</p>
                    <p className="mt-1 text-xs text-gray-600">
                      Processus rattaché :{' '}
                      <span className="font-medium text-indigo-700">
                        {selectedProcess?.PR_Code} — {selectedProcess?.PR_Libelle}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-gray-600">
                      Pilote PAQ : {selectedPAQ.PAQ_QualityManager.U_FirstName}{' '}
                      {selectedPAQ.PAQ_QualityManager.U_LastName}
                    </p>
                  </div>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  ⚠️ Une action ne se rattache pas directement à un processus. Le lien s&apos;établit via le PAQ sélectionné.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="responsible" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Responsable de l&apos;action <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="responsible"
                    required
                    value={formData.ACT_ResponsableId}
                    onChange={e => setFormData({ ...formData, ACT_ResponsableId: e.target.value })}
                    className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-10 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Sélectionnez un responsable...</option>
                    {users
                      .filter(u => u.U_IsActive)
                      .map(user => (
                        <option key={user.U_Id} value={user.U_Id}>
                          {user.U_FirstName} {user.U_LastName} ({user.U_Role})
                        </option>
                      ))}
                  </select>
                  {selectedUser && (
                    <p className="mt-1 text-xs text-gray-500">
                      Email : {selectedUser.U_Email} • Site : {selectedUser.U_SiteId?.S_Name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Échéance de traitement <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="deadline"
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.ACT_Deadline}
                    onChange={e => setFormData({ ...formData, ACT_Deadline: e.target.value })}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  {formData.ACT_Deadline && (
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(formData.ACT_Deadline) > new Date()
                        ? `Délai restant : ${Math.ceil(
                            (new Date(formData.ACT_Deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                          )} jours`
                        : '⚠️ Échéance dans le passé'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 3 : DÉCOMPOSITION */}
          {step === 3 && (
            <div className="space-y-8">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                <h3 className="text-sm font-medium text-gray-900">Récapitulatif de l&apos;action</h3>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-gray-500">Titre</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{formData.ACT_Title}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">PAQ</p>
                    <p className="mt-1 text-sm font-medium text-indigo-700">
                      {selectedPAQ ? `${selectedPAQ.PAQ_Title} (${selectedPAQ.PAQ_Year})` : 'Non défini'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Processus (via PAQ)</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {selectedProcess
                        ? `${selectedProcess.PR_Code} — ${selectedProcess.PR_Libelle}`
                        : 'Non défini'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Responsable</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {selectedUser
                        ? `${selectedUser.U_FirstName} ${selectedUser.U_LastName}`
                        : 'Non défini'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Décomposition en tâches</h3>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        tasks: [...formData.tasks, { titre: '', responsableId: formData.ACT_ResponsableId }],
                      })
                    }
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Ajouter une tâche
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Décomposez l&apos;action en unités de travail exécutables (optionnel mais recommandé pour le suivi)
                </p>

                <div className="mt-6 space-y-4">
                  {formData.tasks.map((task, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5 sm:flex-row sm:items-end"
                    >
                      <div className="flex-1">
                        <label htmlFor={`task-title-${idx}`} className="block text-sm font-medium text-gray-700 mb-1.5">
                          Titre de la tâche
                        </label>
                        <input
                          id={`task-title-${idx}`}
                          type="text"
                          value={task.titre}
                          onChange={e => {
                            const newTasks = [...formData.tasks];
                            newTasks[idx].titre = e.target.value;
                            setFormData({ ...formData, tasks: newTasks });
                          }}
                          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          placeholder="Ex: Mettre à jour la procédure de réception"
                        />
                      </div>

                      <div className="w-full sm:w-64">
                        <label htmlFor={`task-resp-${idx}`} className="block text-sm font-medium text-gray-700 mb-1.5">
                          Responsable
                        </label>
                        <select
                          id={`task-resp-${idx}`}
                          value={task.responsableId}
                          onChange={e => {
                            const newTasks = [...formData.tasks];
                            newTasks[idx].responsableId = e.target.value;
                            setFormData({ ...formData, tasks: newTasks });
                          }}
                          className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="">Responsable par défaut</option>
                          {users
                            .filter(u => u.U_IsActive)
                            .map(user => (
                              <option key={user.U_Id} value={user.U_Id}>
                                {user.U_FirstName} {user.U_LastName}
                              </option>
                            ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            tasks: formData.tasks.filter((_, i) => i !== idx),
                          })
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        aria-label={`Supprimer la tâche ${idx + 1}`}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}

                  {formData.tasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-12">
                      <div className="h-8 w-8 text-gray-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="h-8 w-8"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v12m6-6H6"
                          />
                        </svg>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Aucune tâche définie</p>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            tasks: [{ titre: '', responsableId: formData.ACT_ResponsableId }],
                          })
                        }
                        className="mt-3 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-indigo-600 shadow-sm hover:bg-gray-100"
                      >
                        Ajouter une première tâche
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ACTIONS DE NAVIGATION */}
          <div className="mt-10 flex flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => setStep(prev => Math.max(1, prev - 1))}
              disabled={step === 1}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:hover:bg-white"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Précédent
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(prev => prev + 1)}
                disabled={!canProceed()}
                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:hover:bg-indigo-600"
              >
                Suivant
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !canProceed()}
                className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:hover:bg-emerald-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Save className="mr-1.5 h-4 w-4" />
                    Créer l&apos;action corrective
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}