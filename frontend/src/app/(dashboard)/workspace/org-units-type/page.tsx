/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : CONFIGURATION DES TYPES D'UNITÉS (ORG-UNIT-TYPES)
 * -------------------------------------------------------------------------
 * RÔLE : Définition des méta-données structurelles pour le SMI.
 * DESIGN : Elite High-Density, 100dvh, No-Scroll, Purple Matrix.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 12:30 GMT
 */

"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import apiClient from "@/core/api/api-client";
import { Network, Plus, RefreshCw, Search, Settings, ShieldCheck, Trash2, X, Edit3, Activity } from "lucide-react";
import { toast, Toaster } from "sonner";

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function OrgUnitsTypePage() {
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const loadTypes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/org-unit-types");
      setTypes(res.data?.data || res.data || []);
    } catch {
      toast.error("ÉCHEC DE LECTURE DU REGISTRE ORGANIQUE");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTypes(); }, [loadTypes]);

  if (loading) return <LoadingScreen label="Scan de la Classification Organique..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-purple-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER PURPLE */}
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-xl z-40 gap-8 mt-12 lg:mt-0">
        <div className="text-left space-y-3">
          <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0">Classification <span className="text-purple-500">Organique</span></h1>
          <p className="text-slate-500 text-[10px] tracking-[0.4em] m-0 italic">Hiérarchisation des Grades §5.3</p>
        </div>
        <div className="flex items-center gap-4 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-80 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-500 transition-all" size={18} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="FILTRER GRADES..." className="w-full bg-black/40 border-2 border-white/5 rounded-3xl py-5 pl-16 pr-8 text-[11px] font-black italic text-white outline-none focus:border-purple-600" />
          </div>
          <button onClick={() => setShowModal(true)} className="bg-purple-600 hover:bg-white hover:text-purple-600 px-10 py-5 rounded-3xl text-[10px] flex items-center gap-3 transition-all border-none cursor-pointer text-white italic shadow-4xl"><Plus size={18} /> Nouveau Grade</button>
        </div>
      </header>

      {/* 📋 GRILLE DE TYPES (Scroll Isolé) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-20">
          {types.filter(t => t.OUT_Label.toLowerCase().includes(search.toLowerCase())).map((type) => (
            <div key={type.OUT_Id} className="bg-[#151B2B] border-2 border-white/5 rounded-[4rem] p-10 flex flex-col justify-between group hover:border-purple-600/40 transition-all shadow-4xl relative overflow-hidden h-72">
              <div className="absolute -right-6 -top-6 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000"><Network size={150} /></div>
              
              <div className="relative z-10 flex justify-between items-start">
                 <div className="w-16 h-16 rounded-3xl bg-purple-600/10 text-purple-500 flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-600 group-hover:text-white transition-all"><Network size={28} /></div>
                 <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all">
                    <button className="p-3 bg-white/5 rounded-xl border-none cursor-pointer text-slate-500 hover:text-white"><Edit3 size={16} /></button>
                    <button className="p-3 bg-white/5 rounded-xl border-none cursor-pointer text-slate-500 hover:text-rose-500"><Trash2 size={16} /></button>
                 </div>
              </div>

              <div className="relative z-10 text-left">
                <h3 className="text-3xl tracking-tighter m-0 mb-3">{type.OUT_Label}</h3>
                <div className="flex items-center gap-4">
                  <span className="px-4 py-1.5 bg-purple-600/10 rounded-xl text-[9px] text-purple-400 border border-purple-500/20 tracking-widest">LEVEL {type.OUT_Level || 1}</span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(168,85,247,0.1); border-radius: 10px; }` }} />
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-purple-500 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={60} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center">{label}</span>
    </div>
  );
}
