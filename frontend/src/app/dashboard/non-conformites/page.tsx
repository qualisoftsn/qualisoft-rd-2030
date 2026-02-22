/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : REGISTRE GLOBAL DES NON-CONFORMITÉS (NC)
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage des écarts et réactivité système (§10.2 ISO 9001).
 * RÉFÉRENTIEL : types/elite-sde.ts (SCELLAGE PRISMA STRICT).
 * DESIGN : Cockpit Matrix Full-Space (max-w-500).
 * -------------------------------------------------------------------------
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import apiClient from '@/core/api/api-client';
import { 
  AlertOctagon, Plus, Zap, Clock, FileText, 
  MessageSquare, ClipboardCheck, ShieldAlert, Truck, Loader2,
  Filter, Search, Fingerprint, Activity, ShieldCheck, ChevronRight
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

// --- 🏗️ RÉFÉRENTIEL ÉLITE-SDE (VÉRIFIÉ) ---
import { 
  NonConformite as INonConformite, 
  Processus as IProcessus,
  User as IUser,
  NCStatus,
  NCSource,
  NCGravity
} from '@/types/elite-sde';

// --- 🛠️ UTILITAIRES SYSTÈME ---
const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

// --- 🎨 CONFIGURATION DES SOURCES (NCSource Enum) ---
const SOURCE_UI: Record<NCSource, { label: string, icon: React.ReactNode, color: string, bg: string, border: string }> = {
  [NCSource.CLIENT_COMPLAINT]: { label: "Réclamation Client", icon: <MessageSquare size={14}/>, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  [NCSource.INTERNAL_AUDIT]: { label: "Audit Interne", icon: <ClipboardCheck size={14}/>, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  [NCSource.EXTERNAL_AUDIT]: { label: "Audit Externe", icon: <ShieldAlert size={14}/>, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  [NCSource.SUPPLIER]: { label: "Fournisseur", icon: <Truck size={14}/>, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  [NCSource.INCIDENT_SAFETY]: { label: "Incident SST", icon: <AlertOctagon size={14}/>, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  [NCSource.PROCESS_REVIEW]: { label: "Revue Processus", icon: <Activity size={14}/>, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  [NCSource.MANAGEMENT_REVIEW]: { label: "Revue Direction", icon: <Fingerprint size={14}/>, color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" },
};

export default function NonConformitesGlobalPage() {
  // --- 📦 ÉTATS SDE MATRIX ---
  const [ncs, setNcs] = useState<(INonConformite & { Processus?: IProcessus, Detector?: IUser })[]>([]); 
  const [processes, setProcesses] = useState<IProcessus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState<boolean>(false);
  
  const [formData, setFormData] = useState({ 
    NC_Libelle: '', 
    NC_Description: '', 
    NC_Source: NCSource.INTERNAL_AUDIT, 
    NC_Gravite: NCGravity.MINEURE,
    NC_ProcessusId: '', 
    NC_DetectorId: '' 
  });

  /**
   * 📡 SYNCHRONISATION DES FLUX NC
   * @description Extraction du registre avec mapping des relations Processus et Detector.
   */
  const charger = useCallback(async () => {
    try {
      setLoading(true);
      const [ncRes, prRes] = await Promise.all([
        apiClient.get('/non-conformites'), 
        apiClient.get('/processus')
      ]);
      
      const extract = (res: any) => res.data?.data || res.data || [];
      setNcs(extract(ncRes));
      setProcesses(extract(prRes));

      const storageUser = localStorage.getItem('qualisoft-auth-storage');
      if (storageUser) {
          const parsed = JSON.parse(storageUser);
          const userId = parsed.state?.user?.U_Id || parsed.state?.user?.id;
          if (userId) setFormData(prev => ({ ...prev, NC_DetectorId: userId }));
      }
    } catch (e: unknown) {
      toast.error("RUPTURE SDE : REGISTRE NC INACCESSIBLE");
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  /**
   * 💾 ACTION : SCELLAGE D'ÉCART (§10.2)
   */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.NC_ProcessusId) return toast.error("Attribution processus obligatoire (§4.4)");
    
    const tid = toast.loading("Scellage de l'écart dans le SMI...");
    try {
      // ✅ SCELLAGE : NC_Statut (Enum NCStatus.DETECTION)
      await apiClient.post('/non-conformites', { ...formData, NC_Statut: NCStatus.DETECTION });
      toast.success("Écart scellé avec succès.", { id: tid });
      setIsSlideOverOpen(false);
      setFormData(prev => ({ ...prev, NC_Libelle: '', NC_Description: '' }));
      charger();
    } catch (err: any) { 
      toast.error(err.response?.data?.message || "ERREUR DE SCELLAGE SDE", { id: tid }); 
    }
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0F172A] gap-8">
      <Loader2 className="animate-spin text-red-600" size={60} strokeWidth={1.5} />
      <p className="text-red-500 font-black uppercase italic tracking-[0.6em] text-[11px] animate-pulse">Sync Registre NC RD 2030...</p>
    </div>
  );

  return (
    <div className="h-screen bg-[#0F172A] ml-72 flex flex-col font-sans italic text-left overflow-hidden selection:bg-red-600/30">
      <Toaster position="top-right" richColors />
      
      {/* 🔝 HEADER COCKPIT ANALYTIQUE */}
      <header className="h-36 px-16 flex items-center justify-between border-b border-white/5 bg-slate-900/60 shrink-0 backdrop-blur-3xl z-40 shadow-2xl">
        <div className="flex items-center gap-10">
          <div className="p-6 bg-red-600/10 border-2 border-red-600/20 rounded-[2.5rem] shadow-4xl group">
              <Zap size={40} className="text-red-600 fill-current group-hover:scale-110 transition-transform" strokeWidth={2.5} />
          </div>
          <div className="space-y-3">
            <h1 className="text-5xl font-black uppercase text-white leading-none italic tracking-tighter">Pilotage <span className="text-red-600">NC</span></h1>
            <p className="text-slate-500 font-black text-[11px] uppercase italic tracking-[0.5em] flex items-center gap-4">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse shadow-[0_0_15px_red]" />
              Registre des Écarts ISO 9001 • {ncs.length} Dossiers Scellés
            </p>
          </div>
        </div>

        <button 
          onClick={() => setIsSlideOverOpen(true)} 
          className="bg-red-600 hover:bg-white hover:text-red-600 px-12 py-6 rounded-4xl font-black uppercase text-xs text-white flex items-center gap-5 transition-all shadow-4xl border-none active:scale-95 cursor-pointer"
        >
          <Plus size={24} strokeWidth={3} /> Déclarer un Écart
        </button>
      </header>

      {/*  */}

      {/* 📊 REGISTRE SDE TOTAL (max-w-500) */}
      <main className="flex-1 overflow-y-auto p-16 bg-black/20 custom-scrollbar relative">
        <div className="w-full max-w-500 mx-auto space-y-12">
            
            {/* Barre de recherche Matrix */}
            <div className="flex gap-8 items-center bg-white/2 p-4 rounded-[2.5rem] border border-white/5 shadow-inner">
              <div className="flex-1 bg-slate-900/60 border border-white/5 rounded-3xl px-8 py-5 flex items-center gap-6 focus-within:border-red-600/40 group">
                <Search size={22} className="text-slate-600 group-focus-within:text-red-600 transition-colors" />
                <input type="text" placeholder="RECHERCHER DANS LE REGISTRE SDE..." className="bg-transparent border-none outline-none text-[12px] font-black uppercase italic text-white w-full placeholder:text-slate-800 tracking-widest" />
              </div>
              <button className="p-5 bg-slate-900/60 border border-white/5 rounded-2xl text-slate-500 hover:text-white transition-all cursor-pointer"><Filter size={24} /></button>
            </div>

            {/* Registre des Écarts Matrix */}
            <div className="bg-[#0F172A]/80 border-2 border-white/5 rounded-[4rem] overflow-hidden shadow-4xl backdrop-blur-md">
              <table className="w-full text-left italic border-collapse">
                <thead className="bg-white/5 text-[12px] font-black uppercase text-slate-500 tracking-[0.4em] border-b border-white/5">
                  <tr>
                    <th className="px-16 py-12">Détection / Source</th>
                    <th className="px-16 py-12 w-2/5">Écart & Chronologie SDE</th>
                    <th className="px-16 py-12">Axe Processus §4.4</th>
                    <th className="px-16 py-12 text-center">Statut Matrix</th>
                    <th className="px-16 py-12 text-right">Pilotage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ncs.length === 0 ? (
                      <tr><td colSpan={5} className="p-48 text-center opacity-10 font-black uppercase tracking-[1em]">Registre Vierge</td></tr>
                  ) : ncs.map((nc) => {
                    const ui = SOURCE_UI[nc.NC_Source] || SOURCE_UI[NCSource.INTERNAL_AUDIT];
                    return (
                      <tr key={nc.NC_Id} className="hover:bg-red-600/3 transition-all group">
                        <td className="px-16 py-10">
                          <div className={cn("inline-flex items-center gap-4 px-6 py-3 rounded-2xl border shadow-lg", ui.bg, ui.border)}>
                            <span className={ui.color}>{ui.icon}</span>
                            <span className={cn("text-[11px] font-black uppercase italic tracking-widest", ui.color)}>{ui.label}</span>
                          </div>
                        </td>

                        <td className="px-16 py-10">
                          <div className="flex flex-col gap-4 text-left">
                            <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none group-hover:text-red-500 transition-colors">
                              {nc.NC_Libelle}
                            </h4>
                            <div className="flex items-center gap-5 text-[10px] font-black text-slate-600 uppercase italic tracking-[0.3em]">
                               <Clock size={14} className="text-slate-700"/> RELEVÉ : {new Date(nc.NC_CreatedAt).toLocaleDateString()}
                               <span className="text-slate-800">•</span>
                               <span className="text-slate-400">REF: NC-{nc.NC_Id?.slice(0, 8).toUpperCase()}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-16 py-10">
                          <div className="flex items-center gap-5">
                            <div className="w-2 h-8 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
                            {/* ✅ SCELLAGE SDE : Relation Processus (Interface elite-sde) */}
                            <span className="text-[13px] font-black text-blue-400 uppercase italic tracking-widest leading-none">
                              {nc.Processus?.PR_Libelle || 'SEGMENT TRANSVERSAL'}
                            </span>
                          </div>
                        </td>

                        <td className="px-16 py-10 text-center">
                          {/* ✅ SCELLAGE SDE : NC_Statut (Enum NCStatus) */}
                          <div className={cn(
                            "px-8 py-3 rounded-2xl text-[11px] font-black uppercase border tracking-[0.4em] inline-block shadow-inner",
                            nc.NC_Statut === NCStatus.CLOTURE ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-600/10 text-red-600 border-red-600/20 animate-pulse'
                          )}>
                            {nc.NC_Statut}
                          </div>
                        </td>

                        <td className="px-16 py-10 text-right">
                          <Link href={`/dashboard/non-conformites/${nc.NC_Id}`} className="p-6 bg-white/5 rounded-3xl hover:bg-red-600 transition-all text-slate-600 hover:text-white border border-white/5 hover:border-red-600 shadow-xl inline-flex items-center justify-center group/btn active:scale-90">
                            <FileText size={24} className="group-hover/btn:rotate-6 transition-transform" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
        </div>
      </main>

      {/* 🧾 SLIDE OVER : SAISIE NC SDE SOUVERAINE */}
      {isSlideOverOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-end">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500" onClick={() => setIsSlideOverOpen(false)} />
          <div className="relative h-full w-162.5 bg-[#0F172A] border-l-4 border-red-600 p-20 overflow-y-auto animate-in slide-in-from-right duration-700 italic text-left shadow-4xl custom-scrollbar">
            <header className="mb-20 border-b-2 border-white/5 pb-12">
                <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none text-white text-left">Saisie <span className="text-red-600">NC</span></h2>
                <p className="text-slate-600 text-[11px] font-black uppercase tracking-[0.6em] mt-4 italic">Isolation SDE RD 2030 Matrix</p>
            </header>

            <form onSubmit={onSubmit} className="space-y-14 text-left">
              <div className="space-y-4">
                <label className="text-[12px] font-black uppercase text-slate-500 ml-8 block italic tracking-[0.4em]">Objet de la constatation *</label>
                <input required value={formData.NC_Libelle} onChange={e => setFormData({...formData, NC_Libelle: e.target.value.toUpperCase()})} type="text" placeholder="EX: DÉFAUT DE TRAÇABILITÉ..." className="w-full bg-[#0B0F1A] border-2 border-white/10 rounded-4xl p-10 text-xl font-black italic text-white outline-none focus:border-red-600 shadow-inner" />
              </div>

              <div className="grid grid-cols-2 gap-8 text-left">
                <div className="space-y-4">
                    <label className="text-[12px] font-black text-slate-500 ml-8 block uppercase italic tracking-widest">Gravité SDE</label>
                    <select value={formData.NC_Gravite} onChange={e => setFormData({...formData, NC_Gravite: e.target.value as NCGravity})} className="w-full bg-[#0B0F1A] border-2 border-white/10 rounded-2xl p-8 text-[13px] font-black uppercase italic text-white outline-none focus:border-red-600 appearance-none shadow-inner">
                       {Object.values(NCGravity).map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
                <div className="space-y-4">
                    <label className="text-[12px] font-black text-slate-500 ml-8 block uppercase italic tracking-widest">Source</label>
                    <select value={formData.NC_Source} onChange={e => setFormData({...formData, NC_Source: e.target.value as NCSource})} className="w-full bg-[#0B0F1A] border-2 border-white/10 rounded-2xl p-8 text-[13px] font-black uppercase italic text-white outline-none focus:border-red-600 appearance-none shadow-inner">
                       {Object.entries(SOURCE_UI).map(([key, config]) => <option key={key} value={key}>{config.label}</option>)}
                    </select>
                </div>
              </div>

              <div className="space-y-4 text-left">
                  <label className="text-[12px] font-black text-blue-500 ml-8 block uppercase italic tracking-widest">Processus Lié §4.4</label>
                  <select required value={formData.NC_ProcessusId} onChange={e => setFormData({...formData, NC_ProcessusId: e.target.value})} className="w-full bg-[#0B0F1A] border-2 border-blue-600/20 rounded-2xl p-8 text-[13px] font-black uppercase italic text-blue-400 outline-none focus:border-blue-500 appearance-none shadow-inner">
                      <option value="">-- SÉLECTIONNER PROCESSUS --</option>
                      {processes.map((pr) => <option key={pr.PR_Id} value={pr.PR_Id}>{pr.PR_Libelle}</option>)}
                  </select>
              </div>

              <div className="space-y-4 text-left">
                <label className="text-[12px] font-black text-slate-500 ml-8 block uppercase italic tracking-widest">Exposé Factuel (§10.2.1)</label>
                <textarea required rows={10} value={formData.NC_Description} onChange={e => setFormData({...formData, NC_Description: e.target.value})} className="w-full bg-[#0B0F1A] border-2 border-white/10 rounded-[3.5rem] p-12 text-[16px] font-bold italic text-slate-200 outline-none focus:border-red-600 shadow-inner resize-none" placeholder="Décrire précisément l'anomalie..." />
              </div>
              <button type="submit" className="w-full py-12 bg-red-600 rounded-[3rem] text-[14px] font-black uppercase italic text-white flex items-center justify-center gap-6 hover:bg-white hover:text-red-600 transition-all border-none shadow-4xl active:scale-95 cursor-pointer">
                <Zap size={32} fill="currentColor" /> Enregistrer dans le Registre
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🧩 STYLES MATRIX CUSTOM */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
      `}</style>
    </div>
  );
}