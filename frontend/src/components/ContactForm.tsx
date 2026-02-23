/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
/**
 * 🛰️ MODULE : CONTACT / DEMANDE DE DÉMO
 * -------------------------------------------------------------------------
 * FONCTION : Capture de prospects et workflow d'invitation (Lead Gen).
 * RÔLE : Initier le processus de provisionnement d'un nouveau Tenant.
 * PHILOSOPHIE : Sobriété, efficacité, conversion Elite.
 */

import {
  Building2,
  CheckCircle,
  Loader2,
  Mail,
  MessageSquare,
  Send,
} from "lucide-react";
import React, { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      company: formData.get("company"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    try {
      const response = await fetch("/api/auth/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setStatus(
          "Requête transmise au Kernel. Nos analystes vous contacteront.",
        );
        form.reset();
      } else {
        setStatus("Erreur de transmission. Vérifiez vos protocoles réseau.");
      }
    } catch (err) {
      setStatus("Échec critique de connexion au service d'invitation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 bg-white rounded-[3rem] shadow-2xl border border-slate-100 italic text-left relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5 text-blue-600">
        <Building2 size={120} />
      </div>

      <h2 className="text-3xl font-black mb-8 uppercase italic tracking-tighter text-slate-950 leading-none">
        Demander une démo <br />
        <span className="text-blue-600">Qualisoft Elite</span>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest italic flex items-center gap-2">
            <Building2 size={12} /> Raison Sociale
          </label>
          <input
            type="text"
            name="company"
            required
            placeholder="EX: GLOBAL INDUSTRIES SA"
            className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl font-bold outline-none focus:border-blue-600 transition-all uppercase"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest italic flex items-center gap-2">
            <Mail size={12} /> Email Professionnel
          </label>
          <input
            type="email"
            name="email"
            required
            placeholder="directeur@entreprise.sn"
            className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl font-bold outline-none focus:border-blue-600 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest italic flex items-center gap-2">
            <MessageSquare size={12} /> notre besoin stratégique
          </label>
          <textarea
            name="message"
            rows={4}
            placeholder="DÉTAILLEZ notre PROJET ISO..."
            className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl font-bold outline-none focus:border-blue-600 transition-all italic"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-950 text-white py-6 rounded-4xl font-black uppercase italic tracking-[0.3em] hover:bg-blue-600 transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95 border-none cursor-pointer"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
          {loading ? "TRANSMISSION..." : "Envoyer ma demande Elite"}
        </button>

        {status && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in">
            <CheckCircle className="text-blue-600" size={18} />
            <p className="text-[11px] font-black text-blue-700 uppercase tracking-tight italic">
              {status}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
