/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { Plus, Edit3, Save, X, Loader2, Target, ShieldCheck, Layers, GitBranch, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

/**
 * 🌐 PAGE : CARTOGRAPHIE SMI (SYSTÈME DE MANAGEMENT INTÉGRÉ)
 * -------------------------------------------------------------------------
 * RÔLE : Gestionnaire central des processus de l'organisation.
 * CONFORMITÉ : ISO 9001:2015 §4.4 (Détermination des processus).
 * DESIGN : Elite Sovereign Infrastructure (Industrial Matrix).
 */

export default function ProcessusPage() {
  // --- ÉTATS DE DONNÉES ---
  const [items, setItems] = useState<any[]>([]); // Liste des processus
  const [collaborateurs, setCollaborateurs] = useState<any[]>([]); // Liste des pilotes potentiels
  const [types, setTypes] = useState<any[]>([]); // Familles de processus (Mngt, Op, Support)
  const [loading, setLoading] = useState(true);
  
  // --- ÉTATS DE GESTION (MODAL/CRUD) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null); // Processus en cours d'édition
  const [formData, setFormData] = useState({ 
    PR_Code: '', 
    PR_Libelle: '', 
    PR_TypeId: '', 
    PR_PiloteId: '' 
  });

  /**
   * 📡 PROTOCOLE DE SYNCHRONISATION MATRIX
   * Récupère l'intégralité des référentiels nécessaires au pilotage.
   */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [resP, resU, resT] = await Promise.all([
        apiClient.get('/processus'),
        apiClient.get('/users'), 
        apiClient.get('/processus-types')
      ]);
      setItems(resP.data);
      setCollaborateurs(resU.data);
      setTypes(resT.data);
    } catch (e) {
      toast.error("Rupture de liaison avec le noyau Matrix");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /**
   * 💾 SCELLAGE DES DONNÉES (SUBMIT)
   * Enregistre ou met à jour un processus dans la cartographie officielle.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selected) {
        // Mise à jour d'un processus existant
        await apiClient.patch(`/processus/${selected.PR_Id}`, formData);
        toast.success("Mutation du processus validée");
      } else {
        // Création d'un nouveau segment de la cartographie
        await apiClient.post('/processus', formData);
        toast.success("Nouveau processus intégré au SMI");
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error("Échec du scellage des données");
    }
  };

  // --- ÉCRAN DE CHARGEMENT ÉLITE ---
  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A]">
      <Loader2 className="animate-spin text-blue-500 mb-6" size={50} />
      <span className="text-blue-500 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">SMI CORE PROTOCOL INITIATING...</span>
    </div>
  );

  return (
    <div className="p-12 bg-[#0B0F1A] min-h-screen ml-72 text-white italic text-left selection:bg-blue-500/30">
      
      {/* 🔝 EN-TÊTE SOUVERAIN */}
      <header className="mb-16 flex justify-between items-end border-b border-white/5 pb-10">
        <div className="space-y-4">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none">
            CARTOGRAPHIE <span className="text-blue-600">SMI</span>
          </h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.5em] italic">
            ISO 9001 §4.4 • GOUVERNANCE OPÉRATIONNELLE & MAÎTRISE
          </p>
        </div>
        <button 
          onClick={() => { setSelected(null); setFormData({ PR_Code: '', PR_Libelle: '', PR_TypeId: '', PR_PiloteId: '' }); setIsModalOpen(true); }} 
          className="bg-blue-600 hover:bg-white hover:text-slate-900 px-10 py-6 rounded-2xl font-black uppercase text-xs transition-all shadow-[0_20px_50px_rgba(37,99,235,0.2)] border-none cursor-pointer flex items-center gap-3 active:scale-95"
        >
          <Plus size={20} /> AJOUTER UN PROCESSUS
        </button>
      </header>

      {/*  */}

      {/* 📊 GRILLE DES PROCESSUS (CARTES HI-TECH) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((pr) => (
          <div key={pr.PR_Id} className="bg-slate-900/40 border border-white/5 p-10 rounded-[3.5rem] group hover:border-blue-500/40 transition-all flex flex-col justify-between min-h-80 shadow-2xl relative overflow-hidden">
            {/* Décoration d'arrière-plan Matrix */}
            <div className="absolute -right-6 -top-6 text-white/5 group-hover:text-blue-500/5 transition-colors pointer-events-none">
                <GitBranch size={160} />
            </div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <span className="px-4 py-1.5 bg-blue-600/10 text-blue-500 border border-blue-600/20 rounded-xl text-[10px] font-black uppercase italic tracking-widest leading-none">
                  {pr.PR_Code}
                </span>
                <button 
                  onClick={() => { setSelected(pr); setFormData({PR_Code: pr.PR_Code, PR_Libelle: pr.PR_Libelle, PR_TypeId: pr.PR_TypeId, PR_PiloteId: pr.PR_PiloteId}); setIsModalOpen(true); }} 
                  className="text-slate-600 hover:text-white bg-transparent border-none cursor-pointer transition-colors"
                >
                  <Edit3 size={18} />
                </button>
              </div>
              
              <h4 className="text-3xl font-black uppercase italic leading-tight tracking-tighter mb-4 group-hover:text-blue-400 transition-colors">
                {pr.PR_Libelle}
              </h4>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-8 italic">
                {pr.PR_Type?.PT_Label || 'FAMILLE NON DÉFINIE'}
              </p>
              
              {/* INDICATEUR DU PILOTE (§5.3) */}
              <div className="flex items-center gap-4 bg-white/2 p-5 rounded-3xl border border-white/5 shadow-inner">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center font-black text-blue-500 text-sm shadow-lg">
                    {pr.PR_Pilote?.U_FirstName?.[0]}{pr.PR_Pilote?.U_LastName?.[0]}
                </div>
                <div className="text-left">
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic mb-1">PILOTE TITULAIRE</p>
                    <p className="text-xs font-black uppercase italic text-slate-200">{pr.PR_Pilote?.U_FirstName} {pr.PR_Pilote?.U_LastName}</p>
                </div>
              </div>
            </div>

            {/* ACTION D'ENTRÉE EN COCKPIT */}
            <Link href={`/dashboard/processus/cockpit/${pr.PR_Id}`} className="mt-8 flex justify-between items-center bg-blue-600 text-white p-7 rounded-2xl font-black uppercase italic text-[10px] tracking-widest hover:bg-white hover:text-slate-900 transition-all no-underline shadow-xl relative z-10 group/btn">
                OUVRIR LE COCKPIT DE PILOTAGE <ArrowUpRight size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
            </Link>
          </div>
        ))}
      </div>

      {/* 📟 MODAL DE CONFIGURATION SOUVERAINE */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-100 animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-[#0F172A] z-110 p-16 animate-in slide-in-from-right duration-500 italic text-left border-l border-white/10 overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-12 border-b border-white/5 pb-8">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter">CONFIG. <span className="text-blue-600">SMI</span></h2>
                <button onClick={() => setIsModalOpen(false)} className="bg-white/5 hover:bg-white/10 p-4 rounded-xl text-slate-500 transition-all border-none cursor-pointer"><X size={24}/></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest italic leading-none">Code ID (Identifiant Radical)</label>
                <input 
                  value={formData.PR_Code} 
                  onChange={e => setFormData({...formData, PR_Code: e.target.value.toUpperCase()})} 
                  placeholder="EX: PR-MAINTENANCE" 
                  className="w-full p-7 bg-slate-900 border border-white/10 rounded-3xl text-sm font-black uppercase italic text-white outline-none focus:border-blue-600 shadow-inner transition-all" 
                  required 
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest italic leading-none">Désignation Officielle</label>
                <input 
                  value={formData.PR_Libelle} 
                  onChange={e => setFormData({...formData, PR_Libelle: e.target.value})} 
                  placeholder="INTITULÉ DU PROCESSUS" 
                  className="w-full p-7 bg-slate-900 border border-white/10 rounded-3xl text-sm font-black uppercase italic text-white outline-none focus:border-blue-600 shadow-inner transition-all" 
                  required 
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest italic leading-none">Typologie ISO 9001</label>
                <select 
                  value={formData.PR_TypeId} 
                  onChange={e => setFormData({...formData, PR_TypeId: e.target.value})} 
                  className="w-full p-7 bg-slate-900 border border-white/10 rounded-3xl text-[11px] font-black uppercase italic text-white outline-none focus:border-blue-600 cursor-pointer shadow-inner appearance-none"
                >
                  <option value="">SÉLECTIONNER UNE FAMILLE</option>
                  {types.map(t => <option key={t.PT_Id} value={t.PT_Id}>{t.PT_Label}</option>)}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest italic leading-none">Responsable du Pilotage (§5.3)</label>
                <select 
                  value={formData.PR_PiloteId} 
                  onChange={e => setFormData({...formData, PR_PiloteId: e.target.value})} 
                  className="w-full p-7 bg-slate-900 border border-white/10 rounded-3xl text-[11px] font-black uppercase italic text-white outline-none focus:border-blue-600 cursor-pointer shadow-inner appearance-none"
                >
                  <option value="">DÉSIGNER LE PILOTE TITULAIRE</option>
                  {collaborateurs.map(u => <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName} {u.U_LastName}</option>)}
                </select>
              </div>

              <button type="submit" className="w-full py-8 bg-blue-600 rounded-4xl font-black uppercase text-[11px] tracking-[0.2em] italic transition-all shadow-2xl border-none cursor-pointer mt-10 hover:bg-white hover:text-slate-900 active:scale-95 shadow-blue-900/40">
                SCELLER DANS LA CARTOGRAPHIE
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}