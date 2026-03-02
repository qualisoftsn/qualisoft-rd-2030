/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🗺️ MODULE : CARTOGRAPHIE DES PROCESSUS (ISO 9001 §4.4)
 * -------------------------------------------------------------------------
 * RÔLE : Inventaire centralisé et modélisation du Système de Management.
 * ARCHITECTURE : Zéro NextAuth, Full API Client, Interface Responsive.
 * DATE : 02 Mars 2026 | 13:17 GMT
 * -------------------------------------------------------------------------
 */

'use client';

import apiClient from "@/core/api/api-client";
import { ProcessType as IProcessType, Processus as IProcessus, User as IUser } from "@/types/elite-sde";
import { 
  ArrowUpRight, Edit3, GitBranch, Layers, Loader2, Plus, 
  ShieldCheck, X, Search, Fingerprint, Activity, RefreshCw
} from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { toast, Toaster } from "sonner";

export default function ProcessusPage() {
  const [items, setItems] = useState<any[]>([]);
  const [collaborateurs, setCollaborateurs] = useState<IUser[]>([]);
  const [types, setTypes] = useState<IProcessType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    PR_Code: "", PR_Libelle: "", PR_TypeId: "", PR_PiloteId: "",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [resP, resU, resT] = await Promise.all([
        apiClient.get("/processus"),
        apiClient.get("/users"),
        apiClient.get("/processus-types"),
      ]);
      const extract = (res: any) => Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      
      setItems(extract(resP));
      setCollaborateurs(extract(resU));
      setTypes(extract(resT));
    } catch (err) {
      toast.error("Rupture de flux Matrix §4.4");
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredItems = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return items;
    return items.filter(i => 
      (i.PR_Libelle && i.PR_Libelle.toLowerCase().includes(term)) || 
      (i.PR_Code && i.PR_Code.toLowerCase().includes(term))
    );
  }, [items, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = toast.loading("Scellage Matrix en cours...");
    try {
      if (selected) {
        await apiClient.patch(`/processus/${selected.PR_Id}`, formData);
      } else {
        await apiClient.post("/processus", formData);
      }
      toast.success("Registre Cartographique Mis à Jour", { id: tid });
      setIsModalOpen(false);
      loadData();
    } catch (err) { 
      toast.error("Échec du scellage des données", { id: tid }); 
    }
  };

  const openModal = (pr?: any) => {
    if (pr) {
      setSelected(pr);
      setFormData({ 
        PR_Code: pr.PR_Code || "", 
        PR_Libelle: pr.PR_Libelle || "", 
        PR_TypeId: pr.PR_TypeId || "", 
        PR_PiloteId: pr.PR_PiloteId || "" 
      });
    } else {
      setSelected(null);
      setFormData({ PR_Code: "", PR_Libelle: "", PR_TypeId: "", PR_PiloteId: "" });
    }
    setIsModalOpen(true);
  };

  if (loading) return (
    <div className="ml-0 lg:ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-blue-500 gap-6">
      <Loader2 className="animate-spin" size={60} strokeWidth={2} />
      <span className="font-black uppercase tracking-[0.4em] text-[12px] animate-pulse">Synchronisation SMI Core...</span>
    </div>
  );

  return (
    <div className="h-screen bg-[#0B0F1A] ml-0 lg:ml-72 flex flex-col overflow-hidden text-white italic font-sans selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER COMPACT */}
      <header className="px-6 lg:px-10 py-6 border-b-2 border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center shrink-0 bg-[#0F172A]/80 backdrop-blur-md gap-6 z-20 shadow-xl">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter m-0 flex items-center gap-4 italic leading-none">
            <GitBranch className="text-blue-600" size={32} /> Cartographie <span className="text-blue-600">SMI</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] m-0 mt-3 flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" /> ISO 9001 §4.4 • Gouvernance Matrix
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              placeholder="RECHERCHER PROCESSUS..." 
              className="w-full bg-slate-900/50 border-2 border-white/10 rounded-2xl py-3 pl-12 pr-4 text-[11px] font-black uppercase outline-none focus:border-blue-600 italic transition-all shadow-inner placeholder:text-slate-600"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-500 active:scale-95 px-6 py-3 rounded-2xl font-black uppercase text-[11px] flex items-center justify-center gap-3 border-none cursor-pointer transition-all shadow-[0_10px_20px_rgba(37,99,235,0.3)] italic tracking-widest"
          >
            <Plus size={18} strokeWidth={3} /> Nouveau
          </button>
        </div>
      </header>

      {/* 📊 GRILLE DÉFILANTE */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar relative">
        {/* Contexte Pédagogique (ISO 9001 Mapping) */}
        {filteredItems.length > 0 && search === "" && (
          <div className="mb-10 bg-slate-900/40 border border-white/5 rounded-4xl p-6 lg:p-8 flex flex-col lg:flex-row items-center gap-8 shadow-lg">
            <div className="flex-1">
               <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-blue-400 mb-3 italic leading-none">Approche Processus (§4.4)</h3>
               <p className="text-[11px] text-slate-400 uppercase tracking-widest leading-relaxed italic m-0">
                 L&apos;organisme doit déterminer les processus nécessaires au système de management de la qualité et leur application dans tout l&apos;organisme. La cartographie ci-dessous modélise la chaîne de création de valeur de votre structure.
               </p>
            </div>
            <div className="w-full lg:w-75 h-25 rounded-2xl overflow-hidden opacity-50 border border-white/10 bg-black/50 shrink-0 mix-blend-screen flex items-center justify-center">
               
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredItems.map((pr) => (
            <div key={pr.PR_Id} className="bg-[#151A2D] border-2 border-white/5 p-8 rounded-[2.5rem] group hover:border-blue-500/40 transition-all flex flex-col justify-between relative overflow-hidden shadow-2xl hover:shadow-blue-900/20">
              <div className="absolute -right-8 -top-8 text-white/5 group-hover:text-blue-500/10 transition-all duration-700 rotate-12 pointer-events-none">
                <GitBranch size={160} />
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <span className="px-4 py-1.5 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-xl text-[10px] font-black uppercase italic tracking-widest shadow-inner">{pr.PR_Code || 'SDE-XX'}</span>
                  <button 
                    onClick={() => openModal(pr)} 
                    className="p-2.5 text-slate-500 hover:text-white bg-slate-900 rounded-xl border border-white/5 cursor-pointer transition-colors shadow-sm"
                  >
                    <Edit3 size={16} />
                  </button>
                </div>
                <h4 className="text-2xl font-black uppercase italic tracking-tighter mb-4 group-hover:text-blue-400 transition-colors leading-tight m-0 text-white">
                  {pr.PR_Libelle || 'PROCESSUS NON DÉFINI'}
                </h4>
                <div className="flex items-center gap-3 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-8 italic">
                  <Layers size={14} className="text-blue-500" /> {pr.PR_Type?.PT_Label || "PROCESSUS TRANSVERSAL"}
                </div>

                <div className="flex items-center gap-5 bg-black/30 p-5 rounded-3xl border border-white/5 shadow-inner">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-black text-blue-500 text-sm shadow-sm">
                    {pr.PR_Pilote?.U_FirstName?.[0] || '?'}{pr.PR_Pilote?.U_LastName?.[0] || '?'}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-[8px] font-black text-slate-500 uppercase m-0 tracking-[0.3em] mb-1 italic">PILOTE TITULAIRE</p>
                    <p className="text-[11px] font-black uppercase text-slate-200 m-0 truncate italic tracking-tight">
                      {pr.PR_Pilote ? `${pr.PR_Pilote.U_FirstName} ${pr.PR_Pilote.U_LastName}` : 'Non assigné'}
                    </p>
                  </div>
                </div>
              </div>

              <Link href={`/dashboard/processus/cockpit/${pr.PR_Id}`} className="mt-8 bg-blue-600/10 border border-blue-500/20 text-blue-500 py-4 rounded-2xl font-black uppercase italic text-[10px] tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all no-underline flex items-center justify-center gap-3 relative z-10 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                OUVRIR COCKPIT <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>
          ))}

          {filteredItems.length === 0 && (
             <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-50">
                <GitBranch size={80} className="mb-6 text-slate-600" />
                <p className="text-xl font-black uppercase tracking-widest text-slate-500 italic">Aucun processus trouvé</p>
             </div>
          )}
        </div>
      </main>

      {/* 📟 MODALE / DRAWER DE CONFIGURATION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-[#0F172A] p-8 lg:p-12 border-l border-white/10 animate-in slide-in-from-right duration-500 flex flex-col shadow-2xl overflow-y-auto">
            <div className="flex justify-between items-center mb-10 shrink-0">
              <h2 className="text-2xl font-black uppercase italic m-0 leading-none">
                CONFIG. <span className="text-blue-600">SMI</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white/5 rounded-xl text-slate-500 hover:text-white border-none cursor-pointer transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 flex-1">
              <InputSDE label="Code Radical (Réf)" value={formData.PR_Code} onChange={(v: string) => setFormData({...formData, PR_Code: v.toUpperCase()})} placeholder="EX: DIR, RH, PROD..." />
              <InputSDE label="Désignation du processus" value={formData.PR_Libelle} onChange={(v: string) => setFormData({...formData, PR_Libelle: v.toUpperCase()})} placeholder="Nom officiel..." />
              
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase italic ml-4 tracking-widest">Typologie</label>
                <div className="relative">
                  <select value={formData.PR_TypeId} onChange={e => setFormData({...formData, PR_TypeId: e.target.value})} className="w-full p-5 bg-slate-950 border-2 border-white/10 rounded-2xl text-[11px] font-black uppercase text-white outline-none focus:border-blue-600 transition-colors shadow-inner appearance-none cursor-pointer">
                    <option value="">SÉLECTIONNER FAMILLE...</option>
                    {types.map(t => <option key={t.PT_Id} value={t.PT_Id}>{t.PT_Label}</option>)}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase italic ml-4 tracking-widest">Pilote Titulaire</label>
                <div className="relative">
                  <select value={formData.PR_PiloteId} onChange={e => setFormData({...formData, PR_PiloteId: e.target.value})} className="w-full p-5 bg-slate-950 border-2 border-white/10 rounded-2xl text-[11px] font-black uppercase text-white outline-none focus:border-blue-600 transition-colors shadow-inner appearance-none cursor-pointer">
                    <option value="">DÉSIGNER UN RESPONSABLE...</option>
                    {collaborateurs.map(u => <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName} {u.U_LastName}</option>)}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
                </div>
              </div>

              <button type="submit" className="w-full py-6 bg-blue-600 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] italic border-none cursor-pointer mt-12 hover:bg-blue-500 active:scale-95 transition-all shadow-[0_15px_30px_rgba(37,99,235,0.3)] text-white">
                VALIDER LA MATRICE
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.5); }
      `}</style>
    </div>
  );
}

function InputSDE({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-slate-500 uppercase italic ml-4 tracking-widest">{label}</label>
      <input 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-5 bg-slate-950 border-2 border-white/10 rounded-2xl text-[11px] font-black uppercase text-white outline-none focus:border-blue-600 transition-colors shadow-inner placeholder:text-slate-700 italic"
      />
    </div>
  );
}