/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🚨 MODULE : SseModal.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Déclaration d'événements SSE (Accidents/Incidents).
 * PHILOSOPHIE : Réactivité maximale et traçabilité légale (§10.2).
 * RÉVISION : 02 Mars 2026 | 19:25 GMT
 */

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AlertCircle, Loader2, MapPin, ShieldAlert, X, User, Activity } from "lucide-react";
import apiClient from "@/core/api/api-client";
import { toast } from "sonner";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function SseModal({ onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [sites, setSites] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [form, setForm] = useState({
    SSE_Type: "ACCIDENT_TRAVAIL",
    SSE_Lieu: "",
    SSE_Description: "",
    SSE_DateEvent: new Date().toISOString().split("T")[0],
    SSE_SiteId: "",
    SSE_VictimId: "",
    SSE_AvecArret: false,
    SSE_NbJoursArret: 0,
    SSE_Lesions: "",
  });

  const syncKernel = useCallback(async () => {
    try {
      const [sRes, uRes] = await Promise.all([
        apiClient.get("/sites"),
        apiClient.get("/users")
      ]);
      setSites(Array.isArray(sRes.data) ? sRes.data : []);
      setUsers(Array.isArray(uRes.data) ? uRes.data : []);
    } catch (err) {
      toast.error("ERREUR : Rupture de liaison avec le Kernel");
    }
  }, []);

  useEffect(() => {
    syncKernel();
  }, [syncKernel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tid = toast.loading("Indexation du sinistre SSE...");
    try {
      await apiClient.post("/sse", form);
      toast.success("ÉVÉNEMENT SSE ARCHIVÉ ET SCELLÉ", { id: tid });
      onSuccess();
      onClose();
    /// eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("REJET : Erreur d'intégrité des données", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-200 flex items-center justify-center p-6 italic font-sans text-left animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-4xl rounded-[4rem] shadow-4xl overflow-hidden animate-in slide-in-from-bottom-12 duration-700">
        
        {/* HEADER D'URGENCE ROUGE */}
        <header className="p-12 bg-red-600 text-white flex justify-between items-center relative overflow-hidden">
          <ShieldAlert className="absolute -right-10 -bottom-10 opacity-10 text-white rotate-12" size={280} />
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="p-5 bg-white/20 rounded-3xl backdrop-blur-md animate-pulse shadow-xl">
              <AlertCircle size={36} />
            </div>
            <div className="leading-none">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter m-0">
                Déclarer un <span className="text-slate-900 underline decoration-white/20">Événement SSE</span>
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] mt-3 opacity-70 m-0">
                Rapport de sinistre scellé • ISO 45001
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border-none cursor-pointer text-white relative z-10">
            <X size={32} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-14 grid grid-cols-2 gap-10">
          
          <div className="col-span-2 space-y-4">
            <label className="text-[11px] font-black uppercase text-slate-500 ml-5 tracking-[0.2em] italic">Catégorie de l&apos;écart SSE</label>
            <select
              className="w-full bg-slate-50 border-2 border-slate-100 p-7 rounded-4xl text-sm font-black outline-none focus:border-red-600 transition-all uppercase italic cursor-pointer shadow-inner appearance-none"
              value={form.SSE_Type}
              onChange={(e) => setForm({ ...form, SSE_Type: e.target.value })}
            >
              <option value="ACCIDENT_TRAVAIL">Accident de Travail (AT)</option>
              <option value="ACCIDENT_TRAJET">Accident de Trajet</option>
              <option value="PRESQU_ACCIDENT">Presqu&apos;Accident (Nearly Miss)</option>
              <option value="SITUATION_DANGEREUSE">Situation Dangereuse</option>
            </select>
          </div>

          <div className="space-y-4 text-left">
            <label className="text-[11px] font-black uppercase text-slate-500 ml-5 tracking-widest italic">Date & Heure des faits</label>
            <input type="date" required className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-3xl text-sm font-black outline-none focus:border-red-600 shadow-inner" value={form.SSE_DateEvent} onChange={(e) => setForm({ ...form, SSE_DateEvent: e.target.value })} />
          </div>

          <div className="space-y-4 text-left">
            <label className="text-[11px] font-black uppercase text-slate-500 ml-5 tracking-widest italic flex items-center gap-2"><MapPin size={16} /> Site de l&apos;événement</label>
            <select className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-3xl text-sm font-black outline-none focus:border-red-600 uppercase italic cursor-pointer shadow-inner" value={form.SSE_SiteId} onChange={(e) => setForm({ ...form, SSE_SiteId: e.target.value })}>
              <option value="">-- CHOISIR UN SITE --</option>
              {sites.map((s) => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
            </select>
          </div>

          <div className="col-span-2 space-y-4 text-left">
            <label className="text-[11px] font-black uppercase text-slate-500 ml-5 tracking-widest italic">Description & Circonstances</label>
            <textarea required rows={3} className="w-full bg-slate-50 border-2 border-slate-100 p-8 rounded-[2.5rem] text-sm font-bold outline-none focus:border-red-600 italic leading-relaxed shadow-inner" placeholder="Décrivez précisément les faits, les causes immédiates..." value={form.SSE_Description} onChange={(e) => setForm({ ...form, SSE_Description: e.target.value })} />
          </div>

          {/* IMPACT ET ARRÊTS */}
          <div className="col-span-2 p-8 bg-slate-50 rounded-[2.5rem] flex items-center justify-between border-2 border-transparent hover:border-red-100 transition-all italic">
            <div className="flex items-center gap-6">
              <input type="checkbox" className="w-10 h-10 rounded-xl border-slate-300 text-red-600 focus:ring-red-600 cursor-pointer shadow-inner" checked={form.SSE_AvecArret} onChange={(e) => setForm({ ...form, SSE_AvecArret: e.target.checked })} />
              <div>
                <label className="text-sm font-black uppercase text-slate-900 m-0 leading-none">Indice de gravité : Arrêt de travail</label>
                <p className="text-[9px] font-black text-slate-400 uppercase mt-2 m-0 tracking-[0.2em]">Interruption de la continuité de service</p>
              </div>
            </div>

            {form.SSE_AvecArret && (
              <div className="flex items-center gap-4 animate-in slide-in-from-right duration-500">
                <span className="text-[11px] font-black text-red-600 uppercase italic">Jours d&apos;arrêt :</span>
                <input type="number" className="w-24 bg-white border-2 border-red-100 p-4 rounded-xl text-lg font-black outline-none text-red-600 text-center shadow-lg" value={form.SSE_NbJoursArret} onChange={(e) => setForm({ ...form, SSE_NbJoursArret: parseInt(e.target.value) })} />
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="col-span-2 bg-slate-950 py-8 rounded-[3rem] font-black uppercase italic text-xs tracking-[0.5em] text-white shadow-4xl hover:bg-red-600 transition-all flex justify-center items-center gap-6 border-none cursor-pointer active:scale-95 disabled:opacity-30 mt-6">
            {loading ? <Loader2 className="animate-spin" size={24} /> : <Activity size={24} />}
            Sceller le rapport de sinistre
          </button>
        </form>
      </div>
    </div>
  );
}
