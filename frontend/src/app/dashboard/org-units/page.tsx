/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : GESTION DES UNITÉS ORGANIQUES (SDE KERNEL)
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage de la structure et des autorités (§5.3 ISO 9001).
 * RÉFÉRENTIEL : types/elite-sde.ts (STRICT).
 * DESIGN : Elite High-Density / Table-View / No-Scroll / Full-Viewport.
 * -------------------------------------------------------------------------
 */

"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  Layers, Plus, Search, RefreshCw, Edit3, Trash2, 
  Building2, GitBranch, ShieldCheck, Activity, 
  Fingerprint, ChevronRight, LayoutGrid, Save, X, Loader2
} from "lucide-react";
import apiClient from "@/core/api/api-client";
import { cn } from "@/core/utils/cn";
import { toast, Toaster } from "sonner";

interface OrgUnit {
  OU_Id: string;
  OU_Name: string;
  OU_Code: string;
  OU_TypeId: string;
  OU_SiteId: string;
  OU_ParentId: string | null;
  OU_IsActive: boolean;
  OU_Type?: { OUT_Label: string };
  OU_Site?: { S_Name: string };
  OU_Parent?: { OU_Name: string };
}

export default function OrgUnitsPage() {
  const [units, setUnits] = useState<OrgUnit[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    OU_Id: "",
    OU_Name: "",
    OU_Code: "",
    OU_TypeId: "",
    OU_SiteId: "",
    OU_ParentId: "",
    OU_IsActive: true,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [uRes, sRes, tRes] = await Promise.all([
        apiClient.get("/org-units"),
        apiClient.get("/sites"),
        apiClient.get("/org-unit-types"),
      ]);
      setUnits(uRes.data?.data || uRes.data || []);
      setSites(sRes.data?.data || sRes.data || []);
      setTypes(tRes.data?.data || tRes.data || []);
    } catch (e) {
      toast.error("RUPTURE DE SYNCHRONISATION KERNEL");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredUnits = useMemo(() => {
    return units.filter(u => 
      u.OU_Name.toLowerCase().includes(search.toLowerCase()) || 
      u.OU_Code?.toLowerCase().includes(search.toLowerCase())
    );
  }, [units, search]);

  const handleEdit = (u: OrgUnit) => {
    setFormData({
      OU_Id: u.OU_Id,
      OU_Name: u.OU_Name,
      OU_Code: u.OU_Code || "",
      OU_TypeId: u.OU_TypeId,
      OU_SiteId: u.OU_SiteId,
      OU_ParentId: u.OU_ParentId || "",
      OU_IsActive: u.OU_IsActive,
    });
    setShowEditor(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...formData, OU_Name: formData.OU_Name.toUpperCase(), OU_Code: formData.OU_Code.toUpperCase(), OU_ParentId: formData.OU_ParentId || null };
      if (formData.OU_Id) await apiClient.put(`/org-units/${formData.OU_Id}`, payload);
      else await apiClient.post("/org-units", payload);
      
      toast.success("MATRICE ORGANIQUE MISE À JOUR");
      setShowEditor(false);
      resetForm();
      fetchData();
    } catch {
      toast.error("ERREUR DE SCELLAGE SDE");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ OU_Id: "", OU_Name: "", OU_Code: "", OU_TypeId: "", OU_SiteId: "", OU_ParentId: "", OU_IsActive: true });
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A]">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <span className="text-blue-600 font-black uppercase text-[9px] tracking-[0.5em] mt-4 animate-pulse italic">Kernel Anatomy Scan...</span>
    </div>
  );

  return (
    <div className="ml-72 h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col p-6 overflow-hidden relative">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER SOUVERAIN */}
      <header className="flex justify-between items-center border-b border-white/10 pb-4 mb-6 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black uppercase tracking-tighter m-0 flex items-center gap-3">
            <Layers className="text-blue-500" size={32} /> Unités <span className="text-blue-500">Organiques</span>
          </h1>
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] m-0 italic">ISO 9001 §5.3 • Matrice de Responsabilités & Autorités</p>
        </div>
        <div className="flex gap-4">
          <div className="relative w-80 group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            <input 
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="RECHERCHER DANS LA STRUCTURE..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-[11px] font-black uppercase outline-none focus:border-blue-600 transition-all text-white italic" 
            />
          </div>
          <button onClick={() => { resetForm(); setShowEditor(true); }} className="bg-blue-600 hover:bg-white hover:text-blue-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase flex items-center gap-3 transition-all italic shadow-2xl shadow-blue-600/20">
            <Plus size={18} strokeWidth={3} /> Créer Unité
          </button>
          <button onClick={fetchData} className="p-3 bg-white/5 rounded-xl border border-white/10 text-slate-400 hover:text-white cursor-pointer"><RefreshCw size={18} /></button>
        </div>
      </header>

      {/* 📊 TABLEAU HAUTE DENSITÉ (No-Scroll Page) */}
      <main className="flex-1 min-h-0 bg-[#151A2D] border border-white/5 rounded-[3rem] overflow-hidden flex flex-col shadow-4xl relative">
        <div className="absolute top-0 right-0 p-20 opacity-[0.02] pointer-events-none rotate-12">
          <ShieldCheck size={400} />
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#151A2D]/95 backdrop-blur-md z-20 border-b border-white/10">
              <tr className="text-[9px] text-slate-500 uppercase font-black italic tracking-[0.2em]">
                <th className="px-8 py-6">Code & Désignation</th>
                <th className="px-8 py-6 text-center">Type Organique</th>
                <th className="px-8 py-6">Rattachement / Site</th>
                <th className="px-8 py-6 text-center">Statut</th>
                <th className="px-8 py-6 text-right">Actions CRUD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[11px]">
              {filteredUnits.map(u => (
                <tr key={u.OU_Id} className={cn("group hover:bg-blue-600/5 transition-all", !u.OU_IsActive && "opacity-30")}>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-600/10 rounded-xl text-blue-500 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Building2 size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-white uppercase italic tracking-tight text-sm">{u.OU_Name}</span>
                        <span className="text-[9px] text-blue-500 font-bold uppercase tracking-widest">{u.OU_Code}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase italic text-slate-400 tracking-wider">
                      {u.OU_Type?.OUT_Label || 'N/A'}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase italic text-slate-300">
                        <GitBranch size={12} className="text-slate-600" />
                        {u.OU_Parent?.OU_Name || 'UNITÉ RACINE'}
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
                        <MapPin size={10} /> {u.OU_Site?.S_Name || 'SITE NON SCELLÉ'}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase italic tracking-widest border", u.OU_IsActive ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500")}>
                      <Activity size={10} className={u.OU_IsActive ? "animate-pulse" : ""} />
                      {u.OU_IsActive ? 'Actif' : 'Révoqué'}
                    </div>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => handleEdit(u)} className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-blue-500 border border-white/10 cursor-pointer shadow-lg active:scale-90"><Edit3 size={16}/></button>
                      <button className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-red-500 border border-white/10 cursor-pointer shadow-lg active:scale-90"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* 🏁 FOOTER SDE */}
      <footer className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center opacity-30 shrink-0 italic px-2">
        <div className="flex items-center gap-6">
          <Fingerprint size={32} className="text-blue-600" />
          <div className="flex flex-col leading-none">
            <p className="text-[11px] font-black uppercase tracking-[0.4em] m-0 mb-1 text-white">SDE Organic Engine</p>
            <p className="text-[8px] font-bold text-slate-700 uppercase tracking-widest m-0 leading-none">Kernel Architecture • 2026</p>
          </div>
        </div>
        <Activity size={24} className="text-emerald-500 animate-pulse" />
      </footer>

      {/* 🛠️ EDITEUR LATÉRAL (Drawer Matrix) */}
      {showEditor && (
        <div className="absolute inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-all animate-in fade-in">
          <div className="w-112.5 h-screen bg-[#0B0F1A] border-l border-white/10 shadow-4xl p-10 flex flex-col gap-8 animate-in slide-in-from-right duration-300">
            <header className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black uppercase italic m-0 tracking-tighter">
                  {formData.OU_Id ? "Mutation" : "Nouveau"} <span className="text-blue-500">Segment</span>
                </h2>
                <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest italic mt-1 leading-none">Éditeur de structure organique §5.3</p>
              </div>
              <button onClick={() => setShowEditor(false)} className="p-3 bg-white/5 rounded-xl text-slate-500 hover:text-white cursor-pointer border border-white/10"><X size={20}/></button>
            </header>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
              <SDEInput label="Nom de l'unité" value={formData.OU_Name} onChange={(v: string) => setFormData({...formData, OU_Name: v})} placeholder="NOM EXEMPLE" />
              <div className="grid grid-cols-2 gap-4">
                <SDEInput label="Code Interne" value={formData.OU_Code} onChange={(v: string) => setFormData({...formData, OU_Code: v})} placeholder="CODE" />
                <SDESelect label="Statut Activation" value={formData.OU_IsActive ? "true" : "false"} onChange={(v: any) => setFormData({...formData, OU_IsActive: v === "true"})}>
                  <option value="true">ACTIF</option>
                  <option value="false">RÉVOQUÉ</option>
                </SDESelect>
              </div>
              <SDESelect label="Typologie Organique" value={formData.OU_TypeId} onChange={(v: any) => setFormData({...formData, OU_TypeId: v})}>
                <option value="">SÉLECTIONNER...</option>
                {types.map(t => <option key={t.OUT_Id} value={t.OUT_Id}>{t.OUT_Label}</option>)}
              </SDESelect>
              <SDESelect label="Ancrage Géographique (Site)" value={formData.OU_SiteId} onChange={(v: any) => setFormData({...formData, OU_SiteId: v})}>
                <option value="">CHOISIR LE SITE...</option>
                {sites.map(s => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
              </SDESelect>
              <SDESelect label="Unité Parente (Hiérarchie)" value={formData.OU_ParentId} onChange={(v: any) => setFormData({...formData, OU_ParentId: v})}>
                <option value="">-- UNITÉ RACINE --</option>
                {units.map(u => <option key={u.OU_Id} value={u.OU_Id}>{u.OU_Name}</option>)}
              </SDESelect>

              <button disabled={submitting} type="submit" className="mt-auto bg-blue-600 hover:bg-white hover:text-blue-600 p-6 rounded-2xl font-black uppercase italic tracking-[0.4em] transition-all flex items-center justify-center gap-4 text-xs shadow-3xl cursor-pointer active:scale-95 text-white">
                {submitting ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Sceller le segment</>}
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(37, 99, 235, 0.2); border-radius: 10px; }`}</style>
    </div>
  );
}

// --- 🧩 SDE ATOMIC COMPONENTS ---

function SDEInput({ label, value, onChange, placeholder }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">{label}</label>
      <input 
        value={value} onChange={(e) => onChange(e.target.value.toUpperCase())}
        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[11px] font-black text-white italic outline-none focus:border-blue-600 transition-all placeholder:text-slate-800"
        placeholder={placeholder} 
      />
    </div>
  );
}

function SDESelect({ label, value, onChange, children }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">{label}</label>
      <select 
        value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[11px] font-black text-white italic outline-none focus:border-blue-600 appearance-none cursor-pointer"
      >
        {children}
      </select>
    </div>
  );
}

function MapPin({ size, className }: { size: number, className?: string }) {
  return <Building2 size={size} className={className} />;
}