/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : ActionModal.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Formulaire d'injection d'actions corrective.
 * SÉCURITÉ : Liaison obligatoire au PAQ pour la cohérence ISO (§10.2).
 * SYNC : Unification avec Sonner & Élimination NextAuth.
 * -------------------------------------------------------------------------
 * RÉVISION : 02 Mars 2026 | 17:55 GMT
 */

"use client";

import React, { useCallback, useEffect, useState } from "react";
import apiClient from "@/core/api/api-client";
import { Calendar, Loader2, Save, ShieldAlert, X, User as UserIcon, Layers } from "lucide-react";
import { toast } from "sonner";

interface ActionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ActionModal({ onClose, onSuccess }: ActionModalProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [paqs, setPaqs] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    ACT_Title: "",
    ACT_Description: "",
    ACT_Priority: "MEDIUM",
    ACT_Deadline: "",
    ACT_ResponsableId: "",
    ACT_PAQId: "", 
    ACT_Origin: "AUDIT",
  });

  const loadReferentials = useCallback(async () => {
    try {
      const [resUsers, resPaqs] = await Promise.all([
        apiClient.get("/users"),
        apiClient.get("/paq"),
      ]);
      setUsers(resUsers.data || []);
      setPaqs(resPaqs.data || []);
    } catch (err) {
      toast.error("ERREUR SYNC : Impossible de charger les référentiels.");
    }
  }, []);

  useEffect(() => { loadReferentials(); }, [loadReferentials]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.ACT_ResponsableId || !formData.ACT_PAQId) {
      return toast.warning("CONFIGURATION REQUISE : Pilote & PAQ obligatoires.");
    }

    setLoading(true);
    const tid = toast.loading("Scellage de l'action corrective...");
    
    try {
      await apiClient.post("/actions", formData);
      toast.success("ACTION SCELLÉE : Registre PAQ mis à jour.", { id: tid });
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("ERREUR KERNEL : Enregistrement rejeté.", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0B0F1A]/90 backdrop-blur-xl z-100 flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-[#0F172A] w-full max-w-2xl rounded-[3rem] lg:rounded-[4rem] shadow-4xl border border-white/10 overflow-hidden text-left italic font-sans">
        
        {/* HEADER */}
        <div className="p-10 lg:p-12 border-b border-white/5 flex justify-between items-center bg-white/2">
          <div>
            <h2 className="text-3xl font-black uppercase italic text-white tracking-tighter m-0">Nouvelle Action</h2>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-2 m-0">Initialisation du flux d&apos;amélioration §10.2</p>
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-red-500 hover:rotate-90 transition-all border-none cursor-pointer">
            <X size={24} />
          </button>
        </div>

        {/* FORMULAIRE */}
        <form onSubmit={handleSubmit} className="p-10 lg:p-12 space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-6 tracking-widest italic">Désignation de l&apos;Action</label>
            <input
              required
              placeholder="INTITULÉ DE L'ACTION CORRECTIVE..."
              className="w-full bg-black/40 border border-white/5 rounded-2xl p-6 text-sm font-black italic uppercase outline-none focus:border-blue-600 transition-all shadow-inner text-white"
              value={formData.ACT_Title}
              onChange={(e) => setFormData({ ...formData, ACT_Title: e.target.value.toUpperCase() })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-6 tracking-widest italic flex items-center gap-2"><UserIcon size={12}/> Pilote Responsable</label>
              <select
                required
                className="w-full bg-black/40 border border-white/5 rounded-2xl p-6 text-[11px] font-black uppercase italic outline-none cursor-pointer text-white appearance-none"
                value={formData.ACT_ResponsableId}
                onChange={(e) => setFormData({ ...formData, ACT_ResponsableId: e.target.value })}
              >
                <option value="">-- CHOISIR PILOTE --</option>
                {users.map((u) => <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName} {u.U_LastName}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-6 tracking-widest italic flex items-center gap-2"><Layers size={12}/> Liaison PAQ Master</label>
              <select
                required
                className="w-full bg-black/40 border border-white/5 rounded-2xl p-6 text-[11px] font-black uppercase italic outline-none cursor-pointer text-white appearance-none"
                value={formData.ACT_PAQId}
                onChange={(e) => setFormData({ ...formData, ACT_PAQId: e.target.value })}
              >
                <option value="">-- LIER AU PLAN GLOBAL --</option>
                {paqs.map((p) => <option key={p.PAQ_Id} value={p.PAQ_Id}>{p.PAQ_Title}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-6 tracking-widest italic flex items-center gap-2"><Calendar size={12} /> Échéance Requise</label>
              <input
                type="date"
                required
                className="w-full bg-black/40 border border-white/5 rounded-2xl p-6 text-[11px] font-black italic outline-none text-white"
                value={formData.ACT_Deadline}
                onChange={(e) => setFormData({ ...formData, ACT_Deadline: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-6 tracking-widest italic flex items-center gap-2"><ShieldAlert size={12} /> Priorité Système</label>
              <select
                className="w-full bg-black/40 border border-white/5 rounded-2xl p-6 text-[11px] font-black uppercase italic outline-none cursor-pointer text-white appearance-none"
                value={formData.ACT_Priority}
                onChange={(e) => setFormData({ ...formData, ACT_Priority: e.target.value })}
              >
                <option value="LOW">BASSE</option>
                <option value="MEDIUM">MOYENNE</option>
                <option value="HIGH">HAUTE</option>
                <option value="CRITICAL">⚠️ CRITIQUE</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-6 tracking-widest italic">Détails de mise en œuvre</label>
            <textarea
              placeholder="DESCRIPTION DES ÉTAPES DE RÉALISATION..."
              className="w-full bg-black/40 border border-white/5 rounded-4xl p-6 text-xs font-bold min-h-32 italic outline-none focus:border-blue-600 transition-all text-white"
              value={formData.ACT_Description}
              onChange={(e) => setFormData({ ...formData, ACT_Description: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-white hover:text-blue-600 py-7 rounded-3xl font-black uppercase italic text-white flex items-center justify-center gap-4 shadow-3xl transition-all active:scale-95 disabled:opacity-50 border-none cursor-pointer"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />} 
            ENREGISTRER & SCELLER L&apos;ACTION
          </button>
        </form>
      </div>
    </div>
  );
}
