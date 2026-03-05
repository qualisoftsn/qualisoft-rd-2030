/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : CRÉATION D'ACTION CAPA (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Enregistrement de mesures d'amélioration (ISO 9001 §10.2.1).
 * FIX : UI ClickUp (100dvh, Zéro Scroll Global), PWA Ready (retrait ml-72).
 * SÉCURITÉ : Dark Mode Matrix, Typage strict, Zéro NextAuth.
 * RÉVISION : 05 Mars 2026 | 00:00 GMT
 * -------------------------------------------------------------------------
 */

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  Calendar, Loader2, Save, X, Target, User as UserIcon, 
  Zap, Info, AlertCircle, ChevronLeft, ShieldCheck 
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { useAuthStore } from '@/store/authStore';

import { 
  Action, ActionStatus, Priority, ActionOrigin, 
  ActionType, User, PAQ, Processus 
} from '@/types/elite-sde';

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

  const loadReferences = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, paqsRes] = await Promise.all([
        apiClient.get<User[]>('/users'),
        apiClient.get<PAQWithRelation[]>('/paq'),
      ]);
      setUsers(usersRes.data || []);
      setPaqs(paqsRes.data || []);
    } catch (err) {
      toast.error('ERREUR SDE : Échec de synchronisation des référentiels');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReferences();
  }, [loadReferences]);

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
        ACT_CreatorId: currentUser?.U_Id,
        ACT_PAQId: formData.ACT_PAQId,
        ACT_Deadline: new Date(formData.ACT_Deadline).toISOString(),
        ACT_IsActive: true,
      };

      await apiClient.post<Action>('/actions', payload);
      toast.success('ACTION SCELLÉE : Mesure d\'amélioration enregistrée.', { id: tid });
      router.push('/dashboard/actions');
    } catch (err: any) {
      toast.error('ÉCHEC KERNEL : Rupture de la transaction.', { id: tid });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center italic bg-[#0F172A] text-white">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" strokeWidth={3} />
        <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-blue-500 animate-pulse m-0">Initialisation du Registre CAPA...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0F172A] italic font-sans overflow-hidden selection:bg-blue-600/30 text-white w-full">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER FIXE STRATÉGIQUE */}
      <header className="shrink-0 p-6 md:p-8 lg:px-12 border-b border-white/5 bg-[#0F172A]/90 backdrop-blur-md z-20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 animate-in fade-in slide-in-from-left-4 duration-500">
          <button 
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 m-0"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Retour au registre
          </button>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic leading-none m-0">
            Nouvelle Action <span className="text-blue-500">CAPA</span>
          </h1>
          <p className="text-slate-500 font-bold text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-widest m-0">
            Indexation ISO 9001:2015 — Amélioration Continue
          </p>
        </div>
        
        {/* ACTIONS FINALES (Fixées en haut pour accès rapide) */}
        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
          <button
            type="button"
            onClick={() => router.push('/dashboard/actions')}
            className="hidden md:block text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors bg-transparent border-none cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full md:w-auto px-6 md:px-8 py-4 md:py-4 bg-blue-600 hover:bg-white hover:text-slate-900 text-white rounded-2xl md:rounded-3xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50 border-none cursor-pointer"
          >
            {submitting ? <Loader2 className="animate-spin shrink-0" size={18} /> : <Save size={18} className="shrink-0" />}
            Sceller l&apos;action
          </button>
        </div>
      </header>

      {/* 📜 FORMULAIRE DÉFILANT */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 lg:p-12">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in zoom-in-95 duration-700">
          
          <div className="bg-[#0B0F1A]/80 backdrop-blur-sm rounded-4xl md:rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden">
            <div className="p-6 md:p-10 space-y-8 md:space-y-10">
              
              {/* 1. DÉFINITION DE L'ACTION */}
              <div className="space-y-6">
                <div>
                  <label className="block text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Titre de l&apos;action *</label>
                  <input
                    required type="text" value={formData.ACT_Title}
                    onChange={(e) => setFormData({ ...formData, ACT_Title: e.target.value })}
                    className="w-full bg-[#0F172A] border border-white/5 rounded-2xl md:rounded-3xl py-4 md:py-5 px-6 text-xs md:text-sm font-bold text-white outline-none focus:border-blue-500 transition-colors italic shadow-inner placeholder:text-slate-600"
                    placeholder="Ex: Refonte de la procédure d'accueil client..."
                  />
                </div>

                <div>
                  <label className="block text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Analyse & Description</label>
                  <textarea
                    rows={4} value={formData.ACT_Description}
                    onChange={(e) => setFormData({ ...formData, ACT_Description: e.target.value })}
                    className="w-full bg-[#0F172A] border border-white/5 rounded-2xl md:rounded-3xl py-4 md:py-5 px-6 text-xs md:text-sm font-bold text-white outline-none focus:border-blue-500 transition-colors italic shadow-inner placeholder:text-slate-600 custom-scrollbar"
                    placeholder="Causes racines identifiées, méthodologie et résultats attendus..."
                  />
                </div>
              </div>

              <div className="h-px bg-white/5" />

              {/* 2. RÉFÉRENTIEL & PILOTAGE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div>
                  <label className="block text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Plan d&apos;Actions (PAQ) *</label>
                  <select
                    required value={formData.ACT_PAQId}
                    onChange={(e) => setFormData({ ...formData, ACT_PAQId: e.target.value })}
                    className="w-full bg-[#0F172A] border border-white/5 rounded-2xl md:rounded-3xl py-4 md:py-5 px-6 text-[10px] md:text-xs font-bold text-white outline-none focus:border-blue-500 transition-colors appearance-none italic cursor-pointer shadow-inner uppercase"
                  >
                    <option value="" disabled className="text-slate-500">SÉLECTIONNER LE PLAN CIBLE</option>
                    {paqs.filter((p) => p.PAQ_IsActive && p.PAQ_Status !== 'ARCHIVE').map((paq) => (
                      <option key={paq.PAQ_Id} value={paq.PAQ_Id} className="bg-[#0B0F1A]">
                        {paq.PAQ_Title} ({paq.PAQ_Year}) — {paq.PAQ_Processus?.PR_Libelle || "TRANSVERSE"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Pilote de l&apos;action *</label>
                  <select
                    required value={formData.ACT_ResponsableId}
                    onChange={(e) => setFormData({ ...formData, ACT_ResponsableId: e.target.value })}
                    className="w-full bg-[#0F172A] border border-white/5 rounded-2xl md:rounded-3xl py-4 md:py-5 px-6 text-[10px] md:text-xs font-bold text-white outline-none focus:border-blue-500 transition-colors appearance-none italic cursor-pointer shadow-inner uppercase"
                  >
                    <option value="" disabled className="text-slate-500">DÉSIGNER UN RESPONSABLE</option>
                    {users.filter((u) => u.U_IsActive).map((user) => (
                      <option key={user.U_Id} value={user.U_Id} className="bg-[#0B0F1A]">
                        {user.U_FirstName} {user.U_LastName} — {user.U_Role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. PARAMÈTRES CRITIQUES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                <div>
                  <label className="block text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Échéance *</label>
                  <div className="relative">
                     <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                     <input
                      required type="date" min={new Date().toISOString().split('T')[0]}
                      value={formData.ACT_Deadline}
                      onChange={(e) => setFormData({ ...formData, ACT_Deadline: e.target.value })}
                      className="w-full bg-[#0F172A] border border-white/5 rounded-2xl md:rounded-3xl py-4 md:py-5 pl-12 pr-6 text-xs md:text-sm font-bold text-white outline-none focus:border-blue-500 transition-colors italic shadow-inner"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Priorité</label>
                  <select
                    value={formData.ACT_Priority}
                    onChange={(e) => setFormData({ ...formData, ACT_Priority: e.target.value as Priority })}
                    className="w-full bg-[#0F172A] border border-white/5 rounded-2xl md:rounded-3xl py-4 md:py-5 px-6 text-[10px] md:text-xs font-bold text-white outline-none focus:border-blue-500 transition-colors appearance-none italic cursor-pointer shadow-inner uppercase"
                  >
                    {Object.values(Priority).map((priority) => (
                      <option key={priority} value={priority} className="bg-[#0B0F1A]">{priority}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 md:col-span-1">
                  <label className="block text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Origine</label>
                  <select
                    value={formData.ACT_Origin}
                    onChange={(e) => setFormData({ ...formData, ACT_Origin: e.target.value as ActionOrigin })}
                    className="w-full bg-[#0F172A] border border-white/5 rounded-2xl md:rounded-3xl py-4 md:py-5 px-6 text-[10px] md:text-xs font-bold text-white outline-none focus:border-blue-500 transition-colors appearance-none italic cursor-pointer shadow-inner uppercase"
                  >
                    {Object.values(ActionOrigin).map((origin) => (
                      <option key={origin} value={origin} className="bg-[#0B0F1A]">{origin.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ℹ️ EXIGENCE ISO */}
          <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6 p-6 md:p-8 bg-blue-900/10 border border-blue-500/20 rounded-4xl md:rounded-[2.5rem] italic shadow-inner">
            <div className="p-3 md:p-4 bg-blue-500/20 text-blue-500 rounded-xl md:rounded-2xl border border-blue-500/30 shrink-0">
              <ShieldCheck size={24} className="md:w-7 md:h-7" />
            </div>
            <div>
              <h4 className="text-[9px] md:text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 m-0">Conformité ISO 9001:2015 §10.2.1</h4>
              <p className="text-xs md:text-sm text-slate-400 font-bold leading-relaxed m-0">
                L&apos;organisation doit évaluer la nécessité d&apos;agir pour éliminer la cause d&apos;une non-conformité. Cette action sera scellée cryptographiquement dans le registre SMI pour garantir la traçabilité des audits.
              </p>
            </div>
          </div>

        </form>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37,99,235,0.5); }
      `}} />
    </div>
  );
}