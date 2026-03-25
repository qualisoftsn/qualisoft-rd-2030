/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ⚠️ MODULE : NCModal.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Déclaration d'anomalies et signalement d'écarts.
 * DESIGN : Elite High-Density / Sovereign Alert.
 * RÉVISION : 02 Mars 2026 | 18:50 GMT
 */

"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, Link2, Loader2, ShieldAlert, X, Zap } from "lucide-react";
import apiClient from "@/core/api/api-client";
import { toast } from "sonner";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function NCModal({ onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [audits, setAudits] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    NC_Libelle: "",
    NC_Description: "",
    NC_Gravite: "MINEURE",
    NC_Source: "INTERNAL_AUDIT",
    NC_AuditId: "",
  });

  useEffect(() => {
    // 📡 RÉCUPÉRATION DU RÉFÉRENTIEL AUDIT (SOUVERAINETÉ TENANT)
    apiClient.get("/audits")
      .then((res) => setAudits(Array.isArray(res.data) ? res.data : []))
      .catch(() => toast.error("ÉCHEC DE SYNC : Registre Audits inaccessible."));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tid = toast.loading("Scellage de l'écart au registre...");

    try {
      await apiClient.post("/nc", formData);
      toast.success("NON-CONFORMITÉ INDEXÉE AVEC SUCCÈS", { id: tid });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "ERREUR KERNEL : Rejet du signalement", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0B0F1A]/95 backdrop-blur-2xl z-200 flex items-center justify-center p-6 italic font-sans text-left">
      <div className="bg-white w-full max-w-xl rounded-[3.5rem] overflow-hidden shadow-4xl animate-in zoom-in duration-500 border-none">
        
        {/* 🚨 HEADER CRITIQUE */}
        <header className="p-10 border-b border-red-100 flex justify-between items-center bg-red-50/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-600 animate-pulse" />
          <div className="flex items-center gap-5">
            <div className="p-4 bg-red-600 rounded-2xl text-white shadow-3xl shadow-red-500/30">
              <AlertTriangle size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 m-0">
                Déclarer un <span className="text-red-600 underline">Écart</span>
              </h2>
              <p className="text-[10px] font-black text-red-700/60 uppercase tracking-[0.3em] mt-2 m-0">Signalement d&apos;Anomalie Matrix OS</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-100/50 rounded-xl transition-all border-none bg-transparent cursor-pointer"><X size={32} /></button>
        </header>

        <form onSubmit={handleSubmit} className="p-12 space-y-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 block ml-4 tracking-widest italic leading-none">Intitulé du constat (Objet)</label>
            <input 
              required 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 text-sm font-black text-slate-900 outline-none focus:border-red-500 focus:bg-white transition-all uppercase italic"
              value={formData.NC_Libelle}
              onChange={(e) => setFormData({ ...formData, NC_Libelle: e.target.value.toUpperCase() })}
              placeholder="EX: ABSENCE DE MARQUAGE - ZONE SUD"
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <SelectBlock label="Niveau de Gravité" value={formData.NC_Gravite} onChange={(v: any) => setFormData({ ...formData, NC_Gravite: v })}>
              <option value="MINEURE">⚪ Mineure</option>
              <option value="MAJEURE">🟠 Majeure</option>
              <option value="CRITIQUE">🔴 Critique</option>
            </SelectBlock>
            <SelectBlock label="Provenance (Source)" value={formData.NC_Source} onChange={(v: any) => setFormData({ ...formData, NC_Source: v })}>
              <option value="INTERNAL_AUDIT">Audit Interne</option>
              <option value="CLIENT_COMPLAINT">Réclamation Client</option>
              <option value="INCIDENT_SAFETY">Incident SSE</option>
              <option value="EXTERNAL_AUDIT">Audit Externe</option>
            </SelectBlock>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 block ml-4 tracking-[0.2em] items-center gap-2 italic leading-none">
              <Link2 size={12} className="text-blue-500" /> Audit Scellé (Optionnel)
            </label>
            <select 
              className={`w-full bg-slate-50 border-2 rounded-2xl p-6 text-[11px] font-black outline-none appearance-none cursor-pointer uppercase italic transition-all ${formData.NC_AuditId ? 'border-blue-500 bg-blue-50' : 'border-slate-100'}`}
              value={formData.NC_AuditId}
              onChange={(e) => setFormData({ ...formData, NC_AuditId: e.target.value })}
            >
              <option value="">-- Aucun lien audit détecté --</option>
              {audits.map((a) => <option key={a.AU_Id} value={a.AU_Id}>{a.AU_Reference} : {a.AU_Title}</option>)}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 block ml-4 tracking-widest italic leading-none">Analyse circonstanciée (Preuves)</label>
            <textarea 
              required 
              rows={4}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] p-8 text-sm font-bold text-slate-700 outline-none focus:border-red-500 focus:bg-white transition-all italic leading-relaxed"
              value={formData.NC_Description}
              onChange={(e) => setFormData({ ...formData, NC_Description: e.target.value })}
              placeholder="Détaillez ici les faits observés..."
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-950 py-7 rounded-4xl font-black uppercase italic text-white flex items-center justify-center gap-4 hover:bg-red-600 transition-all shadow-4xl active:scale-95 border-none cursor-pointer tracking-widest"
          >
            {loading ? <Loader2 className="animate-spin" /> : <ShieldAlert size={22} />}
            Sceller au Registre Qualité
          </button>
        </form>
      </div>
    </div>
  );
}

function SelectBlock({ label, value, onChange, children }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black uppercase text-slate-400 block ml-4 italic tracking-widest leading-none">{label}</label>
      <select 
        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 text-[11px] font-black outline-none appearance-none cursor-pointer uppercase italic focus:border-red-500 transition-colors"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
    </div>
  );
}
