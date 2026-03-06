/**
 * 🚨 MODULE : NEW SSE INCIDENT PAGE (ELITE SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Initialisation de l'investigation §10.2.
 * DESIGN : 100dvh / High-Density / Matrix Command.
 * ARCHITECTURE : Zéro NextAuth / PWA Ready.
 * -------------------------------------------------------------------------
 * DATE DE RÉVISION : 05 Mars 2026 | 19:55 GMT
 */

"use client";

import apiClient from "@/core/api/api-client";
import {
  GitCommit,
  Info,
  MapPin,
  RefreshCw,
  Save,
  ShieldAlert,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast, Toaster } from "sonner";

export default function NewSSEPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "ACCIDENT_TRAVAIL",
    dateHeure: new Date().toISOString().slice(0, 16),
    lieu: "",
    description: "",
    avecArret: false,
    nbJoursArret: 0,
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tid = toast.loading("Scellage de l'incident au registre...");
    try {
      await apiClient.post("/sse", formData);
      toast.success("ÉVÉNEMENT ENREGISTRÉ ET SCELLÉ", { id: tid });
      router.push("/dashboard/sse");
    } catch {
      toast.error("REJET KERNEL : Échec d'indexation.", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <LoadingScreen label="Scellage Cryptographique en cours..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-orange-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      <header className="shrink-0 p-8 border-b border-white/5 bg-black/40 flex flex-col xl:flex-row justify-between items-center gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-3">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-600 rounded-2xl text-white shadow-xl shadow-rose-600/20">
              <ShieldAlert size={28} />
            </div>
            <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0 italic">
              Nouvel <span className="text-rose-600">Incident</span>
            </h1>
          </div>
          <p className="text-slate-500 text-[10px] tracking-[0.4em] m-0">
            Ouverture Investigation §10.2 ISO 45001
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => router.back()}
            className="p-5 bg-white/5 border border-white/10 rounded-2xl text-slate-500 hover:text-white transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
          <button
            onClick={handleSave}
            form="sse-form"
            className="px-10 py-5 bg-rose-600 text-white rounded-2xl font-black text-[10px] tracking-widest shadow-xl hover:bg-white hover:text-rose-600 transition-all border-none cursor-pointer flex items-center gap-3 active:scale-95"
          >
            <Save size={18} /> SCELLER L&apos;INCIDENT
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <form
          id="sse-form"
          onSubmit={handleSave}
          className="max-w-4xl mx-auto space-y-12 py-10 text-left"
        >
          <div className="bg-[#151A2D] border-2 border-white/5 p-10 lg:p-16 rounded-[4rem] shadow-4xl relative overflow-hidden">
            <GitCommit
              className="absolute -top-10 -right-10 text-white opacity-[0.02]"
              size={300}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 relative z-10">
              <div className="space-y-4">
                <label className="text-[11px] text-blue-500 tracking-widest font-black ml-4">
                  Classification ISO
                </label>
                <select
                  className="w-full bg-black/40 border-2 border-white/10 rounded-4xl p-6 text-xs font-black text-white outline-none focus:border-rose-600 transition-all cursor-pointer appearance-none shadow-inner uppercase italic"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value="ACCIDENT_TRAVAIL">
                    Accident de travail (AT)
                  </option>
                  <option value="ACCIDENT_TRAJET">Accident de trajet</option>
                  <option value="PRESQU_ACCIDENT">
                    Presqu&apos;accident (Near Miss)
                  </option>
                  <option value="INCIDENT_ENV">Incident Environnemental</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] text-slate-500 tracking-widest font-black ml-4">
                  Horodatage précis
                </label>
                <input
                  type="datetime-local"
                  className="w-full bg-black/40 border-2 border-white/10 rounded-4xl p-6 text-xs font-black text-white outline-none focus:border-rose-600 shadow-inner"
                  value={formData.dateHeure}
                  onChange={(e) =>
                    setFormData({ ...formData, dateHeure: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-4 mb-12 relative z-10">
              <label className="text-[11px] text-slate-500 tracking-widest font-black ml-4 flex items-center gap-2">
                <MapPin size={14} /> Localisation (Zone / Site)
              </label>
              <input
                required
                placeholder="EX: ATELIER CENTRAL - ZONE A..."
                className="w-full bg-black/40 border-2 border-white/10 rounded-4xl p-6 text-xs font-black text-white outline-none focus:border-rose-600 shadow-inner uppercase"
                value={formData.lieu}
                onChange={(e) =>
                  setFormData({ ...formData, lieu: e.target.value })
                }
              />
            </div>

            <div className="space-y-4 relative z-10">
              <label className="text-[11px] text-slate-500 tracking-widest font-black ml-4 flex items-center gap-2">
                <Info size={14} /> Circonstances Détaillées
              </label>
              <textarea
                rows={6}
                required
                placeholder="DÉCRIRE LES FAITS, ÉQUIPEMENTS IMPLIQUÉS..."
                className="w-full bg-black/40 border-2 border-white/10 rounded-[3rem] p-8 text-xs font-bold text-slate-300 outline-none focus:border-rose-600 transition-all italic leading-relaxed shadow-inner resize-none uppercase"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>
        </form>
      </main>

      <footer className="shrink-0 bg-black/40 border-t border-white/5 p-6 flex justify-center opacity-30 italic text-[9px] tracking-[0.5em]">
        Qualisoft RD 2026 • Document d&apos;investigation SSE scellé
        cryptographiquement
      </footer>
      <style
        dangerouslySetInnerHTML={{
          __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }`,
        }}
      />
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-rose-600 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed uppercase">
        {label}
      </span>
    </div>
  );
}
