/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Crown,
  Fingerprint,
  Mail,
  Rocket,
  ShieldCheck,
  Sparkles,
  LogIn,
  Zap,
  Layers,
  Globe
} from "lucide-react";
import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const plans = [
    {
      name: "Standard Elite",
      price: "Sur Devis",
      desc: "Idéal pour les PME en phase de certification.",
      features: ["Conformité ISO 9001", "Gestion Documentaire", "5 Utilisateurs Matrix", "Support Standard"],
      premium: false
    },
    {
      name: "Business Master",
      price: "Sur Devis",
      desc: "Le standard industriel pour le multi-site.",
      features: ["ISO 9001, 14001, 45001", "Audits & Non-Conformités", "25 Utilisateurs Matrix", "Analytique en Temps Réel"],
      premium: true
    },
    {
      name: "Enterprise Sovereign",
      price: "Sur Devis",
      desc: "Souveraineté totale pour grands comptes.",
      features: ["Full Pack Normatif", "Utilisateurs Illimités", "Hébergement Dédié", "Support Élite 24/7"],
      premium: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white selection:bg-blue-600/30 selection:text-blue-200 font-sans italic">
      
      {/* --- 🛡️ NAVBAR ÉLITE --- */}
      <nav className="fixed top-0 w-full z-50 bg-[#0B0F1A]/80 backdrop-blur-2xl border-b border-white/5 px-6 md:px-12 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center border border-white/10 shadow-lg shadow-blue-600/20">
            <span className="font-black text-xl text-white not-italic">Q</span>
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter leading-none hidden md:block">
            Qualisoft <span className="text-blue-600">ELITE RD 2030</span>
          </h1>
        </div>

        <div className="flex items-center gap-3 md:gap-8">
          <Link href="/auth/login" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-amber-500 transition-all group">
            <Crown size={14} className="group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Master Access</span>
          </Link>
          <div className="hidden sm:block h-4 w-px bg-white/10"></div>
          <Link href="/auth/login" className="flex items-center gap-2 px-6 py-3 bg-blue-600 border border-blue-400/30 rounded-full text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
            <LogIn size={14} /> Se Connecter
          </Link>
        </div>
      </nav>

      {/* --- 🚀 HERO SECTION --- */}
      <section className="relative pt-48 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <img src="/QS_FondEcran.webp" alt="Fond Matrix" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-b from-[#0B0F1A] via-transparent to-[#0B0F1A]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-[0.3em] mb-10">
            <Rocket size={18} className="animate-bounce" /> LANCEMENT OFFICIEL : 02 FÉVRIER 2026
          </div>

          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-10 italic">
            Pilotez votre <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-indigo-500">Conformité.</span>
          </h1>

          <p className="max-w-3xl mx-auto text-slate-400 text-lg md:text-xl font-medium italic mb-14 leading-relaxed">
            L&apos;excellence ISO 9001, 14001 et 45001 digitalisée. Rejoignez l&apos;élite et obtenez 14 jours d&apos;accès complet dès aujourd&apos;hui.
          </p>

          <div id="essai" className="max-w-md mx-auto bg-white/5 border border-white/10 p-8 rounded-[3rem] shadow-3xl backdrop-blur-xl mb-24">
            {!submitted ? (
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
                <div className="text-left space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">Demander mon essai de 14 jours</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input type="email" required placeholder="votre@email-pro.com" className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 pr-4 focus:outline-none focus:border-blue-500 transition-all text-white font-bold" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-600/30 text-[11px] uppercase tracking-widest">
                  DÉMARRER MON ESSAI ÉLITE <Sparkles size={18} />
                </button>
              </form>
            ) : (
              <div className="py-8 space-y-4 animate-in zoom-in duration-500">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 size={32} /></div>
                <h3 className="text-xl font-black uppercase italic">Enregistré !</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase">Un officier Qualisoft vous contactera.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- 💎 SECTION PLANS & ABONNEMENTS --- */}
      <section className="py-24 px-6 border-t border-white/5 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">Plans <span className="text-blue-600">Souverains</span></h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto mt-4"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <div key={i} className={`relative p-10 rounded-[3rem] border-2 transition-all duration-500 hover:scale-105 ${plan.premium ? 'border-blue-600 bg-blue-600/10 shadow-2xl shadow-blue-600/20' : 'border-slate-800 bg-slate-900/50'}`}>
                {plan.premium && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-blue-600 text-[8px] font-black px-6 py-2 rounded-full uppercase tracking-widest">Recommandé</div>
                )}
                <h3 className="text-2xl font-black uppercase italic mb-2">{plan.name}</h3>
                <p className="text-slate-500 text-xs mb-6 uppercase font-bold">{plan.desc}</p>
                <div className="text-4xl font-black mb-8 italic">{plan.price}</div>
                <ul className="space-y-4 mb-10">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-3 text-[11px] font-bold uppercase text-slate-300">
                      <CheckCircle2 size={16} className="text-blue-500 shrink-0" /> {feat}
                    </li>
                  ))}
                </ul>
                <Link href="#essai" className={`block w-full py-5 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest transition-all ${plan.premium ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                  Choisir ce plan
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 📊 MODULES ÉLITE --- */}
      <section className="py-20 px-6 border-t border-white/5 bg-black/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: "ISO 9001/14001", icon: ShieldCheck, desc: "Souveraineté" },
              { label: "Audits Digitaux", icon: ClipboardCheck, desc: "Zéro Papier" },
              { label: "Cockpit Direction", icon: Activity, desc: "Temps Réel" },
              { label: "Sécurité Matrix", icon: Fingerprint, desc: "Isolation" },
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center space-y-3 group">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-blue-600 transition-all duration-500"><f.icon size={24} className="text-blue-500 group-hover:text-white" /></div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest">{f.label}</h4>
                  <p className="text-[8px] text-slate-600 font-black uppercase mt-1 italic">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 text-center border-t border-white/5 opacity-50">
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em] italic">Qualisoft RD 2030 • Dakar • Sénégal • Excellence Opérationnelle</p>
      </footer>
    </div>
  );
}