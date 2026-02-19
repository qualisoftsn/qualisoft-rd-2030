/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import {
  Activity,
  CheckCircle2,
  ClipboardCheck,
  Crown,
  Fingerprint,
  Mail,
  Rocket,
  ShieldCheck,
  Sparkles,
  LogIn,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white selection:bg-blue-600/30 selection:text-blue-200 font-sans italic">
      
      {/* --- NAVBAR ÉLITE --- */}
      <nav className="fixed top-0 w-full z-50 bg-[#0B0F1A]/80 backdrop-blur-2xl border-b border-white/5 px-6 md:px-12 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center border border-white/10 shadow-lg shadow-blue-600/20">
            <span className="font-black text-xl text-white not-italic">Q</span>
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter leading-none hidden md:block">
            Qualisoft <span className="text-blue-600">ELITE RD 2030</span>
          </h1>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          {/* BOUTON MASTER : Redirige vers le login en mode Master */}
          <Link
            href="/auth/login"
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-amber-500 transition-all group"
          >
            <Crown size={14} className="group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Master Access</span>
          </Link>

          <div className="hidden sm:block h-4 w-px bg-white/10"></div>

          {/* BOUTON SE CONNECTER : Le point d'entrée vers le portail multitenant */}
          <Link
            href="/auth/login"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600/10 border border-blue-500/30 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-600/10"
          >
            <LogIn size={14} />
            Se Connecter
          </Link>
        </div>
      </nav>

      {/* --- HERO : LE NOYAU --- */}
      <section className="relative pt-48 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <img
            src="/QS_FondEcran.webp"
            alt="Fond Matrix"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-[#0B0F1A] via-transparent to-[#0B0F1A]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-[0.3em] mb-10">
            <Rocket size={18} className="animate-bounce" /> 
            Instance RD 2030 v2.1 • Disponibilité Cloud : Opérationnelle
          </div>

          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-10 italic">
            Pilotez votre <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-indigo-500">
              Conformité.
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-slate-400 text-lg md:text-xl font-medium italic mb-14 leading-relaxed">
            L&apos;excellence ISO 9001, 14001 et 45001 digitalisée. 
            Une infrastructure souveraine pour vos audits, processus et pilotage stratégique.
          </p>

          {/* SECTION ESSAI : LE FORMULAIRE DE DEMANDE */}
          <div id="essai" className="max-w-md mx-auto bg-white/5 border border-white/10 p-8 rounded-[3rem] shadow-3xl backdrop-blur-xl">
            {!submitted ? (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                }}
              >
                <div className="text-left space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">
                    Demander un essai gratuit (14 jours)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="email"
                      required
                      placeholder="votre@email-professionnel.com"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 pr-4 focus:outline-none focus:border-blue-500 transition-all text-white placeholder:text-slate-700 font-bold"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-600/30 active:scale-95 text-[11px] uppercase tracking-widest"
                >
                  DÉMARRER MON ESSAI ÉLITE
                  <Sparkles size={18} />
                </button>
              </form>
            ) : (
              <div className="py-8 space-y-4 animate-in zoom-in duration-500">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-black uppercase italic">Requête Transmise</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-tight leading-relaxed">
                  Qualisoft analyse votre demande.<br/>Un accès temporaire vous sera envoyé par mail.
                </p>
                <button 
                    onClick={() => setSubmitted(false)}
                    className="text-[9px] font-black uppercase text-blue-500 hover:text-white transition-colors"
                >
                    Nouvelle demande
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- SECTION MODULES --- */}
      <section className="py-20 px-6 border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "ISO 9001/14001", icon: ShieldCheck, desc: "Souveraineté Totale" },
              { label: "Audits Digitaux", icon: ClipboardCheck, desc: "Zéro Papier" },
              { label: "Cockpit Direction", icon: Activity, desc: "Temps Réel" },
              { label: "Sécurité Matrix", icon: Fingerprint, desc: "Isolation Cloud" },
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-3 group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-blue-600/20 transition-colors">
                  <f.icon size={20} className="text-blue-500" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest">{f.label}</h4>
                  <p className="text-[8px] text-slate-600 font-black uppercase mt-1 italic">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 px-6 text-center border-t border-white/5">
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em] italic">
          Qualisoft RD 2030 • Dakar • Sénégal • Excellence Opérationnelle
        </p>
      </footer>
    </div>
  );
}