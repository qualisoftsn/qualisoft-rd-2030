/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 💡 MODULE : CRÉATION ACTION CORRECTIVE (NEW)
 * -------------------------------------------------------------------------
 * RÔLE : Formulaire multi-étapes pour sceller une nouvelle action.
 * FIX : Optimisation du Layout responsive (lg:ml-72), espacements, 
 * renforcement visuel du workflow d'étapes (Stepper).
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 01:51 GMT
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { toast, Toaster } from 'sonner';
import apiClient from '@/core/api/api-client';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Layers, Loader2,
  Save, ShieldCheck, Target
} from 'lucide-react';

import { ActionStatus, Priority, ActionType, ActionOrigin, PAQStatus } from '@/types/elite-sde';
import type { User, PAQ, Processus, Action } from '@/types/elite-sde';

const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

export default function NewActionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [users, setUsers] = useState<User[]>([]);
  const [paqs, setPaqs] = useState<PAQ[]>([]);
  const [processes, setProcesses] = useState<Processus[]>([]);

  const [formData, setFormData] = useState({
    ACT_Title: '', ACT_Description: '', ACT_Priority: Priority.MEDIUM,
    ACT_Origin: ActionOrigin.AUTRE, ACT_Type: ActionType.CORRECTIVE,
    ACT_ResponsableId: '', ACT_PAQId: '', ACT_Deadline: '',
  });

  const loadRefs = useCallback(async () => {
    try {
      const [resU, resP, resProc] = await Promise.all([
        apiClient.get<User[]>('/users'),
        apiClient.get<PAQ[]>('/paq'),
        apiClient.get<Processus[]>('/processus'),
      ]);
      setUsers(Array.isArray(resU.data) ? resU.data : []);
      setPaqs(Array.isArray(resP.data) ? resP.data : []);
      setProcesses(Array.isArray(resProc.data) ? resProc.data : []);
    } catch (err) {
      toast.error('Échec du chargement des référentiels (Users/PAQ/Processus)');
    }
  }, []);

  useEffect(() => { loadRefs(); }, [loadRefs]);

  const handleSubmit = async () => {
    if (!formData.ACT_Title.trim()) return toast.error('Désignation obligatoire');
    if (!formData.ACT_PAQId) return toast.error('Rattachement PAQ obligatoire');
    if (!formData.ACT_ResponsableId) return toast.error('Responsable obligatoire');
    if (!formData.ACT_Deadline || new Date(formData.ACT_Deadline) <= new Date()) return toast.error('Échéance future requise');

    setLoading(true);
    const tid = toast.loading('Scellage de l\'action...');
    try {
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
        ACT_CreatorId: localStorage.getItem('qualisoft_user_id') || users[0]?.U_Id || '',
      };

      await apiClient.post('/actions', payload);
      toast.success('Action corrective enregistrée avec succès', { id: tid });
      router.push(`/dashboard/continuous-improvement`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Échec de la création', { id: tid });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return formData.ACT_Title.trim().length >= 5;
    if (step === 2) return (formData.ACT_PAQId && formData.ACT_ResponsableId && formData.ACT_Deadline && new Date(formData.ACT_Deadline) > new Date());
    return true;
  };

  const selectedPAQ = useMemo(() => paqs.find(p => p.PAQ_Id === formData.ACT_PAQId), [paqs, formData.ACT_PAQId]);
  const selectedProcess = useMemo(() => {
    if (!selectedPAQ) return null;
    return processes.find(pr => pr.PR_Id === (selectedPAQ.PAQ_ProcessusId as any));
  }, [processes, selectedPAQ]);
  const selectedResponsible = useMemo(() => users.find(u => u.U_Id === formData.ACT_ResponsableId), [users, formData.ACT_ResponsableId]);

  const steps = [
    { id: 1, title: 'Identification', icon: Target },
    { id: 2, title: 'Rattachement', icon: Layers },
    { id: 3, title: 'Validation', icon: CheckCircle2 },
  ];

  return (
    <div className="ml-0 lg:ml-72 bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-10 font-sans pb-24">
      <Toaster position="top-right" richColors />

      <div className="mx-auto max-w-4xl mt-12 lg:mt-0">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-indigo-600 transition-colors bg-white border border-gray-200 px-4 py-2 rounded-xl mb-8 cursor-pointer shadow-sm">
          <ArrowLeft className="h-4 w-4" /> Retour au registre
        </button>

        <div className="mb-12 text-center">
          <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter text-gray-900 italic m-0">
            Nouvelle Action <span className="text-indigo-600">Corrective</span>
          </h1>
          <p className="mt-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 m-0">
            Cycle PDCA • ISO 9001:2015 §10.2
          </p>
        </div>

        {/* STEPPER */}
        <div className="mb-12 relative">
          <div className="absolute top-6 left-0 w-full h-1 bg-gray-200 rounded-full -z-10 hidden sm:block">
            <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }} />
          </div>
          <div className="flex justify-between relative z-10">
            {steps.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-3">
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl border-4 transition-all duration-500', step > s.id ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg' : step === s.id ? 'border-indigo-600 bg-white text-indigo-600 shadow-xl scale-110' : 'border-gray-200 bg-white text-gray-300')}>
                  {step > s.id ? <CheckCircle2 className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                </div>
                <p className={cn('text-[10px] font-black uppercase tracking-widest text-center m-0 hidden sm:block', step >= s.id ? 'text-gray-900' : 'text-gray-400')}>{s.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FORM CONTAINER */}
        <div className="rounded-4xl bg-white shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sm:p-10">
          
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Titre de l&apos;action *</label>
                <input autoFocus value={formData.ACT_Title} onChange={e => setFormData({ ...formData, ACT_Title: e.target.value })} placeholder="Ex: DÉPLOIEMENT DE LA NOUVELLE PROCÉDURE" className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 p-4 text-sm font-bold text-gray-900 focus:border-indigo-500 focus:bg-white outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Analyse / Description</label>
                <textarea rows={4} value={formData.ACT_Description} onChange={e => setFormData({ ...formData, ACT_Description: e.target.value })} placeholder="Détaillez le contexte..." className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 p-4 text-sm font-bold text-gray-900 focus:border-indigo-500 focus:bg-white outline-none transition-all resize-y" />
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Source / Origine</label>
                  <select value={formData.ACT_Origin} onChange={e => setFormData({ ...formData, ACT_Origin: e.target.value as ActionOrigin })} className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 p-4 text-sm font-bold text-gray-900 focus:border-indigo-500 outline-none cursor-pointer">
                    {Object.values(ActionOrigin).map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Type d&apos;action</label>
                  <select value={formData.ACT_Type} onChange={e => setFormData({ ...formData, ACT_Type: e.target.value as ActionType })} className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 p-4 text-sm font-bold text-gray-900 focus:border-indigo-500 outline-none cursor-pointer">
                    {Object.values(ActionType).map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Priorité Stratégique</label>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[Priority.LOW, Priority.MEDIUM, Priority.HIGH, Priority.CRITICAL].map(p => (
                    <button key={p} type="button" onClick={() => setFormData({ ...formData, ACT_Priority: p })} className={cn('flex flex-col items-center rounded-xl border-2 p-4 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer', formData.ACT_Priority === p ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-300')}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="rounded-2xl bg-indigo-50 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-indigo-100">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg"><Layers size={20} /></div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-indigo-900 m-0">Maillage Organisationnel</h3>
                  <p className="mt-1 text-xs font-bold text-indigo-700/70 italic m-0">Liaison obligatoire au Plan d&apos;Actions Qualité (PAQ).</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Plan d&apos;Actions Qualité (PAQ) *</label>
                <select value={formData.ACT_PAQId} onChange={e => setFormData({ ...formData, ACT_PAQId: e.target.value })} className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 p-4 text-sm font-bold text-gray-900 focus:border-indigo-500 outline-none">
                  <option value="">SÉLECTIONNER UN PAQ ACTIF...</option>
                  {paqs.filter(p => p.PAQ_IsActive && p.PAQ_Status !== PAQStatus.ARCHIVE).map(paq => (
                    <option key={paq.PAQ_Id} value={paq.PAQ_Id}>{paq.PAQ_Title.toUpperCase()} ({paq.PAQ_Year})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Responsable *</label>
                  <select value={formData.ACT_ResponsableId} onChange={e => setFormData({ ...formData, ACT_ResponsableId: e.target.value })} className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 p-4 text-sm font-bold text-gray-900 focus:border-indigo-500 outline-none">
                    <option value="">CHOISIR LE PILOTE...</option>
                    {users.filter(u => u.U_IsActive).map(user => (
                      <option key={user.U_Id} value={user.U_Id}>{user.U_FirstName} {user.U_LastName}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Échéance cible *</label>
                  <input type="date" min={new Date().toISOString().split('T')[0]} value={formData.ACT_Deadline} onChange={e => setFormData({ ...formData, ACT_Deadline: e.target.value })} className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 p-4 text-sm font-bold text-gray-900 focus:border-indigo-500 outline-none uppercase" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="rounded-4xl bg-gray-50 p-6 sm:p-8 border border-gray-200">
                <h3 className="text-lg font-black uppercase tracking-widest text-gray-900 mb-6 m-0">Matrice de Validation</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest m-0">Désignation</p>
                    <p className="text-sm font-bold text-gray-900 italic mt-1 m-0">{formData.ACT_Title}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest m-0">Rattachement PAQ</p>
                    <p className="text-sm font-black text-indigo-600 italic uppercase mt-1 m-0">{selectedPAQ?.PAQ_Title}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest m-0">Processus</p>
                    <p className="text-sm font-bold text-gray-900 italic uppercase mt-1 m-0">{selectedProcess?.PR_Libelle || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest m-0">Pilote désigné</p>
                    <p className="text-sm font-bold text-gray-900 italic uppercase mt-1 m-0">{selectedResponsible?.U_FirstName} {selectedResponsible?.U_LastName}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-6 flex items-center gap-4 border border-emerald-100">
                <ShieldCheck className="h-8 w-8 text-emerald-600 shrink-0" />
                <p className="text-xs font-bold text-emerald-800 italic m-0">
                  Conforme. Le payload est sécurisé et prêt à être scellé dans la base de données de l&apos;organisation.
                </p>
              </div>
            </div>
          )}

          {/* CONTROLES */}
          <div className="mt-10 flex flex-col-reverse sm:flex-row justify-between gap-4 pt-8 border-t border-gray-100">
            <button disabled={step === 1} onClick={() => setStep(prev => Math.max(1, prev - 1))} className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 hover:bg-gray-100 disabled:opacity-0 transition-all cursor-pointer border border-transparent hover:border-gray-200">
              <ArrowLeft className="h-4 w-4" /> Précédent
            </button>

            {step < 3 ? (
              <button disabled={!canProceed()} onClick={() => setStep(prev => prev + 1)} className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-200 transition-all cursor-pointer border-none">
                Étape Suivante <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button disabled={loading || !canProceed()} onClick={handleSubmit} className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-700 disabled:opacity-50 shadow-lg shadow-emerald-200 transition-all cursor-pointer border-none">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {loading ? 'SCELLAGE EN COURS...' : 'SCELLER L\'ACTION'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}