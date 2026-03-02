/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * ⚙️ MODULE ABSOLU : src/app/dashboard/settings/structure/page.tsx
 * ---------------------------------------------------------------------------
 * FONCTION : Administration des référentiels structurants du SMI (ISO 9001).
 * LOGIQUE : Gestion par onglets (Unités, Processus, Risques) via apiClient.
 * SÉCURITÉ : Zéro NextAuth.
 * DATE DE RÉVISION : 02 Mars 2026 | 14:32 GMT
 * ---------------------------------------------------------------------------
 */

"use client";

import apiClient from "@/core/api/api-client";
import { Loader2, Plus, Save, Settings2, Tag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";

// --- 🏗️ TYPAGE STRICT DES MÉTADONNÉES ---
interface StructureItem {
  PT_Id?: string;
  OUT_Id?: string;
  RT_Id?: string;
  PT_Label?: string;
  OUT_Label?: string;
  RT_Label?: string;
  PT_Color?: string;
}

type TabType = "units" | "processes" | "risks";

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("units");
  const [data, setData] = useState<StructureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ label: "", color: "#2563eb" });
  const [submitting, setSubmitting] = useState(false);

  // --- ⚙️ CONFIGURATION DES ENDPOINTS & LABELS ---
  const config = {
    units: {
      endpoint: "/org-unit-types",
      title: "Unités d'Organisation",
      label: "EX: DIRECTION, DÉPARTEMENT, ATELIER",
      key: "OUT_Label",
    },
    processes: {
      endpoint: "/process-types",
      title: "Types de Processus",
      label: "EX: MANAGEMENT, SUPPORT, MÉTIER",
      key: "PT_Label",
    },
    risks: {
      endpoint: "/risk-types",
      title: "Typologies de Risques",
      label: "EX: QUALITÉ, SSE, ENVIRONNEMENT",
      key: "RT_Label",
    },
  };

  /**
   * 📡 SYNCHRONISATION DU RÉFÉRENTIEL ACTIF
   */
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(config[activeTab].endpoint);
      setData(Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []));
    } catch (err: any) {
      console.error("Erreur de liaison référentiel:", err);
      setData([]);
      toast.error("Échec de synchronisation avec le Noyau de Configuration.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  /**
   * 💾 PERSISTANCE D'UNE NOUVELLE OPTION
   */
  const handleAdd = async () => {
    if (!newItem.label.trim()) {
      toast.error("Le libellé est obligatoire.");
      return;
    }
    setSubmitting(true);
    const tid = toast.loading("Injection dans le système...");
    try {
      const payload = {
        [config[activeTab].key]: newItem.label.toUpperCase().trim(),
        ...(activeTab === "processes" && { PT_Color: newItem.color }),
      };
      await apiClient.post(config[activeTab].endpoint, payload);
      setNewItem({ label: "", color: "#2563eb" });
      await fetchData();
      toast.success("Référentiel SMI mis à jour.", { id: tid });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur d'écriture serveur.", { id: tid });
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 🗑️ RÉVOCATION D'UNE OPTION
   */
  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (!window.confirm("⚠️ Cette action peut impacter les documents et processus liés. Confirmer la suppression ?")) return;
    
    const tid = toast.loading("Révocation en cours...");
    try {
      await apiClient.delete(`${config[activeTab].endpoint}/${id}`);
      await fetchData();
      toast.success("Option supprimée du référentiel.", { id: tid });
    } catch (err: any) {
      toast.error("L'option est probablement utilisée dans un processus actif (Contrainte d'intégrité).", { id: tid });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-12 bg-slate-50 min-h-screen italic font-sans text-left ml-0 lg:ml-72 selection:bg-blue-600/20">
      <Toaster position="top-right" />
      
      <header className="mb-8 lg:mb-12 border-b border-slate-200 pb-8 lg:pb-10 animate-in fade-in duration-700">
        <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter text-slate-900 flex items-center gap-4 lg:gap-6 leading-none m-0">
          <Settings2 className="text-blue-600 shrink-0" size={36} /> Paramétrage <span className="text-blue-600">Structure SMI</span>
        </h1>
        <p className="text-slate-500 font-bold italic uppercase text-[9px] lg:text-[10px] tracking-[0.3em] lg:tracking-[0.4em] mt-4 lg:mt-6 m-0">
          Architecture Normative • Configuration des Listes de Référence ISO 9001
        </p>
      </header>

      

      {/* SÉLECTEUR TACTIQUE D'ONGLETS (Responsive Scrollable) */}
      <div className="flex overflow-x-auto gap-3 lg:gap-4 mb-8 lg:mb-12 pb-2 custom-scrollbar-light w-full">
        {(["units", "processes", "risks"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 lg:px-10 py-4 lg:py-5 rounded-xl lg:rounded-2xl font-black uppercase text-[9px] lg:text-[10px] transition-all border-none cursor-pointer tracking-[0.2em] lg:tracking-widest italic whitespace-nowrap ${
              activeTab === tab
                ? "bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)] lg:scale-105"
                : "bg-white text-slate-400 border border-slate-200 hover:border-blue-300 hover:text-blue-500 shadow-sm"
            }`}
          >
            {config[tab].title}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start animate-in slide-in-from-bottom-8 duration-700">
        
        {/* FORMULAIRE DE CRÉATION DE MÉTADONNÉES */}
        <div className="bg-white p-6 lg:p-10 rounded-4xl lg:rounded-[3rem] border border-slate-200 shadow-xl lg:sticky lg:top-8 w-full">
          <h2 className="text-[10px] lg:text-[11px] font-black uppercase mb-6 lg:mb-8 flex items-center gap-3 text-slate-900 tracking-widest italic m-0 leading-none">
            <Plus size={18} className="text-blue-600 shrink-0" /> 
            <span>Ajouter <span className="text-blue-600">{activeTab === "units" ? "Unité" : activeTab === "processes" ? "Processus" : "Risque"}</span></span>
          </h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-3 lg:ml-4 tracking-widest italic">Libellé Radical *</label>
              <input
                placeholder={config[activeTab].label}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 lg:px-6 py-4 text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all shadow-inner"
                value={newItem.label}
                onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
              />
            </div>

            {activeTab === "processes" && (
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-3 lg:ml-4 tracking-widest italic">Code Couleur Identitaire</label>
                <input
                  type="color"
                  className="w-full h-12 lg:h-14 rounded-2xl cursor-pointer bg-white border border-slate-200 p-1 lg:p-1.5 shadow-sm"
                  value={newItem.color}
                  onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
                />
              </div>
            )}

            <button
              onClick={handleAdd}
              disabled={submitting || !newItem.label.trim()}
              className="w-full bg-slate-900 text-white font-black uppercase py-4 lg:py-5 rounded-2xl text-[9px] lg:text-[10px] flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl border-none cursor-pointer tracking-widest italic disabled:opacity-50 active:scale-95 m-0"
            >
              {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={18} />}
              Valider dans le système
            </button>
          </div>
        </div>

        {/* REGISTRE DES OPTIONS ACTIVES */}
        <div className="lg:col-span-2 bg-white rounded-4xl lg:rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden w-full">
          {loading ? (
            <div className="p-16 lg:p-32 text-center flex flex-col items-center gap-4 lg:gap-6 bg-slate-50/50">
              <Loader2 className="animate-spin text-blue-600 w-10 h-10" strokeWidth={2} />
              <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.3em] lg:tracking-[0.4em] text-slate-400 italic">
                Lecture du Noyau...
              </span>
            </div>
          ) : (
            <div className="overflow-x-auto w-full custom-scrollbar-light">
              <table className="w-full text-left border-collapse min-w-125">
                <thead className="bg-slate-50/80 text-[9px] lg:text-[10px] font-black uppercase text-slate-400 border-b border-slate-100 italic tracking-widest">
                  <tr>
                    <th className="px-6 lg:px-10 py-6 lg:py-8 whitespace-nowrap">Désignation de l&apos;Option Référencée</th>
                    {activeTab === "processes" && (
                      <th className="px-6 lg:px-10 py-6 lg:py-8 text-center whitespace-nowrap">Identité Visuelle</th>
                    )}
                    <th className="px-6 lg:px-10 py-6 lg:py-8 text-right whitespace-nowrap">Pilotage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((item) => {
                    const id = item.PT_Id || item.OUT_Id || item.RT_Id;
                    const label = item.OUT_Label || item.PT_Label || item.RT_Label;
                    return (
                      <tr key={id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-6 lg:px-10 py-6 lg:py-8 flex items-center gap-4 lg:gap-5">
                          <Tag size={16} className="text-blue-500 opacity-40 shrink-0" />
                          <span className="text-xs lg:text-sm font-black uppercase text-slate-800 tracking-tighter italic">
                            {label}
                          </span>
                        </td>
                        {activeTab === "processes" && (
                          <td className="px-6 lg:px-10 py-6 lg:py-8">
                            <div
                              className="w-8 h-8 lg:w-10 lg:h-10 rounded-[0.8rem] lg:rounded-2xl border border-slate-200 mx-auto shadow-sm"
                              style={{ backgroundColor: item.PT_Color || "#ccc" }}
                            />
                          </td>
                        )}
                        <td className="px-6 lg:px-10 py-6 lg:py-8 text-right">
                          <button
                            onClick={() => handleDelete(id)}
                            className="text-slate-300 hover:text-red-500 transition-all border-none bg-transparent cursor-pointer p-2 lg:p-3 rounded-xl hover:bg-red-50 shadow-sm opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                            title="Révoquer l'option"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!loading && data.length === 0 && (
                    <tr>
                      <td colSpan={activeTab === "processes" ? 3 : 2} className="p-16 lg:p-24 text-center text-slate-300 font-black uppercase italic tracking-widest">
                        <div className="flex flex-col items-center gap-3 opacity-50">
                          <Tag size={32} />
                          <span>Aucun référentiel configuré.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <style jsx global>{`
        .custom-scrollbar-light::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar-light::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-light::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar-light::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}