/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 👥 MODULE : REGISTRE DES TIERS (ELITE SDE)
 * ---------------------------------------------------------------------------
 * RÔLE : Centralisation des Parties Intéressées (PI).
 * CONFORMITÉ : ISO 9001/14001 §4.2 (Besoins & Attentes).
 * DESIGN : 100dvh / High-Density ClickUp.
 * ---------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 23:15 GMT
 */

"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import apiClient from "@/core/api/api-client";
import {
  Briefcase, ChevronRight, Mail,
  MessageSquare, Plus, Search, ShieldCheck, Target, Users, X, RefreshCw
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { cn } from "@/core/utils/cn";

export default function TiersPage() {
  const [tiers, setTiers] = useState<any[]>([]);
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({ TR_Name: "", TR_Email: "", TR_Type: "CLIENT" });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/tiers");
      setTiers(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch { toast.error("Échec de synchronisation du registre."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = toast.loading("Scellage du registre...");
    try {
      const payload = { ...form, TR_Name: form.TR_Name.toUpperCase() };
      if (editingId) await apiClient.patch(`/tiers/${editingId}`, payload);
      else await apiClient.post("/tiers", payload);
      toast.success("Registre mis à jour.", { id: tid });
      setIsModalOpen(false);
      fetchData();
    } catch { toast.error("Erreur d'écriture Master.", { id: tid }); }
  };

  const filtered = useMemo(() => tiers.filter(t => 
    t.TR_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.TR_Type.toLowerCase().includes(searchTerm.toLowerCase())
  ), [tiers, searchTerm]);

  if (loading && tiers.length === 0) return <ViewLoader label="Intelligence Tiers SDE..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      <header className="shrink-0 p-8 border-b border-white/5 bg-black/40 flex flex-col xl:flex-row justify-between items-center gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-2">
          <div className="flex items-center gap-3 text-blue-500 text-[10px] tracking-[0.4em]">
            <ShieldCheck size={16} /> QUALISOFT SOVEREIGN SECURITY
          </div>
          <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0 italic">Intelligence <span className="text-blue-500">Tiers</span></h1>
          <p className="text-slate-500 text-[9px] tracking-[0.3em] m-0">
            {"Couverture Parties Intéressées : $$PI_{coverage} = \\frac{Tier_{active}}{Tier_{total}} = 100\\%$$"}
          </p>
        </div>
        <button onClick={() => { setEditingId(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] border-none cursor-pointer hover:bg-white hover:text-blue-600 transition-all shadow-xl flex items-center gap-3">
          <Plus size={18} strokeWidth={3} /> NOUVEAU TIERS
        </button>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col p-8 gap-8">
        <div className="shrink-0 relative max-w-2xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="RECHERCHER DANS LE REGISTRE..." className="w-full bg-slate-900/40 border border-white/5 rounded-4xl py-6 pl-16 pr-8 text-[10px] font-black italic text-white focus:border-blue-500 outline-none transition-all" />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filtered.map((tier) => (
              <div key={tier.TR_Id} onClick={() => { setSelectedTier(tier); setIsDetailOpen(true); }} className="bg-slate-900/40 border border-white/5 p-10 rounded-[3.5rem] relative group hover:border-blue-500/40 transition-all cursor-pointer shadow-2xl overflow-hidden">
                <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-all mb-8">
                   {tier.TR_Type === "CLIENT" ? <Users size={30} /> : <Briefcase size={30} />}
                </div>
                <h3 className="text-2xl font-black tracking-tighter m-0 mb-6 truncate">{tier.TR_Name}</h3>
                <div className="flex justify-between items-center border-t border-white/5 pt-6">
                  <span className="text-[9px] px-4 py-1.5 bg-blue-600/10 text-blue-400 rounded-lg border border-blue-500/20 tracking-widest">{tier.TR_Type}</span>
                  <ChevronRight size={18} className="text-slate-800 group-hover:text-blue-500 group-hover:translate-x-2 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 📄 DRAWER DETAIL */}
      {isDetailOpen && selectedTier && (
        <div className="fixed inset-0 z-100 flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in" onClick={() => setIsDetailOpen(false)} />
          <div className="relative w-full max-w-2xl bg-[#0B0F1A] border-l border-white/10 h-full p-16 shadow-4xl animate-in slide-in-from-right flex flex-col">
            <button onClick={() => setIsDetailOpen(false)} className="self-end p-4 text-slate-500 hover:text-white transition-colors bg-transparent border-none cursor-pointer"><X size={40} /></button>
            <div className="flex-1 overflow-y-auto custom-scrollbar text-left space-y-12 pr-4">
               <div>
                 <h2 className="text-5xl font-black italic m-0 tracking-tighter text-white uppercase leading-none">{selectedTier.TR_Name}</h2>
                 <p className="text-blue-500 text-sm font-bold mt-4 lowercase flex items-center gap-3"><Mail size={16}/> {selectedTier.TR_Email || "N/A"}</p>
               </div>
               <div className="grid grid-cols-2 gap-8">
                 <StatCard icon={MessageSquare} label="Réclamations" val={selectedTier.stats?.reclamations || 0} color="blue" />
                 <StatCard icon={Target} label="Actions PAQ" val={selectedTier.stats?.actions || 0} color="emerald" />
               </div>
            </div>
          </div>
        </div>
      )}

      {/* 📝 FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-200 bg-black/95 flex items-center justify-center p-6 backdrop-blur-3xl">
          <form onSubmit={handleSubmit} className="bg-[#0B0F1A] border border-white/10 p-16 rounded-[4rem] w-full max-w-2xl animate-in zoom-in-95 text-left">
            <h2 className="text-4xl font-black italic text-white mb-12 m-0 leading-none">Registre <span className="text-blue-600">Tiers</span></h2>
            <div className="space-y-8">
              <Field label="Raison Sociale *" val={form.TR_Name} onChange={(v:any) => setForm({...form, TR_Name:v})} />
              <Field label="Email" val={form.TR_Email} onChange={(v:any) => setForm({...form, TR_Email:v})} type="email" />
              <Select label="Type Stratégique" val={form.TR_Type} onChange={(v:any) => setForm({...form, TR_Type:v})}>
                <option value="CLIENT">CLIENT</option><option value="FOURNISSEUR">FOURNISSEUR</option>
              </Select>
              <button type="submit" className="w-full py-8 bg-blue-600 text-white rounded-[2.5rem] font-black text-xs tracking-widest border-none cursor-pointer hover:bg-white hover:text-blue-600 transition-all shadow-2xl">VALIDER AU REGISTRE MASTER</button>
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-full text-[10px] text-slate-500 font-black border-none bg-transparent cursor-pointer hover:text-white transition-colors">ANNULER</button>
            </div>
          </form>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

function StatCard({ icon: Icon, label, val, color }: any) {
  const colors: any = { blue: "text-blue-500", emerald: "text-emerald-500" };
  return (
    <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/5 shadow-inner">
      <Icon className={cn(colors[color], "mb-6")} size={30} />
      <p className="text-[10px] text-slate-500 tracking-widest font-black m-0 mb-3">{label}</p>
      <p className="text-5xl font-black italic text-white m-0 leading-none">{val}</p>
    </div>
  );
}

function Field({ label, val, onChange, type = "text" }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] text-slate-500 tracking-widest ml-4">{label}</label>
      <input type={type} required value={val} onChange={e => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm font-black text-white italic outline-none focus:border-blue-600 transition-all uppercase" />
    </div>
  );
}

function Select({ label, val, onChange, children }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] text-slate-500 tracking-widest ml-4">{label}</label>
      <select value={val} onChange={e => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm font-black text-white italic outline-none cursor-pointer">
        {children}
      </select>
    </div>
  );
}

function ViewLoader({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-blue-600 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed uppercase">{label}</span>
    </div>
  );
}