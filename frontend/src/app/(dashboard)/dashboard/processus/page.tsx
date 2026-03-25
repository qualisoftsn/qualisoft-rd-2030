/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🗺️ MODULE : CARTOGRAPHIE DES PROCESSUS (ISO 9001 §4.4)
 * -------------------------------------------------------------------------
 * RÔLE : Inventaire centralisé et modélisation du Système de Management.
 * DESIGN : Elite High-Density, 100dvh, ClickUp Registry Style.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 19:42 GMT
 */

'use client';

import React, { useCallback, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import apiClient from "@/core/api/api-client";
import { 
  ArrowUpRight, Edit3, GitBranch, Layers, Plus, 
  ShieldCheck, X, Search, RefreshCw 
} from "lucide-react";
import { toast, Toaster } from "sonner";

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function ProcessusPage() {
  const [items, setItems] = useState<any[]>([]);
  const [collaborateurs, setCollaborateurs] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
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
    } catch {
      toast.error("RUPTURE DE FLUX MATRIX §4.4");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredItems = useMemo(() => {
    const term = search.toLowerCase().trim();
    return items.filter(i => 
      i.PR_Libelle?.toLowerCase().includes(term) || i.PR_Code?.toLowerCase().includes(term)
    );
  }, [items, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = toast.loading("Scellage Matrix...");
    try {
      if (selected) await apiClient.patch(`/processus/${selected.PR_Id}`, formData);
      else await apiClient.post("/processus", formData);
      toast.success("REGISTRE CARTOGRAPHIQUE MIS À JOUR", { id: tid });
      setIsModalOpen(false);
      loadData();
    } catch { toast.error("ÉCHEC DU SCELLAGE", { id: tid }); }
  };

  const openModal = (pr?: any) => {
    setSelected(pr || null);
    setFormData({
      PR_Code: pr?.PR_Code || "", PR_Libelle: pr?.PR_Libelle || "",
      PR_TypeId: pr?.PR_TypeId || "", PR_PiloteId: pr?.PR_PiloteId || ""
    });
    setIsModalOpen(true);
  };

  if (loading) return <LoadingScreen label="Synchronisation SMI Core..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER TACTIQUE */}
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-xl z-50 gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-3">
          <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0 italic flex items-center gap-5">
            <GitBranch className="text-blue-600" size={40} /> Cartographie <span className="text-blue-600">SMI</span>
          </h1>
          <p className="text-slate-500 text-[9px] tracking-[0.4em] m-0 flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" /> ISO 9001 §4.4 • Gouvernance Matrix
          </p>
        </div>

        <div className="flex gap-4 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-80 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-500 transition-all" size={18} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="FILTRER LES FLUX..." className="w-full bg-black/40 border-2 border-white/5 rounded-3xl py-5 pl-16 pr-6 text-[11px] font-black italic text-white outline-none focus:border-blue-600 transition-all" />
          </div>
          <button onClick={() => openModal()} className="bg-blue-600 hover:bg-white hover:text-blue-600 px-10 py-5 rounded-3xl text-[10px] shadow-4xl border-none cursor-pointer text-white italic transition-all active:scale-95 flex items-center gap-3">
            <Plus size={18} /> Nouveau
          </button>
        </div>
      </header>

      {/* 📋 WORKZONE */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-10">
        <div className="max-w-400 mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-20">
          {filteredItems.map((pr) => (
            <div key={pr.PR_Id} className="bg-[#151B2B] border-2 border-white/5 p-10 rounded-[3.5rem] group hover:border-blue-600/30 transition-all shadow-4xl relative overflow-hidden flex flex-col justify-between h-105">
              <div className="absolute -right-12 -top-12 text-blue-600/5 group-hover:text-blue-600/10 transition-all duration-1000 rotate-12 pointer-events-none">
                <GitBranch size={220} />
              </div>

              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                  <span className="px-4 py-2 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-xl text-[10px] tracking-widest">{pr.PR_Code}</span>
                  <button onClick={() => openModal(pr)} className="p-3 text-slate-500 hover:text-white bg-black/40 rounded-xl border border-white/5 cursor-pointer transition-all"><Edit3 size={18} /></button>
                </div>
                <h4 className="text-3xl font-black tracking-tighter leading-tight m-0 group-hover:text-blue-400 transition-colors uppercase">{pr.PR_Libelle}</h4>
                <div className="flex items-center gap-3 text-slate-500 text-[9px] tracking-[0.2em] italic font-black">
                  <Layers size={14} className="text-blue-500" /> {pr.PR_Type?.PT_Label || "PROCESSUS TRANSVERSAL"}
                </div>

                <div className="bg-black/40 p-6 rounded-4xl border border-white/5 flex items-center gap-5 shadow-inner">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-black text-blue-500 text-lg">
                    {pr.PR_Pilote?.U_FirstName?.[0]}{pr.PR_Pilote?.U_LastName?.[0]}
                  </div>
                  <div className="text-left overflow-hidden">
                    <p className="text-[8px] text-slate-600 tracking-[0.3em] m-0 mb-1">PILOTE TITULAIRE</p>
                    <p className="text-[12px] text-slate-200 m-0 truncate italic">{pr.PR_Pilote?.U_FirstName} {pr.PR_Pilote?.U_LastName}</p>
                  </div>
                </div>
              </div>

              <Link href={`/dashboard/processus/cockpit/${pr.PR_Id}`} className="mt-8 bg-blue-600 text-white py-5 rounded-4xl font-black uppercase italic text-[10px] tracking-widest hover:bg-white hover:text-blue-600 transition-all no-underline flex items-center justify-center gap-3 relative z-10 shadow-4xl border-none">
                Ouvrir Cockpit <ArrowUpRight size={18} />
              </Link>
            </div>
          ))}
        </div>
      </main>

      {/* 📟 MODALE CONFIG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#0F172A] p-12 border-l border-white/5 animate-in slide-in-from-right duration-500 flex flex-col shadow-4xl overflow-y-auto custom-scrollbar">
            <header className="flex justify-between items-center mb-16">
              <h2 className="text-3xl font-black italic m-0">Config. <span className="text-blue-600">SMI</span></h2>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white border-none cursor-pointer transition-all"><X size={24} /></button>
            </header>

            <form onSubmit={handleSubmit} className="space-y-10 flex-1 flex flex-col justify-between">
              <div className="space-y-10">
                <InputSDE label="Code Radical" value={formData.PR_Code} onChange={(v: string) => setFormData({...formData, PR_Code: v.toUpperCase()})} placeholder="EX: RH-01" />
                <InputSDE label="Désignation" value={formData.PR_Libelle} onChange={(v: string) => setFormData({...formData, PR_Libelle: v.toUpperCase()})} placeholder="Nom du processus..." />
                
                <SelectSDE label="Typologie" value={formData.PR_TypeId} onChange={(v: string) => setFormData({...formData, PR_TypeId: v})} options={types.map(t => ({ id: t.PT_Id, label: t.PT_Label }))} />
                <SelectSDE label="Pilote Responsable" value={formData.PR_PiloteId} onChange={(v: string) => setFormData({...formData, PR_PiloteId: v})} options={collaborateurs.map(u => ({ id: u.U_Id, label: `${u.U_FirstName} ${u.U_LastName}` }))} />
              </div>

              <button type="submit" className="w-full py-8 bg-blue-600 rounded-[2.5rem] font-black uppercase text-[12px] tracking-widest italic border-none cursor-pointer mt-12 hover:bg-white hover:text-blue-600 transition-all shadow-4xl text-white">
                Valider la Matrice
              </button>
            </form>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

/* HELPER COMPONENTS */
function InputSDE({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-4 text-left">
      <label className="text-[10px] text-slate-500 tracking-[0.4em] ml-6">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-slate-950 border-2 border-white/5 rounded-4xl p-6 text-[11px] font-black uppercase italic text-white outline-none focus:border-blue-600 transition-all shadow-inner" />
    </div>
  );
}

function SelectSDE({ label, value, onChange, options }: any) {
  return (
    <div className="space-y-4 text-left">
      <label className="text-[10px] text-slate-500 tracking-[0.4em] ml-6">{label}</label>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-950 border-2 border-white/5 rounded-4xl p-6 text-[11px] font-black uppercase italic text-white outline-none focus:border-blue-600 appearance-none cursor-pointer shadow-inner">
          <option value="">SÉLECTIONNER...</option>
          {options.map((o: any) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 text-[10px]">▼</div>
      </div>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-blue-500 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10">{label}</span>
    </div>
  );
}
