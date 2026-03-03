/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : ContactForm.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Capture de prospects et provisionnement de Tenant.
 * RÉVISION : 03 Mars 2026 | 00:15 GMT
 */

"use client";

import { Building2, CheckCircle, Loader2, Mail, MessageSquare, Send } from "lucide-react";
import React, { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/auth/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: formData.get("company"),
          email: formData.get("email"),
          message: formData.get("message"),
        }),
      });

      if (response.ok) {
        setStatus("REQUÊTE TRANSMISE AU KERNEL. ANALYSE EN COURS.");
        form.reset();
      } else {
        setStatus("ERREUR RÉSEAU : ÉCHEC DE TRANSMISSION.");
      }
    } catch (err) {
      setStatus("ÉCHEC CRITIQUE DE CONNEXION.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-12 bg-white rounded-[4rem] shadow-4xl border border-slate-100 italic text-left relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 p-10 opacity-5 text-blue-600 rotate-12"><Building2 size={160} /></div>

      <h2 className="text-4xl font-black mb-10 uppercase italic tracking-tighter text-slate-950 leading-none">
        Demander une démo <br /> <span className="text-blue-600 underline decoration-blue-100">Qualisoft Elite</span>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-5 tracking-widest flex items-center gap-2"><Building2 size={12} /> Raison Sociale</label>
          <input name="company" required placeholder="EX: GLOBAL INDUSTRIES SA" className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-4xl font-black outline-none focus:border-blue-600 transition-all uppercase shadow-inner" />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-5 tracking-widest flex items-center gap-2"><Mail size={12} /> Email Pro</label>
          <input name="email" type="email" required placeholder="directeur@entreprise.sn" className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-4xl font-black outline-none focus:border-blue-600 transition-all shadow-inner" />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-5 tracking-widest flex items-center gap-2"><MessageSquare size={12} /> Projet Stratégique</label>
          <textarea name="message" rows={4} placeholder="DÉTAILLEZ VOTRE PROJET ISO..." className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-[2.5rem] font-black outline-none focus:border-blue-600 transition-all italic shadow-inner" />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-slate-950 text-white py-8 rounded-[3rem] font-black uppercase italic tracking-[0.4em] hover:bg-blue-600 transition-all flex items-center justify-center gap-5 shadow-4xl active:scale-95 border-none cursor-pointer">
          {loading ? <Loader2 className="animate-spin" /> : <Send size={24} />}
          {loading ? "TRANSMISSION..." : "ENVOYER MA DEMANDE ELITE"}
        </button>

        {status && (
          <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-4xl flex items-center gap-4 animate-in zoom-in">
            <CheckCircle className="text-blue-600" size={24} />
            <p className="text-[11px] font-black text-blue-700 uppercase tracking-tight m-0">{status}</p>
          </div>
        )}
      </form>
    </div>
  );
}