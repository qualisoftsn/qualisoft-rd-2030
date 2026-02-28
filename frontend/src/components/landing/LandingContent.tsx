/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

/**
 * 🌍 COMPONENT : LANDING CONTENT (VITRINE ELITE)
 * -------------------------------------------------------------------------
 * RÔLE : Présentation de l'offre Qualisoft RD 2030.
 * UTILISATION : Importé par app/page.tsx pour les domaines "Master".
 * -------------------------------------------------------------------------
 */

import {
  Activity,
  CheckCircle2,
  ClipboardCheck,
  Facebook,
  FileDown,
  Fingerprint,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Rocket,
  ShieldCheck,
  Sparkles,
  Twitter,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingContent() {
  const router = useRouter();
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
      features: [
        "1 Utilisateur Matrix",
        "Conformité ISO 9001",
        "Support Standard",
        "Accès Cloud Souverain",
      ],
      premium: false,
    },
    {
      name: "ÉMERGENCE",
      price: "55.000 FCFA",
      period: "/mois",
      desc: "Idéal pour les PME en phase de structuration.",
      features: [
        "5 Utilisateurs",
        "ISO 9001 & 14001",
        "Gestion Documentaire",
        "Tableaux de bord",
      ],
      premium: false,
    },
    {
      name: "CROISSANCE",
      price: "105.000 FCFA",
      period: "/mois",
      desc: "Le standard industriel pour le multi-site.",
      features: [
        "20 Utilisateurs",
        "Full Pack ISO",
        "Audits & Non-Conformités",
        "Analytique Avancée",
      ],
      premium: true,
    },
    {
      name: "ENTREPRISE",
      price: "175.000 FCFA",
      period: "/mois",
      desc: "Performance globale et gestion des risques.",
      features: [
        "Utilisateurs Illimités",
        "Workflow Personnalisé",
        "Gestion des Risques",
        "Cockpit Direction",
      ],
      premium: false,
    },
    {
      name: "GROUPE",
      price: "Sur Devis",
      period: "",
      desc: "Souveraineté totale pour holdings.",
      features: [
        "Instance Dédiée",
        "SLA Garanti 99.9%",
        "Support Élite 24/7",
        "Sécurité Matrix avancée",
      ],
      premium: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white selection:bg-blue-600/30 selection:text-blue-200 font-sans italic">
      {/* --- NAVBAR ELITE --- */}
      <nav className="fixed top-0 w-full z-50 bg-[#0B0F1A]/90 backdrop-blur-2xl border-b border-white/5 px-6 md:px-12 py-5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="h-12 w-auto flex items-center justify-center relative group">
            <img
              src="/qslogo.png"
              alt="Qualisoft Logo"
              className="h-full w-auto object-contain filter brightness-110 group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter leading-none hidden md:block">
              Qualisoft <span className="text-blue-500">ELITE</span>
            </h1>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] hidden md:block mt-1">
              RD 2030 Architecture
            </p>
          </div>
        </div>

        {/* Bouton de connexion directe pour les administrateurs */}
        <button 
          onClick={() => router.push('/auth/login')}
          className="bg-white/5 hover:bg-blue-600 border border-white/10 text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all"
        >
          Accès Elite
        </button>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-56 pb-12 px-6 overflow-hidden text-center">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img
            src="/qs_fondecran.webp"
            alt="Fond Matrix"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-[#0B0F1A] via-[#0B0F1A]/80 to-[#0B0F1A]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="relative inline-flex items-center justify-center mb-12 group">
            <div className="absolute inset-0 bg-blue-600 rounded-full blur-xl opacity-40 animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
            <div className="relative flex items-center gap-4 px-8 py-4 rounded-full bg-slate-900 border border-blue-500/50 text-white shadow-[0_0_40px_rgba(37,99,235,0.3)]">
              <div className="p-2 bg-blue-600/20 rounded-full">
                <Rocket size={20} className="text-blue-400 animate-bounce" />
              </div>
              <span className="text-[13px] md:text-xs font-black uppercase tracking-[0.4em] text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-white to-blue-400 animate-[pulse_2.5s_ease-in-out_infinite]">
                Lancement Officiel : 02 Mars 2026
              </span>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.85] mb-10 italic drop-shadow-2xl">
            Pilotez notre <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 via-indigo-400 to-blue-600">
              Conformité.
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-slate-400 text-lg md:text-2xl font-bold italic mb-12 leading-relaxed">
            L&apos;excellence ISO 9001, 14001 et 45001 digitalisée.{" "}
            <br className="hidden md:block" />
            Rejoignez l&apos;élite souveraine du pilotage d&apos;entreprise.
          </p>

          {/* FORMULAIRE TRIAL */}
          <div
            id="essai"
            className="max-w-lg mx-auto bg-white/5 border border-white/10 p-10 rounded-[3.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl mb-12 relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,1)]"></div>
            {!submitted ? (
              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
              >
                <div className="text-left space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 ml-4 italic">
                    Réserver mon ESSAI prioritaire (14 Jours)
                  </label>
                  <div className="relative group">
                    <Mail
                      className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors"
                      size={20}
                    />
                    <input
                      type="email"
                      required
                      placeholder="notre.nom@entreprise.sn"
                      className="w-full bg-[#0B0F1A]/80 border-2 border-white/10 rounded-3xl py-6 pl-16 text-sm text-white font-bold outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-3xl transition-all flex items-center justify-center gap-4 text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/40 active:scale-95 border-none cursor-pointer"
                >
                  DÉMARRER MON ESSAI ÉLITE <Sparkles size={20} />
                </button>
              </form>
            ) : (
              <div className="py-12 space-y-6 animate-in zoom-in duration-500 text-center">
                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={48} className="text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-2">
                    Accès Réservé !
                  </h3>
                  <p className="text-slate-400 text-[11px] font-black uppercase italic tracking-widest leading-relaxed">
                    Elite a enregistré notre demande. <br /> L&apos;équipe
                    Qualisoft vous contactera sous 48h.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- NEW ELITE VISUAL SHOWCASE --- */}
      <div className="max-w-7xl mx-auto mb-32 px-4 text-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="group relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-slate-900/50 shadow-2xl transition-all hover:scale-[1.02]">
            <div className="p-6 text-left">
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">QS Matrix V2</span>
              <h4 className="text-lg font-black italic uppercase leading-tight">Cockpit Opérationnel</h4>
            </div>
            <img src="/qs_cockpit.jpg" alt="Cockpit" className="w-full h-auto opacity-80 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="group relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-slate-900/50 shadow-2xl transition-all hover:scale-[1.02]">
            <div className="p-6 text-left">
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">Intelligence Stratégique</span>
              <h4 className="text-lg font-black italic uppercase leading-tight">Revue de Direction</h4>
            </div>
            <img src="/qs_revuedirection.jpg" alt="Revue" className="w-full h-auto opacity-80 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="group relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-slate-900/50 shadow-2xl transition-all hover:scale-[1.02]">
            <div className="p-6 text-left">
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">Pyramide Structurelle</span>
              <h4 className="text-lg font-black italic uppercase leading-tight">Architecture SMI</h4>
            </div>
            <img src="/qsorg01.gif" alt="Architecture" className="w-full h-auto opacity-80 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>

      {/* PLANS ET TARIFS */}
      <section className="max-w-7xl mx-auto px-6 mb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-left">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative p-8 rounded-[3rem] border-2 transition-all duration-500 hover:-translate-y-2 flex flex-col ${plan.premium ? "border-blue-500 bg-blue-900/10 shadow-2xl shadow-blue-900/30" : "border-white/5 bg-white/2 hover:bg-white/5"}`}
            >
              {plan.premium && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-[8px] font-black px-6 py-2 rounded-full uppercase tracking-widest">
                  Recommandé
                </div>
              )}
              <h3 className="text-lg font-black uppercase italic mb-2 tracking-tighter">{plan.name}</h3>
              <p className="text-slate-500 text-[9px] mb-6 uppercase font-bold italic h-10">{plan.desc}</p>
              <div className="mb-8 pb-8 border-b border-white/10">
                <div className="text-2xl font-black italic tracking-tighter">{plan.price}</div>
                {plan.period && <div className="text-[10px] text-blue-400 uppercase font-black mt-2">{plan.period}</div>}
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-start gap-3 text-[10px] font-bold uppercase text-slate-300 italic">
                    <CheckCircle2 size={14} className="text-blue-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <Link href="#essai" className={`block w-full py-4 rounded-2xl text-center text-[9px] font-black uppercase tracking-widest ${plan.premium ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400"}`}>
                Sélectionner
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* --- FOOTER SOUVERAIN --- */}
      <footer className="pt-24 pb-12 px-6 border-t border-white/10 bg-[#0B0F1A] relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10 mb-20">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <img src="/qslogo.png" alt="Qualisoft Elite" className="h-10 w-auto" />
              <h4 className="text-2xl font-black uppercase tracking-tighter text-white">Qualisoft <br /><span className="text-blue-600">ELITE</span></h4>
            </div>
            <p className="text-[10px] text-slate-400 uppercase font-bold italic leading-relaxed">Le standard industriel de la digitalisation QHSE avec des économies réelles.</p>
            <div className="flex gap-4 mt-8">
              <Linkedin size={20} className="text-slate-400 hover:text-blue-600 cursor-pointer" />
              <Twitter size={20} className="text-slate-400 hover:text-blue-600 cursor-pointer" />
              <Facebook size={20} className="text-slate-400 hover:text-blue-600 cursor-pointer" />
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-600 border-b border-white/5 pb-4">Siège Social</h4>
            <div className="flex items-start gap-4 text-[11px] font-bold text-slate-300 uppercase italic">
              <MapPin size={20} className="text-blue-500 shrink-0 mt-1" />
              <p>Villa 247, Route du Lac Rose, <br /> Dakar, Sénégal</p>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-600 border-b border-white/5 pb-4">Contact</h4>
            <div className="flex items-start gap-4 text-[11px] font-bold text-slate-300 uppercase italic">
              <Phone size={20} className="text-blue-500 shrink-0 mt-1" />
              <p>+221 77 441 09 02</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-bold text-slate-300 uppercase pt-2">
              <Mail size={20} className="text-blue-500" />
              <a href="mailto:ab.thiongane@qualisoft.sn" className="hover:text-blue-400 italic">ab.thiongane@qualisoft.sn</a>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-white/5 text-center">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em] italic">© 2026 QUALISOFT RD 2030 • RaaS</p>
        </div>
      </footer>
    </div>
  );
}