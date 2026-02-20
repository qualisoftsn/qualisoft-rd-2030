/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import apiClient from '@/core/api/api-client';
import { 
  AlertOctagon, Plus, Zap, Clock, FileText, 
  MessageSquare, ClipboardCheck, ShieldAlert, Truck, Loader2,
  ChevronRight, Filter, Search, MoreHorizontal
} from 'lucide-react';
import { toast } from 'react-hot-toast';

/**
 * 🛠️ MODULE : GESTION DES NON-CONFORMITÉS (NC)
 * -------------------------------------------------------------------------
 * RÔLE : 
 * Centralise tous les écarts détectés (internes, externes, fournisseurs).
 * Ce registre est l'outil principal de pilotage de l'amélioration continue.
 * * FONCTIONNALITÉS :
 * 1. Visualisation du registre global (Workflow status).
 * 2. Déclaration rapide (Slide-over) avec liaison processus (§4.4).
 * 3. Filtrage sémantique des sources de détection.
 * -------------------------------------------------------------------------
 */

// Types partagés pour assurer l'intégrité des données
import { NonConformite, NCSource } from '@/types/quality';

// --- CONFIGURATION VISUELLE DES SOURCES (NORME SMQ) ---
const SOURCE_UI: Record<string, { label: string, icon: React.ReactNode, color: string, bg: string, border: string }> = {
  CLIENT_COMPLAINT: { label: "Réclamation Client", icon: <MessageSquare size={14}/>, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  INTERNAL_AUDIT: { label: "Audit Interne", icon: <ClipboardCheck size={14}/>, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  EXTERNAL_AUDIT: { label: "Audit Externe", icon: <ShieldAlert size={14}/>, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  SUPPLIER: { label: "Fournisseur", icon: <Truck size={14}/>, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  INCIDENT_SAFETY: { label: "Incident SST", icon: <AlertOctagon size={14}/>, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
};

export default function NonConformitesGlobalPage() {
  // --- ÉTATS DU REGISTRE ---
  const [ncs, setNcs] = useState<NonConformite[]>([]); 
  const [processes, setProcesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  
  // --- ÉTAT DU FORMULAIRE DE DÉCLARATION (§10.2.1) ---
  const [formData, setFormData] = useState({ 
    NC_Libelle: '', 
    NC_Description: '', 
    NC_Source: 'INTERNAL_AUDIT' as NCSource, 
    NC_ProcessusId: '', 
    NC_DetectorId: '' 
  });

  /**
   * 📡 SYNCHRONISATION DES DONNÉES
   * Récupère simultanément le registre NC et la liste des processus pour le mapping.
   */
  const charger = useCallback(async () => {
    try {
      setLoading(true);
      const [ncRes, prRes] = await Promise.all([
        apiClient.get('/non-conformites'), 
        apiClient.get('/processus')
      ]);
      setNcs(ncRes.data);
      setProcesses(prRes.data);

      // Récupération de l'identité du déclarant via le store persistant
      const storageUser = localStorage.getItem('qualisoft-auth-storage');
      if (storageUser) {
          const parsed = JSON.parse(storageUser);
          const userId = parsed.state?.user?.U_Id || parsed.state?.user?.id;
          if (userId) setFormData(prev => ({ ...prev, NC_DetectorId: userId }));
      }
    } catch (e) {
      console.error("NC_LOAD_ERROR", e);
      toast.error("Échec de synchronisation du registre NC");
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { 
    charger(); 
  }, [charger]);

  /**
   * 💾 ACTION : ENREGISTREMENT D'UN NOUVEL ÉCART
   * Valide les champs obligatoires avant diffusion au Responsable Qualité.
   */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation stricte ISO : Une NC doit toujours être rattachée à un processus (§4.4)
    if (!formData.NC_ProcessusId) {
      return toast.error("Attribution processus obligatoire (Exigence ISO §4.4)");
    }
    
    try {
      await apiClient.post('/non-conformites', {
        ...formData,
        NC_Statut: 'OPEN' // Initialisation du cycle de vie
      });
      
      toast.success("Écart enregistré dans le système");
      setIsSlideOverOpen(false);
      charger(); // Refresh du registre
      
      // Reset du tampon de saisie
      setFormData(prev => ({ ...prev, NC_Libelle: '', NC_Description: '' }));
    } catch (err) { 
      toast.error("Erreur système lors de l'enregistrement de la NC"); 
    }
  };

  // --- RENDU : CHARGEMENT ---
  if (loading) return (
    <div className="ml-72 h-screen flex items-center justify-center bg-[#0F172A] text-red-600 font-black italic uppercase tracking-[0.5em] animate-pulse">
      <Loader2 className="animate-spin mr-6" size={32}/> 
      Accès Registre SMI...
    </div>
  );

  return (
    <div className="h-screen bg-[#0F172A] ml-72 flex flex-col font-sans italic text-left overflow-hidden selection:bg-red-500/30">
      
      {/* 🔝 HEADER : PILOTAGE & ACTIONS */}
      <header className="h-32 px-12 flex items-center justify-between border-b border-white/5 bg-slate-900/50 shrink-0 backdrop-blur-xl z-10">
        <div className="flex items-center gap-8">
          <div className="p-5 bg-red-600/20 border border-red-600/30 rounded-3xl shadow-[0_0_30px_rgba(220,38,38,0.15)] group transition-all">
             <Zap size={32} className="text-red-500 fill-current group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase text-white leading-none italic tracking-tighter">
              Pilotage <span className="text-red-600">NC</span>
            </h1>
            <p className="text-slate-500 font-black text-[10px] uppercase mt-3 italic tracking-[0.4em] flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Registre des Écarts ISO 9001:2015 • {ncs.length} Instances Actives
            </p>
          </div>
        </div>

        <button 
          onClick={() => setIsSlideOverOpen(true)} 
          className="bg-red-600 hover:bg-red-500 px-10 py-5 rounded-4xl font-black uppercase text-[11px] text-white flex items-center gap-4 transition-all shadow-[0_10px_30px_rgba(220,38,38,0.2)] hover:scale-[1.03] active:scale-95 cursor-pointer border-none"
        >
          <Plus size={20} strokeWidth={3} /> Déclarer un Écart
        </button>
      </header>

      {/* 📊 MAIN CONTENT : REGISTRE DÉTAILLÉ */}
      <main className="flex-1 overflow-y-auto p-12 bg-black/10 custom-scrollbar">
        
        {/* Barre de recherche et filtres rapides */}
        <div className="mb-8 flex gap-4">
          <div className="flex-1 bg-slate-900/40 border border-white/5 rounded-2xl px-6 py-4 flex items-center gap-4 focus-within:border-red-500/50 transition-all">
            <Search size={18} className="text-slate-600" />
            <input type="text" placeholder="RECHERCHER DANS LE REGISTRE..." className="bg-transparent border-none outline-none text-[11px] font-black uppercase italic text-white w-full placeholder:text-slate-700" />
          </div>
          <button className="px-6 py-4 bg-slate-900/40 border border-white/5 rounded-2xl text-slate-500 hover:text-white transition-all">
            <Filter size={18} />
          </button>
        </div>

        <div className="bg-slate-900/40 border border-white/10 rounded-[4rem] overflow-hidden shadow-2xl backdrop-blur-sm">
          <table className="w-full text-left italic border-collapse">
            <thead className="bg-white/5 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] border-b border-white/5">
              <tr>
                <th className="px-12 py-10">Origine Détection</th>
                <th className="px-12 py-10 w-1/3">Nature de l&apos;écart</th>
                <th className="px-12 py-10">Axe Processus</th>
                <th className="px-12 py-10 text-center">État Workflow</th>
                <th className="px-12 py-10 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ncs.length === 0 ? (
                 <tr>
                   <td colSpan={5} className="p-32 text-center">
                     <div className="flex flex-col items-center gap-4 opacity-20">
                       <AlertOctagon size={64} className="text-slate-500" />
                       <p className="text-xl font-black uppercase tracking-widest text-slate-400">Aucune Non-Conformité répertoriée</p>
                     </div>
                   </td>
                 </tr>
              ) : ncs.map((nc) => {
                const ui = SOURCE_UI[nc.NC_Source] || SOURCE_UI.INTERNAL_AUDIT;
                return (
                  <tr key={nc.NC_Id} className="hover:bg-white/3 transition-colors group cursor-default">
                    {/* Colonne Source */}
                    <td className="px-12 py-8">
                      <div className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl border ${ui.bg} ${ui.border}`}>
                        <span className={ui.color}>{ui.icon}</span>
                        <span className={`text-[10px] font-black uppercase italic ${ui.color} tracking-wider`}>{ui.label}</span>
                      </div>
                    </td>

                    {/* Colonne Libellé & Date */}
                    <td className="px-12 py-8">
                      <h4 className="text-[15px] font-black text-white uppercase italic truncate max-w-lg group-hover:text-red-500 transition-colors tracking-tight leading-none mb-3">
                        {nc.NC_Libelle}
                      </h4>
                      <p className="text-[10px] font-black text-slate-600 uppercase italic flex items-center gap-2 tracking-widest">
                         <Clock size={12} className="text-slate-700"/> RELEVÉ LE {new Date(nc.NC_CreatedAt).toLocaleDateString()}
                      </p>
                    </td>

                    {/* Colonne Processus */}
                    <td className="px-12 py-8">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                        <span className="text-[11px] font-black text-blue-400 uppercase italic tracking-widest">
                          {nc.NC_Processus?.PR_Libelle || 'NON ATTRIBUÉ'}
                        </span>
                      </div>
                    </td>

                    {/* Colonne Statut */}
                    <td className="px-12 py-8 text-center">
                      <span className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase border tracking-[0.2em] shadow-inner ${
                        nc.NC_Statut === 'CLOSED' 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse'
                      }`}>
                        {nc.NC_Statut === 'OPEN' ? 'OUVERT' : 'SÉCURISÉ'}
                      </span>
                    </td>

                    {/* Colonne Actions */}
                    <td className="px-12 py-8 text-right">
                      <Link 
                        href={`/dashboard/non-conformites/${nc.NC_Id}`} 
                        className="p-5 bg-white/5 rounded-2xl hover:bg-red-600 transition-all text-slate-600 hover:text-white border border-white/5 hover:border-red-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:scale-105 inline-flex items-center justify-center group/btn"
                      >
                        <FileText size={20} className="group-hover/btn:rotate-6 transition-transform" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {/* 🧾 SLIDE OVER : FORMULAIRE DE SAISIE §10.2 */}
      {isSlideOverOpen && (
        <>
          {/* Overlay flou pour focus */}
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-100 animate-in fade-in duration-300" onClick={() => setIsSlideOverOpen(false)} />
          
          <div className="fixed top-0 right-0 h-full w-150 bg-[#0F172A] border-l border-white/10 p-16 overflow-y-auto animate-in slide-in-from-right duration-500 italic text-left z-110 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
            
            {/* Titre du formulaire */}
            <header className="mb-16 border-b border-white/5 pb-10">
              <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-4 flex items-center gap-6 leading-none text-white">
                 <AlertOctagon className="text-red-600" size={56} />
                 Saisie <span className="text-red-600">NC</span>
              </h2>
              <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em] italic">Procédure Qualisoft de gestion des écarts</p>
            </header>

            <form onSubmit={onSubmit} className="space-y-12">
              <div className="grid grid-cols-2 gap-10">
                  {/* Champ Libellé */}
                  <div className="col-span-2 space-y-4">
                    <label className="text-[11px] font-black uppercase text-slate-500 ml-4 block italic tracking-[0.3em]">Objet de la constatation</label>
                    <input 
                      required 
                      value={formData.NC_Libelle} 
                      onChange={e => setFormData({...formData, NC_Libelle: e.target.value.toUpperCase()})} 
                      type="text" 
                      placeholder="EX: ÉCART TEMPÉRATURE STOCKAGE..." 
                      className="w-full bg-slate-900/50 border border-white/10 rounded-2xl p-7 text-[13px] font-black italic text-white outline-none focus:border-red-600 focus:bg-slate-900 transition-all shadow-inner uppercase" 
                    />
                  </div>
                  
                  {/* Sélecteur Source */}
                  <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase text-slate-500 ml-4 block italic tracking-[0.3em]">Origine</label>
                    <select 
                      value={formData.NC_Source} 
                      onChange={e => setFormData({...formData, NC_Source: e.target.value as NCSource})} 
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl p-6 text-[11px] font-black uppercase italic text-white outline-none focus:border-red-600 appearance-none cursor-pointer"
                    >
                       {Object.entries(SOURCE_UI).map(([key, config]) => (
                         <option key={key} value={key}>{config.label}</option>
                       ))}
                    </select>
                  </div>
                  
                  {/* Sélecteur Processus (§4.4) */}
                  <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase text-blue-500 ml-4 block italic tracking-[0.3em]">Processus Lié</label>
                    <select 
                      required 
                      value={formData.NC_ProcessusId} 
                      onChange={e => setFormData({...formData, NC_ProcessusId: e.target.value})} 
                      className="w-full bg-slate-950 border border-blue-500/30 rounded-2xl p-6 text-[11px] font-black uppercase italic text-blue-400 outline-none focus:border-blue-500 appearance-none cursor-pointer"
                    >
                       <option value="">-- SÉLECTIONNER --</option>
                       {processes.map((pr: any) => (
                         <option key={pr.PR_Id} value={pr.PR_Id}>{pr.PR_Libelle}</option>
                       ))}
                    </select>
                  </div>
              </div>

              {/* Champ Description (Méthode QQOQCCP) */}
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase text-slate-500 ml-4 block italic tracking-[0.3em]">Détails Factuels (§10.2.1)</label>
                <textarea 
                  required 
                  rows={8} 
                  value={formData.NC_Description} 
                  onChange={e => setFormData({...formData, NC_Description: e.target.value})} 
                  className="w-full bg-slate-900/50 border border-white/10 rounded-[2.5rem] p-8 text-[13px] font-bold italic text-white outline-none focus:border-red-600 focus:bg-slate-900 transition-all shadow-inner leading-relaxed resize-none" 
                  placeholder="Décrire précisément l'anomalie : Quoi, Qui, Où, Quand, Comment, Pourquoi..." 
                />
              </div>
              
              {/* Bouton de Soumission */}
              <button 
                type="submit" 
                className="w-full py-8 bg-red-600 rounded-[2.5rem] text-[12px] font-black uppercase italic hover:bg-red-500 shadow-2xl flex items-center justify-center gap-5 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer border-none text-white group"
              >
                <Zap size={22} fill="currentColor" className="group-hover:animate-pulse"/> Enregistrer & Lancer le Flux
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}