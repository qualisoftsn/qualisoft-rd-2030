/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ⚙️ MODULE : ADMINISTRATION STRUCTURELLE (ELITE SDE)
 * ---------------------------------------------------------------------------
 * RÔLE : Configuration des référentiels (Unités, Processus, Risques).
 * DESIGN : Elite Multi-Tab / High-Density Grid / 100dvh.
 * SÉCURITÉ : Zéro NextAuth (Souveraineté JWT).
 * ---------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 19:10 GMT
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import apiClient from "@/core/api/api-client";
import { Loader2, Plus, Save, Settings2, Trash2, RefreshCw, Layers } from "lucide-react";
import { toast, Toaster } from "sonner";

type TabType = "units" | "processes" | "risks";

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("units");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ label: "", color: "#2563eb" });
  const [submitting, setSubmitting] = useState(false);

  const config = {
    units: { endpoint: "/org-unit-types", title: "Unités d'Organisation", label: "EX: DIRECTION, ATELIER", key: "OUT_Label" },
    processes: { endpoint: "/process-types", title: "Types de Processus", label: "EX: MÉTIER, SUPPORT", key: "PT_Label" },
    risks: { endpoint: "/risk-types", title: "Typologies de Risques", label: "EX: QUALITÉ, ENVIRONNEMENT", key: "RT_Label" },
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<any>(config[activeTab].endpoint);
      const content = res.data?.data || res.data;
      setData(Array.isArray(content) ? content : []);
    } catch {
      toast.error("ÉCHEC KERNEL : Synchronisation référentiel interrompue.");
    } finally { setLoading(false); }
  }, [activeTab, config]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async () => {
    if (!newItem.label.trim()) return toast.warning("Libellé obligatoire.");
    setSubmitting(true);
    const tid = toast.loading("Injection système...");
    try {
      const payload = { [config[activeTab].key]: newItem.label.toUpperCase().trim(), ...(activeTab === "processes" && { PT_Color: newItem.color }) };
      await apiClient.post(config[activeTab].endpoint, payload);
      setNewItem({ label: "", color: "#2563eb" });
      fetchData();
      toast.success("Référentiel SMI mis à jour.", { id: tid });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur d'écriture serveur.", { id: tid });
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("⚠️ Impact potentiel sur la traçabilité. Confirmer la révocation ?")) return;
    const tid = toast.loading("Révocation en cours...");
    try {
      await apiClient.delete(`${config[activeTab].endpoint}/${id}`);
      fetchData();
      toast.success("Option révoquée.", { id: tid });
    } catch {
      toast.error("Contrainte d'intégrité : Option utilisée dans un processus actif.", { id: tid });
    }
  };

  if (loading && data.length === 0) return <LoadingScreen label="Synchronisation Configuration SMI..." />;

  return (
    <div className="h-screen bg-slate-50 text-slate-900 italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/20">
      <Toaster position="top-right" richColors />

      {/* 🔝 HEADER E-ADMIN */}
      <header className="shrink-0 p-8 border-b border-slate-200 bg-white flex flex-col xl:flex-row justify-between items-center gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-3">
          <div className="flex items-center gap-3">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[9px] font-black italic shadow-lg uppercase tracking-widest">ISO 9001 §4.4</span>
            <h1 className="text-3xl lg:text-4xl tracking-tighter leading-none m-0 italic flex items-center gap-4 uppercase">
              <Settings2 className="text-blue-600" size={36} /> Paramétrage <span className="text-blue-600">Structure</span>
            </h1>
          </div>
          <p className="text-slate-500 text-[10px] tracking-[0.4em] m-0">Architecture Normative • Configuration des Référentiels SMI</p>
        </div>
        <div className="flex overflow-x-auto gap-3 w-full xl:w-auto p-2 bg-slate-100 rounded-3xl border border-slate-200">
          {(["units", "processes", "risks"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={cn(
              "px-8 py-4 rounded-2xl font-black text-[10px] transition-all border-none cursor-pointer italic uppercase whitespace-nowrap tracking-widest",
              activeTab === tab ? "bg-blue-600 text-white shadow-xl" : "bg-white text-slate-400 hover:text-blue-600"
            )}>{config[tab].title}</button>
          ))}
        </div>
      </header>

      {/* 🧩 DUAL VIEWPORT GRID */}
      <main className="flex-1 overflow-hidden p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* FORMULAIRE D'INJECTION (Sticky style within viewport) */}
        <section className="lg:col-span-4 bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-2xl flex flex-col gap-10">
          <h2 className="text-lg font-black italic m-0 flex items-center gap-4 text-slate-900 uppercase">
            <Plus className="text-blue-600" size={24} /> Ajouter <span className="text-blue-600">{activeTab}</span>
          </h2>
          <div className="space-y-6">
            <div className="space-y-3 text-left">
              <label className="text-[10px] font-black text-slate-400 ml-4 tracking-widest italic uppercase">Libellé Radical *</label>
              <input placeholder={config[activeTab].label} className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-sm font-black text-slate-900 outline-none focus:border-blue-600 italic uppercase shadow-inner" value={newItem.label} onChange={(e) => setNewItem({ ...newItem, label: e.target.value })} />
            </div>
            {activeTab === "processes" && (
              <div className="space-y-3 text-left">
                <label className="text-[10px] font-black text-slate-400 ml-4 tracking-widest italic uppercase">Identité Visuelle</label>
                <input type="color" className="w-full h-16 rounded-3xl cursor-pointer bg-white border-2 border-slate-100 p-2 shadow-inner" value={newItem.color} onChange={(e) => setNewItem({ ...newItem, color: e.target.value })} />
              </div>
            )}
            <button onClick={handleAdd} disabled={submitting} className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black text-[11px] tracking-[0.4em] italic shadow-4xl border-none cursor-pointer hover:bg-blue-600 transition-all flex items-center justify-center gap-4 uppercase">
              {submitting ? <Loader2 className="animate-spin" /> : <Save size={20} />} Injecter dans le Noyau
            </button>
          </div>
        </section>

        {/* REGISTRE DATA STREAM (Isolated Scroll) */}
        <section className="lg:col-span-8 bg-white rounded-[3rem] border-2 border-slate-100 shadow-2xl overflow-hidden flex flex-col">
          <header className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-sm font-black italic m-0 uppercase flex items-center gap-3 tracking-widest">
              <Layers className="text-blue-600" size={20} /> Référentiel Actif
            </h2>
            <button onClick={fetchData} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 transition-all cursor-pointer">
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </header>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <table className="w-full text-left border-collapse">
              <tbody className="divide-y divide-slate-50">
                {data.map((item) => {
                  const id = item.PT_Id || item.OUT_Id || item.RT_Id;
                  const label = item.OUT_Label || item.PT_Label || item.RT_Label;
                  return (
                    <tr key={id} className="group hover:bg-blue-50/30 transition-all italic">
                      <td className="p-6">
                        <div className="flex items-center gap-5">
                          {activeTab === "processes" && <div className="w-10 h-10 rounded-xl border-2 border-white shadow-sm" style={{ backgroundColor: item.PT_Color }} />}
                          <span className="text-sm font-black text-slate-800 uppercase tracking-tighter">{label}</span>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <button onClick={() => handleDelete(id)} className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all border-none cursor-pointer opacity-100 lg:opacity-0 group-hover:opacity-100"><Trash2 size={20}/></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white gap-8 lg:pl-72 text-blue-600 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed uppercase">{label}</span>
    </div>
  );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
