/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : CARTOGRAPHIE DES UNITÉS ORGANIQUES (SDE KERNEL)
 * -------------------------------------------------------------------------
 * RÔLE : Gestion de l'arborescence et des autorités (§5.3 ISO 9001).
 * RÉFÉRENTIEL : types/elite-sde.ts (Prisma Strict).
 * DESIGN : Elite High-Density / No-Scroll / Sovereign Tree view.
 * -------------------------------------------------------------------------
 */

"use client";

import apiClient from "@/core/api/api-client";
import { cn } from "@/core/utils/cn";
import {
  OrgUnit as IOrgUnit,
  OrgUnitType as IOrgUnitType,
  Site as ISite,
} from "@/types/elite-sde";
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
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast, Toaster } from "sonner";

interface ExtendedOrgUnit extends IOrgUnit {
  OU_Type?: IOrgUnitType;
  OU_Site?: ISite;
  children?: ExtendedOrgUnit[];
  _count?: { OU_Users: number };
}

export default function OrgUnitsPage() {
  const [units, setUnits] = useState<ExtendedOrgUnit[]>([]);
  const [sites, setSites] = useState<ISite[]>([]);
  const [types, setTypes] = useState<IOrgUnitType[]>([]);
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

  useEffect(() => {
    fetchData();
  }, []);

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
    setSubmitting(true);
    const tid = toast.loading("Scellage organique...");
    try {
      const payload = {
        ...formData,
        OU_ParentId: formData.OU_ParentId || null,
      };
      if (formData.OU_Id)
        await apiClient.patch(`/org-units/${formData.OU_Id}`, payload);
      else await apiClient.post("/org-units", payload);
      toast.success("SEGMENT SCELLÉ §5.3", { id: tid });
      setFormData({
        OU_Id: "",
        OU_Name: "",
        OU_Code: "",
        OU_TypeId: "",
        OU_SiteId: "",
        OU_ParentId: "",
      });
      fetchData();
    } catch (err) {
      toast.error("ÉCHEC DE MUTATION", { id: tid });
    } finally {
      setSubmitting(false);
    }
  };

  const toggle = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  if (loading)
    return (
      <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <span className="text-blue-600 font-black uppercase text-[9px] tracking-[0.5em] animate-pulse">
          Syncing Structure Matrix...
        </span>
      </div>
    );

  return (
    <div className="ml-72 h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col p-6 overflow-hidden selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER TACTIQUE (Shrink-0) */}
      <header className="flex justify-between items-center border-b border-white/10 pb-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter m-0 flex items-center gap-3">
            <Layers className="text-blue-500" size={24} /> Structure{" "}
            <span className="text-blue-500">Organique</span>
          </h1>
          <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em] m-0 italic">
            ISO 9001 §5.3 • Matrice de Responsabilités
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative w-48 group">
            <Search
              size={12}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SCANNER UNITÉ..."
              className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-8 pr-3 text-[9px] font-black uppercase outline-none focus:border-blue-600 transition-all italic"
            />
          </div>
          <button
            onClick={fetchData}
            className="p-2 bg-white/5 rounded-lg border border-white/10 text-slate-400 hover:text-white cursor-pointer"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </header>

      {/* 📊 CORE GRID (Flex-1) */}
      <main className="flex-1 min-h-0 grid grid-cols-12 gap-6 overflow-hidden">
        {/* COL 1: FORMULAIRE DE MUTATION (4/12) */}
        <aside className="col-span-4 flex flex-col gap-4">
          <div className="bg-[#151A2D] border border-white/5 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 -mr-4 -mt-4 rotate-12">
              <Zap size={100} />
            </div>
            <h2 className="text-[10px] font-black uppercase text-blue-500 mb-6 flex items-center gap-2 italic">
              <Plus size={14} strokeWidth={3} />{" "}
              {formData.OU_Id ? "Modifier Segment" : "Nouveau Segment"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <SDEInput
                label="Désignation Unité"
                value={formData.OU_Name}
                onChange={(v: string) =>
                  setFormData({ ...formData, OU_Name: v.toUpperCase() })
                }
                placeholder="EX: SERVICE LOGISTIQUE"
              />
              <div className="grid grid-cols-2 gap-3">
                <SDEInput
                  label="Code Interne"
                  value={formData.OU_Code}
                  onChange={(v: string) =>
                    setFormData({ ...formData, OU_Code: v.toUpperCase() })
                  }
                  placeholder="EX: LOG-01"
                />
                <SDESelect
                  label="Type d'Unité"
                  value={formData.OU_TypeId}
                  onChange={(v: any) => setFormData({ ...formData, OU_TypeId: v })}
                >
                  <option value="">SÉLECTIONNER...</option>
                  {types.map((t) => (
                    <option key={t.OUT_Id} value={t.OUT_Id}>
                      {t.OUT_Label}
                    </option>
                  ))}
                </SDESelect>
              </div>
              <SDESelect
                label="Site Géographique (§4.4)"
                value={formData.OU_SiteId}
                onChange={(v: any) => setFormData({ ...formData, OU_SiteId: v })}
              >
                <option value="">CHOISIR SITE...</option>
                {sites.map((s) => (
                  <option key={s.S_Id} value={s.S_Id}>
                    {s.S_Name}
                  </option>
                ))}
              </SDESelect>
              <SDESelect
                label="Unité Parente (Hiérarchie)"
                value={formData.OU_ParentId}
                onChange={(v: any) => setFormData({ ...formData, OU_ParentId: v })}
              >
                <option value="">-- UNITÉ RACINE --</option>
                {units.map((u) => (
                  <option key={u.OU_Id} value={u.OU_Id}>
                    {u.OU_Name}
                  </option>
                ))}
              </SDESelect>

              <div className="pt-4 flex gap-3">
                {formData.OU_Id && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        OU_Id: "",
                        OU_Name: "",
                        OU_Code: "",
                        OU_TypeId: "",
                        OU_SiteId: "",
                        OU_ParentId: "",
                      })
                    }
                    className="flex-1 py-3 bg-white/5 text-slate-500 rounded-xl text-[9px] font-black uppercase italic border-none cursor-pointer"
                  >
                    Annuler
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-2 py-3 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase italic shadow-lg border-none cursor-pointer hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <Save size={14} />
                  )}{" "}
                  {formData.OU_Id ? "Valider Mutation" : "Sceller Segment"}
                </button>
              </div>
            </form>
          </div>

          <div className="flex-1 bg-black/30 border border-white/5 p-6 rounded-4xl flex flex-col justify-between italic">
            <div>
              <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none mb-3">
                Isolation Multi-Tenant
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                L&apos;arborescence est isolée dynamiquement pour votre environnement
                souverain. Toute modification impacte la matrice de distribution
                des tâches RACI.
              </p>
            </div>
            <Fingerprint size={32} className="text-blue-600 opacity-20" />
          </div>
        </aside>

        {/* COL 2: ARBORESCENCE TREE ENGINE (8/12) */}
        <section className="col-span-8 bg-[#151A2D] border border-white/5 rounded-[3rem] shadow-4xl flex flex-col overflow-hidden relative">
          <header className="p-4 bg-black/20 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase italic flex items-center gap-2 m-0">
              <GitBranch size={14} className="text-blue-500" /> Maillage
              Hiérarchique
            </h3>
            <span className="text-[8px] bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full font-black uppercase italic border border-blue-500/20">
              {units.length} Branches Racines
            </span>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {renderTree(units, 0, toggle, expanded, search, (u) => {
              setFormData({
                OU_Id: u.OU_Id,
                OU_Name: u.OU_Name,
                OU_Code: u.OU_Code || "",
                OU_TypeId: u.OU_TypeId,
                OU_SiteId: u.OU_SiteId,
                OU_ParentId: u.OU_ParentId || "",
              });
            })}
          </div>
        </section>
      </main>

      <footer className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center opacity-30 shrink-0 italic">
        <div className="flex items-center gap-4">
          <Building2 size={24} className="text-blue-600" />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] m-0">
              Organic Unit Engine v4.0
            </p>
            <p className="text-[8px] font-bold text-slate-700 uppercase tracking-widest m-0 italic">
              Elite SDE Architecture • ISO Compliance
            </p>
          </div>
        </div>
        <Activity size={14} className="text-emerald-500 animate-pulse" />
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

