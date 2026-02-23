/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛠️ MODULE : GESTION DES TYPOLOGIES DE PROCESSUS (SDE MATRIX)
 * -------------------------------------------------------------------------
 * RÔLE : Définition des familles de processus (§4.4 ISO 9001).
 * ARCHITECTURE : Multi-Tenant Sovereign Data Environment (SDE).
 * RÉFÉRENTIEL : types/elite-sde.ts (Prisma Core).
 * CORRECTIFS : Sécurisation des accès aux couleurs (L.159, L.186).
 * -------------------------------------------------------------------------
 */

"use client";

import apiClient from "@/core/api/api-client";
import { ProcessFamily, ProcessType } from "@/types/elite-sde";
import {
  Activity,
  Edit,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  Settings,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast, Toaster } from "sonner";

/**
 * @interface ProcessTypeFormData
 * @description Structure de données pour la mutation vers le Kernel.
 */
interface ProcessTypeFormData {
  PT_Label: string;
  PT_Description: string;
  PT_Color: string;
  PT_Family: ProcessFamily;
  PT_IsActive: boolean;
}

export default function ProcessTypePage() {
  // --- 📦 ÉTATS SYSTÈME SCELLÉS ---
  const [types, setTypes] = useState<ProcessType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingType, setEditingType] = useState<ProcessType | null>(null);

  /**
   * 📡 SYNCHRONISATION DU RÉFÉRENTIEL
   */
  const loadTypes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/processus-types");
      const data = res.data?.data || res.data;
      setTypes(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      console.error("❌ Rupture de flux SDE (§4.4):", err);
      toast.error("Impossible de synchroniser les types de processus.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTypes();
  }, [loadTypes]);

  /**
   * 🧨 RÉVOCATION DÉCISIONNELLE
   */
  const handleDelete = async (id: string) => {
    if (
      !window.confirm("⚠️ Action critique : Supprimer ce type de processus ?")
    )
      return;
    const toastId = toast.loading("Vérification d'intégrité...");
    try {
      await apiClient.delete(`/processus-types/${id}`);
      toast.success("Structure retirée du registre SMI", { id: toastId });
      loadTypes();
    } catch (err: unknown) {
      toast.error(
        "Échec : Le type est probablement lié à des processus actifs.",
        { id: toastId },
      );
    }
  };

  return (
    <div className="ml-72 min-h-screen bg-[#0B0F1A] text-white italic font-sans p-10 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors />

      {/* 🔝 EN-TÊTE STRATÉGIQUE */}
      <header className="flex justify-between items-end mb-16 border-b border-white/5 pb-10 animate-in slide-in-from-top-4 duration-700">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-blue-500 bg-blue-500/5 w-fit px-4 py-1 rounded-full border border-blue-500/10">
            <ShieldCheck size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest text-left">
              SDE Mapping Active
            </span>
          </div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none text-left">
            Référentiel <span className="text-blue-600">Structurel</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] italic opacity-60 text-left">
            ISO 9001 §4.4 : Typologie et Familles de Processus
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={loadTypes}
            className="p-5 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-all border border-white/5 cursor-pointer"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => {
              setEditingType(null);
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-white hover:text-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase italic text-xs flex items-center gap-4 transition-all shadow-2xl border-none cursor-pointer shadow-blue-900/20"
          >
            <Plus size={20} strokeWidth={3} /> Initialiser un Segment
          </button>
        </div>
      </header>

      {/* --- GRILLE D'ARCHITECTURE (§4.4.1) --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2
            className="animate-spin text-blue-600 mb-8"
            size={60}
            strokeWidth={1.5}
          />
          <p className="font-black uppercase text-[11px] tracking-[0.6em] italic text-slate-500 animate-pulse">
            Scanning SDE Architecture...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
          {types.length > 0 ? (
            types.map((type) => {
              // 🛡️ SÉCURISATION DES COULEURS (L.159 CORRECTION)
              const safeColor = type.PT_Color || "#3b82f6";
              const safeBgColor = `${safeColor}15`;

              return (
                <div
                  key={type.PT_Id}
                  className="bg-[#0F172A]/40 border border-white/5 rounded-[3rem] p-10 hover:border-blue-600/40 transition-all group relative overflow-hidden shadow-2xl"
                >
                  <div className="absolute -right-6 -top-6 opacity-[0.03] text-white group-hover:opacity-[0.08] transition-opacity pointer-events-none rotate-12">
                    <Layers size={180} />
                  </div>

                  <div className="flex justify-between items-start mb-10 relative z-10">
                    <div
                      className="w-18 h-18 rounded-2xl flex items-center justify-center shadow-2xl border border-white/5 transition-transform group-hover:scale-110 duration-500"
                      style={{ backgroundColor: safeBgColor, color: safeColor }}
                    >
                      <Layers size={36} strokeWidth={1.5} />
                    </div>
                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-y-0">
                      <button
                        onClick={() => {
                          setEditingType(type);
                          setShowModal(true);
                        }}
                        className="p-4 bg-white/5 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 transition-all border-none cursor-pointer"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(type.PT_Id)}
                        className="p-4 bg-white/5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all border-none cursor-pointer"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="relative z-10 text-left">
                    <h3 className="text-2xl font-black uppercase italic mb-3 tracking-tighter group-hover:text-blue-400 transition-colors">
                      {type.PT_Label}
                    </h3>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="bg-blue-600/10 border border-blue-500/20 px-4 py-1.5 rounded-full">
                        <span className="text-[10px] font-black uppercase text-blue-400 italic tracking-[0.2em]">
                          {type.PT_Family}
                        </span>
                      </div>
                    </div>

                    <p className="text-[12px] text-slate-500 italic mb-12 line-clamp-3 leading-relaxed font-bold opacity-80">
                      {type.PT_Description ||
                        "Aucune analyse descriptive scellée."}
                    </p>

                    <div className="flex items-center justify-between border-t border-white/5 pt-8">
                      <div className="flex items-center gap-4">
                        {/* 🛡️ SÉCURISATION DU BACKGROUND COLOR (L.186 CORRECTION) */}
                        <div
                          className="w-5 h-5 rounded-lg border border-white/10"
                          style={{ backgroundColor: safeColor }}
                        ></div>
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">
                          {safeColor}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Activity
                          size={14}
                          className={
                            type.PT_IsActive
                              ? "text-emerald-500"
                              : "text-red-500"
                          }
                        />
                        <span
                          className={`text-[10px] font-black uppercase italic tracking-tighter ${type.PT_IsActive ? "text-emerald-500" : "text-red-500"}`}
                        >
                          {type.PT_IsActive ? "OPÉRATIONNEL" : "ARCHIVÉ"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-32 text-center border-4 border-dashed border-white/5 rounded-[4rem] opacity-20 italic">
              <Layers size={80} className="mx-auto mb-6" />
              <p className="font-black uppercase tracking-[0.5em] text-sm">
                Néant Structurel — ISO §4.4
              </p>
            </div>
          )}
        </div>
      )}

      {/* --- MODAL D'ÉDITION SOUVERAINE --- */}
      {showModal && (
        <ProcessTypeModal
          type={editingType}
          onClose={() => setShowModal(false)}
          onSuccess={loadTypes}
        />
      )}
    </div>
  );
}

