'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';
import apiClient from '@/core/api/api-client';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Layers,
  Loader2,
  Plus,
  Save,
  Target,
  User as UserIcon,
  X,
} from 'lucide-react';
import type {
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
    ACT_PAQId: '',
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
      // 🔑 PAYLOAD STRICTEMENT CONFORME AU SCHÉMA PRISMA (AUCUN CHAMP INVENTÉ)
      const payload: Partial<Action> = {
        ACT_Title: formData.ACT_Title.trim(),
        ACT_Description: formData.ACT_Description.trim() || undefined,
        ACT_Priority: formData.ACT_Priority,
        ACT_Origin: formData.ACT_Origin,
        ACT_Type: formData.ACT_Type,
        ACT_Status: ActionStatus.A_FAIRE, // ✅ Valeur par défaut conforme
        ACT_IsActive: true, // ✅ Obligatoire selon schéma
        ACT_Deadline: formData.ACT_Deadline ? new Date(formData.ACT_Deadline) : undefined,
        ACT_ResponsableId: formData.ACT_ResponsableId,
        ACT_CreatorId: localStorage.getItem('qualisoft_user_id') || users[0]?.U_Id || '',
        ACT_PAQId: formData.ACT_PAQId,
      };

      const actionRes = await apiClient.post<Action>('/actions', payload);

      // 🔑 TÂCHES DÉTAILLÉES (OPTIONNEL - endpoint séparé)
      if (formData.tasks.length > 0 && formData.tasks[0].titre.trim()) {
        try {
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
        } catch (taskErr) {
          console.warn('[NEW_ACTION] Tâches non créées (endpoint /action-items peut ne pas exister)', taskErr);
          // Ne pas bloquer la création de l'action principale
        }
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
        formData.ACT_PAQId &&
        formData.ACT_ResponsableId &&
        formData.ACT_Deadline &&
        new Date(formData.ACT_Deadline) > new Date()
      );
    return true;
  };

  // 🔑 RELATIONS SÉCURISÉES (null-safe)
  const selectedPAQ = paqs.find(p => p.PAQ_Id === formData.ACT_PAQId);
  const selectedProcess = selectedPAQ?.PAQ_Processus || null;
  const selectedResponsible = users.find(u => u.U_Id === formData.ACT_ResponsableId);
  const storedUser = localStorage.getItem('qualisoft_user');
  const currentUser = storedUser ? (JSON.parse(storedUser) as User) : null;

  // --- ÉTAPES DU WIZARD ---
  const steps = [
    { id: 1, title: 'Identification', icon: Target, description: 'Titre, description et typologie' },
    { id: 2, title: 'Rattachement', icon: Layers, description: 'PAQ, responsable et échéance' },
    { id: 3, title: 'Récapitulatif', icon: CheckCircle2, description: 'Validation avant création' },
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
            Conformément à l'exigence ISO 9001:2015 §10.2 — Actions correctives
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
                  Titre de l'action <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  autoFocus
                  required
                  value={formData.ACT_Title}
                  onChange={e => setFormData({ ...formData, ACT_Title: e.target.value })}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Ex: Correction du processus de réception"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Minimum 5 caractères — décrivez l'objectif principal
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
                  placeholder="Causes racines, contexte et objectifs attendus..."
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Origine de l'action
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
                    <option value={ActionOrigin.SSE}>SST / Environnement</option>
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
                    <option value={ActionType.AMELIORATION}>Opportunité d'amélioration</option>
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

          {/* ÉTAPE 2 : RATTACHEMENT (CORRIGÉ - STRICTEMENT CONFORME) */}
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
                      Toute action corrective doit être rattachée à un Plan d&apos;Actions Qualité (PAQ). Le lien avec le processus s&apos;établit via le PAQ sélectionné.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="paq" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Plan d'actions qualité (PAQ) <span className="text-red-500">*</span>
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
                        {paq.PAQ_Title} ({paq.PAQ_Year}) — Processus: {paq.PAQ_Processus.PR_Code}
                      </option>
                    ))}
                </select>
                {selectedPAQ && (
                  <div className="mt-3 rounded-md bg-gray-50 p-4">
                    <p className="text-sm font-medium text-gray-900">{selectedPAQ.PAQ_Title}</p>
                    {selectedProcess && (
                      <p className="mt-1 text-xs text-gray-600">
                        Processus: <span className="font-medium text-indigo-700">{selectedProcess.PR_Code} — {selectedProcess.PR_Libelle}</span>
                      </p>
                    )}
                    {selectedPAQ.PAQ_QualityManager && (
                      <p className="mt-1 text-xs text-gray-600">
                        Pilote PAQ: {selectedPAQ.PAQ_QualityManager.U_FirstName} {selectedPAQ.PAQ_QualityManager.U_LastName}
                      </p>
                    )}
                  </div>
                )}
                <p className="mt-2 text-xs text-amber-700 bg-amber-50 p-2 rounded-lg">
                  ⚠️ Une action ne se rattache pas directement à un processus. Le lien s&apos;établit via le PAQ sélectionné (conformément au schéma Prisma).
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
                  {selectedResponsible && (
                    <p className="mt-1 text-xs text-gray-500">
                      Email : {selectedResponsible.U_Email}
                      {selectedResponsible.U_SiteId && ` • Site ID: ${selectedResponsible.U_SiteId}`}
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

          {/* ÉTAPE 3 : RÉCAPITULATIF (SANS DÉCOMPOSITION - CONFORME SCHÉMA) */}
          {step === 3 && (
            <div className="space-y-8">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Récapitulatif de l&apos;action</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                      {selectedProcess ? `${selectedProcess.PR_Code} — ${selectedProcess.PR_Libelle}` : 'Non défini'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Responsable</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {selectedResponsible
                        ? `${selectedResponsible.U_FirstName} ${selectedResponsible.U_LastName}`
                        : 'Non défini'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Créateur</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {currentUser
                        ? `${currentUser.U_FirstName} ${currentUser.U_LastName}`
                        : 'Utilisateur système'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Échéance</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {formData.ACT_Deadline
                        ? new Date(formData.ACT_Deadline).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Non définie'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-amber-50 p-5 border border-amber-200">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-600">
                    <span className="text-xs font-bold text-white">!</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-amber-900">Fonctionnalité en préparation</h3>
                    <p className="mt-1 text-sm text-amber-800">
                      La décomposition en tâches détaillées (WBS) sera disponible dans la version 2.1 de Qualisoft Elite. 
                      Cette action sera créée avec un statut initial &quot;À faire&quot; et pourra être détaillée ultérieurement.
                    </p>
                  </div>
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