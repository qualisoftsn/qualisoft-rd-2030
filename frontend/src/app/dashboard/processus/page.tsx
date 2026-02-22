/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🌐 PAGE : CARTOGRAPHIE SMI (SYSTÈME DE MANAGEMENT INTÉGRÉ)
 * -------------------------------------------------------------------------
 * RÔLE : Gestionnaire central de l'architecture des processus.
 * CONFORMITÉ : ISO 9001:2015 §4.4 (Détermination et application des processus).
 * ARCHITECTURE : Multi-Tenant SDE Matrix Isolation.
 * RÉFÉRENTIEL : types/elite-sde.ts (Prisma Core).
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Plus, Edit3, Save, X, Loader2, Target, ShieldCheck, 
  Layers, GitBranch, ArrowUpRight, Fingerprint, Activity, 
  Users
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import Link from 'next/link';
import { 
  Processus as IProcessus, 
  User as IUser, 
  ProcessType as IProcessType 
} from '@/types/elite-sde';

// --- INTERFACES ÉTENDUES (POUR LES RELATIONS) ---
interface ExtendedProcessus extends IProcessus {
  PR_Pilote?: IUser;
  PR_Type?: IProcessType;
}

interface ProcessusFormData {
  PR_Code: string;
  PR_Libelle: string;
  PR_TypeId: string;
  PR_PiloteId: string;
}

