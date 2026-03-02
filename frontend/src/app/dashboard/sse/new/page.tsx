/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🚨 MODULE : src/app/dashboard/sse/new/page.tsx
 * -------------------------------------------------------------------------
 * FONCTION : Enregistrement des nouveaux incidents, accidents et presqu'accidents.
 * RÔLE : Initialisation du processus d'investigation (§10.2 ISO 45001).
 * ISOLATION : Toutes les entrées sont scellées au TenantId de l'organisation.
 * SÉCURITÉ : Zéro NextAuth. Responsive.
 * DATE DE RÉVISION : 02 Mars 2026 | 15:13 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import apiClient from "@/core/api/api-client";
import { ChevronRight, GitCommit, Info, Loader2, Save, ShieldAlert, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast, Toaster } from "sonner"; // Remplacement par Sonner pour uniformité

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
      toast.error(err.response?.data?.message || "REJET : Échec d'indexation Kernel.", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  /**
   * ℹ️ PROTOCOLE DE NOTIFICATION INFO
   */
  const showInfo = () => {
    toast.info("Dossier d'investigation ISO §10.2", {
      style: {
        borderRadius: "20px", background: "#0F172A", color: "#fff",
        border: "1px solid rgba(59, 130, 246, 0.2)", fontSize: "10px",
        fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.1em",
      },
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-12 bg-[#0B0F1A] min-h-screen ml-0 lg:ml-72 text-white font-sans uppercase italic font-black selection:bg-blue-600/30 overflow-x-hidden">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* HEADER SOUVERAIN */}
      <header className="mb-8 lg:mb-16 flex justify-between items-end border-b border-white/5 pb-6 lg:pb-10 animate-in fade-in duration-700">
        <div className="text-left">
          <div className="flex items-center gap-3 lg:gap-4 mb-3 lg:mb-4">
            <div className="p-3 bg-red-600/20 rounded-xl lg:rounded-2xl border border-red-500/30 shrink-0">
              <ShieldAlert size={28} className="text-red-500 lg:w-8 lg:h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl tracking-tighter italic leading-none m-0">
              NOUVEL <span className="text-red-600">INCIDENT</span>
            </h1>
          </div>
          <p className="text-slate-500 text-[8px] lg:text-[10px] tracking-[0.2em] lg:tracking-[0.5em] italic uppercase ml-1 lg:ml-2 m-0">
            Ouverture de dossier d&apos;investigation • ISO 45001
          </p>
        </div>
      </header>

      

      {/* FORMULAIRE D'INDEXATION ÉLITE */}
      <form onSubmit={handleSave} className="max-w-4xl mx-auto space-y-8 lg:space-y-12 text-left animate-in slide-in-from-bottom-8 duration-1000">
        <div className="bg-[#0F172A]/80 border-2 border-white/5 p-6 sm:p-8 lg:p-12 rounded-[2.5rem] lg:rounded-[4rem] shadow-2xl backdrop-blur-xl space-y-8 lg:space-y-10 relative overflow-hidden">
          <GitCommit className="absolute -top-10 -right-10 text-white opacity-5 hidden sm:block" size={200} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 relative z-10">
            {/* TYPE D'INCIDENT */}
            <div className="space-y-3 lg:space-y-4">
              <label className="text-[9px] lg:text-[11px] text-blue-500 tracking-[0.2em] lg:tracking-[0.3em] font-black m-0 block">Classification de l&apos;événement</label>
              <select
                className="w-full bg-[#0B0F1A] border-2 border-white/10 rounded-3xl lg:rounded-4xl p-4 lg:p-6 text-[10px] lg:text-xs font-black text-white uppercase outline-none focus:border-red-600 transition-colors cursor-pointer appearance-none shadow-inner"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="ACCIDENT_TRAVAIL">Accident de travail (AT)</option>
                <option value="ACCIDENT_TRAJET">Accident de trajet</option>
                <option value="PRESQU_ACCIDENT">Presqu&apos;accident (Near Miss)</option>
                <option value="INCIDENT_ENV">Incident Environnemental</option>
              </select>
            </div>

            {/* DATE & HEURE */}
            <div className="space-y-3 lg:space-y-4">
              <label className="text-[9px] lg:text-[11px] text-slate-500 tracking-[0.2em] lg:tracking-[0.3em] font-black m-0 block">Horodatage des faits</label>
              <input
                type="datetime-local"
                className="w-full bg-[#0B0F1A] border-2 border-white/10 rounded-3xl lg:rounded-4xl p-4 lg:p-6 text-[10px] lg:text-xs font-black text-white outline-none focus:border-red-600 transition-colors shadow-inner"
                value={formData.dateHeure}
                onChange={(e) => setFormData({ ...formData, dateHeure: e.target.value })}
              />
            </div>
          </div>

          {/* LIEU */}
          <div className="space-y-3 lg:space-y-4 relative z-10">
            <label className="text-[9px] lg:text-[11px] text-slate-500 tracking-[0.2em] lg:tracking-[0.3em] font-black m-0 block">Localisation précise (Zone / Site)</label>
            <input
              required
              placeholder="EX: ATELIER CENTRAL - ZONE DE STOCKAGE A..."
              className="w-full bg-[#0B0F1A] border-2 border-white/10 rounded-3xl lg:rounded-4xl p-4 lg:p-6 text-[10px] lg:text-xs font-black text-white outline-none focus:border-red-600 transition-colors shadow-inner uppercase placeholder:text-slate-800"
              value={formData.lieu}
              onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
            />
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-3 lg:space-y-4 relative z-10">
            <label className="text-[9px] lg:text-[11px] text-slate-500 tracking-[0.2em] lg:tracking-[0.3em] font-black m-0 block">Circonstances détaillées</label>
            <textarea
              rows={5}
              required
              placeholder="DÉCRIRE LES FAITS, LES ÉQUIPEMENTS IMPLIQUÉS ET LES MESURES IMMÉDIATES..."
              className="w-full bg-[#0B0F1A] border-2 border-white/10 rounded-4xl lg:rounded-[2.5rem] p-6 lg:p-8 text-xs font-bold text-slate-300 outline-none focus:border-red-600 transition-colors italic leading-relaxed shadow-inner resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* FOOTER ACTIONS DANS LA CARTE */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-8 lg:pt-10 border-t border-white/5 mt-8 lg:mt-10 relative z-10 gap-6">
            <div className="flex gap-3 lg:gap-4 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 sm:flex-none p-4 lg:p-6 bg-white/5 border-2 border-white/5 rounded-2xl lg:rounded-3xl text-slate-500 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shadow-md flex justify-center m-0"
              >
                <X size={20} className="lg:w-6 lg:h-6" />
              </button>
              <button
                type="button"
                onClick={showInfo}
                className="flex-1 sm:flex-none p-4 lg:p-6 bg-blue-600/10 border-2 border-blue-500/20 rounded-2xl lg:rounded-3xl text-blue-500 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer shadow-inner flex justify-center m-0"
              >
                <ChevronRight size={20} className="lg:w-6 lg:h-6" />
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 lg:px-12 py-5 lg:py-6 bg-red-600 text-white rounded-4xl lg:rounded-[2.5rem] text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] lg:tracking-[0.3em] italic shadow-[0_15px_30px_rgba(220,38,38,0.4)] hover:bg-red-500 transition-all active:scale-95 disabled:opacity-50 border-none cursor-pointer flex items-center justify-center gap-3 lg:gap-4 m-0"
            >
              {loading ? <Loader2 className="animate-spin shrink-0" size={18} /> : <Save size={18} className="shrink-0" />}
              {loading ? "SCELLAGE..." : "Valider au Registre"}
            </button>
          </div>
        </div>
      </form>

      {/* FOOTER DE CERTIFICATION */}
      <footer className="mt-12 lg:mt-20 opacity-40 text-center max-w-4xl mx-auto pb-8">
        <p className="text-[8px] lg:text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] lg:tracking-[0.5em] italic m-0 px-4 leading-relaxed">
          Qualisoft RD 2026 • Document d&apos;investigation SSE scellé cryptographiquement
        </p>
      </footer>
    </div>
  );
}