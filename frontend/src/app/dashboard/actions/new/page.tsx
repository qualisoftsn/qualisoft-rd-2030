/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : NewActionPage.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Création de mesures d'amélioration (ISO 9001 §10.2.1).
 * DESIGN : ClickUp Professional High-End.
 * RÉVISION : 04 Mars 2026 | 05:45 GMT
 * -------------------------------------------------------------------------
 */

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  Calendar, Loader2, Save, X, Target, User as UserIcon, 
  Zap, Info, AlertCircle, ChevronLeft 
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { useAuthStore } from '@/store/authStore';

// IMPORTATION STRICTE DU RÉFÉRENTIEL ELITE-SDE
import { 
  Action, ActionStatus, Priority, ActionOrigin, 
  ActionType, User, PAQ, Processus 
} from '@/types/elite-sde';

// 🛡️ Extension locale pour sceller la relation Prisma
interface PAQWithRelation extends PAQ {
  PAQ_Processus?: Processus;
}

export default function NewActionPage() {
  const router = useRouter();
  const { user: currentUser } = useAuthStore() as any;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [paqs, setPaqs] = useState<PAQWithRelation[]>([]);

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

  /**
   * 📡 CHARGEMENT DES RÉFÉRENTIELS MATRIX
   * On s'assure de récupérer les PAQ avec leurs processus liés.
   */
  const loadReferences = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, paqsRes] = await Promise.all([
        apiClient.get<User[]>('/users'),
        apiClient.get<PAQWithRelation[]>('/paq'), // Le backend doit inclure PAQ_Processus
      ]);
      setUsers(usersRes.data || []);
      setPaqs(paqsRes.data || []);
    /// eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error('ERREUR SDE : Échec de synchronisation des référentiels');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReferences();
  }, [loadReferences]);

  /**
   * ⚖️ SOUMISSION ATOMIQUE
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.ACT_Title.trim() || !formData.ACT_PAQId || !formData.ACT_ResponsableId || !formData.ACT_Deadline) {
      toast.error('Veuillez renseigner tous les champs obligatoires (*)');
      return;
    }

    setSubmitting(true);
    const tid = toast.loading("Scellage de l'action dans le registre...");

    try {
      const payload: Partial<Action> = {
        ACT_Title: formData.ACT_Title.trim(),
        ACT_Description: formData.ACT_Description.trim() || undefined,
        ACT_Priority: formData.ACT_Priority,
        ACT_Origin: formData.ACT_Origin,
        ACT_Type: formData.ACT_Type,
        ACT_Status: ActionStatus.A_FAIRE,
        ACT_ResponsableId: formData.ACT_ResponsableId,
        ACT_CreatorId: currentUser?.U_Id, // Utilisation du store souverain
        ACT_PAQId: formData.ACT_PAQId,
        ACT_Deadline: new Date(formData.ACT_Deadline).toISOString(),
        ACT_IsActive: true,
      };

      await apiClient.post<Action>('/actions', payload);
      toast.success('ACTION SCELLÉE : Mesure d\'amélioration enregistrée.', { id: tid });
      router.push('/dashboard/actions');
    /// eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: any) {
      toast.error('ÉCHEC KERNEL : Rupture de la transaction.', { id: tid });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center italic">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" strokeWidth={3} />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Initialisation du Registre CAPA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700">
      <Toaster position="top-right" richColors />

      {/* 🔝 HEADER STRATÉGIQUE */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-4">
          <button 
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Retour au registre
          </button>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
            Nouvelle Action <span className="text-indigo-600 not-italic">CAPA</span>
          </h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Indexation ISO 9001:2015 — Amélioration Continue</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="p-10 space-y-10">
            
            {/* 1. DÉFINITION DE L'ACTION */}
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Titre de l&apos;action *</label>
                <input
                  required
                  type="text"
                  value={formData.ACT_Title}
                  onChange={(e) => setFormData({ ...formData, ACT_Title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all italic"
                  placeholder="Ex: Refonte de la procédure d'accueil client..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Analyse & Description</label>
                <textarea
                  rows={4}
                  value={formData.ACT_Description}
                  onChange={(e) => setFormData({ ...formData, ACT_Description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all italic"
                  placeholder="Causes racines identifiées, méthodologie et résultats attendus..."
                />
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* 2. RÉFÉRENTIEL & PILOTAGE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Plan d&apos;Actions (PAQ) *</label>
                <select
                  required
                  value={formData.ACT_PAQId}
                  onChange={(e) => setFormData({ ...formData, ACT_PAQId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none italic cursor-pointer"
                >
                  <option value="">SÉLECTIONNER LE PLAN CIBLE</option>
                  {paqs
                    .filter((p) => p.PAQ_IsActive && p.PAQ_Status !== 'ARCHIVE')
                    .map((paq) => (
                      <option key={paq.PAQ_Id} value={paq.PAQ_Id}>
                        {paq.PAQ_Title} ({paq.PAQ_Year}) — {paq.PAQ_Processus?.PR_Libelle || "TRANSVERSE"}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Pilote de l&apos;action *</label>
                <select
                  required
                  value={formData.ACT_ResponsableId}
                  onChange={(e) => setFormData({ ...formData, ACT_ResponsableId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none italic cursor-pointer"
                >
                  <option value="">DÉSIGNER UN RESPONSABLE</option>
                  {users
                    .filter((u) => u.U_IsActive)
                    .map((user) => (
                      <option key={user.U_Id} value={user.U_Id}>
                        {user.U_FirstName} {user.U_LastName} — {user.U_Role}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* 3. PARAMÈTRES CRITIQUES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Date d&apos;échéance *</label>
                <div className="relative">
                   <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input
                    required
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.ACT_Deadline}
                    onChange={(e) => setFormData({ ...formData, ACT_Deadline: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all italic"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Niveau de Priorité</label>
                <select
                  value={formData.ACT_Priority}
                  onChange={(e) => setFormData({ ...formData, ACT_Priority: e.target.value as Priority })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none italic cursor-pointer"
                >
                  {Object.values(Priority).map((priority) => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Origine du flux</label>
                <select
                  value={formData.ACT_Origin}
                  onChange={(e) => setFormData({ ...formData, ACT_Origin: e.target.value as ActionOrigin })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none italic cursor-pointer"
                >
                  {Object.values(ActionOrigin).map((origin) => (
                    <option key={origin} value={origin}>{origin.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ℹ️ EXIGENCE ISO */}
        <div className="flex items-start gap-5 p-8 bg-indigo-50/50 border border-indigo-100 rounded-4xl italic">
          <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg">
            <Shield size={18} />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1">Conformité ISO 9001:2015 §10.2.1</h4>
            <p className="text-xs text-indigo-700 font-bold leading-relaxed m-0">
              L&apos;organisation doit évaluer la nécessité d&apos;agir pour éliminer la cause d&apos;une non-conformité. Cette action sera scellée dans le registre SMI avec traçabilité complète.
            </p>
          </div>
        </div>

        {/* ✅ ACTIONS FINALES */}
        <div className="flex justify-end items-center gap-6">
          <button
            type="button"
            onClick={() => router.push('/dashboard/actions')}
            className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors bg-transparent border-none cursor-pointer"
          >
            Annuler l&apos;indexation
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-10 py-5 bg-indigo-600 hover:bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest flex items-center gap-4 shadow-xl shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 border-none cursor-pointer"
          >
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Sceller l&apos;action CAPA
          </button>
        </div>
      </form>
    </div>
  );
}

// Icône locale pour le bloc ISO
function Shield({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}