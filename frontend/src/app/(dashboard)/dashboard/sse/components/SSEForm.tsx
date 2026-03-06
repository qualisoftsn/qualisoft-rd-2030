//* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🚨 MODULE : SSE SIGNALEMENT FORM (ELITE SDE)
 * -------------------------------------------------------------------------
 * FONCTION : Déclaration des événements et non-conformités.
 * DESIGN : High-Density ClickUp / 100dvh Isolated Scroll.
 */

"use client";

import React, { useState } from "react";
import apiClient from "@/core/api/api-client";
import { AlertCircle, Loader2, MapPin, Save, X, Calendar, Activity } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/core/utils/cn";

export default function SSEForm({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    SSE_Description: "", SSE_Lieu: "", SSE_Type: "ACCIDENT_TRAVAIL",
    SSE_DateEvent: new Date().toISOString().slice(0, 16),
    SSE_AvecArret: false, SSE_NbJoursArret: 0, SSE_Lesions: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tid = toast.loading("Indexation de l'incident...");
    try {
      await apiClient.post("/sse", formData);
      toast.success("INCIDENT SCELLÉ AU REGISTRE", { id: tid });
      onSuccess();
      onClose();
    } catch {
      toast.error("ÉCHEC D'INDEXATION KERNEL", { id: tid });
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-[#0B0F1A]/95 backdrop-blur-2xl z-500 flex items-center justify-center p-4 overflow-hidden italic font-black uppercase">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative bg-[#0F172A] w-full max-w-3xl rounded-[3rem] lg:rounded-[4rem] shadow-4xl border border-white/10 flex flex-col max-h-[90vh] my-auto animate-in zoom-in-95">
        
        <header className="p-8 lg:p-12 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-6 text-left">
            <div className="p-4 bg-orange-600 rounded-2xl text-white shadow-xl animate-pulse">
              <AlertCircle size={32} />
            </div>
            <div>
              <h2 className="text-3xl lg:text-4xl font-black italic tracking-tighter text-white m-0">Signalement <span className="text-orange-500">SSE</span></h2>
              <p className="text-[10px] text-slate-500 tracking-[0.4em] mt-2 m-0">Déclaration Scellée ISO 45001 / 14001</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 hover:bg-rose-600 rounded-2xl transition-all border-none cursor-pointer text-slate-400 hover:text-white"><X size={24}/></button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 lg:p-14 space-y-10 overflow-y-auto custom-scrollbar flex-1 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[11px] text-slate-500 ml-4 flex items-center gap-2"><Activity size={14} className="text-orange-500" /> Nature de l&apos;Événement *</label>
              <select className="w-full bg-black/40 border-2 border-white/10 rounded-3xl p-5 text-xs text-orange-500 font-black outline-none focus:border-orange-500 transition-all uppercase italic cursor-pointer appearance-none shadow-inner" value={formData.SSE_Type} onChange={(e) => setFormData({ ...formData, SSE_Type: e.target.value })}>
                <option value="ACCIDENT_TRAVAIL">Accident du Travail</option>
                <option value="ACCIDENT_TRAJET">Accident de Trajet</option>
                <option value="PRESQU_ACCIDENT">Presqu&apos;accident</option>
                <option value="SITUATION_DANGEREUSE">Situation Dangereuse</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] text-slate-500 ml-4 flex items-center gap-2"><Calendar size={14} className="text-blue-500" /> Horodatage *</label>
              <input type="datetime-local" className="w-full bg-black/40 border-2 border-white/10 rounded-3xl p-5 text-xs text-white font-black outline-none focus:border-blue-500 shadow-inner" value={formData.SSE_DateEvent} onChange={(e) => setFormData({ ...formData, SSE_DateEvent: e.target.value })} required />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] text-slate-500 ml-4">Description Factuelle (§10.2)</label>
            <textarea className="w-full bg-black/40 border-2 border-white/10 rounded-[2.5rem] p-8 text-xs text-slate-300 h-40 outline-none focus:border-orange-500/50 shadow-inner resize-none font-bold leading-relaxed uppercase" placeholder="DÉTAILS DES FAITS ET CAUSES IMMÉDIATES..." value={formData.SSE_Description} onChange={(e) => setFormData({ ...formData, SSE_Description: e.target.value.toUpperCase() })} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            <div className="space-y-3">
              <label className="text-[11px] text-slate-500 ml-4">Localisation Précise *</label>
              <div className="relative">
                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-500" size={20} />
                <input type="text" className="w-full bg-black/40 border-2 border-white/10 rounded-3xl pl-14 pr-6 py-5 text-xs text-white outline-none focus:border-orange-500 shadow-inner" placeholder="ZONE / ATELIER..." value={formData.SSE_Lieu} onChange={(e) => setFormData({ ...formData, SSE_Lieu: e.target.value.toUpperCase() })} required />
              </div>
            </div>

            <div className={cn("flex items-center justify-between p-5 rounded-3xl border-2 transition-all", formData.SSE_AvecArret ? "bg-orange-600/10 border-orange-500/30" : "bg-white/5 border-white/10")}>
              <div className="flex items-center gap-4">
                <input type="checkbox" id="avecArret" className="w-6 h-6 rounded-lg accent-orange-500" checked={formData.SSE_AvecArret} onChange={(e) => setFormData({ ...formData, SSE_AvecArret: e.target.checked })} />
                <label htmlFor="avecArret" className="text-[10px] text-white tracking-widest cursor-pointer">Avec arrêt</label>
              </div>
              {formData.SSE_AvecArret && (
                <input type="number" className="w-20 bg-black/40 border-2 border-orange-500/30 rounded-xl p-2 text-orange-500 text-center font-black outline-none" value={formData.SSE_NbJoursArret} onChange={(e) => setFormData({ ...formData, SSE_NbJoursArret: parseInt(e.target.value) || 0 })} />
              )}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-white text-slate-900 py-8 rounded-4xl font-black text-xs tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-orange-600 hover:text-white transition-all shadow-4xl cursor-pointer active:scale-95 disabled:opacity-50 border-none mt-10">
            {loading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />} Valider au Registre SSE
          </button>
        </form>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}