/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * NOM ABSOLU : src/app/dashboard/settings/structure/page.tsx
 * FONCTION : Administration des référentiels structurants du SMI.
 * LOGIQUE : Gestion par onglets des métadonnées ISO (Unités, Processus, Risques).
 */

"use client";

import apiClient from "@/core/api/api-client";
import { Loader2, Plus, Save, Settings2, Tag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState<"units" | "processes" | "risks">(
    "units",
  );
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ label: "", color: "#2563eb" });

  // --- CONFIGURATION DES ENDPOINTS & LABELS ---
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
      setData(Array.isArray(res.data) ? res.data : []);
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
    if (!newItem.label) return;
    try {
      const payload = {
        [config[activeTab].key]: newItem.label.toUpperCase().trim(),
        ...(activeTab === "processes" && { PT_Color: newItem.color }),
      };
      await apiClient.post(config[activeTab].endpoint, payload);
      setNewItem({ label: "", color: "#2563eb" });
      fetchData();
      toast.success("Référentiel SMI mis à jour.");
    } catch (err) {
      toast.error("Erreur d'écriture serveur.");
    }
  };

  /**
   * 🗑️ RÉVOCATION D'UNE OPTION
   */
  const handleDelete = async (id: string) => {
    if (
      !confirm("⚠️ Cette action peut impacter les documents liés. Confirmer ?")
    )
      return;
    try {
      await apiClient.delete(`${config[activeTab].endpoint}/${id}`);
      fetchData();
    } catch (err) {
      toast.error(
        "L'option est probablement utilisée dans un processus actif.",
      );
    }
  };

  return (
    <div className="p-12 bg-slate-50 min-h-screen italic font-sans text-left ml-72">
      <header className="mb-12 border-b border-slate-200 pb-10">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 flex items-center gap-6 leading-none">
          <Settings2 className="text-blue-600" size={48} /> Paramétrage{" "}
          <span className="text-blue-600">Structure SMI</span>
        </h1>
        <p className="text-slate-500 font-bold italic uppercase text-[10px] tracking-[0.4em] mt-6">
          Architecture Normative • Configuration des Listes de Référence ISO
        </p>
      </header>

      {/* SÉLECTEUR TACTIQUE D'ONGLETS */}
      <div className="flex gap-4 mb-12">
        {(["units", "processes", "risks"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-10 py-5 rounded-2xl font-black uppercase text-[10px] transition-all border-none cursor-pointer tracking-widest italic ${
              activeTab === tab
                ? "bg-blue-600 text-white shadow-2xl scale-105"
                : "bg-white text-slate-400 border border-slate-200 hover:border-blue-300"
            }`}
          >
            {config[tab].title}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* FORMULAIRE DE CRÉATION DE MÉTADONNÉES */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-2xl h-fit">
          <h2 className="text-[10px] font-black uppercase mb-8 flex items-center gap-3 text-slate-900 tracking-widest italic">
            <Plus size={18} className="text-blue-600" /> Ajouter un{" "}
            {activeTab === "units" ? "Niveau d'unité" : "Type"}
          </h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-4">
                Libellé Radical
              </label>
              <input
                placeholder={config[activeTab].label}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-inner"
                value={newItem.label}
                onChange={(e) =>
                  setNewItem({ ...newItem, label: e.target.value })
                }
              />
            </div>

            {activeTab === "processes" && (
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-4">
                  Code Couleur Identitaire
                </label>
                <input
                  type="color"
                  className="w-full h-14 rounded-2xl cursor-pointer bg-white border border-slate-200 p-1"
                  value={newItem.color}
                  onChange={(e) =>
                    setNewItem({ ...newItem, color: e.target.value })
                  }
                />
              </div>
            )}

            <button
              onClick={handleAdd}
              className="w-full bg-slate-900 text-white font-black uppercase py-5 rounded-2xl text-[10px] flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl border-none cursor-pointer tracking-widest italic"
            >
              <Save size={18} /> Valider dans le système
            </button>
          </div>
        </div>

        {/* REGISTRE DES OPTIONS ACTIVES */}
        <div className="lg:col-span-2 bg-white rounded-[3.5rem] border border-slate-200 shadow-2xl overflow-hidden backdrop-blur-3xl">
          {loading ? (
            <div className="p-32 text-center flex flex-col items-center gap-6">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">
                Lecture du Noyau...
              </span>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100 italic">
                <tr>
                  <th className="px-10 py-8 tracking-widest">
                    Désignation de l&apos;Option Référencée
                  </th>
                  {activeTab === "processes" && (
                    <th className="px-10 py-8 text-center">
                      Identité Visuelle
                    </th>
                  )}
                  <th className="px-10 py-8 text-right">Pilotage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((item) => {
                  const id = item.PT_Id || item.OUT_Id || item.RT_Id;
                  const label =
                    item.OUT_Label || item.PT_Label || item.RT_Label;
                  return (
                    <tr
                      key={id}
                      className="hover:bg-slate-50 transition-all group"
                    >
                      <td className="px-10 py-8 flex items-center gap-4">
                        <Tag size={16} className="text-blue-500 opacity-40" />
                        <span className="text-sm font-black uppercase text-slate-900 tracking-tighter italic">
                          {label}
                        </span>
                      </td>
                      {activeTab === "processes" && (
                        <td className="px-10 py-8">
                          <div
                            className="w-10 h-10 rounded-2xl border border-slate-200 mx-auto shadow-inner"
                            style={{ backgroundColor: item.PT_Color }}
                          ></div>
                        </td>
                      )}
                      <td className="px-10 py-8 text-right">
                        <button
                          onClick={() => handleDelete(id)}
                          className="text-slate-300 hover:text-red-500 transition-all border-none bg-transparent cursor-pointer p-3 rounded-xl hover:bg-red-50"
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {!loading && data.length === 0 && (
            <div className="p-32 text-center text-slate-300 font-black uppercase italic tracking-widest opacity-30">
              Aucun référentiel configuré pour cette catégorie.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
