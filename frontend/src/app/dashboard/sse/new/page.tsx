/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * 🚨 MODULE : NEW SSE INCIDENT (DÉCLARATION D'ÉVÉNEMENT)
 * -------------------------------------------------------------------------
 * FONCTION : Enregistrement des nouveaux incidents, accidents et presqu'accidents.
 * RÔLE : Initialisation du processus d'investigation (§10.2 ISO 45001).
 * ISOLATION : Toutes les entrées sont scellées au TenantId de l'organisation.
 */

import apiClient from "@/core/api/api-client";
import {
  ChevronRight,
  GitCommit,
  Info,
  Loader2,
  Save,
  ShieldAlert,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

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

  /**
   * 🚀 SOUMISSION AU KERNEL MATRIX
   */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tid = toast.loading("Scellage de l'incident au registre SDE...");

    try {
      // Injection automatique du x-tenant-id via apiClient
      await apiClient.post("/sse", formData);
      toast.success("ÉVÉNEMENT ENREGISTRÉ ET SCELLÉ", { id: tid });
      router.push("/dashboard/sse");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "REJET : Échec d'indexation Kernel.",
        { id: tid },
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * ℹ️ PROTOCOLE DE NOTIFICATION INFO (SÉCURISATION DU BUILD)
   * Correction de l'erreur toast.info (inexistant dans react-hot-toast)
   */
  const showInfo = () => {
    toast("Dossier d'investigation ISO §10.2", {
      icon: <Info className="text-blue-500" size={18} />,
      style: {
        borderRadius: "20px",
        background: "#0F172A",
        color: "#fff",
        border: "1px solid rgba(59, 130, 246, 0.2)",
        fontSize: "10px",
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
      },
    });
  };

  return (
    <div className="p-12 bg-[#0B0F1A] min-h-screen ml-72 text-white font-sans uppercase italic font-black selection:bg-blue-600/30">
      {/* HEADER SOUVERAIN */}
      <header className="mb-16 flex justify-between items-end border-b border-white/5 pb-10">
        <div className="text-left">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-600/20 rounded-2xl border border-red-500/30">
              <ShieldAlert size={32} className="text-red-500" />
            </div>
            <h1 className="text-5xl tracking-tighter italic leading-none">
              NOUVEL <span className="text-red-600">INCIDENT</span>
            </h1>
          </div>
          <p className="text-slate-500 text-[10px] tracking-[0.5em] italic uppercase ml-2">
            Ouverture de dossier d&apos;investigation • ISO 45001
          </p>
        </div>
      </header>

      {/* FORMULAIRE D'INDEXATION ÉLITE */}
      <form onSubmit={handleSave} className="max-w-4xl space-y-12 text-left">
        <div className="bg-[#0F172A]/80 border-2 border-white/5 p-12 rounded-[4rem] shadow-4xl backdrop-blur-xl space-y-10 relative overflow-hidden">
          <GitCommit
            className="absolute -top-10 -right-10 text-white opacity-5"
            size={200}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
            {/* TYPE D'INCIDENT */}
            <div className="space-y-4">
              <label className="text-[11px] text-blue-500 tracking-[0.3em] font-black">
                Classification de l&apos;événement
              </label>
              <select
                className="w-full bg-[#0B0F1A] border-2 border-white/10 rounded-4xl p-6 text-xs font-black text-white uppercase outline-none focus:border-red-600 transition-all cursor-pointer appearance-none shadow-inner"
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

            {/* DATE & HEURE */}
            <div className="space-y-4">
              <label className="text-[11px] text-slate-500 tracking-[0.3em] font-black">
                Horodatage des faits
              </label>
              <input
                type="datetime-local"
                className="w-full bg-[#0B0F1A] border-2 border-white/10 rounded-4xl p-6 text-xs font-black text-white outline-none focus:border-red-600 transition-all shadow-inner"
                value={formData.dateHeure}
                onChange={(e) =>
                  setFormData({ ...formData, dateHeure: e.target.value })
                }
              />
            </div>
          </div>

          {/* LIEU */}
          <div className="space-y-4 relative z-10">
            <label className="text-[11px] text-slate-500 tracking-[0.3em] font-black">
              Localisation précise (Zone / Site)
            </label>
            <input
              required
              placeholder="EX: ATELIER CENTRAL - ZONE DE STOCKAGE A..."
              className="w-full bg-[#0B0F1A] border-2 border-white/10 rounded-4xl p-6 text-xs font-black text-white outline-none focus:border-red-600 transition-all shadow-inner uppercase placeholder:text-slate-800"
              value={formData.lieu}
              onChange={(e) =>
                setFormData({ ...formData, lieu: e.target.value })
              }
            />
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-4 relative z-10">
            <label className="text-[11px] text-slate-500 tracking-[0.3em] font-black">
              Circonstances détaillées
            </label>
            <textarea
              rows={4}
              required
              placeholder="DÉCRIRE LES FAITS, LES ÉQUIPEMENTS IMPLIQUÉS..."
              className="w-full bg-[#0B0F1A] border-2 border-white/10 rounded-[2.5rem] p-8 text-sm font-bold text-slate-300 outline-none focus:border-red-600 transition-all italic leading-relaxed shadow-inner"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* FOOTER ACTIONS DANS LA CARTE */}
          <div className="flex justify-between items-center pt-10 border-t border-white/5 mt-10 relative z-10">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="p-6 bg-white/5 border-2 border-white/5 rounded-3xl text-slate-500 hover:text-white hover:border-white/10 transition-all cursor-pointer shadow-xl"
              >
                <X size={24} />
              </button>
              <button
                type="button"
                onClick={showInfo} // ✅ FIX: Appel de la fonction corrigée
                className="p-6 bg-blue-600/10 border-2 border-blue-500/20 rounded-3xl text-blue-500 hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-inner"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-12 py-6 bg-red-600 text-white rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.3em] italic shadow-2xl shadow-red-900/40 hover:bg-red-500 transition-all active:scale-95 disabled:opacity-50 border-none cursor-pointer flex items-center gap-4"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}
              {loading ? "SCÉLLAGE..." : "Valider au Registre"}
            </button>
          </div>
        </div>
      </form>

      {/* FOOTER DE CERTIFICATION */}
      <footer className="mt-20 opacity-30 text-center max-w-4xl">
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em] italic">
          Qualisoft RD 2026 • Document d&apos;investigation SSE scellé
          cryptographiquement
        </p>
      </footer>
    </div>
  );
}

// Composant local de carte statistique si besoin (non utilisé ici mais disponible dans le design)
function MiniStat({ label, value, icon }: any) {
  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center gap-4">
      <div className="text-red-500">{icon}</div>
      <div>
        <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">
          {label}
        </p>
        <p className="text-xl font-black italic">{value}</p>
      </div>
    </div>
  );
}
