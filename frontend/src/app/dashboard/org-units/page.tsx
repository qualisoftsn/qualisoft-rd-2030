/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : CARTOGRAPHIE DES UNITÉS ORGANIQUES (SDE KERNEL)
 * -------------------------------------------------------------------------
 * RÔLE : Maillage hiérarchique et distribution des autorités (§5.3 ISO 9001).
 * RÉFÉRENTIEL : types/elite-sde.ts (Prisma Strict).
 * DESIGN : Elite High-Density / No-Scroll / Sovereign Tree / Full-Viewport.
 * -------------------------------------------------------------------------
 */

"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  Activity,
  Archive,
  Building2,
  ChevronDown,
  ChevronRight,
  Edit3,
  Fingerprint,
  GitBranch,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Users,
  Zap,
  ShieldCheck,
  LayoutGrid
} from "lucide-react";
import apiClient from "@/core/api/api-client";
import { cn } from "@/core/utils/cn";
import { toast, Toaster } from "sonner";

// --- 🛡️ INTERFACES SDE STRICTES ---
interface ExtendedOrgUnit {
  OU_Id: string;
  OU_Name: string;
  OU_Code: string | null;
  OU_TypeId: string;
  OU_SiteId: string;
  OU_ParentId: string | null;
  OU_IsActive: boolean;
  OU_Type?: { OUT_Id: string; OUT_Label: string };
  OU_Site?: { S_Id: string; S_Name: string };
  children?: ExtendedOrgUnit[];
  _count?: { OU_Users: number; children: number };
}

