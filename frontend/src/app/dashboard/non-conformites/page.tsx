/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import apiClient from '@/core/api/api-client';
import { 
  AlertOctagon, Plus, Zap, Clock, FileText, 
  MessageSquare, ClipboardCheck, ShieldAlert, Truck, Loader2 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Import des types partagés (Assure-toi que src/types/quality.ts existe)
import { NonConformite, NCSource } from '@/types/quality';

// Configuration UI des Sources
const SOURCE_UI: Record<string, { label: string, icon: React.ReactNode, color: string, bg: string, border: string }> = {
  CLIENT_COMPLAINT: { label: "Réclamation Client", icon: <MessageSquare size={14}/>, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  INTERNAL_AUDIT: { label: "Audit Interne", icon: <ClipboardCheck size={14}/>, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  EXTERNAL_AUDIT: { label: "Audit Externe", icon: <ShieldAlert size={14}/>, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  SUPPLIER: { label: "Fournisseur", icon: <Truck size={14}/>, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  INCIDENT_SAFETY: { label: "Incident SST", icon: <AlertOctagon size={14}/>, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
};

export default function NonConformitesGlobalPage() {
  const [ncs, setNcs] = useState<NonConformite[]>([]); 
  const [processes, setProcesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  
  // État du formulaire
  const [formData, setFormData] = useState({ 
    NC_Libelle: '', 
    NC_Description: '', 
    NC_Source: 'INTERNAL_AUDIT', 
    NC_ProcessusId: '', 
    NC_DetectorId: '' 
  });

  const charger = useCallback(async () => {
    try {
      setLoading(true);
      const [ncRes, prRes] = await Promise.all([
        apiClient.get('/non-conformites'), 
        apiClient.get('/processus')
      ]);
      setNcs(ncRes.data);
      setProcesses(prRes.data);

      // Récupération sécurisée de l'ID utilisateur
      const storageUser = localStorage.getItem('qualisoft-auth-storage');
      if (storageUser) {
          const parsed = JSON.parse(storageUser);
          const userId = parsed.state?.user?.U_Id || parsed.state?.user?.id;
          if (userId) setFormData(prev => ({ ...prev, NC_DetectorId: userId }));
      }
    } catch (e) {
      toast.error("Erreur de chargement du registre NC");
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.NC_ProcessusId) return toast.error("Le processus est obligatoire (ISO §4.4)");
    
    try {
      await apiClient.post('/non-conformites', {
        ...formData,
        NC_Statut: 'OPEN'
      });
      toast.success("Non-Conformité enregistrée");
      setIsSlideOverOpen(false);
      charger();
      setFormData(prev => ({ ...prev, NC_Libelle: '', NC_Description: '' }));
    } catch { 
      toast.error("Échec de l'enregistrement"); 
    }
  };

  if (loading) return <div className="ml-72 h-screen flex items-center justify-center bg-[#0F172A] text-red-600 font-black italic uppercase tracking-widest animate-pulse"><Loader2 className="animate-spin mr-4"/> SMI Qualisoft Root...</div>;

  return (
    <div className="h-screen bg-[#0F172A] ml-72 flex flex-col font-sans italic text-left overflow-hidden">
      
      {/* HEADER */}
      <header className="h-28 px-10 flex items-center justify-between border-b border-white/5 bg-slate-900/50 shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-red-600/20 border border-red-600/30 rounded-2xl shadow-lg shadow-red-900/20">
             <Zap size={28} className="text-red-500 fill-current" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase text-white leading-none italic tracking-tight">Pilotage <span className="text-red-600">NC</span></h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase mt-2 italic tracking-[0.3em]">Registre des Écarts ISO 9001 • {ncs.length} Fiches</p>
          </div>
        </div>
        <button onClick={() => setIsSlideOverOpen(true)} className="bg-red-600 hover:bg-red-500 px-8 py-4 rounded-3xl font-black uppercase text-[11px] text-white flex items-center gap-3 transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer">
          <Plus size={18} strokeWidth={3} /> Déclarer un Écart
        </button>
      </header>

      {/* TABLEAU REGISTRE */}
      <main className="flex-1 overflow-y-auto p-10 bg-black/20 custom-scrollbar">
        <div className="bg-slate-900/40 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-sm">
          <table className="w-full text-left italic">
            <thead className="bg-white/5 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
              <tr>
                <th className="px-10 py-8">Source Détection</th>
                <th className="px-10 py-8 w-1/3">Libellé de l&apos;écart</th>
                <th className="px-10 py-8">Processus Lié</th>
                <th className="px-10 py-8 text-center">Statut Workflow</th>
                <th className="px-10 py-8 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ncs.length === 0 ? (
                 <tr><td colSpan={5} className="p-20 text-center text-slate-600 font-black uppercase tracking-widest">Aucune Non-Conformité Active</td></tr>
              ) : ncs.map((nc) => {
                const ui = SOURCE_UI[nc.NC_Source] || SOURCE_UI.INTERNAL_AUDIT;
                return (
                  <tr key={nc.NC_Id} className="hover:bg-white/2 transition-colors group">
                    <td className="px-10 py-6">
                      <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl border ${ui.bg} ${ui.border}`}>
                        <span className={ui.color}>{ui.icon}</span>
                        <span className={`text-[9px] font-black uppercase ${ui.color}`}>{ui.label}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <h4 className="text-sm font-black text-white uppercase italic truncate max-w-md group-hover:text-red-500 transition-colors">{nc.NC_Libelle}</h4>
                      <p className="text-[9px] font-bold text-slate-600 uppercase mt-2 italic flex items-center gap-2">
                         <Clock size={12}/> {new Date(nc.NC_CreatedAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-10 py-6">
                      <span className="text-[10px] font-black text-blue-400 uppercase italic tracking-wider">{nc.NC_Processus?.PR_Libelle || 'Non Défini'}</span>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase border tracking-widest ${nc.NC_Statut === 'CLOSED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        {nc.NC_Statut}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <Link href={`/dashboard/non-conformites/${nc.NC_Id}`} className="p-4 bg-white/5 rounded-2xl hover:bg-red-600 transition-all text-slate-500 hover:text-white border border-transparent hover:shadow-lg hover:scale-105 inline-flex items-center justify-center">
                        <FileText size={18} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {/* SLIDE OVER (FORMULAIRE) */}
      {isSlideOverOpen && (
        <>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-100" onClick={() => setIsSlideOverOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-150 bg-[#0F172A] border-l border-white/10 p-14 overflow-y-auto animate-in slide-in-from-right duration-500 italic text-left z-110 shadow-2xl">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-12 border-b border-white/5 pb-8 flex items-center gap-4">
               <AlertOctagon className="text-red-600" size={40} />
               Saisie <span className="text-red-600">NC</span>
            </h2>
            <form onSubmit={onSubmit} className="space-y-10">
              <div className="grid grid-cols-2 gap-8">
                 <div className="col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 mb-3 block italic tracking-widest">Objet de l&apos;écart</label>
                    <input required value={formData.NC_Libelle} onChange={e => setFormData({...formData, NC_Libelle: e.target.value})} type="text" placeholder="EX: ERREUR SUR LIVRAISON CLIENT..." className="w-full bg-slate-900 border border-white/10 rounded-2xl p-6 text-sm font-bold italic text-white outline-none focus:border-red-600 transition-all" />
                 </div>
                 
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 mb-3 block italic tracking-widest">Source</label>
                    <select value={formData.NC_Source} onChange={e => setFormData({...formData, NC_Source: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-[10px] font-black uppercase italic text-white outline-none focus:border-red-600">
                       {Object.entries(SOURCE_UI).map(([key, config]) => <option key={key} value={key}>{config.label}</option>)}
                    </select>
                 </div>
                 
                 <div>
                    <label className="text-[10px] font-black uppercase text-blue-500 mb-3 block italic tracking-widest">Processus Impacté</label>
                    <select required value={formData.NC_ProcessusId} onChange={e => setFormData({...formData, NC_ProcessusId: e.target.value})} className="w-full bg-slate-950 border border-blue-500/20 rounded-2xl p-5 text-[10px] font-black uppercase italic text-blue-400 outline-none focus:border-blue-500">
                       <option value="">-- SÉLECTIONNER --</option>
                       {processes.map((pr: any) => <option key={pr.PR_Id} value={pr.PR_Id}>{pr.PR_Libelle}</option>)}
                    </select>
                 </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 mb-3 block italic tracking-widest">Description Factuelle</label>
                <textarea required rows={6} value={formData.NC_Description} onChange={e => setFormData({...formData, NC_Description: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-4xl p-6 text-sm font-bold italic text-white outline-none focus:border-red-600 transition-all" placeholder="Décrire le constat (QQOQCCP)..." />
              </div>
              
              <button type="submit" className="w-full py-6 bg-red-600 rounded-4xl text-[11px] font-black uppercase italic hover:bg-red-500 shadow-xl flex items-center justify-center gap-4 transition-all hover:scale-[1.02] cursor-pointer">
                <Zap size={20} fill="currentColor"/> Enregistrer & Diffuser
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}