export default function ProcessusPage() {
  // --- 📦 ÉTATS DE DONNÉES SCELLÉS ---
  const [items, setItems] = useState<ExtendedProcessus[]>([]);
  const [collaborateurs, setCollaborateurs] = useState<IUser[]>([]);
  const [types, setTypes] = useState<IProcessType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // --- 🖥️ ÉTATS DE GESTION (MODAL/CRUD) ---
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<ExtendedProcessus | null>(null);
  
  const [formData, setFormData] = useState<ProcessusFormData>({ 
    PR_Code: '', 
    PR_Libelle: '', 
    PR_TypeId: '', 
    PR_PiloteId: '' 
  });

  /**
   * 📡 PROTOCOLE DE SYNCHRONISATION MATRIX
   * @description Récupère les processus, les utilisateurs et les typologies pour le tenant actif.
   */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [resP, resU, resT] = await Promise.all([
        apiClient.get('/processus'),
        apiClient.get('/users'), 
        apiClient.get('/processus-types')
      ]);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const extract = (res: any) => res.data?.data || res.data || [];
      
      setItems(extract(resP));
      setCollaborateurs(extract(resU));
      setTypes(extract(resT));
    } catch (err: unknown) {
      console.error("❌ Rupture de liaison Matrix (§4.4):", err);
      toast.error("Échec de synchronisation avec le registre des processus.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /**
   * 💾 SCELLAGE DES DONNÉES (POST/PATCH)
   * @description Enregistre un segment dans la cartographie officielle du SDE.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Scellage du processus en cours...");
    
    try {
      if (selected) {
        await apiClient.patch(`/processus/${selected.PR_Id}`, formData);
        toast.success("Mutation du processus validée", { id: toastId });
      } else {
        await apiClient.post('/processus', formData);
        toast.success("Nouveau processus intégré au SMI", { id: toastId });
      }
      setIsModalOpen(false);
      loadData();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("❌ Échec du scellage Processus:", err);
      const msg = err.response?.data?.message || "Erreur de persistance Matrix";
      toast.error(Array.isArray(msg) ? msg[0] : msg, { id: toastId });
    }
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-6">
      <Loader2 className="animate-spin text-blue-500" size={60} strokeWidth={1.5} />
      <span className="text-blue-500 font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">
        SMI CORE PROTOCOL INITIATING...
      </span>
    </div>
  );

  return (
    <div className="p-12 bg-[#0B0F1A] min-h-screen ml-72 text-white italic text-left selection:bg-blue-500/30">
      <Toaster position="top-right" richColors />
      
      {/* 🔝 EN-TÊTE SOUVERAIN (§4.4) */}
      <header className="mb-20 flex justify-between items-end border-b-2 border-white/5 pb-12 animate-in slide-in-from-top-4 duration-700">
        <div className="space-y-6">
          <div className="flex items-center gap-4 text-blue-500 bg-blue-500/5 w-fit px-5 py-2 rounded-full border border-blue-500/20">
            <Fingerprint size={16} className="animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Isolation Sovereign SDE Active</span>
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none">
            CARTOGRAPHIE <span className="text-blue-600">SMI</span>
          </h1>
          <p className="text-slate-500 font-bold text-[11px] uppercase tracking-[0.6em] italic opacity-60">
            ISO 9001 §4.4 • GOUVERNANCE OPÉRATIONNELLE & MAÎTRISE
          </p>
        </div>
        <button 
          onClick={() => { 
            setSelected(null); 
            setFormData({ PR_Code: '', PR_Libelle: '', PR_TypeId: '', PR_PiloteId: '' }); 
            setIsModalOpen(true); 
          }} 
          className="bg-blue-600 hover:bg-white hover:text-slate-900 px-12 py-7 rounded-4xl font-black uppercase text-xs transition-all shadow-[0_25px_60px_rgba(37,99,235,0.3)] border-none cursor-pointer flex items-center gap-4 active:scale-95 group"
        >
          <Plus size={22} strokeWidth={3} className="group-hover:rotate-90 transition-transform" /> 
          AJOUTER UN PROCESSUS
        </button>
      </header>

      {/* 📊 GRILLE DES PROCESSUS (§4.4.1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        {items.map((pr) => {
          // Sécurisation des initiales (Null-Safe)
          const firstInitial = pr.PR_Pilote?.U_FirstName?.charAt(0) || '';
          const lastInitial = pr.PR_Pilote?.U_LastName?.charAt(0) || '';

          return (
            <div key={pr.PR_Id} className="bg-[#0F172A]/40 border border-white/5 p-12 rounded-[4rem] group hover:border-blue-500/40 transition-all flex flex-col justify-between min-h-112.5 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-8 -top-8 text-white/5 group-hover:text-blue-500/10 transition-all pointer-events-none rotate-12">
                <GitBranch size={200} />
              </div>
              
              <div className="relative z-10 text-left">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <span className="px-5 py-2 bg-blue-600/10 text-blue-500 border border-blue-600/20 rounded-xl text-[10px] font-black uppercase italic tracking-widest leading-none">
                      {pr.PR_Code}
                    </span>
                    <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">v{pr.PR_Version}.0</span>
                  </div>
                  <button 
                    onClick={() => { 
                      setSelected(pr); 
                      setFormData({
                        PR_Code: pr.PR_Code, 
                        PR_Libelle: pr.PR_Libelle, 
                        PR_TypeId: pr.PR_TypeId, 
                        PR_PiloteId: pr.PR_PiloteId
                      }); 
                      setIsModalOpen(true); 
                    }} 
                    className="p-3 text-slate-600 hover:text-white bg-white/5 rounded-xl border-none cursor-pointer transition-all hover:bg-blue-600"
                  >
                    <Edit3 size={20} />
                  </button>
                </div>
                
                <h4 className="text-3xl font-black uppercase italic leading-tight tracking-tighter mb-6 group-hover:text-blue-400 transition-colors">
                  {pr.PR_Libelle}
                </h4>
                
                <div className="flex items-center gap-3 mb-10">
                   <Layers size={14} className="text-slate-500" />
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] italic">
                     {pr.PR_Type?.PT_Label || 'FAMILLE NON DÉFINIE'}
                   </p>
                </div>
                
                {/* INDICATEUR DU PILOTE (§5.3) */}
                <div className="flex items-center gap-5 bg-white/2 p-6 rounded-4xl border border-white/5 shadow-inner backdrop-blur-sm">
                  <div className="w-14 h-14 rounded-2xl bg-[#0B0F1A] border border-white/5 flex items-center justify-center font-black text-blue-600 text-lg shadow-xl group-hover:scale-110 transition-transform">
                    {firstInitial}{lastInitial}
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic mb-2">PILOTE TITULAIRE</p>
                    <p className="text-sm font-black uppercase italic text-slate-200">
                      {pr.PR_Pilote?.U_FirstName} {pr.PR_Pilote?.U_LastName}
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTION D'ENTRÉE EN COCKPIT */}
              <Link 
                href={`/dashboard/processus/cockpit/${pr.PR_Id}`} 
                className="mt-12 flex justify-between items-center bg-blue-600 text-white p-8 rounded-3xl font-black uppercase italic text-[11px] tracking-[0.2em] hover:bg-white hover:text-slate-900 transition-all no-underline shadow-3xl relative z-10 group/btn active:scale-95"
              >
                OUVRIR LE COCKPIT <ArrowUpRight size={22} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
              </Link>
            </div>
          );
        })}
      </div>

      {/* 📟 MODAL DE CONFIGURATION SOUVERAINE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-end">
          <div 
            className="absolute inset-0 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500" 
            onClick={() => setIsModalOpen(false)} 
          />
          <div className="relative h-full w-full max-w-xl bg-[#0F172A] z-110 p-16 animate-in slide-in-from-right duration-500 italic text-left border-l border-white/10 overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-16 border-b-2 border-white/5 pb-10">
                <div className="flex items-center gap-6">
                   <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-xl"><ShieldCheck size={32} /></div>
                   <h2 className="text-4xl font-black uppercase italic tracking-tighter">CONFIG. <span className="text-blue-600">SMI</span></h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="bg-white/5 hover:bg-red-500 hover:text-white p-4 rounded-xl text-slate-500 transition-all border-none cursor-pointer">
                  <X size={32} strokeWidth={1} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-6 tracking-[0.3em] italic leading-none">Identifiant Radical (Code)</label>
                <input 
                  value={formData.PR_Code} 
                  onChange={e => setFormData({...formData, PR_Code: e.target.value.toUpperCase()})} 
                  placeholder="EX: PR-MAINTENANCE" 
                  className="w-full p-8 bg-slate-900 border border-white/10 rounded-4xl text-base font-black uppercase italic text-white outline-none focus:border-blue-600 shadow-inner transition-all placeholder:opacity-20" 
                  required 
                />
              </div>
              
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-6 tracking-[0.3em] italic leading-none">Désignation Officielle (§4.4)</label>
                <input 
                  value={formData.PR_Libelle} 
                  onChange={e => setFormData({...formData, PR_Libelle: e.target.value.toUpperCase()})} 
                  placeholder="INTITULÉ DU PROCESSUS" 
                  className="w-full p-8 bg-slate-900 border border-white/10 rounded-4xl text-base font-black uppercase italic text-white outline-none focus:border-blue-600 shadow-inner transition-all" 
                  required 
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-6 tracking-[0.3em] italic leading-none">Typologie Structurelle</label>
                <div className="relative">
                  <select 
                    value={formData.PR_TypeId} 
                    onChange={e => setFormData({...formData, PR_TypeId: e.target.value})} 
                    className="w-full p-8 bg-slate-900 border border-white/10 rounded-4xl text-[12px] font-black uppercase italic text-white outline-none focus:border-blue-600 cursor-pointer shadow-inner appearance-none"
                    required
                  >
                    <option value="">SÉLECTIONNER UNE FAMILLE</option>
                    {types.map(t => <option key={t.PT_Id} value={t.PT_Id}>{t.PT_Label}</option>)}
                  </select>
                  <Layers size={18} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-6 tracking-[0.3em] italic leading-none">Responsable du Pilotage (§5.3)</label>
                <div className="relative">
                  <select 
                    value={formData.PR_PiloteId} 
                    onChange={e => setFormData({...formData, PR_PiloteId: e.target.value})} 
                    className="w-full p-8 bg-slate-900 border border-white/10 rounded-4xl text-[12px] font-black uppercase italic text-white outline-none focus:border-blue-600 cursor-pointer shadow-inner appearance-none"
                    required
                  >
                    <option value="">DÉSIGNER LE PILOTE TITULAIRE</option>
                    {collaborateurs.map(u => <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName} {u.U_LastName}</option>)}
                  </select>
                  <Users size={18} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                </div>
              </div>

              <button type="submit" className="w-full py-10 bg-blue-600 rounded-[2.5rem] font-black uppercase text-[12px] tracking-[0.4em] italic transition-all shadow-[0_25px_60px_rgba(37,99,235,0.4)] border-none cursor-pointer mt-14 hover:bg-white hover:text-slate-900 active:scale-95">
                SCELLER DANS LA CARTOGRAPHIE
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🧩 STYLES MATRIX CUSTOM */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
      `}</style>
    </div>
  );
}