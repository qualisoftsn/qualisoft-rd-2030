/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  ArrowLeft, Printer, Save, CheckCircle2, AlertOctagon, 
  Clock, User, Loader2, PlayCircle, Lock, ShieldCheck, 
  Plus, Calendar, 
  FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';

/**
 * 🛠️ MODULE : DOSSIER DÉTAILLÉ DE NON-CONFORMITÉ (NC)
 * -------------------------------------------------------------------------
 * RÔLE : 
 * Cette page permet de piloter le traitement d'un écart spécifique après sa 
 * détection. Elle structure la réponse en trois phases normatives :
 * 1. Diagnostic : Analyse des causes racines (Root Cause Analysis).
 * 2. Correction : Mise en place d'un plan d'actions correctives (CAPA).
 * 3. Clôture : Validation de l'efficacité et archivage du dossier.
 * -------------------------------------------------------------------------
 */

// Importation des types pour la cohérence des objets Quality
import { NonConformite, ActionCorrective } from '@/types/quality';

export default function DetailNonConformitePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  // Déballage des paramètres d'URL (Next.js 15+ pattern)
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  // --- ÉTATS DU DOSSIER ---
  const [nc, setNc] = useState<NonConformite | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [analyse, setAnalyse] = useState('');
  
  // --- ÉTATS POUR LE WORKFLOW DES ACTIONS (CAPA) ---
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionDeadline, setNewActionDeadline] = useState('');

  /**
   * 📡 CHARGEMENT DES DONNÉES DU DOSSIER
   * Récupère l'intégralité de la fiche NC incluant les relations (détecteur, actions).
   */
  const chargerDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<NonConformite>(`/non-conformites/${id}`);
      setNc(res.data);
      // Initialise le champ d'analyse avec les données existantes en base
      setAnalyse(res.data.NC_Diagnostic || '');
    } catch (e) {
      toast.error("Échec de la récupération du dossier NC");
      router.push('/dashboard/non-conformites');
    } finally { 
      setLoading(false); 
    }
  }, [id, router]);

  useEffect(() => { 
    chargerDetails(); 
  }, [chargerDetails]);

  /**
   * 💾 PHASE 01 : ENREGISTREMENT DU DIAGNOSTIC
   * Met à jour le diagnostic (Causes racines) et fait progresser le workflow vers "ANALYSE".
   */
  const sauvegarderAnalyse = async () => {
    if (!analyse.trim()) {
      toast.error("Le diagnostic ne peut pas être vide (Exigence ISO)");
      return;
    }

    setIsSaving(true);
    try {
      await apiClient.patch(`/non-conformites/${id}`, { 
        NC_Diagnostic: analyse, 
        NC_Statut: 'ANALYSE' 
      });
      toast.success("Analyse des causes racines validée");
      chargerDetails(); // Rafraîchissement pour refléter le changement de statut
    } catch {
      toast.error("Erreur lors de la mise à jour du diagnostic");
    } finally { 
      setIsSaving(false); 
    }
  };

  /**
   * ⚡ PHASE 02 : DÉCLENCHEMENT D'UNE ACTION CORRECTIVE
   * Crée une action dans le plan d'amélioration globale en la liant à cette NC.
   */
  const creerAction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/actions', {
        ACT_Title: newActionTitle,
        ACT_Deadline: newActionDeadline,
        ACT_Status: 'OPEN',
        ACT_OriginType: 'NC', // Tag d'origine pour la traçabilité §7.5
        ACT_OriginId: id      // Clé étrangère vers ce dossier NC
      });
      toast.success("Nouvelle Action Corrective indexée");
      setIsActionModalOpen(false);
      setNewActionTitle('');
      setNewActionDeadline('');
      chargerDetails(); // Mise à jour pour afficher l'action dans la liste
    } catch {
      toast.error("Échec du déclenchement de l'action");
    }
  };

  /**
   * 🛡️ PHASE 03 : CLÔTURE DÉFINITIVE DU DOSSIER
   * Verrouille le dossier après vérification de l'efficacité des actions.
   */
  const cloturerNC = async () => {
    // Vérification de sécurité avant verrouillage immuable
    if(!confirm("CONFIRMATION DE CLÔTURE : Cette action verrouille le diagnostic. Avez-vous vérifié l'efficacité des actions correctives ?")) return;
    
    try {
      await apiClient.patch(`/non-conformites/${id}`, { NC_Statut: 'CLOSED' });
      toast.success("Dossier NC officiellement clôturé et scellé");
      chargerDetails();
    } catch { 
      toast.error("Erreur lors du scellage du dossier"); 
    }
  }

  // --- RENDU DE CHARGEMENT SYSTÈME ---
  if (loading || !nc) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A]">
      <Loader2 className="animate-spin text-red-600" size={50} />
      <span className="text-[10px] font-black uppercase text-red-600 mt-6 italic tracking-[0.4em] animate-pulse">
        Accès au coffre NC #{id.slice(0, 8)}...
      </span>
    </div>
  );

  return (
    <div className="px-10 py-10 bg-[#0B0F1A] min-h-screen ml-72 text-white italic font-sans text-left relative selection:bg-red-500/30">
      
      {/* 🔝 HEADER : ACTIONS DE GOUVERNANCE DU DOSSIER */}
      <div className="mb-10 flex justify-between items-center animate-in fade-in slide-in-from-top-4 duration-500">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-all bg-white/5 px-6 py-3 rounded-2xl border border-white/5 cursor-pointer shadow-inner"
        >
          <ArrowLeft size={16} /> Retour Registre
        </button>
        <div className="flex gap-4">
          {nc.NC_Statut !== 'CLOSED' && (
             <button 
              onClick={cloturerNC} 
              className="px-8 py-3 bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 rounded-2xl text-[10px] font-black uppercase flex items-center gap-3 hover:bg-emerald-600 hover:text-white transition-all italic cursor-pointer shadow-lg"
             >
               <ShieldCheck size={16} /> Clôturer le Dossier
             </button>
          )}
          <button 
            onClick={() => window.print()} 
            className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase flex items-center gap-3 hover:bg-white/10 transition-all italic cursor-pointer"
          >
            <Printer size={16} /> Imprimer PV
          </button>
          <button 
            onClick={sauvegarderAnalyse} 
            disabled={isSaving || nc.NC_Statut === 'CLOSED'} 
            className="px-8 py-3 bg-red-600 rounded-2xl text-[10px] font-black uppercase flex items-center gap-3 shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:bg-red-500 transition-all italic cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-none"
          >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Enregistrer l&apos;analyse</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10">
        
        {/* 📋 COLONNE GAUCHE : CONTEXTE DE DÉTECTION (STATIQUE) */}
        <div className="col-span-12 lg:col-span-4 space-y-8 text-left animate-in fade-in slide-in-from-left-4 duration-700">
          <div className="bg-[#151A2D] border border-white/10 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden">
            {/* Décoration Matrix */}
            <div className="absolute -top-10 -right-10 p-10 opacity-[0.03] rotate-12 bg-red-500 rounded-full blur-3xl w-60 h-60 pointer-events-none"></div>
            
            <div className="flex justify-between items-start mb-10">
                <span className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border italic shadow-inner ${
                  nc.NC_Statut === 'CLOSED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-600/10 text-red-500 border-red-500/20 animate-pulse'
                }`}>
                    STATUT : {nc.NC_Statut}
                </span>
                <AlertOctagon size={32} className="text-slate-700" />
            </div>
            
            <h1 className="text-3xl font-black uppercase tracking-tighter leading-tight mb-8 text-white italic">
              {nc?.NC_Libelle}
            </h1>
            
            <div className="space-y-6 pt-10 border-t border-white/5 italic">
              <div className="flex items-center gap-5 text-[11px] font-black text-slate-400">
                  <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center"><Clock size={16} className="text-red-500" /></div>
                  <span className="uppercase tracking-[0.2em]">Ouverture : {new Date(nc?.NC_CreatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-5 text-[11px] font-black text-slate-400">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center"><User size={16} className="text-blue-500" /></div>
                  <span className="uppercase tracking-[0.2em]">Détecteur : {nc?.NC_Detector?.U_FirstName || 'Origine Système'}</span>
              </div>
            </div>

            <div className="mt-12 p-8 bg-black/30 rounded-[2.5rem] border border-white/5 italic shadow-inner relative">
              <div className="absolute top-4 right-6 opacity-10"><FileText size={20} /></div>
              <p className="text-[10px] font-black uppercase text-slate-600 mb-4 tracking-[0.3em] flex items-center gap-2">
                <ArrowLeft size={12} className="rotate-180 text-red-500"/> Constat Factuel Déclaré
              </p>
              <p className="text-[13px] leading-relaxed text-slate-300 italic font-medium">
                {nc?.NC_Description}
              </p>
            </div>
          </div>
        </div>

        {/* ⚙️ COLONNE DROITE : TRAITEMENT & RÉSOLUTION (DYNAMIQUE) */}
        <div className="col-span-12 lg:col-span-8 space-y-10 text-left animate-in fade-in slide-in-from-right-4 duration-1000">
          
          {/* 🔍 ÉTAPE 01 : DIAGNOSTIC & ANALYSE DES CAUSES */}
          <div className="bg-[#151A2D] border border-white/10 rounded-[3.5rem] p-12 shadow-2xl flex flex-col relative group transition-all hover:border-red-500/20">
            <div className="absolute left-0 top-12 w-1.5 h-20 bg-red-600 rounded-r-full shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black uppercase italic flex items-center gap-5 text-slate-200 tracking-tight">
                  <span className="text-red-600 text-5xl opacity-40 leading-none">01.</span> Diagnostic & Causes
              </h2>
              <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest border border-white/10 px-4 py-2 rounded-full">Méthodologie Ishikawa / 5P</div>
            </div>
            <textarea 
                value={analyse} 
                onChange={(e) => setAnalyse(e.target.value)} 
                disabled={nc.NC_Statut === 'CLOSED'}
                placeholder="Rédigez ici l'analyse détaillée des causes racines. Pourquoi cet écart s'est-il produit ?" 
                className="w-full p-10 bg-black/40 border-2 border-white/5 rounded-[3rem] text-[15px] font-medium text-white outline-none focus:border-red-600 min-h-62.5 leading-relaxed italic placeholder-slate-800 transition-all focus:bg-black/60 disabled:opacity-30 shadow-inner resize-none" 
            />
          </div>

          {/* ⚡ ÉTAPE 02 : PLAN D'ACTIONS CORRECTIVES (CAPA) */}
          <div className="bg-[#151A2D] border border-white/10 rounded-[3.5rem] p-12 shadow-2xl text-left relative group transition-all hover:border-blue-500/20">
            <div className="absolute left-0 top-12 w-1.5 h-20 bg-blue-600 rounded-r-full shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
            
            <div className="flex justify-between items-center mb-12">
                <h2 className="text-2xl font-black uppercase italic flex items-center gap-5 text-slate-200 tracking-tight">
                    <span className="text-blue-600 text-5xl opacity-40 leading-none">02.</span> Plan d&apos;Actions Correctives
                </h2>
                <button 
                  onClick={() => setIsActionModalOpen(true)} 
                  disabled={nc.NC_Statut === 'CLOSED'}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-20 px-8 py-4 rounded-3xl text-[10px] font-black uppercase text-white flex items-center gap-3 transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer border-none"
                >
                    <Plus size={18} strokeWidth={3} /> Nouvelle Action
                </button>
            </div>

            <div className="grid gap-6">
              {nc?.NC_Actions && nc.NC_Actions.length > 0 ? nc.NC_Actions.map((action: any) => (
                <div key={action.ACT_Id} className="p-8 bg-black/40 border border-white/5 rounded-[2.5rem] flex items-center justify-between italic hover:border-blue-500/40 transition-all group/item shadow-inner">
                  <div className="flex items-center gap-8">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${action.ACT_Status === 'DONE' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/20' : 'bg-slate-800/50 text-slate-600 border border-white/5'}`}>
                        <PlayCircle size={28} className={action.ACT_Status === 'OPEN' ? 'animate-pulse' : ''} />
                    </div>
                    <div>
                      <p className="text-lg font-black uppercase text-white tracking-tighter leading-none mb-2 group-hover/item:text-blue-400 transition-colors">
                        {action.ACT_Title}
                      </p>
                      <p className="text-[10px] font-black text-slate-500 uppercase italic mt-1 flex items-center gap-3 tracking-[0.2em]">
                        <Calendar size={14} className="text-blue-500"/> ÉCHÉANCE PRÉVISIONNELLE : {new Date(action.ACT_Deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase italic border tracking-widest ${
                    action.ACT_Status === 'DONE' 
                      ? 'bg-emerald-600 text-white border-transparent shadow-lg' 
                      : 'bg-slate-900 text-slate-500 border-white/10'
                  }`}>
                      {action.ACT_Status === 'DONE' ? 'TERMINÉ' : 'EN COURS'}
                  </span>
                </div>
              )) : (
                <div className="py-20 border-2 border-dashed border-white/5 rounded-[3.5rem] text-center flex flex-col items-center justify-center">
                    <ShieldCheck className="text-slate-800 mb-6" size={50} />
                    <p className="text-[11px] text-slate-600 uppercase font-black italic tracking-[0.4em]">
                      Aucune Action Corrective rattachée.
                    </p>
                    <p className="text-[9px] text-slate-700 mt-2 uppercase font-bold italic tracking-widest">Le plan CAPA est requis pour la clôture §10.2.1</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 MODAL DE CRÉATION RAPIDE D'ACTION (SLIDE-IN) */}
      {isActionModalOpen && (
        <div className="fixed inset-0 bg-[#0B0F1A]/95 backdrop-blur-xl z-200 flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-[#151A2D] border border-white/10 rounded-[4rem] p-16 w-full max-w-xl shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500 relative">
                <header className="mb-12 border-b border-white/5 pb-8">
                  <h3 className="text-4xl font-black uppercase italic text-white tracking-tighter leading-none mb-4">Lancer une Action</h3>
                  <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">Cible : Résolution de l&apos;écart NC #{id.slice(0, 8)}</p>
                </header>

                <form onSubmit={creerAction} className="space-y-10">
                    <div className="space-y-4">
                        <label className="text-[11px] font-black uppercase text-slate-500 ml-6 block italic tracking-widest">Désignation de l&apos;action</label>
                        <input 
                          autoFocus 
                          required 
                          value={newActionTitle} 
                          onChange={e => setNewActionTitle(e.target.value.toUpperCase())} 
                          className="w-full bg-black/40 border-2 border-white/10 rounded-2xl p-6 text-[13px] font-black italic text-white outline-none focus:border-blue-600 shadow-inner placeholder:text-slate-800" 
                          placeholder="EX: RÉVISION DE LA PROCÉDURE DE CONTRÔLE RÉCEPTION..." 
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[11px] font-black uppercase text-slate-500 ml-6 block italic tracking-widest">Date limite de réalisation</label>
                        <input 
                          required 
                          type="date" 
                          value={newActionDeadline} 
                          onChange={e => setNewActionDeadline(e.target.value)} 
                          className="w-full bg-black/40 border-2 border-white/10 rounded-2xl p-6 text-[13px] font-black italic text-white outline-none focus:border-blue-600 shadow-inner uppercase cursor-pointer" 
                        />
                    </div>
                    <div className="flex gap-6 pt-10">
                        <button 
                          type="button" 
                          onClick={() => setIsActionModalOpen(false)} 
                          className="flex-1 py-6 bg-white/5 hover:bg-white/10 rounded-3xl text-[11px] font-black uppercase text-slate-500 transition-all cursor-pointer border-none"
                        >
                          Annuler
                        </button>
                        <button 
                          type="submit" 
                          className="flex-2 py-6 bg-blue-600 hover:bg-blue-500 rounded-3xl text-[11px] font-black uppercase text-white shadow-2xl transition-all cursor-pointer border-none group"
                        >
                          Lancer l&apos;Action Corrective
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* 🔐 PIED DE PAGE : TRAÇABILITÉ SMI */}
      <footer className="mt-20 pt-10 border-t border-white/5 flex justify-between items-center opacity-30">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-500">
          Qualisoft Node-SMI 2026 • Dossier Immuable • Sécurité Matrix Validée
        </p>
        <div className="flex gap-6">
           <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
           <div className="w-2 h-2 rounded-full bg-blue-600" />
           <div className="w-2 h-2 rounded-full bg-emerald-600" />
        </div>
      </footer>
    </div>
  );
}