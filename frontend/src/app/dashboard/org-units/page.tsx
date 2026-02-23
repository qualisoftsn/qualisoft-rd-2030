/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : GESTION DES UNITÉS ORGANIQUES (ORG-UNITS) — ÉDITION ÉLITE SÉCURISÉE
 * -------------------------------------------------------------------------
 * RÔLE : Cartographie de l'arborescence structurelle (SMI Matrix).
 * ARCHITECTURE : Multi-Tenant Sovereign Data Environment (SDE).
 * RÉFÉRENTIEL DB : types/elite-sde.ts (Prisma Core).
 * CORRECTIFS : Suppression des ternaires orphelines (L.260) & Sécurisation Initiales.
 * -------------------------------------------------------------------------
 */

"use client";

import apiClient from "@/core/api/api-client";
import {
  OrgUnit as IOrgUnit,
  OrgUnitType as IOrgUnitType,
  Site as ISite,
  User as IUser,
} from "@/types/elite-sde";
import {
  Activity,
  Archive,
  Boxes,
  Briefcase,
  Building2,
  ChevronDown,
  ChevronRight,
  Edit3,
  Fingerprint,
  GitGraph,
  Hash,
  Layers,
  Loader2,
  Plus,
  Rocket,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "sonner";

// --- 🏗️ INTERFACES SYSTÈME ÉTENDUES ---

interface ExtendedOrgUnit extends IOrgUnit {
  OU_Type?: IOrgUnitType;
  OU_Site?: ISite;
  OU_Parent?: { OU_Id: string; OU_Name: string } | null;
  OU_Users?: IUser[];
  _count?: {
    OU_Children: number;
    OU_Users: number;
  };
  children?: ExtendedOrgUnit[];
}

interface OrgUnitFormData {
  OU_Name: string;
  OU_Code: string;
  OU_TypeId: string;
  OU_SiteId: string;
  OU_ParentId: string | null;
}

export default function OrgUnitsPage() {
  // --- 📦 ÉTATS DE DONNÉES SCELLÉS ---
  const [units, setUnits] = useState<ExtendedOrgUnit[]>([]);
  const [sites, setSites] = useState<ISite[]>([]);
  const [unitTypes, setUnitTypes] = useState<IOrgUnitType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // --- 🖥️ ÉTATS INTERFACE (MODALS MATRIX) ---
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedUnit, setSelectedUnit] = useState<ExtendedOrgUnit | null>(
    null,
  );

  // --- 🔍 ÉTATS DE NAVIGATION & FORMULAIRE ---
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [formData, setFormData] = useState<OrgUnitFormData>({
    OU_Name: "",
    OU_Code: "",
    OU_TypeId: "",
    OU_SiteId: "",
    OU_ParentId: null,
  });

  /**
   * 📡 SYNCHRONISATION MULTI-FLUX
   * @description Extraction du maillage organique depuis le Kernel.
   */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [uRes, sRes, tRes] = await Promise.all([
        apiClient.get("/org-units?includeArchived=false"),
        apiClient.get("/sites"),
        apiClient.get("/org-unit-types"),
      ]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const extract = (res: any) => res.data?.data || res.data || [];
      const flatUnits: ExtendedOrgUnit[] = extract(uRes);
      setUnits(buildHierarchy(flatUnits));
      setSites(extract(sRes));
      setUnitTypes(extract(tRes));
    } catch (err: unknown) {
      toast.error("Rupture de synchronisation avec le registre SDE.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * 🌳 LOGIQUE DE CONSTRUCTION HIÉRARCHIQUE
   * @description Conversion de la liste plate en arbre récursif.
   */
  const buildHierarchy = (flatUnits: ExtendedOrgUnit[]): ExtendedOrgUnit[] => {
    const unitMap = new Map<string, ExtendedOrgUnit>();
    const roots: ExtendedOrgUnit[] = [];
    flatUnits.forEach((unit) => {
      unitMap.set(unit.OU_Id, { ...unit, children: [] });
    });
    unitMap.forEach((unit) => {
      const parentId = unit.OU_ParentId;
      if (parentId && unitMap.has(parentId)) {
        unitMap.get(parentId)!.children?.push(unit);
      } else {
        roots.push(unit);
      }
    });
    return roots;
  };

  /**
   * 📐 MÉMOÏSATION DE LA LISTE PLATE POUR LES SÉLECTEURS
   */
  const flatListForSelect = useMemo(() => {
    const flat: (ExtendedOrgUnit & { depth: number })[] = [];
    const recurse = (list: ExtendedOrgUnit[], depth = 0) => {
      list.forEach((u) => {
        flat.push({ ...u, depth });
        if (u.children && u.children.length > 0) recurse(u.children, depth + 1);
      });
    };
    recurse(units);
    return flat;
  }, [units]);

  // --- ⚡ ACTIONS DE GESTION MATRIX ---

  const handleAutoInit = async () => {
    setSubmitting(true);
    try {
      const payload: OrgUnitFormData = {
        OU_Name: "DIRECTION GÉNÉRALE",
        OU_Code: "DG-001",
        OU_TypeId: unitTypes[0].OUT_Id,
        OU_SiteId: sites[0].S_Id,
        OU_ParentId: null,
      };
      await apiClient.post("/org-units", payload);
      toast.success("Direction Générale scellée.");
      fetchData();
    } catch (err: unknown) {
      toast.error("Erreur d'initialisation souveraine.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        OU_ParentId: formData.OU_ParentId === "" ? null : formData.OU_ParentId,
      };
      await apiClient.post("/org-units", payload);
      toast.success("Nouveau segment organique indexé.");
      setFormData({
        OU_Name: "",
        OU_Code: "",
        OU_TypeId: "",
        OU_SiteId: "",
        OU_ParentId: null,
      });
      fetchData();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error("Échec de création dans le SDE.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit) return;
    setSubmitting(true);
    try {
      const payload = {
        OU_Name: formData.OU_Name,
        OU_Code: formData.OU_Code,
        OU_TypeId: formData.OU_TypeId,
        OU_SiteId: formData.OU_SiteId,
        OU_ParentId:
          formData.OU_ParentId === "" || formData.OU_ParentId === "null"
            ? null
            : formData.OU_ParentId,
      };
      await apiClient.patch(`/org-units/${selectedUnit.OU_Id}`, payload);
      toast.success("Mutation validée.");
      setIsEditModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      toast.error("Échec de la mutation.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async () => {
    if (!selectedUnit) return;
    setSubmitting(true);
    try {
      await apiClient.delete(`/org-units/${selectedUnit.OU_Id}`);
      toast.success("Unité organique archivée.");
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      toast.error("Rupture : Dépendances actives détectées.");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 🌳 RENDU RÉCURSIF (TREE ENGINE)
   * @description Correction erreur L.260 : Utilisation d'un bloc conditionnel explicite.
   */
  const renderUnitTree = (unitsList: ExtendedOrgUnit[], level = 0) => {
    return unitsList
      .filter((u) => {
        const query = searchQuery.toLowerCase();
        return (
          u.OU_Name.toLowerCase().includes(query) ||
          (u.OU_Code?.toLowerCase() || "").includes(query)
        );
      })
      .map((unit) => {
        const hasChildren = !!(unit.children && unit.children.length > 0);
        const isExpanded = expandedUnits.has(unit.OU_Id);
        const hasUsers = (unit._count?.OU_Users || 0) > 0;

        return (
          <div
            key={unit.OU_Id}
            className="select-none animate-in fade-in duration-300 text-left"
          >
            <div
              className={`group flex items-center justify-between p-5 hover:bg-blue-50/50 transition-all border-l-4 ${level > 0 ? "ml-10 border-l-slate-200" : "border-l-blue-600 bg-white shadow-sm"}`}
              style={{ paddingLeft: `${20 + level * 30}px` }}
            >
              <div className="flex items-center gap-5 flex-1">
                {/* 🛑 CORRECTION LOGIQUE L.260 : Remplacement de la ternaire par un bloc conditionnel */}
                <button
                  type="button"
                  onClick={() => {
                    const next = new Set(expandedUnits);
                    if (isExpanded) {
                      next.delete(unit.OU_Id);
                    } else {
                      next.add(unit.OU_Id);
                    }
                    setExpandedUnits(next);
                  }}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${hasChildren ? "hover:bg-blue-100 text-blue-600 cursor-pointer shadow-sm" : "text-transparent cursor-default"}`}
                >
                  {hasChildren &&
                    (isExpanded ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    ))}
                </button>

                <div
                  className={`p-3 rounded-2xl ${hasUsers ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}
                >
                  <Building2 size={22} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[15px] font-black uppercase italic text-slate-900 tracking-tight leading-none">
                      {unit.OU_Name}
                    </h3>
                    {unit.OU_Code && (
                      <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md border border-slate-200">
                        {unit.OU_Code}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase italic tracking-[0.2em] mt-2">
                    <span className="text-blue-500/60">
                      [{unit.OU_Type?.OUT_Label}]
                    </span>{" "}
                    — {unit.OU_Site?.S_Name}
                  </p>
                </div>

                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUnit(unit);
                      setIsDetailModalOpen(true);
                    }}
                    className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 rounded-xl cursor-pointer shadow-sm transition-all"
                  >
                    <Search size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUnit(unit);
                      setFormData({
                        OU_Name: unit.OU_Name,
                        OU_Code: unit.OU_Code || "",
                        OU_TypeId: unit.OU_TypeId,
                        OU_SiteId: unit.OU_SiteId,
                        OU_ParentId: unit.OU_ParentId || "",
                      });
                      setIsEditModalOpen(true);
                    }}
                    className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-amber-600 rounded-xl cursor-pointer shadow-sm transition-all"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUnit(unit);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-red-600 rounded-xl cursor-pointer shadow-sm transition-all"
                  >
                    <Archive size={18} />
                  </button>
                </div>
              </div>
            </div>
            {hasChildren &&
              isExpanded &&
              renderUnitTree(unit.children || [], level + 1)}
          </div>
        );
      });
  };

  if (loading)
    return (
      <div className="flex h-screen bg-slate-50 flex-col items-center justify-center gap-6">
        <Loader2
          className="animate-spin text-blue-600"
          size={64}
          strokeWidth={1.5}
        />
        <p className="font-black italic text-blue-600 uppercase tracking-[0.6em] animate-pulse">
          Synchronisation Structurelle...
        </p>
      </div>
    );

  return (
    <div className="p-8 space-y-10 bg-slate-50 min-h-screen italic font-sans font-bold text-left selection:bg-blue-600/20">
      <Toaster position="top-right" richColors />

      <header className="flex justify-between items-end border-b-4 border-slate-100 pb-10 animate-in slide-in-from-top-4 duration-700">
        <div>
          <div className="flex items-center gap-4 text-blue-600 mb-4 bg-blue-50 w-fit px-4 py-1.5 rounded-full border border-blue-200">
            <Fingerprint size={14} className="animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest">
              SDE Matrix Isolation Active
            </span>
          </div>
          <h1 className="text-6xl font-black uppercase tracking-tighter text-slate-900 flex items-center gap-8 italic leading-none">
            <div className="p-4 bg-blue-600 text-white rounded-4xl shadow-2xl shadow-blue-600/30">
              <Layers size={64} strokeWidth={2.5} />
            </div>
            Structure <span className="text-blue-600">Organique</span>
          </h1>
          <p className="text-slate-500 font-black text-[11px] uppercase tracking-[0.6em] mt-6 italic opacity-60">
            Hiérarchie Elite — ISO 9001 §5.3
          </p>
        </div>
        <button
          onClick={() => fetchData()}
          className="px-12 py-6 bg-white border-2 border-slate-200 rounded-4xl font-black uppercase text-[12px] text-slate-600 hover:bg-slate-50 hover:border-blue-600/30 transition-all flex items-center gap-5 shadow-xl italic cursor-pointer active:scale-95 border-none"
        >
          <GitGraph size={24} className="text-blue-600" /> Rafraîchir
          l&apos;Arbre
        </button>
      </header>

      {units.length === 0 && !loading ? (
        <div className="bg-white rounded-[5rem] p-32 text-center border-4 border-dashed border-slate-200 shadow-4xl animate-in fade-in zoom-in-95 max-w-5xl mx-auto mt-20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-3 h-full bg-blue-600" />
          <Rocket
            size={80}
            className="text-blue-600 mx-auto mb-12 animate-bounce"
          />
          <h2 className="text-6xl font-black uppercase text-slate-900 mb-8 tracking-tighter italic leading-none">
            Néant Structurel
          </h2>
          <button
            onClick={handleAutoInit}
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-16 py-8 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.4em] shadow-3xl transition-all flex items-center gap-6 mx-auto cursor-pointer border-none group active:scale-95"
          >
            {submitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <ShieldCheck size={32} />
            )}{" "}
            Déployer la Direction Générale
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-4 sticky top-10">
            <div className="bg-white rounded-[4rem] p-14 shadow-4xl border border-slate-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-10 opacity-5 -mr-8 -mt-8 rotate-12">
                <Boxes size={120} />
              </div>
              <h2 className="text-2xl font-black uppercase text-slate-900 flex items-center gap-5 italic leading-none mb-14 relative z-10">
                <Plus size={32} className="text-blue-600" strokeWidth={3} />{" "}
                Nouveau Segment
              </h2>
              <form
                onSubmit={handleCreate}
                className="space-y-10 relative z-10"
              >
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-6 tracking-[0.2em]">
                    Désignation Unité
                  </label>
                  <input
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-8 py-6 text-[15px] font-black uppercase italic outline-none focus:border-blue-500 shadow-inner"
                    value={formData.OU_Name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        OU_Name: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="EX: SERVICE LOGISTIQUE"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-6 tracking-[0.2em]">
                    Code Unité
                  </label>
                  <div className="relative">
                    <Hash
                      size={16}
                      className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"
                    />
                    <input
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl pl-14 pr-8 py-6 text-[15px] font-black uppercase italic outline-none focus:border-blue-500 shadow-inner"
                      value={formData.OU_Code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          OU_Code: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="EX: SL-01"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-slate-950 hover:bg-blue-600 text-white font-black uppercase py-8 rounded-4xl shadow-3xl transition-all italic flex items-center justify-center gap-6 cursor-pointer border-none active:scale-95"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <ShieldCheck size={28} />
                  )}{" "}
                  Valider l&apos;Unité
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-[5rem] shadow-4xl border border-slate-100 overflow-hidden min-h-200 flex flex-col">
              <div className="p-12 border-b-4 border-slate-50 flex justify-between items-center bg-slate-50/40 backdrop-blur-md">
                <div className="relative w-full max-w-xl group">
                  <Search
                    className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors"
                    size={28}
                  />
                  <input
                    placeholder="FILTRER LE MAILLAGE ORGANIQUE..."
                    className="w-full bg-white border-2 border-slate-100 rounded-[2.5rem] py-6 pl-20 pr-10 text-xs font-black uppercase italic outline-none focus:border-blue-500 shadow-inner"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="text-[11px] font-black uppercase text-blue-600 bg-blue-50 px-8 py-4 rounded-3xl border border-blue-100 italic">
                  {flatListForSelect.length} Unités
                </div>
              </div>
              <div className="divide-y-2 divide-slate-50 flex-1 overflow-y-auto custom-scrollbar p-6">
                {renderUnitTree(units)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INSPECTION (VUE DÉTAILLÉE) */}
      {isDetailModalOpen && selectedUnit && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl z-50 flex items-center justify-center p-8">
          <div className="bg-white rounded-[6rem] w-full max-w-6xl shadow-4xl animate-in slide-in-from-bottom-24 font-black italic overflow-hidden border-none text-left">
            <div className="p-20 border-b-4 border-slate-50 flex justify-between items-center bg-slate-50/40">
              <div className="flex items-center gap-10">
                <div className="w-28 h-28 rounded-[2.5rem] bg-blue-600 flex items-center justify-center text-white shadow-3xl rotate-3">
                  <Briefcase size={56} strokeWidth={2.5} />
                </div>
                <div>
                  <span className="text-[13px] text-blue-600 uppercase tracking-[0.5em] font-black bg-blue-50 px-6 py-2 rounded-full border border-blue-100">
                    {selectedUnit.OU_Type?.OUT_Label}
                  </span>
                  <h2 className="text-7xl uppercase tracking-tighter text-slate-900 leading-none mt-4">
                    {selectedUnit.OU_Name}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-8 hover:bg-slate-200 rounded-full text-slate-400 transition-colors border-none cursor-pointer bg-transparent"
              >
                <X size={64} strokeWidth={1} />
              </button>
            </div>
            <div className="p-20 space-y-16">
              <h3 className="text-2xl uppercase text-slate-900 flex items-center gap-6 italic font-black">
                <Users size={40} className="text-blue-600" /> Capital Humain (
                {selectedUnit._count?.OU_Users || 0})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-h-120 overflow-y-auto pr-10 custom-scrollbar p-4">
                {selectedUnit.OU_Users && selectedUnit.OU_Users.length > 0 ? (
                  selectedUnit.OU_Users.map((u) => (
                    <div
                      key={u.U_Id}
                      className="flex items-center gap-6 p-8 bg-white border-2 border-slate-100 rounded-[3rem] shadow-sm hover:shadow-xl transition-all group"
                    >
                      {/* ✅ SÉCURISATION DES INITIALES (NULL-SAFE) */}
                      <div className="w-16 h-16 rounded-3xl bg-slate-950 text-white flex items-center justify-center font-black text-sm group-hover:bg-blue-600 transition-colors">
                        {(u.U_FirstName?.charAt(0) || "").toUpperCase()}
                        {(u.U_LastName?.charAt(0) || "").toUpperCase()}
                      </div>
                      <div className="truncate flex-1">
                        <p className="font-black text-slate-900 uppercase truncate text-[16px] tracking-tight mb-2">
                          {u.U_FirstName} {u.U_LastName}
                        </p>
                        <p className="text-blue-600 text-[11px] font-bold italic opacity-70 uppercase tracking-widest">
                          {u.U_Role}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 py-32 text-center text-slate-300 border-4 border-dashed border-slate-100 rounded-[5rem]">
                    <Activity
                      size={72}
                      className="mx-auto mb-8 opacity-10 animate-pulse"
                    />
                    <p className="uppercase text-sm font-black tracking-[0.5em] opacity-40 italic">
                      Aucune affectation scellée
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STYLE SCROLLBAR SDE */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 20px;
          border: 3px solid #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3b82f6;
        }
      `}</style>
    </div>
  );
}