// --- 🌳 ENGINE DE RENDU RÉCURSIF ---

function renderTree(
  list: ExtendedOrgUnit[],
  level: number,
  toggle: any,
  expanded: Set<string>,
  search: string,
  onEdit: (u: any) => void,
) {
  return list.map((unit) => {
    const hasChildren = unit.children && unit.children.length > 0;
    const isExpanded = expanded.has(unit.OU_Id);
    const matches =
      search === "" ||
      unit.OU_Name.toLowerCase().includes(search.toLowerCase()) ||
      unit.OU_Code?.toLowerCase().includes(search.toLowerCase());

    if (!matches && !hasChildren) return null;

    return (
      <div key={unit.OU_Id} className="flex flex-col">
        <div
          className={cn(
            "group flex items-center justify-between p-3 rounded-2xl mb-1 transition-all border border-transparent",
            level === 0
              ? "bg-white/5 border-white/5"
              : "hover:bg-blue-600/5 hover:border-blue-600/20",
          )}
          style={{ marginLeft: `${level * 20}px` }}
        >
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => toggle(unit.OU_Id)}
              className={cn(
                "w-6 h-6 rounded-lg flex items-center justify-center border-none transition-all cursor-pointer",
                hasChildren
                  ? "bg-white/5 text-blue-500 hover:bg-blue-600 hover:text-white"
                  : "opacity-0 cursor-default",
              )}
            >
              {isExpanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </button>

            <div
              className={cn(
                "p-2 rounded-xl",
                (unit._count?.OU_Users || 0) > 0
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white/5 text-slate-600",
              )}
            >
              <Building2 size={16} />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase italic text-white tracking-tight">
                  {unit.OU_Name}
                </span>
                {unit.OU_Code && (
                  <span className="text-[8px] font-black bg-black/40 text-slate-500 px-1.5 py-0.5 rounded border border-white/5 uppercase">
                    {unit.OU_Code}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                <span className="text-blue-500/60 italic">
                  [{unit.OU_Type?.OUT_Label}]
                </span>
                <span>• {unit.OU_Site?.S_Name}</span>
                {(unit._count?.OU_Users || 0) > 0 && (
                  <span className="flex items-center gap-1 text-emerald-500">
                    <Users size={8} /> {unit._count?.OU_Users}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
            <button
              onClick={() => onEdit(unit)}
              className="p-1.5 bg-white/5 rounded-lg text-slate-400 hover:text-amber-500 transition-colors border-none cursor-pointer"
            >
              <Edit3 size={12} />
            </button>
            <button className="p-1.5 bg-white/5 rounded-lg text-slate-400 hover:text-red-500 transition-colors border-none cursor-pointer">
              <Archive size={12} />
            </button>
          </div>
        </div>
        {hasChildren &&
          isExpanded &&
          renderTree(
            unit.children!,
            level + 1,
            toggle,
            expanded,
            search,
            onEdit,
          )}
      </div>
    );
  });
}

// --- 🧩 COMPOSANTS D'INTERFACE ---

function SDEInput({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-1 text-left">
      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-black text-white italic outline-none focus:border-blue-600 transition-all placeholder:opacity-20"
        placeholder={placeholder}
      />
    </div>
  );
}

function SDESelect({
  label,
  value,
  onChange,
  children,
  disabled = false,
}: any) {
  return (
    <div className={cn("space-y-1 text-left", disabled && "opacity-20")}>
      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">
        {label}
      </label>
      <select
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-black text-white italic outline-none focus:border-blue-600 appearance-none cursor-pointer"
      >
        {children}
      </select>
    </div>
  );
}
