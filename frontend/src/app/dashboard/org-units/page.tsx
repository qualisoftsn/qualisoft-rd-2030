/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : CARTOGRAPHIE DES UNITÉS ORGANIQUES (SDE KERNEL)
 * -------------------------------------------------------------------------
 * RÔLE : Maillage hiérarchique et autorités (§5.3 ISO 9001).
 * RÉFÉRENTIEL : types/elite-sde.ts (STRICT PRISMA CLONE).
 * DESIGN : Elite High-Density / No-Scroll / Full-Viewport.
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
  ShieldCheck,
  LayoutGrid
} from "lucide-react";
import apiClient from "@/core/api/api-client";
import { cn } from "@/core/utils/cn";
import { toast, Toaster } from "sonner";

// --- 🛡️ INTERFACE SDE SCELLÉE (AUCUN CHAMP INVENTÉ) ---
interface ExtendedOrgUnit {
  OU_Id: string;
  OU_Name: string;
  OU_Code: string;
  OU_TypeId: string;
  OU_SiteId: string;
  OU_ParentId: string | null;
  OU_IsActive: boolean;
  OU_Type?: { OUT_Id: string; OUT_Label: string };
  OU_Site?: { S_Id: string; S_Name: string };
  children?: ExtendedOrgUnit[];
  _count?: { OU_Users: number };
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.OU_Name || !formData.OU_TypeId || !formData.OU_SiteId || !formData.OU_Code) {
      return toast.error("CONFORMITÉ ISO ÉCHOUÉE : Champs obligatoires.");
    }

    setSubmitting(true);
    try {
      const payload = {
        OU_Name: formData.OU_Name.toUpperCase(),
        OU_Code: formData.OU_Code.toUpperCase(),
        OU_TypeId: formData.OU_TypeId,
        OU_SiteId: formData.OU_SiteId,
        OU_ParentId: formData.OU_ParentId || null,
        OU_IsActive: formData.OU_IsActive,
      };

      if (formData.OU_Id) {
        await apiClient.put(`/org-units/${formData.OU_Id}`, payload);
        toast.success("MUTATION SCELLÉE");
      } else {
        await apiClient.post("/org-units", payload);
        toast.success("SEGMENT CRÉÉ");
      }
      resetForm();
      fetchData();
    } catch (err) {
      toast.error("ERREUR DE SCELLAGE KERNEL");
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
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A]">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <span className="text-blue-600 font-black uppercase text-[9px] tracking-[0.5em] animate-pulse italic">Scanning QS Structure...</span>
    </div>
  );

  return (
    <div className="ml-72 h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col p-6 overflow-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      <header className="flex justify-between items-center border-b border-white/10 pb-4 mb-6 shrink-0">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black uppercase tracking-tighter m-0 flex items-center gap-3">
            <Layers className="text-blue-500" size={24} /> Unités <span className="text-blue-500">Organiques</span>
          </h1>
          <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em] m-0 italic">ISO 9001 §5.3 • Matrice RACI SDE</p>
        </div>
        <div className="flex gap-4">
          <div className="relative w-64">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="RECHERCHER..." className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-[10px] font-black uppercase outline-none focus:border-blue-600 italic text-white" />
          </div>
          <button onClick={fetchData} className="p-3 bg-white/5 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"><RefreshCw size={16} /></button>
        </div>
      </header>

      <main className="flex-1 min-h-0 grid grid-cols-12 gap-6 overflow-hidden">
        {/* FORMULAIRE (4/12) */}
        <aside className="col-span-4 flex flex-col gap-4">
          <div className="bg-[#151A2D] border border-white/5 p-8 rounded-[3rem] shadow-4xl flex flex-col gap-5">
            <h2 className="text-[11px] font-black uppercase text-blue-500 m-0 italic flex items-center gap-2">
              <Plus size={18} /> {formData.OU_Id ? "Mutation" : "Nouveau Segment"}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <SDEInput label="Libellé Unité" value={formData.OU_Name} onChange={(v: string) => setFormData({ ...formData, OU_Name: v })} placeholder="NOM" />
              <div className="grid grid-cols-2 gap-4">
                <SDEInput label="Code" value={formData.OU_Code} onChange={(v: string) => setFormData({ ...formData, OU_Code: v })} placeholder="CODE" />
                <SDESelect label="Statut" value={formData.OU_IsActive ? "true" : "false"} onChange={(v: any) => setFormData({ ...formData, OU_IsActive: v === "true" })}>
                  <option value="true">ACTIF</option>
                  <option value="false">RÉVOQUÉ</option>
                </SDESelect>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SDESelect label="Type d'Unité" value={formData.OU_TypeId} onChange={(v: any) => setFormData({ ...formData, OU_TypeId: v })}>
                  <option value="">CHOISIR TYPE</option>
                  {types.map((t) => <option key={t.OUT_Id} value={t.OUT_Id}>{t.OUT_Label}</option>)}
                </SDESelect>
                <SDESelect label="Site Géographique" value={formData.OU_SiteId} onChange={(v: any) => setFormData({ ...formData, OU_SiteId: v })}>
                  <option value="">CHOISIR SITE</option>
                  {sites.map((s) => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
                </SDESelect>
              </div>

              <SDESelect label="Unité Parente" value={formData.OU_ParentId} onChange={(v: any) => setFormData({ ...formData, OU_ParentId: v })}>
                <option value="">-- UNITÉ RACINE --</option>
                {units.map((u) => <option key={u.OU_Id} value={u.OU_Id}>{u.OU_Name}</option>)}
              </SDESelect>

              <div className="pt-4 flex gap-3">
                {formData.OU_Id && <button type="button" onClick={resetForm} className="flex-1 py-4 bg-white/5 text-slate-500 rounded-2xl text-[10px] font-black uppercase italic border border-white/10 cursor-pointer">Annuler</button>}
                <button type="submit" disabled={submitting} className="flex-2 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase italic shadow-2xl border-none cursor-pointer flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Valider
                </button>
              </div>
            </form>
          </div>
          <div className="flex-1 bg-black/30 border border-white/5 p-6 rounded-[2.5rem] flex flex-col justify-end italic">
              <Fingerprint size={32} className="text-blue-600 opacity-20 mb-2" />
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">QS Noyau</p>
          </div>
        </aside>

        {/* TREE VIEW (8/12) */}
        <section className="col-span-8 bg-[#151A2D] border border-white/5 rounded-[3.5rem] shadow-5xl flex flex-col overflow-hidden relative">
          <header className="p-6 bg-black/20 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-[12px] font-black uppercase italic m-0 flex items-center gap-3"><GitBranch className="text-blue-500" /> Arborescence QS</h3>
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

      <footer className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center opacity-30 shrink-0 italic">
        <div className="flex items-center gap-4">
          <Building2 size={24} className="text-blue-600" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] m-0">Elite SDE Matrix • 2026</p>
        </div>
        <Activity size={18} className="text-emerald-500 animate-pulse" />
      </footer>
      <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(37, 99, 235, 0.2); border-radius: 10px; }`}</style>
    </div>
  );
}

// --- 🌳 TREE ENGINE ---


function renderTree(list: ExtendedOrgUnit[], level: number, toggle: any, expanded: Set<string>, search: string, onEdit: (u: any) => void) {
  return list.map((unit) => {
    const hasChildren = unit.children && unit.children.length > 0;
    const isExpanded = expanded.has(unit.OU_Id);
    const matches = search === "" || unit.OU_Name.toLowerCase().includes(search.toLowerCase());

    if (!matches && !hasChildren) return null;

    return (
      <div key={unit.OU_Id} className="flex flex-col">
        <div className={cn(
          "group flex items-center justify-between p-4 rounded-2xl mb-2 transition-all border border-transparent",
          level === 0 ? "bg-white/5 border-white/10" : "bg-black/10 hover:bg-blue-600/5",
          !unit.OU_IsActive && "opacity-30"
        )} style={{ marginLeft: `${level * 30}px` }}>
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => toggle(unit.OU_Id)} className={cn("w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer border-none", hasChildren ? "bg-white/10 text-blue-500" : "opacity-0")}>
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-black uppercase italic text-white">{unit.OU_Name}</span>
                <span className="text-[8px] font-black bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded italic">{unit.OU_Code}</span>
              </div>
              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 italic">
                {unit.OU_Type?.OUT_Label} • {unit.OU_Site?.S_Name}
                {unit._count?.OU_Users && <span className="text-emerald-500 ml-2">({unit._count.OU_Users} AGENTS)</span>}
              </div>
            </div>
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
            <button onClick={() => onEdit(unit)} className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-blue-500 border border-white/10 cursor-pointer transition-all"><Edit3 size={16} /></button>
          </div>
        </div>
        {hasChildren && isExpanded && renderTree(unit.children!, level + 1, toggle, expanded, search, onEdit)}
      </div>
    );
  });
}

// --- 🧩 SDE COMPONENTS ---
function SDEInput({ label, value, onChange, placeholder }: any) {
  return (
    <div className="flex flex-col gap-2 text-left">
      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value.toUpperCase())} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[11px] font-black text-white italic outline-none focus:border-blue-600 transition-all uppercase" placeholder={placeholder} />
    </div>
  );
}

function SDESelect({ label, value, onChange, children }: any) {
  return (
    <div className="flex flex-col gap-2 text-left">
      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[11px] font-black text-white italic outline-none focus:border-blue-600 appearance-none uppercase cursor-pointer">
        {children}
      </select>
    </div>
  );
}