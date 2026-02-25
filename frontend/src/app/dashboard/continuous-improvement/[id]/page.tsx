/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
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
  ShieldCheck,
  Target,
  X,
} from 'lucide-react';

// 🔑 IMPORTS ENUMS (VALEURS)
import {
  ActionStatus,
  Priority,
  ActionType,
  ActionOrigin,
  PAQStatus,
} from '@/types/elite-sde';

// 🔑 IMPORTS INTERFACES
import type {
  User,
  PAQ,
  Processus,
  Action,
} from '@/types/elite-sde';

// --- UTILITAIRE CN ---
const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(' ');

export default function NewActionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // États pour les référentiels
  const [users, setUsers] = useState<User[]>([]);
  const [paqs, setPaqs] = useState<PAQ[]>([]);
  const [processes, setProcesses] = useState<Processus[]>([]);

  // État du formulaire
  const [formData, setFormData] = useState({
    ACT_Title: '',
    ACT_Description: '',
    ACT_Priority: Priority.MEDIUM,
    ACT_Origin: ActionOrigin.AUTRE,
    ACT_Type: ActionType.CORRECTIVE,
    ACT_ResponsableId: '',
    ACT_PAQId: '',
    ACT_Deadline: '',
  });

  // --- 🛰️ CHARGEMENT DES RÉFÉRENTIELS ---
  const loadRefs = useCallback(async () => {
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
      toast.error('Échec du chargement des référentiels Matrix');
    }
  }, []);

  useEffect(() => {
    loadRefs();
  }, [loadRefs]);

  // --- 🛠️ LOGIQUE CRUD : SOUMISSION ---
  const handleSubmit = async () => {
    // Validation stricte ISO 9001
    if (!formData.ACT_Title.trim()) {
      toast.error('Désignation de l\'action obligatoire');
      return;
    }
    if (!formData.ACT_PAQId) {
      toast.error('RATTACHEMENT AU PAQ OBLIGATOIRE (§10.2)');
      return;
    }
    if (!formData.ACT_ResponsableId) {
      toast.error('RESPONSABLE DE L\'ACTION OBLIGATOIRE');
      return;
    }
    if (!formData.ACT_Deadline || new Date(formData.ACT_Deadline) <= new Date()) {
      toast.error('ÉCHÉANCE VALIDE OBLIGATOIRE (Date future)');
      return;
    }

    setLoading(true);
    try {
      // 🛡️ PAYLOAD SCELLÉ SUR LE SCHÉMA PRISMA
      const payload: Partial<Action> = {
        ACT_Title: formData.ACT_Title.trim(),
        ACT_Description: formData.ACT_Description.trim() || undefined,
        ACT_Priority: formData.ACT_Priority,
        ACT_Origin: formData.ACT_Origin,
        ACT_Type: formData.ACT_Type,
        ACT_Status: ActionStatus.A_FAIRE,
        ACT_IsActive: true,
        ACT_Deadline: new Date(formData.ACT_Deadline),
        ACT_ResponsableId: formData.ACT_ResponsableId,
        ACT_PAQId: formData.ACT_PAQId,
        // Récupération dynamique du créateur (Tenant Identity)
        ACT_CreatorId: localStorage.getItem('qualisoft_user_id') || users[0]?.U_Id || '',
      };

      const actionRes = await apiClient.post<Action>('/actions', payload);

      toast.success('MUTATION RÉUSSIE : Action corrective enregistrée');
      router.push(`/dashboard/continuous-improvement`);
      router.refresh();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Échec du scellage de l\'action';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  // --- ✅ VALIDATION NAVIGATION ---
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

  // --- 🔍 RELATIONS MÉMORISÉES ---
  const selectedPAQ = useMemo(() => paqs.find(p => p.PAQ_Id === formData.ACT_PAQId), [paqs, formData.ACT_PAQId]);
  
  const selectedProcess = useMemo(() => {
    if (!selectedPAQ) return null;
    return processes.find(pr => pr.PR_Id === (selectedPAQ.PAQ_ProcessusId as any));
  }, [processes, selectedPAQ]);

  const selectedResponsible = useMemo(() => users.find(u => u.U_Id === formData.ACT_ResponsableId), [users, formData.ACT_ResponsableId]);

  const steps = [
    { id: 1, title: 'Identification', icon: Target, description: 'Titre, description et typologie' },
    { id: 2, title: 'Rattachement', icon: Layers, description: 'PAQ, responsable et échéance' },
    { id: 3, title: 'Récapitulatif', icon: CheckCircle2, description: 'Validation avant création' },
  ];

  return (
    <div className="ml-72 bg-gray-50 min-h-screen p-6 italic font-sans">
      <Toaster position="top-right" richColors theme="dark" />

      <div className="mx-auto max-w-4xl">
        {/* BREADCRUMB */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Retour au registre
          </button>
        </div>

        {/* HEADER */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900 italic">
            Nouvelle Action <span className="text-indigo-600">Corrective</span>
          </h1>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
            Exigence ISO 9001:2015 §10.2 • Matrix SDE
          </p>
        </div>

        {/* PROGRESS INDICATOR */}
        <div className="mb-12">
          <div className="flex justify-between">
            {steps.map((s, index) => (
              <div key={s.id} className="flex flex-1 flex-col items-center">
                <div className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-2xl border-2 transition-all duration-500',
                    step > s.id ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 
                    step === s.id ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 
                    'border-gray-200 bg-white text-gray-400'
                  )}>
                  {step > s.id ? <CheckCircle2 className="h-6 w-6" /> : <span className="text-lg font-black">{s.id}</span>}
                </div>
                <div className="mt-4 text-center">
                  <p className={cn('text-[10px] font-black uppercase tracking-widest', step >= s.id ? 'text-gray-900' : 'text-gray-400')}>{s.title}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn('mt-6 h-0.5 w-full', step > s.id ? 'bg-emerald-500' : 'bg-gray-200')} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* FORMULAIRE CONTAINER */}
        <div className="rounded-3xl bg-white shadow-xl shadow-gray-200/50 border border-gray-100 p-10">
          
          {/* ÉTAPE 1 : IDENTIFICATION */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Titre de l&apos;action *</label>
                <input
                  autoFocus
                  value={formData.ACT_Title}
                  onChange={e => setFormData({ ...formData, ACT_Title: e.target.value })}
                  placeholder="Ex: OPTIMISATION DU PROCESSUS DE RÉCEPTION"
                  className="w-full rounded-2xl border-gray-200 bg-gray-50 p-4 text-sm font-bold text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Analyse des causes & Description</label>
                <textarea
                  rows={4}
                  value={formData.ACT_Description}
                  onChange={e => setFormData({ ...formData, ACT_Description: e.target.value })}
                  placeholder="Décrivez ici le contexte et les causes identifiées..."
                  className="w-full rounded-2xl border-gray-200 bg-gray-50 p-4 text-sm font-bold text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Origine Matrix</label>
                  <select
                    value={formData.ACT_Origin}
                    onChange={e => setFormData({ ...formData, ACT_Origin: e.target.value as ActionOrigin })}
                    className="w-full rounded-2xl border-gray-200 bg-gray-50 p-4 text-sm font-bold text-gray-900 focus:border-indigo-500 outline-none cursor-pointer appearance-none"
                  >
                    {Object.values(ActionOrigin).map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Typologie</label>
                  <select
                    value={formData.ACT_Type}
                    onChange={e => setFormData({ ...formData, ACT_Type: e.target.value as ActionType })}
                    className="w-full rounded-2xl border-gray-200 bg-gray-50 p-4 text-sm font-bold text-gray-900 focus:border-indigo-500 outline-none cursor-pointer appearance-none"
                  >
                    {Object.values(ActionType).map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Priorité Stratégique</label>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[Priority.LOW, Priority.MEDIUM, Priority.HIGH, Priority.CRITICAL].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, ACT_Priority: p })}
                      className={cn(
                        'flex flex-col items-center rounded-2xl border-2 p-4 text-[10px] font-black uppercase tracking-widest transition-all',
                        formData.ACT_Priority === p ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg' : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-indigo-200'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 2 : RATTACHEMENT */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="rounded-3xl bg-indigo-50 p-6 flex items-start gap-4 border border-indigo-100">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-black text-white italic">§</div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-indigo-900">Maillage Organisationnel §10.2</h3>
                  <p className="mt-1 text-xs font-bold text-indigo-700/60 leading-relaxed italic">
                    Toute action corrective doit être rattachée à un PAQ. Le lien avec le processus est automatique selon le schéma Prisma.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Plan d&apos;Actions Qualité (PAQ) *</label>
                <select
                  value={formData.ACT_PAQId}
                  onChange={e => setFormData({ ...formData, ACT_PAQId: e.target.value })}
                  className="w-full rounded-2xl border-gray-200 bg-gray-50 p-4 text-sm font-bold text-gray-900 focus:border-indigo-500 outline-none"
                >
                  <option value="">SÉLECTIONNER UN PAQ ACTIF...</option>
                  {paqs.filter(p => p.PAQ_IsActive && p.PAQ_Status !== PAQStatus.ARCHIVE).map(paq => (
                    <option key={paq.PAQ_Id} value={paq.PAQ_Id}>
                      {paq.PAQ_Title.toUpperCase()} ({paq.PAQ_Year})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Responsable désigné *</label>
                  <select
                    value={formData.ACT_ResponsableId}
                    onChange={e => setFormData({ ...formData, ACT_ResponsableId: e.target.value })}
                    className="w-full rounded-2xl border-gray-200 bg-gray-50 p-4 text-sm font-bold text-gray-900 focus:border-indigo-500 outline-none"
                  >
                    <option value="">CHOISIR DANS L&apos;ANNUAIRE...</option>
                    {users.filter(u => u.U_IsActive).map(user => (
                      <option key={user.U_Id} value={user.U_Id}>{user.U_FirstName} {user.U_LastName}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Échéance de traitement *</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.ACT_Deadline}
                    onChange={e => setFormData({ ...formData, ACT_Deadline: e.target.value })}
                    className="w-full rounded-2xl border-gray-200 bg-gray-50 p-4 text-sm font-bold text-gray-900 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 3 : RÉCAPITULATIF */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="rounded-[2.5rem] bg-gray-50 p-8 border border-gray-100">
                <h3 className="text-xl font-black uppercase tracking-tighter text-gray-900 mb-6">Matrice de Validation</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest leading-none">Désignation</p>
                    <p className="text-sm font-bold text-gray-900 italic uppercase">{formData.ACT_Title}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest leading-none">Rattachement PAQ</p>
                    <p className="text-sm font-bold text-indigo-600 italic uppercase">{selectedPAQ?.PAQ_Title}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest leading-none">Processus impacté</p>
                    <p className="text-sm font-bold text-gray-900 italic uppercase">{selectedProcess?.PR_Libelle || 'KERNEL SYSTEM'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest leading-none">Pilote responsable</p>
                    <p className="text-sm font-bold text-gray-900 italic uppercase">{selectedResponsible?.U_FirstName} {selectedResponsible?.U_LastName}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-amber-50 p-6 flex items-start gap-4 border border-amber-100">
                <ShieldCheck className="h-6 w-6 text-amber-600 shrink-0" />
                <p className="text-xs font-bold text-amber-800 leading-relaxed italic">
                  Prêt pour le scellage. Le payload respecte strictement le modèle Prisma <code>Action</code>.
                </p>
              </div>
            </div>
          )}

          {/* NAVIGATION CONTROLS */}
          <div className="mt-12 flex justify-between gap-4">
            <button
              disabled={step === 1}
              onClick={() => setStep(prev => Math.max(1, prev - 1))}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-all italic"
            >
              <ArrowLeft className="h-4 w-4" /> Précédent
            </button>

            {step < 3 ? (
              <button
                disabled={!canProceed()}
                onClick={() => setStep(prev => prev + 1)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-100 transition-all italic"
              >
                Suivant <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                disabled={loading || !canProceed()}
                onClick={handleSubmit}
                className="flex items-center gap-2 bg-emerald-600 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-700 disabled:opacity-50 shadow-lg shadow-emerald-100 transition-all italic"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {loading ? 'SCELLAGE...' : 'SCÉLLER L\'ACTION'}
              </button>
            )}
          </div>
        </div>
      </div>
      

[Image of the PDCA continuous improvement cycle]

    </div>
  );
}