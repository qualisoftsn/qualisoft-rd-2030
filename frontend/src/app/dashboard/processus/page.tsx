/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import apiClient from "@/core/api/api-client";
import { ProcessType as IProcessType, Processus as IProcessus, User as IUser } from "@/types/elite-sde";
import { 
  ArrowUpRight, Edit3, Fingerprint, GitBranch, Layers, Loader2, Plus, 
  ShieldCheck, Users, X, Activity, Search, RefreshCw 
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
      const extract = (res: any) => res.data?.data || res.data || [];
      setItems(extract(resP));
      setCollaborateurs(extract(resU));
      setTypes(extract(resT));
    } catch (err) {
      toast.error("Rupture Matrix §4.4");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredItems = useMemo(() => 
    items.filter(i => i.PR_Libelle.toLowerCase().includes(search.toLowerCase()) || i.PR_Code.toLowerCase().includes(search.toLowerCase()))
  , [items, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = toast.loading("Scellage Matrix...");
    try {
      if (selected) await apiClient.patch(`/processus/${selected.PR_Id}`, formData);
      else await apiClient.post("/processus", formData);
      toast.success("Registre Mis à Jour", { id: tid });
      setIsModalOpen(false);
      loadData();
    } catch (err) { toast.error("Échec du scellage", { id: tid }); }
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-blue-500 gap-4">
      <Loader2 className="animate-spin" size={40} />
      <span className="font-black uppercase tracking-[0.4em] text-[10px]">SMI Core Sync...</span>
    </div>
  );

  return (
    <div className="h-screen bg-[#0B0F1A] ml-72 flex flex-col overflow-hidden text-white italic">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER COMPACT (Shrink-0) */}
      <header className="px-8 py-6 border-b border-white/5 flex justify-between items-center shrink-0 bg-[#0F172A]/50">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter m-0 flex items-center gap-3">
            <GitBranch className="text-blue-600" size={24} /> Cartographie <span className="text-blue-600">SMI</span>
          </h1>
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] m-0 mt-1">ISO 9001 §4.4 • Gouvernance Matrix</p>
        </div>

        <div className="flex gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              placeholder="RECHERCHER..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-[10px] font-black uppercase outline-none focus:border-blue-600 italic"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { setSelected(null); setIsModalOpen(true); }}
            className="bg-blue-600 hover:bg-white hover:text-slate-900 px-6 py-2 rounded-xl font-black uppercase text-[10px] flex items-center gap-2 border-none cursor-pointer transition-all"
          >
            <Plus size={16} /> Ajouter Processus
          </button>
        </div>
      </header>

      {/* 📊 GRILLE DÉFILANTE (Flex-1) */}
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((pr) => (
            <div key={pr.PR_Id} className="bg-[#151A2D] border border-white/5 p-6 rounded-4xl group hover:border-blue-500/40 transition-all flex flex-col justify-between relative overflow-hidden shadow-2xl">
              <div className="absolute -right-4 -top-4 text-white/5 group-hover:text-blue-500/10 transition-all rotate-12"><GitBranch size={120} /></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <span className="px-3 py-1 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-lg text-[9px] font-black uppercase italic tracking-widest">{pr.PR_Code}</span>
                  <button onClick={() => { setSelected(pr); setFormData({ PR_Code: pr.PR_Code, PR_Libelle: pr.PR_Libelle, PR_TypeId: pr.PR_TypeId, PR_PiloteId: pr.PR_PiloteId }); setIsModalOpen(true); }} className="p-2 text-slate-500 hover:text-white bg-white/5 rounded-lg border-none cursor-pointer"><Edit3 size={14} /></button>
                </div>
                <h4 className="text-xl font-black uppercase italic tracking-tighter mb-4 group-hover:text-blue-400 transition-colors leading-tight">{pr.PR_Libelle}</h4>
                <div className="flex items-center gap-3 text-slate-500 text-[8px] font-black uppercase tracking-widest mb-6">
                  <Layers size={12} /> {pr.PR_Type?.PT_Label || "TRANSVERSAL"}
                </div>

                <div className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-black text-blue-500 text-xs">
                    {pr.PR_Pilote?.U_FirstName?.[0]}{pr.PR_Pilote?.U_LastName?.[0]}
                  </div>
                  <div className="text-left">
                    <p className="text-[7px] font-black text-slate-600 uppercase m-0">PILOTE</p>
                    <p className="text-[10px] font-black uppercase text-slate-200 m-0 truncate">{pr.PR_Pilote?.U_FirstName} {pr.PR_Pilote?.U_LastName}</p>
                  </div>
                </div>
              </div>

              <Link href={`/dashboard/processus/cockpit/${pr.PR_Id}`} className="mt-6 bg-blue-600 text-white py-3 rounded-xl font-black uppercase italic text-[9px] tracking-widest hover:bg-white hover:text-blue-600 transition-all no-underline flex items-center justify-center gap-2">
                ACCÉDER AU COCKPIT <ArrowUpRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </main>

      {/* 📟 MODALE / DRAWER (Corrected) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-[#0F172A] p-10 border-l border-white/10 animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-black uppercase italic m-0">CONFIG. <span className="text-blue-600">SMI</span></h2>
              <X onClick={() => setIsModalOpen(false)} className="cursor-pointer text-slate-500 hover:text-white" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <InputSDE label="Code Radical" value={formData.PR_Code} onChange={(v: string) => setFormData({...formData, PR_Code: v.toUpperCase()})} />
              <InputSDE label="Désignation" value={formData.PR_Libelle} onChange={(v: string) => setFormData({...formData, PR_Libelle: v.toUpperCase()})} />
              
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase italic ml-4">Typologie</label>
                <select value={formData.PR_TypeId} onChange={e => setFormData({...formData, PR_TypeId: e.target.value})} className="w-full p-4 bg-black/40 border border-white/10 rounded-xl text-[10px] font-black uppercase text-white outline-none focus:border-blue-600">
                  <option value="">FAMILLE...</option>
                  {types.map(t => <option key={t.PT_Id} value={t.PT_Id}>{t.PT_Label}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase italic ml-4">Pilote Titulaire</label>
                <select value={formData.PR_PiloteId} onChange={e => setFormData({...formData, PR_PiloteId: e.target.value})} className="w-full p-4 bg-black/40 border border-white/10 rounded-xl text-[10px] font-black uppercase text-white outline-none focus:border-blue-600">
                  <option value="">DÉSIGNER...</option>
                  {collaborateurs.map(u => <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName} {u.U_LastName}</option>)}
                </select>
              </div>

              <button type="submit" className="w-full py-5 bg-blue-600 rounded-xl font-black uppercase text-[10px] tracking-widest italic border-none cursor-pointer mt-8 hover:bg-white hover:text-blue-600 transition-all shadow-lg">
                VALIDER DANS LA CARTOGRAPHIE
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
      `}</style>
    </div>
  );
}

function InputSDE({ label, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black text-slate-500 uppercase italic ml-4">{label}</label>
      <input 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-4 bg-black/40 border border-white/10 rounded-xl text-[10px] font-black uppercase text-white outline-none focus:border-blue-600"
      />
    </div>
  );
}