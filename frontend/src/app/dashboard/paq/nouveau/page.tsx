/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🚀 MODULE : INITIALISATION PAQ SOUVERAIN — ÉDITION ÉLITE
 * -------------------------------------------------------------------------
 * RÔLE : Définition du cadre d'amélioration (§10.3 ISO 9001).
 * USAGE : Création du container annuel pour les actions correctives.
 * ARCHITECTURE : Multi-Tenant SDE Matrix Isolation.
 * RÉFÉRENTIEL : types/elite-sde.ts
 * -------------------------------------------------------------------------
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  Save, Target, Loader2, FolderTree, UserCheck, X, 
  ShieldCheck, Fingerprint, ChevronRight, Info, AlertCircle 
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { Processus as IProcessus, User as IUser } from '@/types/elite-sde';

export default function NouveauPAQ() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  // --- RÉFÉRENTIELS SDE ---
  const [processus, setProcessus] = useState<IProcessus[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  
  // --- ÉTAT DU FORMULAIRE SCELLÉ ---
  const [form, setForm] = useState({ 
    PAQ_Title: '', 
    PAQ_Year: new Date().getFullYear(), 
    PAQ_Description: '', 
    PAQ_ProcessusId: '', 
    PAQ_QualityManagerId: '' 
  });

  /**
   * 📡 CHARGEMENT DES PRÉREQUIS MATRIX
   * @description Récupère les processus et les pilotes habilités (§5.3).
   */
  const fetchPrerequis = useCallback(async () => {
    try {
      setLoading(true);
      const [resP, resU] = await Promise.all([
        apiClient.get('/processus'),
        apiClient.get('/users')
      ]);
      
      const extract = (res: any) => res.data?.data || res.data || [];
      setProcessus(extract(resP));
      setUsers(extract(resU));
    } catch (e: unknown) {
      toast.error("Rupture de liaison : Référentiels SMI inaccessibles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPrerequis(); }, [fetchPrerequis]);

  /**
   * 📤 SOUMISSION : INITIALISATION DU PLAN (§10.3)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.PAQ_ProcessusId || !form.PAQ_QualityManagerId) {
      return toast.warning("DONNÉES INCOMPLÈTES : TOUS LES SEGMENTS SONT REQUIS.");
    }

    setSubmitting(true);
    const tid = toast.loading("Initialisation du Plan Annuel dans le SDE...");
    
    try {
      await apiClient.post('/paq', form);
      toast.success("PAQ INITIALISÉ AVEC SUCCÈS DANS LE REGISTRE MATRIX.", { id: tid });
      router.push('/dashboard/paq');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "ERREUR CRITIQUE DE SCELLAGE", { id: tid });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="ml-72 flex h-screen flex-col items-center justify-center bg-[#0B0F1A] gap-6">
      <Loader2 className="animate-spin text-blue-500" size={60} strokeWidth={1.5} />
      <p className="text-blue-500 font-black uppercase italic text-[11px] tracking-[0.6em] animate-pulse">
        Chargement Environnement PAQ...
      </p>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-16 ml-72 text-white italic text-left selection:bg-blue-600/30">
      <Toaster position="top-right" richColors />
      
      <div className="w-full max-w-450 mx-auto space-y-16 animate-in slide-in-from-bottom-10 duration-700">
        
        {/* 🔝 HEADER INITIALISATION (§10.3) */}
        <header className="flex flex-col gap-6 border-b-2 border-white/5 pb-12">
          <div className="flex items-center gap-4 text-blue-500 bg-blue-500/5 w-fit px-5 py-2 rounded-full border border-blue-500/10">
            <Fingerprint size={16} className="animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Plan Initiation Protocol Active</span>
          </div>
          <h1 className="text-7xl font-black uppercase italic tracking-tighter mb-4 flex items-center gap-10 leading-none text-white">
            <div className="p-6 bg-blue-600 rounded-[2.5rem] shadow-4xl"><Target size={64} strokeWidth={2.5}/></div> 
            Initialiser un <span className="text-blue-600">PAQ</span>
          </h1>
          <p className="text-slate-500 font-black text-[12px] uppercase tracking-[0.6em] italic ml-32 opacity-60">
            AMÉLIORATION CONTINUE • CYCLE ISO 2026 MATRIX
          </p>
        </header>

        {/* 🏛️ FORMULAIRE DE CRÉATION STRATÉGIQUE */}
        <div className="grid grid-cols-12 gap-16 items-start">
           <form onSubmit={handleSubmit} className="col-span-8 grid grid-cols-2 gap-12 bg-slate-900/40 p-20 rounded-[5rem] border-2 border-white/5 shadow-4xl relative overflow-hidden backdrop-blur-3xl">
            
            {/* Filigrane Matrix */}
            <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none rotate-12"><FolderTree size={300} /></div>

            <div className="col-span-2 space-y-6 relative z-10">
              <label className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-500 ml-8 italic flex items-center gap-3 leading-none">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span> Titre Global du Plan Annuel (§10.3)
              </label>
              <input 
                type="text" 
                placeholder="EX: STRATÉGIE QUALITÉ GROUPE - EXERCICE 2026" 
                className="w-full bg-slate-950 border-4 border-white/5 p-10 rounded-[2.5rem] outline-none focus:border-blue-600 font-black uppercase italic text-xl text-white shadow-inner transition-all placeholder:text-slate-800" 
                onChange={e => setForm({...form, PAQ_Title: e.target.value.toUpperCase()})} 
                required 
              />
            </div>

            <div className="space-y-6 relative z-10">
              <label className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-500 ml-8 italic flex items-center gap-3">
                <FolderTree size={18} className="text-blue-600" /> Processus Pilote
              </label>
              <div className="relative">
                <select 
                  className="w-full bg-slate-950 border-4 border-white/5 p-10 rounded-[2.5rem] outline-none focus:border-blue-600 font-black italic text-[14px] text-white appearance-none cursor-pointer shadow-inner uppercase" 
                  onChange={e => setForm({...form, PAQ_ProcessusId: e.target.value})} 
                  required
                >
                  <option value="">SÉLECTIONNER UN SEGMENT</option>
                  {processus.map((p) => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Libelle}</option>)}
                </select>
                <ChevronRight size={24} className="absolute right-8 top-1/2 -translate-y-1/2 text-blue-600 rotate-90" />
              </div>
            </div>

            <div className="space-y-6 relative z-10">
              <label className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-500 ml-8 italic flex items-center gap-3">
                <UserCheck size={18} className="text-blue-600" /> Quality Manager (§5.3)
              </label>
              <div className="relative">
                <select 
                  className="w-full bg-slate-950 border-4 border-white/5 p-10 rounded-[2.5rem] outline-none focus:border-blue-600 font-black italic text-[14px] text-white appearance-none cursor-pointer shadow-inner uppercase" 
                  onChange={e => setForm({...form, PAQ_QualityManagerId: e.target.value})} 
                  required
                >
                  <option value="">DÉSIGNER LE RESPONSABLE</option>
                  {users.map((u) => <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName} {u.U_LastName}</option>)}
                </select>
                <ChevronRight size={24} className="absolute right-8 top-1/2 -translate-y-1/2 text-blue-600 rotate-90" />
              </div>
            </div>

            <div className="col-span-2 space-y-6 relative z-10">
              <label className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-500 ml-8 italic flex items-center gap-3">
                 Scope et Définition Stratégique
              </label>
              <textarea 
                rows={4}
                placeholder="Décrire les enjeux normatifs majeurs pour cet exercice..."
                className="w-full bg-slate-950 border-4 border-white/5 p-10 rounded-[3rem] outline-none focus:border-blue-600 font-bold italic text-white shadow-inner transition-all resize-none"
                onChange={e => setForm({...form, PAQ_Description: e.target.value})}
              />
            </div>

            {/* ACTIONS DE VALIDATION ÉLITE */}
            <div className="col-span-2 flex gap-12 pt-12 relative z-10">
              <button 
                type="submit" 
                disabled={submitting}
                className="flex-2 bg-blue-600 hover:bg-white hover:text-slate-900 py-10 rounded-[3rem] font-black uppercase italic text-sm tracking-[0.4em] transition-all border-none cursor-pointer shadow-4xl active:scale-95 flex items-center justify-center gap-6"
              >
                {submitting ? <Loader2 className="animate-spin" /> : <ShieldCheck size={28} />}
                Confirmer l&apos;Initialisation du Plan
              </button>
              <button 
                type="button" 
                onClick={() => router.back()} 
                className="flex-1 px-12 py-10 border-4 border-white/5 rounded-[3rem] font-black uppercase italic text-[12px] tracking-[0.4em] hover:bg-white/5 transition-all cursor-pointer text-slate-500"
              >
                Annuler
              </button>
            </div>
          </form>

          {/* ℹ️ PANNEAU D'INFORMATION NORMATIF */}
          <aside className="col-span-4 space-y-12 animate-in fade-in slide-in-from-right duration-1000">
             <div className="bg-blue-600/5 border-2 border-blue-600/10 p-14 rounded-[5rem] shadow-4xl backdrop-blur-md text-left">
                <h3 className="text-2xl font-black uppercase italic text-blue-600 mb-10 flex items-center gap-6">
                  <Info size={32} /> Note de Scellage
                </h3>
                <div className="space-y-8">
                  <p className="text-[14px] font-bold text-slate-300 leading-relaxed uppercase italic opacity-80">
                    L&apos;initialisation d&apos;un PAQ crée un container immuable rattaché à un processus spécifique. 
                    Ce plan servira de réceptacle pour l&apos;ensemble des actions correctives (§10.2) et d&apos;amélioration (§10.3) 
                    détectées durant l&apos;exercice <span className="text-white">2026</span>.
                  </p>
                  <div className="p-6 bg-[#0B0F1A] rounded-3xl border border-white/5 flex items-start gap-4">
                     <AlertCircle className="text-amber-500 shrink-0" size={20} />
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
                        Le Quality Manager désigné recevra les droits de scellage et de clôture pour toutes les actions de ce plan.
                     </p>
                  </div>
                </div>
             </div>
          </aside>
        </div>
      </div>
    </div>
  );
}