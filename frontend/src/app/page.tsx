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
  LogIn
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

  const plans = [
    {
      name: "ESSAI",
      price: "0 FCFA",
      period: "/14 jours",
      desc: "Découverte totale de l'écosystème.",
      features: ["1 Utilisateur Matrix", "Conformité ISO 9001", "Support Standard", "Accès Cloud Souverain"],
      premium: false
    },
    {
      name: "ÉMERGENCE",
      price: "55.000 FCFA",
      period: "/mois",
      desc: "Idéal pour les PME en phase de structuration.",
      features: ["5 Utilisateurs", "ISO 9001 & 14001", "Gestion Documentaire", "Tableaux de bord"],
      premium: false
    },
    {
      name: "CROISSANCE",
      price: "105.000 FCFA",
      period: "/mois",
      desc: "Le standard industriel pour le multi-site.",
      features: ["20 Utilisateurs", "Full Pack ISO", "Audits & Non-Conformités", "Analytique Avancée"],
      premium: true
    },
    {
      name: "ENTREPRISE",
      price: "175.000 FCFA",
      period: "/mois",
      desc: "Performance globale et gestion des risques.",
      features: ["Utilisateurs Illimités", "Workflow Personnalisé", "Gestion des Risques", "Cockpit Direction"],
      premium: false
    },
    {
      name: "GROUPE",
      price: "Sur Devis",
      period: "",
      desc: "Souveraineté totale pour holdings.",
      features: ["Instance Dédiée", "SLA Garanti 99.9%", "Support Élite 24/7", "Sécurité Matrix avancée"],
      premium: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white selection:bg-blue-600/30 selection:text-blue-200 font-sans italic">
      
      {/* --- NAVBAR --- */}
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

      {/* --- HERO --- */}
      <section className="relative pt-48 pb-20 px-6 overflow-hidden text-center">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <img src="/QS_FondEcran.webp" alt="Fond Matrix" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-b from-[#0B0F1A] via-transparent to-[#0B0F1A]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-[0.3em] mb-10">
            <Rocket size={18} className="animate-bounce" /> LANCEMENT : 02 MARS 2026
          </div>

          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-10 italic">
            Pilotez votre <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-indigo-500">Conformité.</span>
          </h1>

          <p className="max-w-3xl mx-auto text-slate-400 text-lg md:text-xl font-medium italic mb-14 leading-relaxed">
            L&apos;excellence ISO 9001, 14001 et 45001 digitalisée. Rejoignez l&apos;élite souveraine.
          </p>

          {/* FORMULAIRE D'ESSAI */}
          <div id="essai" className="max-w-md mx-auto bg-white/5 border border-white/10 p-8 rounded-[3rem] shadow-3xl backdrop-blur-xl mb-32">
            {!submitted ? (
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
                <div className="text-left space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4 italic">Demander mon essai de 14 jours</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input type="email" required placeholder="votre@email-pro.com" className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 text-white font-bold outline-none focus:border-blue-500 transition-all" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 text-[11px] uppercase tracking-widest shadow-lg shadow-blue-600/30 active:scale-95">
                  DÉMARRER MON ESSAI ÉLITE <Sparkles size={18} />
                </button>
              </form>
            ) : (
              <div className="py-8 space-y-4 animate-in zoom-in duration-500 text-center">
                <CheckCircle2 size={48} className="text-emerald-500 mx-auto" />
                <h3 className="text-xl font-black uppercase italic">Enregistré !</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase italic">Qualisoft vous contactera sous 48h.</p>
              </div>
            )}
          </div>

          {/* --- PLANS & TARIFS CORRIGÉS --- */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-left">
            {plans.map((plan, i) => (
              <div key={i} className={`relative p-6 rounded-[2.5rem] border-2 transition-all duration-500 hover:scale-105 ${plan.premium ? 'border-blue-600 bg-blue-600/10 shadow-2xl shadow-blue-600/20' : 'border-slate-800 bg-slate-900/50'}`}>
                {plan.premium && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-[7px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Populaire</div>}
                <h3 className="text-sm font-black uppercase italic mb-1">{plan.name}</h3>
                <p className="text-slate-500 text-[8px] mb-4 uppercase font-bold italic h-6">{plan.desc}</p>
                <div className="mb-6">
                   <div className="text-lg font-black italic text-white leading-none">{plan.price}</div>
                   <div className="text-[9px] text-slate-500 uppercase font-black">{plan.period}</div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-2 text-[9px] font-bold uppercase text-slate-300 italic">
                      <CheckCircle2 size={12} className="text-blue-500 shrink-0" /> {feat}
                    </li>
                  ))}
                </ul>
                <Link href="#essai" className={`block w-full py-3 rounded-xl text-center text-[8px] font-black uppercase tracking-widest transition-all ${plan.premium ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                  Choisir
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- MODULES ÉLITE --- */}
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
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-blue-600 transition-all duration-500">
                  <f.icon size={24} className="text-blue-500 group-hover:text-white" />
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

      <footer className="py-12 px-6 text-center border-t border-white/5 opacity-50">
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em] italic">Qualisoft RD 2030 • Dakar • Sénégal • Excellence Opérationnelle</p>
      </footer>
    </div>
  );
}