export default function OrgUnitsPage() {
  const [units, setUnits] = useState<ExtendedOrgUnit[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
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

  // --- 🛰️ SYNC KERNEL ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [uRes, sRes, tRes] = await Promise.all([
        apiClient.get("/org-units"),
        apiClient.get("/sites"),
        apiClient.get("/org-unit-types"),
      ]);
      const flat = uRes.data?.data || uRes.data || [];
      setUnits(buildHierarchy(flat));
      setSites(sRes.data?.data || sRes.data || []);
      setTypes(tRes.data?.data || tRes.data || []);
    } catch (e) {
      toast.error("RUPTURE DE SYNCHRONISATION SDE");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const buildHierarchy = (flat: ExtendedOrgUnit[]) => {
    const map = new Map<string, ExtendedOrgUnit>();
    const roots: ExtendedOrgUnit[] = [];
    flat.forEach((u) => map.set(u.OU_Id, { ...u, children: [] }));
    flat.forEach((u) => {
      if (u.OU_ParentId && map.has(u.OU_ParentId)) {
        map.get(u.OU_ParentId)!.children!.push(map.get(u.OU_Id)!);
      } else {
        roots.push(map.get(u.OU_Id)!);
      }
    });
    return roots;
  };

  // --- 🔐 SCELLAGE ORGANIQUE ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.OU_Name || !formData.OU_TypeId || !formData.OU_SiteId) {
      return toast.error("DONNÉES INCOMPLÈTES §5.3");
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        OU_ParentId: formData.OU_ParentId || null,
        OU_Code: formData.OU_Code.toUpperCase(),
        OU_Name: formData.OU_Name.toUpperCase(),
      };

      if (formData.OU_Id) {
        await apiClient.put(`/org-units/${formData.OU_Id}`, payload);
        toast.success("MUTATION SCELLÉE");
      } else {
        await apiClient.post("/org-units", payload);
        toast.success("SEGMENT CRÉÉ DANS LA MATRICE");
      }
      resetForm();
      fetchData();
    } catch (err) {
      toast.error("ERREUR DE SCELLAGE ORGANIQUE");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => setFormData({ OU_Id: "", OU_Name: "", OU_Code: "", OU_TypeId: "", OU_SiteId: "", OU_ParentId: "", OU_IsActive: true });

  const toggle = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpanded(next);
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <span className="text-blue-600 font-black uppercase text-[9px] tracking-[0.5em] animate-pulse italic">Scanning Matrix Anatomy...</span>
    </div>
  );

  return (
    <div className="ml-72 h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col p-6 overflow-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER SOUVERAIN (Compact) */}
      <header className="flex justify-between items-center border-b border-white/10 pb-4 mb-6 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black uppercase tracking-tighter m-0 flex items-center gap-3 leading-none">
            <Layers className="text-blue-500" size={28} /> Cartographie <span className="text-blue-500">Organique</span>
          </h1>
          <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em] m-0 italic">ISO 9001 §5.3 • Maillage Territorial & Autorités</p>
        </div>
        <div className="flex gap-4">
          <div className="relative w-64">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="SCANNER LA STRUCTURE..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-[10px] font-black uppercase outline-none focus:border-blue-600 italic text-white" 
            />
          </div>
          <button onClick={fetchData} className="p-3 bg-white/5 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer">
            <RefreshCw size={16} />
          </button>
        </div>
      </header>

      {/* 📊 GRID ISOLATION (No-Scroll) */}
      <main className="flex-1 min-h-0 grid grid-cols-12 gap-6 overflow-hidden">
        
        {/* COL 1: FORMULAIRE DE MUTATION (§5.3) */}
        <aside className="col-span-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
          <div className="bg-[#151A2D] border border-white/5 p-8 rounded-[3rem] shadow-4xl relative overflow-hidden flex flex-col gap-6">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12 pointer-events-none">
              <ShieldCheck size={180} />
            </div>
            
            <header className="flex items-center gap-3">
               <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500 border border-blue-500/20">
                 {formData.OU_Id ? <Edit3 size={20}/> : <Plus size={20} />}
               </div>
               <div className="flex flex-col">
                 <h2 className="text-[11px] font-black uppercase text-white m-0 italic">{formData.OU_Id ? "Mutation Segment" : "Scellage Organique"}</h2>
                 <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest leading-none">Éditeur de structure SDE</span>
               </div>
            </header>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <SDEInput label="Désignation Unité" value={formData.OU_Name} onChange={(v: string) => setFormData({ ...formData, OU_Name: v.toUpperCase() })} placeholder="EX: SERVICE QUALITÉ" />
              
              <div className="grid grid-cols-2 gap-4">
                <SDEInput label="Code SDE" value={formData.OU_Code} onChange={(v: string) => setFormData({ ...formData, OU_Code: v.toUpperCase() })} placeholder="EX: QUA-01" />
                <SDESelect label="Activation Matrix" value={formData.OU_IsActive ? "true" : "false"} onChange={(v: any) => setFormData({ ...formData, OU_IsActive: v === "true" })}>
                  <option value="true" className="bg-[#151A2D]">ACTIF</option>
                  <option value="false" className="bg-[#151A2D]">RÉVOQUÉ</option>
                </SDESelect>
              </div>

              <SDESelect label="Typologie Organique" value={formData.OU_TypeId} onChange={(v: any) => setFormData({ ...formData, OU_TypeId: v })}>
                <option value="">SÉLECTIONNER TYPE...</option>
                {types.map((t) => <option key={t.OUT_Id} value={t.OUT_Id} className="bg-[#151A2D]">{t.OUT_Label}</option>)}
              </SDESelect>

              <SDESelect label="Ancrage Territorial (Site)" value={formData.OU_SiteId} onChange={(v: any) => setFormData({ ...formData, OU_SiteId: v })}>
                <option value="">CHOISIR SITE...</option>
                {sites.map((s) => <option key={s.S_Id} value={s.S_Id} className="bg-[#151A2D]">{s.S_Name}</option>)}
              </SDESelect>

              <SDESelect label="Unité de Rattachement (Parent)" value={formData.OU_ParentId} onChange={(v: any) => setFormData({ ...formData, OU_ParentId: v })}>
                <option value="">-- UNITÉ RACINE --</option>
                {/* On ne liste que les unités existantes pour le parent */}
                {units.map((u) => <option key={u.OU_Id} value={u.OU_Id} className="bg-[#151A2D]">{u.OU_Name}</option>)}
              </SDESelect>

              <div className="pt-4 flex gap-3 shrink-0">
                {formData.OU_Id && (
                  <button type="button" onClick={resetForm} className="flex-1 py-4 bg-white/5 text-slate-500 rounded-2xl text-[10px] font-black uppercase italic border border-white/10 cursor-pointer hover:bg-white/10 transition-all">Annuler</button>
                )}
                <button type="submit" disabled={submitting} className="flex-2 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase italic shadow-2xl shadow-blue-600/20 border-none cursor-pointer hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center gap-3">
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
                  {formData.OU_Id ? "Appliquer Mutation" : "Sceller Segment"}
                </button>
              </div>
            </form>
          </div>

          <div className="flex-1 bg-black/30 border border-white/5 p-8 rounded-[3rem] flex flex-col justify-between italic relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
              <Fingerprint size={120} />
            </div>
            <div>
              <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest leading-none mb-3">Souveraineté des Données</p>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Le maillage organique est scellé dans le noyau. Toute mutation modifie instantanément les périmètres d&apos;autorité des pilotes.
              </p>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
               <ShieldCheck size={20} />
               <span className="text-[8px] font-black uppercase tracking-[0.2em]">Matrix Integrity Verified §QS</span>
            </div>
          </div>
        </aside>

        {/* COL 2: SOVEREIGN TREE ENGINE (8/12) */}
        <section className="col-span-8 bg-[#151A2D] border border-white/5 rounded-[3.5rem] shadow-5xl flex flex-col overflow-hidden relative">
          <header className="p-6 bg-black/20 border-b border-white/5 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
               <GitBranch size={20} className="text-blue-500" />
               <h3 className="text-[12px] font-black uppercase italic m-0">Hiérarchie <span className="text-blue-500">Organisationnelle</span></h3>
            </div>
            <div className="flex items-center gap-4">
               <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-4 py-1.5 rounded-full font-black uppercase italic border border-emerald-500/20 flex items-center gap-2">
                 <Activity size={10} className="animate-pulse" /> Maillage Actif
               </span>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            {renderTree(units, 0, toggle, expanded, search, (u) => {
              setFormData({
                OU_Id: u.OU_Id,
                OU_Name: u.OU_Name,
                OU_Code: u.OU_Code || "",
                OU_TypeId: u.OU_TypeId,
                OU_SiteId: u.OU_SiteId,
                OU_ParentId: u.OU_ParentId || "",
                OU_IsActive: u.OU_IsActive,
              });
            })}
          </div>
        </section>
      </main>

      {/* 🏁 FOOTER TACTIQUE */}
      <footer className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center opacity-30 shrink-0 italic w-full px-2">
        <div className="flex items-center gap-6">
          <Building2 size={32} className="text-blue-600" />
          <div className="flex flex-col leading-none">
            <p className="text-[11px] font-black uppercase tracking-[0.4em] m-0 mb-1 text-white leading-none">Organic Engine Matrix</p>
            <p className="text-[8px] font-bold text-slate-700 uppercase tracking-widest m-0 leading-none">Elite SDE Architecture • ISO Compliance System</p>
          </div>
        </div>
        <div className="flex items-center gap-10">
           <div className="flex flex-col items-end">
             <span className="text-[9px] font-black uppercase text-blue-500 italic">Network Sovereignty Node</span>
             <span className="text-[7px] text-slate-600 uppercase">Qualisoft Elite v2026</span>
           </div>
           <Activity size={24} className="text-emerald-500 animate-pulse" />
        </div>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(37, 99, 235, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37, 99, 235, 0.3); }
      `}</style>
    </div>
  );
}

// --- 🌳 RECURSIVE RENDER ENGINE ---



function renderTree(
  list: ExtendedOrgUnit[],
  level: number,
  toggle: (id: string) => void,
  expanded: Set<string>,
  search: string,
  onEdit: (u: ExtendedOrgUnit) => void,
) {
  return list.map((unit) => {
    const hasChildren = unit.children && unit.children.length > 0;
    const isExpanded = expanded.has(unit.OU_Id);
    const matches = search === "" || 
      unit.OU_Name.toLowerCase().includes(search.toLowerCase()) || 
      unit.OU_Code?.toLowerCase().includes(search.toLowerCase());

    if (!matches && !hasChildren) return null;

    return (
      <div key={unit.OU_Id} className="flex flex-col">
        <div className={cn(
          "group flex items-center justify-between p-4 rounded-3xl mb-2 transition-all border border-transparent shadow-sm",
          level === 0 ? "bg-white/5 border-white/10" : "hover:bg-blue-600/5 hover:border-blue-600/20 bg-black/10",
          !unit.OU_IsActive && "opacity-30 grayscale"
        )} style={{ marginLeft: `${level * 30}px` }}>
          
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => toggle(unit.OU_Id)} className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center border-none transition-all cursor-pointer",
              hasChildren ? "bg-white/10 text-blue-500 hover:bg-blue-600 hover:text-white" : "opacity-0 cursor-default pointer-events-none"
            )}>
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            <div className={cn(
              "p-3 rounded-2xl flex items-center justify-center shadow-lg",
              (unit._count?.OU_Users || 0) > 0 ? "bg-blue-600 text-white" : "bg-white/5 text-slate-700"
            )}>
              <Building2 size={18} />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-black uppercase italic text-white tracking-tight">{unit.OU_Name}</span>
                {unit.OU_Code && <span className="text-[8px] font-black bg-black/40 text-blue-500 px-2 py-0.5 rounded-lg border border-blue-500/20 italic uppercase tracking-widest">{unit.OU_Code}</span>}
              </div>
              <div className="flex items-center gap-3 text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-none">
                <span className="text-blue-500/60 flex items-center gap-1 italic"><LayoutGrid size={10} /> {unit.OU_Type?.OUT_Label}</span>
                <span className="flex items-center gap-1"><MapPin size={10} /> {unit.OU_Site?.S_Name}</span>
                {(unit._count?.OU_Users || 0) > 0 && (
                  <span className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/10 italic">
                    <Users size={10} /> {unit._count?.OU_Users} COLLABORATEURS
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
            <button onClick={() => onEdit(unit)} className="p-2.5 bg-white/5 rounded-xl text-slate-400 hover:text-amber-500 border border-white/10 cursor-pointer shadow-lg transition-all"><Edit3 size={16} /></button>
            <button className="p-2.5 bg-white/5 rounded-xl text-slate-400 hover:text-red-500 border border-white/10 cursor-pointer shadow-lg transition-all"><Archive size={16} /></button>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="relative">
            {/* Ligne verticale de hiérarchie */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-white/5" style={{ marginLeft: `${level * 30 + 16}px` }} />
            {renderTree(unit.children!, level + 1, toggle, expanded, search, onEdit)}
          </div>
        )}
      </div>
    );
  });
}

// --- 🧩 SDE ATOMIC COMPONENTS ---

function SDEInput({ label, value, onChange, placeholder }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 italic">{label}</label>
      <input 
        value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-[11px] font-black text-white italic outline-none focus:border-blue-600 transition-all placeholder:text-slate-800 uppercase"
        placeholder={placeholder} 
      />
    </div>
  );
}

function SDESelect({ label, value, onChange, children }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 italic">{label}</label>
      <div className="relative group">
        <select 
          value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-[11px] font-black text-white italic outline-none focus:border-blue-600 appearance-none cursor-pointer uppercase transition-all"
        >
          {children}
        </select>
        <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none group-focus-within:text-blue-500" />
      </div>
    </div>
  );
}

function MapPin({ size, className }: { size: number; className?: string }) {
  return <Building2 size={size} className={className} />; // Fallback icon
}