/**
 * 📟 COMPOSANT MODAL : CONFIGURATION SEGMENT
 */
function ProcessTypeModal({
  type,
  onClose,
  onSuccess,
}: {
  type: ProcessType | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [saving, setSaving] = useState<boolean>(false);

  const [formData, setFormData] = useState<ProcessTypeFormData>({
    PT_Label: type?.PT_Label || "",
    PT_Description: type?.PT_Description || "",
    PT_Color: type?.PT_Color || "#3b82f6",
    PT_Family: type?.PT_Family || ProcessFamily.OPERATIONNEL,
    PT_IsActive: type?.PT_IsActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (type) {
        await apiClient.patch(`/processus-types/${type.PT_Id}`, formData);
        toast.success("Mutation du segment validée.");
      } else {
        await apiClient.post("/processus-types", formData);
        toast.success("Nouveau grade structurel déployé.");
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error("Échec de la mutation structurelle.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/98 backdrop-blur-2xl z-100 flex items-center justify-center p-8 animate-in fade-in duration-300">
      <div className="bg-[#0B0F1A] border border-white/10 rounded-[4rem] max-w-2xl w-full p-16 shadow-2xl italic font-bold text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none rotate-12">
          <Settings size={220} />
        </div>

        <div className="flex items-center justify-between mb-16 relative z-10">
          <div className="flex items-center gap-6 text-left">
            <div className="p-5 bg-blue-600/20 text-blue-500 rounded-3xl border border-blue-500/20">
              <Settings className="animate-spin-slow" size={40} />
            </div>
            <div>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none text-white">
                {type ? "RECTIFIER" : "INITIALISER"}{" "}
                <span className="text-blue-600">LE TYPE</span>
              </h2>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">
                Architecture SDE — ISO 9001 §4.4
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-4 text-slate-500 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
          >
            <XCircle size={48} strokeWidth={1} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-10 relative z-10 text-left font-sans"
        >
          <div className="space-y-4">
            <label className="text-[10px] text-slate-500 uppercase tracking-[0.4em] ml-6 italic">
              Désignation du Segment *
            </label>
            <input
              required
              className="w-full bg-slate-900 border border-white/10 p-8 rounded-3xl text-lg font-black uppercase italic text-white outline-none focus:border-blue-600"
              value={formData.PT_Label}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  PT_Label: e.target.value.toUpperCase(),
                })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-[10px] text-slate-500 uppercase tracking-[0.4em] ml-6 italic">
                Classification *
              </label>
              <select
                className="w-full bg-slate-900 border border-white/10 p-8 rounded-3xl text-[11px] font-black uppercase italic text-white outline-none focus:border-blue-600 appearance-none shadow-inner"
                value={formData.PT_Family}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    PT_Family: e.target.value as ProcessFamily,
                  })
                }
              >
                {Object.values(ProcessFamily).map((fam) => (
                  <option key={fam} value={fam}>
                    {fam}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] text-slate-500 uppercase tracking-[0.4em] ml-6 italic">
                Identité Visuelle
              </label>
              <div className="flex gap-4">
                <input
                  type="color"
                  className="w-20 h-20 rounded-3xl cursor-pointer bg-transparent border-none p-0 overflow-hidden"
                  value={formData.PT_Color}
                  onChange={(e) =>
                    setFormData({ ...formData, PT_Color: e.target.value })
                  }
                />
                <input
                  className="flex-1 bg-slate-900 border border-white/10 p-6 rounded-3xl text-[11px] font-black uppercase italic text-center text-slate-400"
                  value={formData.PT_Color}
                  onChange={(e) =>
                    setFormData({ ...formData, PT_Color: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] text-slate-500 uppercase tracking-[0.4em] ml-6 italic">
              Scope SMI
            </label>
            <textarea
              rows={4}
              className="w-full bg-slate-900 border border-white/10 p-8 rounded-4xl text-sm font-bold italic text-white outline-none focus:border-blue-600 resize-none"
              value={formData.PT_Description}
              onChange={(e) =>
                setFormData({ ...formData, PT_Description: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-8 bg-blue-600 hover:bg-blue-500 text-white rounded-[2.5rem] font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-5 transition-all border-none cursor-pointer italic"
          >
            {saving ? (
              <Loader2 className="animate-spin" />
            ) : (
              <ShieldCheck size={22} />
            )}
            {type ? "Valider LES MODIFICATIONS" : "INITIALISER LA STRUCTURE"}
          </button>
        </form>
      </div>
    </div>
  );
}
