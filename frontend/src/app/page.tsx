/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import {
  Activity,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Crown,
  Fingerprint,
  Mail,
  Rocket,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
  Building2,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function LandingPage() {
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [masterKey, setMasterKey] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInviteSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const payload = {
      email: formData.get('email'),
      company: formData.get('company'),
      message: "Demande d'accès d'essai 14 jours (Landing Page)"
    };

    try {
      const response = await fetch("/api/auth/invite", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert("Oups ! Une erreur est survenue. Veuillez vérifier vos informations.");
      }
    } catch (error) {
      alert("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  const handleMasterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterKey === "QUALISOFT_2030_ADMIN") {
      window.location.href = "/dashboard";
    } else {
      alert("Clé Master Invalide");
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white selection:bg-blue-600/30 selection:text-blue-200 font-sans italic">
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-[#0B0F1A]/80 backdrop-blur-2xl border-b border-white/5 px-6 md:px-12 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center border border-white/10 shadow-lg shadow-blue-600/20">
            <span className="font-black text-xl text-white not-italic">Q</span>
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter leading-none hidden md:block">
            Qualisoft <span className="text-blue-600">RD 2030 AT</span>
          </h1>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <button onClick={() => setShowMasterModal(true)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-amber-500 transition-all group">
            <Crown size={14} className="group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Accès Master QS</span>
          </button>
          <Link href="/register" className="px-6 py-3 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 shadow-xl shadow-blue-600/20 transition-all active:scale-95">
            Essai Gratuit
          </Link>
        </div>
      </nav>

      {/* --- HERO --- */}
      <section className="relative pt-48 pb-20 px-6 overflow-hidden border-b border-white/5">
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-5xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] mb-10 italic">
            Pilotez votre <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-indigo-500">Conformité.</span>
          </h1>

          {/* FORMULAIRE RÉPARÉ */}
          <div className="max-w-md mx-auto bg-white/5 border border-white/10 p-8 rounded-[3rem] shadow-3xl backdrop-blur-xl">
            {!submitted ? (
              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div className="text-left space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">
                    Inscrivez-vous pour le test de 14 jours
                  </label>
                  
                  {/* Champ Entreprise */}
                  <div className="relative mb-2">
                    <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input type="text" name="company" required placeholder="Nom de l'entreprise" className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 pr-4 focus:outline-none focus:border-blue-500 transition-all text-white" />
                  </div>

                  {/* Champ Email */}
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input type="email" name="email" required placeholder="votre@email.com" className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 pr-4 focus:outline-none focus:border-blue-500 transition-all text-white" />
                  </div>
                </div>
                
                <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-600/30 text-[11px] uppercase tracking-widest">
                  {loading ? "Traitement..." : "Réserver mon accès Élite"} <Sparkles size={18} />
                </button>
              </form>
            ) : (
              <div className="py-8 space-y-4 animate-in zoom-in duration-500">
                <CheckCircle2 size={32} className="text-blue-500 mx-auto" />
                <h3 className="text-xl font-black uppercase italic">Enregistré !</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-tight">Rendez-vous le 02 février.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- AUTRES SECTIONS GARDÉES À L'IDENTIQUE --- */}
      <footer className="py-12 px-6 text-center border-t border-white/5">
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em] italic">
          Qualisoft RD 2030 • Dakar • Sénégal • Excellence Opérationnelle
        </p>
      </footer>

      {/* MODAL MASTER GARDÉ À L'IDENTIQUE */}
      {showMasterModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-xl p-6">
          <div className="bg-[#0F172A] border border-amber-500/20 w-full max-w-md rounded-[4rem] p-12 relative text-center">
            <button onClick={() => setShowMasterModal(false)} className="absolute top-10 right-10 text-slate-600 hover:text-white"><X size={28} /></button>
            <h2 className="text-3xl font-black uppercase italic mb-8">Noyau <span className="text-amber-500">Master QS</span></h2>
            <form onSubmit={handleMasterSubmit} className="space-y-6">
              <input type="password" value={masterKey} onChange={(e) => setMasterKey(e.target.value)} placeholder="AUTHENTIFICATION" className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl text-white text-center outline-none" />
              <button className="w-full py-6 bg-amber-500 text-slate-950 rounded-4xl font-black">Débloquer</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
