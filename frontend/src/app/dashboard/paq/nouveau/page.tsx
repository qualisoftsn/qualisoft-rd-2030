/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { Save, Target, Loader2, FolderTree, UserCheck, X } from 'lucide-react';
import { toast } from 'sonner';

/**
 * 🚀 COMPOSANT : INITIALISATION PAQ SOUVERAIN
 * Permet de définir le cadre d'un plan d'amélioration pour l'exercice à venir.
 */

export default function NouveauPAQ() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [processus, setProcessus] = useState([]);
  const [users, setUsers] = useState([]);
  
  // État du formulaire scellé
  const [form, setForm] = useState({ 
    PAQ_Title: '', 
    PAQ_Year: new Date().getFullYear(), 
    PAQ_Description: '', 
    PAQ_ProcessusId: '', 
    PAQ_QualityManagerId: '' 
  });

  /**
   * 📡 CHARGEMENT DES RÉFÉRENTIELS
   * Récupère les processus et les responsables éligibles (§5.3).
   */
  useEffect(() => {
    const fetchPrerequis = async () => {
      try {
        setLoading(true);
        const [resP, resU] = await Promise.all([
          apiClient.get('/processus'),
          apiClient.get('/users')
        ]);
        setProcessus(resP.data);
        setUsers(resU.data);
      } catch (e) {
        toast.error("Erreur de communication : Référentiels SMI inaccessibles");
      } finally {
        setLoading(false);
      }
    };
    fetchPrerequis();
  }, []);

  /**
   * 📤 SOUMISSION : INITIALISATION DU PLAN (§10.3)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.PAQ_ProcessusId || !form.PAQ_QualityManagerId) {
      return toast.warning("Données incomplètes : Tous les champs sont obligatoires.");
    }

    try {
      await apiClient.post('/paq', form);
      toast.success("PAQ Initialisé avec succès pour l'exercice sélectionné.");
      router.push('/dashboard/paq');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur critique : Échec de création");
    }
  };

  if (loading) return (
    <div className="ml-72 flex h-screen items-center justify-center bg-[#0B0F1A] italic font-black text-blue-500 uppercase tracking-widest">
      <Loader2 className="animate-spin mr-4" /> Chargement de l&apos;environnement PAQ...
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-12 ml-72 text-white italic text-left selection:bg-blue-600/30">
      <div className="max-w-4xl mx-auto space-y-16 animate-in slide-in-from-bottom-10 duration-700">
        
        {/* HEADER INITIALISATION */}
        <header className="flex flex-col gap-4">
          <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-4 flex items-center gap-8 leading-none">
            <Target className="text-blue-500 animate-pulse" size={64}/> 
            INITIALISER UN <span className="text-blue-500 underline decoration-[6px] underline-offset-8">PAQ</span>
          </h1>
          <p className="text-slate-500 font-black text-[11px] uppercase tracking-[0.4em] italic ml-24">
            Amélioration Continue • Cycle ISO 2026
          </p>
        </header>

        {/* FORMULAIRE DE CRÉATION STRATÉGIQUE */}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-12 bg-slate-900/40 p-20 rounded-[4.5rem] border border-white/5 shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative overflow-hidden">
          
          {/* Filigrane de fond */}
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><FolderTree size={180} /></div>

          <div className="col-span-2 space-y-4">
            <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 ml-6 italic flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Titre Global du Plan Annuel
            </label>
            <input 
              type="text" 
              placeholder="EX: STRATÉGIE QUALITÉ GROUPE - EXERCICE 2026" 
              className="w-full bg-slate-950 border-2 border-white/5 p-8 rounded-4xl outline-none focus:border-blue-500 font-black uppercase italic text-white shadow-inner transition-all placeholder:text-slate-800" 
              onChange={e => setForm({...form, PAQ_Title: e.target.value.toUpperCase()})} 
              required 
            />
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 ml-6 italic flex items-center gap-2">
              <FolderTree size={14} className="text-blue-500" /> Processus Pilote
            </label>
            <select 
              className="w-full bg-slate-950 border-2 border-white/5 p-8 rounded-4xl outline-none focus:border-blue-500 font-black italic text-white appearance-none cursor-pointer shadow-inner" 
              onChange={e => setForm({...form, PAQ_ProcessusId: e.target.value})} 
              required
            >
              <option value="">SÉLECTIONNER PROCESSUS</option>
              {processus.map((p: any) => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Libelle}</option>)}
            </select>
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 ml-6 italic flex items-center gap-2">
              <UserCheck size={14} className="text-blue-500" /> Quality Manager (§5.3)
            </label>
            <select 
              className="w-full bg-slate-950 border-2 border-white/5 p-8 rounded-4xl outline-none focus:border-blue-500 font-black italic text-white appearance-none cursor-pointer shadow-inner" 
              onChange={e => setForm({...form, PAQ_QualityManagerId: e.target.value})} 
              required
            >
              <option value="">DÉSIGNER RESPONSABLE</option>
              {users.map((u: any) => <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName} {u.U_LastName}</option>)}
            </select>
          </div>

          {/* ACTIONS DE VALIDATION ÉLITE */}
          <div className="col-span-2 flex gap-10 pt-12">
            <button 
              type="submit" 
              className="flex-3 bg-blue-600 hover:bg-white hover:text-slate-900 py-8 rounded-[2.5rem] font-black uppercase italic text-xs tracking-[0.3em] transition-all border-none cursor-pointer shadow-[0_20px_50px_rgba(37,99,235,0.3)] active:scale-95"
            >
              CONFIRMER L&apos;INITIALISATION DU PLAN
            </button>
            <button 
              type="button" 
              onClick={() => router.back()} 
              className="flex-1 px-10 py-8 border-2 border-white/5 rounded-[2.5rem] font-black uppercase italic text-xs tracking-[0.3em] hover:bg-white/5 transition-all cursor-pointer text-slate-500"
            >
              ANNULER
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}