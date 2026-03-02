/**
 * 🚨 MODULE : src/app/dashboard/sse/components/SSEForm.tsx
 * -------------------------------------------------------------------------
 * FONCTION : Interface Modale de déclaration des événements SSE.
 * LOGIQUE : Binding direct avec le Prisma SseService du backend.
 * RÔLE : Capturer les données §10.2 (Incidents et Non-conformités).
 * SÉCURITÉ : Zéro NextAuth. 
 * DATE DE RÉVISION : 02 Mars 2026 | 15:13 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import apiClient from "@/core/api/api-client";
import { AlertCircle, Loader2, MapPin, Save, X } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

interface SSEFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function SSEForm({ onClose, onSuccess }: SSEFormProps) {
  const [loading, setLoading] = useState(false);

  // État initial conforme aux enums backend (SSEType)
  const [formData, setFormData] = useState({
    SSE_Description: "",
    SSE_Lieu: "",
    SSE_Type: "ACCIDENT_TRAVAIL",
    SSE_DateEvent: new Date().toISOString().slice(0, 16),
    SSE_AvecArret: false,
    SSE_NbJoursArret: 0,
    SSE_Lesions: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 🚀 Transmission au noyau API NestJS
      await apiClient.post("/sse", formData);
      toast.success("Incident scellé au registre SSE.");
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Erreur d'écriture SSE:", err);
      toast.error("Échec de l'enregistrement. Vérifiez les droits d'accès.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-500 flex items-center justify-center p-4 lg:p-6 text-left italic overflow-y-auto">
      <div className="absolute inset-0 transition-opacity" onClick={onClose} />
      
      <div className="relative bg-[#0F172A] w-full max-w-2xl rounded-[2.5rem] lg:rounded-[4rem] shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in-95 duration-500 my-auto">
        {/* HEADER MODALE */}
        <div className="p-6 lg:p-10 border-b border-white/5 flex justify-between items-center bg-white/5 shadow-inner">
          <div className="flex items-center gap-4 lg:gap-5">
            <div className="p-3 lg:p-4 bg-orange-600/20 rounded-xl lg:rounded-2xl border border-orange-500/20 text-orange-500 shrink-0">
              <AlertCircle size={28} className="lg:w-8 lg:h-8" />
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-black italic uppercase tracking-tighter text-white leading-none m-0">
                Signalement <span className="text-orange-500">SSE</span>
              </h2>
              <p className="text-[8px] lg:text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] lg:tracking-widest mt-2 m-0">
                DÉCLARATION SÉCURISÉE ISO 45001 / 14001
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 lg:p-4 bg-white/5 hover:bg-red-600/20 rounded-xl lg:rounded-2xl transition-colors border-none cursor-pointer text-slate-400 hover:text-red-500 shrink-0"
          >
            <X size={24} className="lg:w-7 lg:h-7" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 lg:p-12 space-y-8 lg:space-y-10 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
            {/* SÉLECTEUR DE TYPE */}
            <div className="space-y-2 lg:space-y-3">
              <label className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4 italic">
                Nature de l&apos;Événement *
              </label>
              <select
                className="w-full bg-[#0B0F1A] border border-white/10 rounded-xl lg:rounded-2xl p-4 lg:p-6 font-black text-xs text-orange-500 focus:border-orange-500 outline-none uppercase italic shadow-inner cursor-pointer"
                value={formData.SSE_Type}
                onChange={(e) => setFormData({ ...formData, SSE_Type: e.target.value })}
              >
                <option value="ACCIDENT_TRAVAIL">Accident du Travail</option>
                <option value="ACCIDENT_TRAJET">Accident de Trajet</option>
                <option value="PRESQU_ACCIDENT">Presqu&apos;accident</option>
                <option value="SITUATION_DANGEREUSE">Situation Dangereuse</option>
                <option value="DOMMAGE_MATERIEL">Dommage Matériel</option>
              </select>
            </div>

            {/* HORODATAGE PRÉCIS */}
            <div className="space-y-2 lg:space-y-3">
              <label className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4 italic">
                Date & Heure des Faits *
              </label>
              <input
                type="datetime-local"
                className="w-full bg-[#0B0F1A] border border-white/10 rounded-xl lg:rounded-2xl p-4 lg:p-6 font-black text-xs text-white outline-none focus:border-blue-500 shadow-inner"
                value={formData.SSE_DateEvent}
                onChange={(e) => setFormData({ ...formData, SSE_DateEvent: e.target.value })}
                required
              />
            </div>
          </div>

          {/* DESCRIPTION & LÉSIONS */}
          <div className="space-y-2 lg:space-y-3">
            <label className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4 italic text-left">
              Description Factuelle & Lésions (§10.2)
            </label>
            <textarea
              className="w-full bg-[#0B0F1A] border border-white/10 rounded-4xl lg:rounded-[2.5rem] p-6 lg:p-8 font-bold text-xs text-slate-300 h-28 lg:h-32 outline-none focus:border-orange-500/50 shadow-inner resize-none leading-relaxed uppercase"
              placeholder="DÉCRIVEZ LES FAITS, LES CAUSES IMMÉDIATES ET LES LÉSIONS ÉVENTUELLES..."
              value={formData.SSE_Description}
              onChange={(e) => setFormData({ ...formData, SSE_Description: e.target.value.toUpperCase() })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-end">
            {/* LIEU DE L'INCIDENT */}
            <div className="space-y-2 lg:space-y-3">
              <label className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4 italic">
                Localisation Précise *
              </label>
              <div className="relative">
                <MapPin className="absolute left-5 lg:left-6 top-1/2 -translate-y-1/2 text-orange-500" size={18} />
                <input
                  type="text"
                  className="w-full bg-[#0B0F1A] border border-white/10 rounded-xl lg:rounded-2xl pl-12 lg:pl-16 pr-4 lg:pr-6 py-4 lg:py-6 font-black text-xs text-white outline-none focus:border-orange-500 shadow-inner uppercase italic"
                  placeholder="EX: ATELIER A..."
                  value={formData.SSE_Lieu}
                  onChange={(e) => setFormData({ ...formData, SSE_Lieu: e.target.value.toUpperCase() })}
                  required
                />
              </div>
            </div>

            {/* GESTION DES ARRÊTS DE TRAVAIL */}
            <div className={`flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6 p-5 lg:p-6 rounded-xl lg:rounded-2xl border transition-all ${formData.SSE_AvecArret ? "bg-orange-600/10 border-orange-500/30" : "bg-white/5 border-white/10"}`}>
              <div className="flex items-center gap-3 lg:gap-4 flex-1">
                <input
                  type="checkbox"
                  id="avecArret"
                  className="w-5 h-5 lg:w-6 lg:h-6 rounded-md accent-orange-500 border-white/10"
                  checked={formData.SSE_AvecArret}
                  onChange={(e) => setFormData({ ...formData, SSE_AvecArret: e.target.checked })}
                />
                <label htmlFor="avecArret" className="font-black italic uppercase text-[9px] lg:text-[10px] text-white tracking-widest leading-none cursor-pointer m-0">
                  Accident avec arrêt
                </label>
              </div>

              {formData.SSE_AvecArret && (
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    className="w-16 lg:w-20 bg-black/40 border border-orange-500/30 rounded-xl p-2.5 lg:p-3 font-black text-orange-500 text-center outline-none shadow-inner"
                    value={formData.SSE_NbJoursArret}
                    onChange={(e) => setFormData({ ...formData, SSE_NbJoursArret: parseInt(e.target.value) || 0 })}
                  />
                  <span className="text-[8px] lg:text-[9px] font-black text-slate-500 uppercase italic m-0">Jours</span>
                </div>
              )}
            </div>
          </div>

          {/* VALIDATION SOUVERAINE */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-100 text-slate-900 py-6 lg:py-8 mt-6 rounded-4xl lg:rounded-4xl font-black uppercase italic tracking-[0.2em] lg:tracking-[0.4em] text-[10px] lg:text-[11px] flex items-center justify-center gap-3 lg:gap-4 hover:bg-orange-600 hover:text-white transition-all shadow-xl disabled:opacity-50 border-none cursor-pointer active:scale-95 m-0"
          >
            {loading ? <Loader2 className="animate-spin shrink-0" size={20} /> : <Save size={20} className="shrink-0" />}
            {loading ? "TRAITEMENT..." : "Valider DANS LE REGISTRE SSE"}
          </button>
        </form>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}