/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛠️ MODULE : GESTION DES TYPOLOGIES DE PROCESSUS (SDE MATRIX)
 * -------------------------------------------------------------------------
 * RÔLE : Définition des familles de processus (§4.4 ISO 9001).
 * ARCHITECTURE : Multi-Tenant Sovereign Data Environment (SDE), Zéro NextAuth.
 * RÉFÉRENTIEL : types/elite-sde.ts (Prisma Core).
 * DATE : 02 Mars 2026 | 13:23 GMT
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
      // Extraction sécurisée pour garantir un tableau
      const data = res.data?.data || res.data;
      setTypes(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      console.error("❌ Rupture de flux SDE (§4.4):", err);
      toast.error("Impossible de synchroniser les typologies de processus.");
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
      !window.confirm("⚠️ Action critique : Supprimer ce type de processus de la cartographie ?")
    )
      return;
    const toastId = toast.loading("Vérification d'intégrité référentielle...");
    try {
      await apiClient.delete(`/processus-types/${id}`);
      toast.success("Structure retirée du registre SMI", { id: toastId });
      loadTypes();
    } catch (err: unknown) {
      toast.error(
        "Échec : Ce type est probablement lié à des processus actifs dans la cartographie.",
        { id: toastId },
      );
    }
  };

  return (
    <div className="ml-0 lg:ml-72 min-h-screen bg-[#0B0F1A] text-white italic font-sans p-6 lg:p-10 selection:bg-blue-600/30 overflow-x-hidden">
      <Toaster position="top-right" richColors />

      {/* 🔝 EN-TÊTE STRATÉGIQUE */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 lg:mb-16 border-b-2 border-white/5 pb-8 lg:pb-10 animate-in slide-in-from-top-4 duration-700 gap-8">
        <div className="space-y-4 lg:space-y-6 w-full lg:w-auto">
          <div className="flex items-center gap-3 text-blue-500 bg-blue-500/10 w-fit px-4 py-1.5 rounded-full border border-blue-500/20 shadow-inner">
            <ShieldCheck size={14} className="lg:w-4 lg:h-4" />
            <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] lg:tracking-widest text-left">
              SDE Mapping Active
            </span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter leading-none text-left m-0">
            Référentiel <span className="text-blue-600">Structurel</span>
          </h1>
          <p className="text-slate-500 text-[10px] lg:text-[12px] font-black uppercase tracking-[0.3em] lg:tracking-[0.5em] italic opacity-80 text-left m-0">
            ISO 9001 §4.4 : Typologie et Familles de Processus
          </p>
        </div>

        <div className="flex flex-row gap-4 w-full lg:w-auto">
          <button
            onClick={loadTypes}
            className="flex-none p-4 lg:p-5 bg-slate-900 border-2 border-white/5 rounded-2xl lg:rounded-3xl text-slate-400 hover:text-white hover:border-white/20 transition-all cursor-pointer shadow-sm flex items-center justify-center"
            title="Rafraîchir les données"
          >
            <RefreshCw size={20} className={`lg:w-6 lg:h-6 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              setEditingType(null);
              setShowModal(true);
            }}
            className="flex-1 lg:flex-none bg-blue-600 hover:bg-blue-500 text-white px-6 lg:px-10 py-4 lg:py-5 rounded-2xl lg:rounded-3xl font-black uppercase italic text-[10px] lg:text-xs tracking-widest flex items-center justify-center gap-3 lg:gap-4 transition-all shadow-[0_15px_30px_rgba(37,99,235,0.3)] border-none cursor-pointer active:scale-95 m-0"
          >
            <Plus size={18} strokeWidth={3} className="lg:w-5 lg:h-5" /> Initialiser un Segment
          </button>
        </div>
      </header>

      {/* --- GRILLE D'ARCHITECTURE (§4.4.1) --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 lg:h-96">
          <Loader2
            className="animate-spin text-blue-600 mb-6 lg:mb-8 w-12 h-12 lg:w-16 lg:h-16"
            strokeWidth={2}
          />
          <p className="font-black uppercase text-[10px] lg:text-[11px] tracking-[0.4em] lg:tracking-[0.6em] italic text-slate-500 animate-pulse m-0">
            Scanning SDE Architecture...
          </p>
        </div>
      ) : (
        <div className="space-y-10 lg:space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
          
          {/* Illustration Pédagogique (Seulement s'il y a des données) */}
          {types.length > 0 && (
            <div className="bg-slate-900/40 border border-white/5 rounded-4xl lg:rounded-[3rem] p-6 lg:p-10 flex flex-col lg:flex-row items-center gap-8 shadow-xl">
               <div className="flex-1">
                  <h3 className="text-[11px] lg:text-[13px] font-black uppercase tracking-[0.3em] text-blue-400 mb-3 italic leading-none m-0">Classification des Processus</h3>
                  <p className="text-[10px] lg:text-[12px] text-slate-400 uppercase tracking-widest leading-relaxed italic m-0">
                    La norme ISO 9001 encourage la structuration du SMQ selon trois grandes familles : Management (Direction), Réalisation (Opérationnel/Métier) et Support (Soutien).
                  </p>
               </div>
               <div className="w-full lg:w-87.5 h-30 bg-black/50 border border-white/10 rounded-2xl mix-blend-screen opacity-60 flex items-center justify-center shrink-0">
                  
               </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
            {types.length > 0 ? (
              types.map((type) => {
                // 🛡️ SÉCURISATION DES COULEURS (Fallback sur bleu SDE)
                const safeColor = type.PT_Color || "#3b82f6";
                const safeBgColor = `${safeColor}15`;

                return (
                  <div
                    key={type.PT_Id}
                    className="bg-[#0F172A]/40 border-2 border-white/5 rounded-[2.5rem] lg:rounded-[3rem] p-8 lg:p-10 hover:border-blue-600/40 transition-all group relative overflow-hidden shadow-2xl flex flex-col justify-between hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
                  >
                    <div className="absolute -right-8 -top-8 lg:-right-6 lg:-top-6 opacity-[0.03] text-white group-hover:opacity-[0.08] transition-opacity pointer-events-none rotate-12">
                      <Layers size={140} className="lg:w-45 lg:h-45" />
                    </div>

                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-8 lg:mb-10">
                        <div
                          className="w-16 h-16 lg:w-18 lg:h-18 rounded-2xl flex items-center justify-center shadow-lg border border-white/10 transition-transform group-hover:scale-110 duration-500 shrink-0"
                          style={{ backgroundColor: safeBgColor, color: safeColor }}
                        >
                          <Layers size={28} className="lg:w-9 lg:h-9" strokeWidth={2} />
                        </div>
                        <div className="flex gap-2 lg:gap-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all lg:translate-x-4 lg:group-hover:translate-x-0">
                          <button
                            onClick={() => {
                              setEditingType(type);
                              setShowModal(true);
                            }}
                            className="p-3 lg:p-4 bg-slate-900 lg:bg-white/5 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 transition-all border border-white/5 lg:border-none cursor-pointer shadow-sm"
                            title="Modifier"
                          >
                            <Edit size={16} className="lg:w-5 lg:h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(type.PT_Id)}
                            className="p-3 lg:p-4 bg-slate-900 lg:bg-white/5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all border border-white/5 lg:border-none cursor-pointer shadow-sm"
                            title="Supprimer"
                          >
                            <Trash2 size={16} className="lg:w-5 lg:h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-left flex-1 flex flex-col">
                        <h3 className="text-xl lg:text-2xl font-black uppercase italic mb-3 lg:mb-4 tracking-tighter group-hover:text-blue-400 transition-colors leading-tight m-0 text-white">
                          {type.PT_Label}
                        </h3>
                        <div className="flex items-center gap-3 mb-6 lg:mb-8">
                          <div className="bg-blue-600/10 border border-blue-500/20 px-3 lg:px-4 py-1.5 rounded-full shadow-inner">
                            <span className="text-[9px] lg:text-[10px] font-black uppercase text-blue-400 italic tracking-[0.2em] leading-none">
                              {type.PT_Family}
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] lg:text-[12px] text-slate-400 italic mb-8 lg:mb-12 line-clamp-3 lg:line-clamp-4 leading-relaxed font-bold opacity-80 flex-1 m-0">
                          {type.PT_Description || "Aucune analyse descriptive scellée pour cette famille."}
                        </p>

                        <div className="flex items-center justify-between border-t-2 border-white/5 pt-6 lg:pt-8 mt-auto">
                          <div className="flex items-center gap-3 lg:gap-4">
                            {/* 🛡️ SÉCURISATION DU BACKGROUND COLOR */}
                            <div
                              className="w-4 h-4 lg:w-5 lg:h-5 rounded-md lg:rounded-lg border border-white/10 shadow-sm"
                              style={{ backgroundColor: safeColor }}
                            ></div>
                            <span className="text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest italic leading-none m-0">
                              {safeColor}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 lg:gap-3 bg-slate-900 px-3 lg:px-4 py-2 rounded-xl border border-white/5">
                            <Activity
                              size={12} className={`lg:w-3.5 lg:h-3.5 ${type.PT_IsActive ? "text-emerald-500" : "text-red-500"}`}
                            />
                            <span
                              className={`text-[8px] lg:text-[10px] font-black uppercase italic tracking-widest m-0 leading-none ${type.PT_IsActive ? "text-emerald-500" : "text-red-500"}`}
                            >
                              {type.PT_IsActive ? "ACTIF" : "ARCHIVÉ"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-24 lg:py-32 text-center border-4 border-dashed border-white/5 rounded-[3rem] lg:rounded-[4rem] opacity-40 italic bg-slate-900/20">
                <Layers size={60} className="mx-auto mb-6 lg:w-20 lg:h-20 text-slate-600" />
                <p className="font-black uppercase tracking-[0.3em] lg:tracking-[0.5em] text-xs lg:text-sm text-slate-500 m-0">
                  Néant Structurel — Configuration Requise (§4.4)
                </p>
              </div>
            )}
          </div>
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
    const tid = toast.loading("Scellage de la configuration en cours...");
    try {
      if (type) {
        await apiClient.patch(`/processus-types/${type.PT_Id}`, formData);
        toast.success("Mutation du segment validée avec succès.", { id: tid });
      } else {
        await apiClient.post("/processus-types", formData);
        toast.success("Nouveau grade structurel déployé dans le SMI.", { id: tid });
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error("Échec critique de la mutation structurelle.", { id: tid });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      <div className="bg-[#0B0F1A] border border-white/10 rounded-t-[3rem] sm:rounded-[3rem] lg:rounded-[4rem] max-w-2xl w-full p-8 sm:p-12 lg:p-16 shadow-2xl italic font-bold text-left relative overflow-y-auto max-h-[90vh] custom-scrollbar">
        
        {/* Poignée mobile */}
        <div className="w-16 h-1.5 bg-white/20 rounded-full mx-auto mb-8 sm:hidden" />

        <div className="absolute top-0 right-0 p-8 lg:p-16 opacity-[0.03] pointer-events-none rotate-12">
          <Settings size={150} className="lg:w-55 lg:h-55" />
        </div>

        <div className="flex items-start lg:items-center justify-between mb-10 lg:mb-16 relative z-10 gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6 text-left">
            <div className="p-4 lg:p-5 bg-blue-600/20 text-blue-500 rounded-2xl lg:rounded-3xl border border-blue-500/20 w-max shadow-inner">
              <Settings className="animate-spin-slow" size={28} />
            </div>
            <div>
              <h2 className="text-3xl lg:text-4xl font-black uppercase italic tracking-tighter leading-none text-white m-0">
                {type ? "RECTIFIER" : "INITIALISER"}{" "}
                <span className="text-blue-600">LE TYPE</span>
              </h2>
              <p className="text-[8px] lg:text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2 m-0 leading-tight">
                Architecture SDE — ISO 9001 §4.4
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 lg:p-4 bg-slate-900 border border-white/5 rounded-2xl text-slate-500 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title="Fermer"
          >
            <XCircle size={24} className="lg:w-8 lg:h-8" strokeWidth={2} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 lg:space-y-10 relative z-10 text-left font-sans"
        >
          <div className="space-y-3 lg:space-y-4">
            <label className="text-[9px] lg:text-[10px] text-slate-500 uppercase tracking-[0.2em] lg:tracking-[0.4em] ml-4 lg:ml-6 italic m-0">
              Désignation du Segment *
            </label>
            <input
              required
              className="w-full bg-slate-900 border-2 border-white/10 p-6 lg:p-8 rounded-4xl lg:rounded-3xl text-base lg:text-lg font-black uppercase italic text-white outline-none focus:border-blue-600 transition-colors shadow-inner"
              value={formData.PT_Label}
              onChange={(e) =>
                setFormData({ ...formData, PT_Label: e.target.value.toUpperCase() })
              }
              placeholder="Ex: PROCESSUS DE MANAGEMENT"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-10">
            <div className="space-y-3 lg:space-y-4">
              <label className="text-[9px] lg:text-[10px] text-slate-500 uppercase tracking-[0.2em] lg:tracking-[0.4em] ml-4 lg:ml-6 italic m-0">
                Classification ISO *
              </label>
              <div className="relative">
                <select
                  className="w-full bg-slate-900 border-2 border-white/10 p-6 lg:p-8 rounded-4xl lg:rounded-3xl text-[10px] lg:text-[11px] font-black uppercase italic text-white outline-none focus:border-blue-600 appearance-none shadow-inner cursor-pointer transition-colors pr-12"
                  value={formData.PT_Family}
                  onChange={(e) =>
                    setFormData({ ...formData, PT_Family: e.target.value as ProcessFamily })
                  }
                >
                  {Object.values(ProcessFamily).map((fam) => (
                    <option key={fam} value={fam}>{fam}</option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
              </div>
            </div>
            
            <div className="space-y-3 lg:space-y-4">
              <label className="text-[9px] lg:text-[10px] text-slate-500 uppercase tracking-[0.2em] lg:tracking-[0.4em] ml-4 lg:ml-6 italic m-0">
                Identité Visuelle
              </label>
              <div className="flex gap-4">
                <input
                  type="color"
                  className="w-16 h-16 lg:w-20 lg:h-20 rounded-3xl lg:rounded-3xl cursor-pointer bg-transparent border-none p-0 overflow-hidden shrink-0 shadow-inner"
                  value={formData.PT_Color}
                  onChange={(e) => setFormData({ ...formData, PT_Color: e.target.value })}
                />
                <input
                  className="flex-1 w-full bg-slate-900 border-2 border-white/10 p-5 lg:p-6 rounded-3xl lg:rounded-3xl text-[10px] lg:text-[11px] font-black uppercase italic text-center text-slate-400 outline-none focus:border-blue-600 transition-colors shadow-inner"
                  value={formData.PT_Color}
                  onChange={(e) => setFormData({ ...formData, PT_Color: e.target.value })}
                  placeholder="#HEX"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 lg:space-y-4">
            <label className="text-[9px] lg:text-[10px] text-slate-500 uppercase tracking-[0.2em] lg:tracking-[0.4em] ml-4 lg:ml-6 italic m-0">
              Scope SMI (Description)
            </label>
            <textarea
              rows={4}
              className="w-full bg-slate-900 border-2 border-white/10 p-6 lg:p-8 rounded-4xl lg:rounded-[2.5rem] text-sm font-bold italic text-white outline-none focus:border-blue-600 resize-none transition-colors shadow-inner"
              value={formData.PT_Description}
              onChange={(e) => setFormData({ ...formData, PT_Description: e.target.value })}
              placeholder="Décrivez les finalités globales de cette typologie..."
            />
          </div>
          
          <div className="flex items-center gap-4 bg-slate-900/50 p-6 rounded-3xl border border-white/5">
             <input 
               type="checkbox" 
               id="isActive"
               checked={formData.PT_IsActive}
               onChange={(e) => setFormData({ ...formData, PT_IsActive: e.target.checked })}
               className="w-6 h-6 rounded bg-slate-800 border-white/10 text-blue-600 cursor-pointer"
             />
             <label htmlFor="isActive" className="text-[11px] font-black uppercase tracking-widest text-slate-300 italic cursor-pointer m-0">
                Maintenir ce segment actif dans la cartographie
             </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-6 lg:py-8 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-4xl lg:rounded-[2.5rem] font-black uppercase text-[10px] lg:text-[11px] tracking-[0.2em] lg:tracking-widest flex items-center justify-center gap-4 lg:gap-5 transition-all shadow-[0_15px_30px_rgba(37,99,235,0.3)] border-none cursor-pointer italic disabled:opacity-50 mt-4"
          >
            {saving ? (
              <Loader2 className="animate-spin w-5 h-5 lg:w-5.5 lg:h-5.5" />
            ) : (
              <ShieldCheck size={20} className="lg:w-5.5 lg:h-5.5" />
            )}
            {type ? "Valider LES MODIFICATIONS" : "INITIALISER LA STRUCTURE"}
          </button>
        </form>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.5); }
      `}</style>
    </div>
  );
}