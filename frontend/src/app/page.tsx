//* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import {
  CheckCircle2,
  ChevronRight,
  Crown,
  Fingerprint,
  Rocket,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

export default function LandingPage() {
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [masterKey, setMasterKey] = useState("");

  const handleMasterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterKey === "QUALISOFT_2030_ADMIN") {
      // Ta clé secrète temporaire
      window.location.href = "/dashboard";
    } else {
      alert("Clé Master Invalide");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white selection:bg-blue-600/30 selection:text-blue-200 font-sans italic">
      {/* --- NAVBAR ÉLITE --- */}
      <nav className="fixed top-0 w-full z-50 bg-[#0B0F1A]/80 backdrop-blur-2xl border-b border-white/5 px-6 md:px-12 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center border border-white/10 shadow-lg shadow-blue-600/20">
            <span className="font-black text-xl text-white not-italic">Q</span>
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter leading-none hidden md:block">
            Qualisoft <span className="text-blue-600">RD 2030</span>
          </h1>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <button
            onClick={() => setShowMasterModal(true)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-amber-500 transition-all group"
          >
            <Crown
              size={14}
              className="group-hover:rotate-12 transition-transform"
            />
            <span className="hidden sm:inline">Accès Master</span>
          </button>

          <Link
            href="/auth/login"
            className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-colors"
          >
            Se connecter
          </Link>

          <Link
            href="/auth/register-trial"
            className="px-6 py-3 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 shadow-xl shadow-blue-600/20 transition-all active:scale-95"
          >
            Essai Gratuit
          </Link>
        </div>
      </nav>

      {/* --- HERO : LE NOYAU --- */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        {/* Background avec ton image de fond */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <img
            src="/QS_FondEcran.webp"
            alt="Fond Technologique"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-[#0B0F1A] via-transparent to-[#0B0F1A]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-[0.3em] mb-10 animate-fade-in">
            <Zap size={14} className="fill-blue-400" /> Digitalisation &
            Excellence Normative
          </div>

          <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] mb-10 italic">
            Pilotez votre <br />
            <span className="text-blue-600">Conformité.</span>
          </h1>

          <p className="max-w-3xl mx-auto text-slate-400 text-lg md:text-xl font-medium italic mb-14 leading-relaxed">
            La plateforme SaaS de référence pour le management Qualité intégré -
            ELITE au Sénégal et dans l&apos;UEMOA. Une puissance technologique
            au service de l&apos;ISO 9001, 14001 et 45001.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link
              href="/auth/register-trial"
              className="px-12 py-6 bg-blue-600 rounded-4xl text-xs font-black uppercase tracking-[0.2em] hover:bg-blue-500 shadow-2xl shadow-blue-600/40 transition-all flex items-center justify-center gap-3"
            >
              Lancer mon essai 14J <Rocket size={20} />
            </Link>
            <Link
              href="#plans"
              className="px-12 py-6 bg-white/5 border border-white/10 rounded-4xl text-xs font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-3"
            >
              Voir les tarifs <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* --- SECTION ÉCRANS / VISUELS --- */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative group p-4 bg-white/5 rounded-[3rem] border border-white/10 shadow-3xl">
            <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-indigo-600 rounded-[3rem] blur opacity-10 group-hover:opacity-25 transition duration-1000"></div>
            <img
              src="/qs_schema_01.jpg"
              alt="Cockpit Qualisoft"
              className="relative w-full rounded-[2.5rem] shadow-2xl grayscale-20 group-hover:grayscale-0 transition-all duration-700"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-24">
            {[
              {
                title: "Zéro Papier",
                desc: "Digitalisation intégrale de votre GED et de vos flux documentaires.",
              },
              {
                title: "Dashboard Élite",
                desc: "Analyse décisionnelle temps réel pour le pilotage stratégique.",
              },
              {
                title: "Multi-Tenant",
                desc: "Architecture sécurisée isolant hermétiquement vos données.",
              },
            ].map((feature, idx) => (
              <div key={idx} className="space-y-4 text-center md:text-left">
                <div className="text-blue-600 font-black text-3xl italic tracking-tighter">
                  0{idx + 1}
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight italic">
                  {feature.title}
                </h3>
                <p className="text-slate-500 text-sm font-bold leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION PLANS D'ABONNEMENT --- */}
      <section
        id="plans"
        className="py-32 px-6 bg-white/2 border-y border-white/5"
      >
        <div className="max-w-7xl mx-auto text-center mb-24">
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic mb-6">
            Investissez dans <span className="text-blue-600">la Qualité</span>
          </h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] italic">
            Tarification transparente • Activation instantanée
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              id: "TRIAL",
              name: "Essai 14J",
              price: "0",
              period: "OFFERT",
              features: ["21 modules actifs", "Config. Assistée"],
              highlight: false,
            },
            {
              id: "EMERGENCE",
              name: "Émergence",
              price: "55K",
              period: "AN / HT",
              features: ["RQ + 3 Pilotes", "GED SMQ"],
              highlight: false,
            },
            {
              id: "CROISSANCE",
              name: "Croissance",
              price: "105K",
              period: "AN / HT",
              features: ["RQ + 3 Pilotes", "GED SMQ"],
              highlight: false,
            },
            {
              id: "PRO",
              name: "Entreprise",
              price: "175K",
              period: "AN / HT",
              features: ["Illimité", "Support 24/7"],
              highlight: true,
            },
            {
              id: "GROUPE",
              name: "Groupe",
              price: "350K",
              period: "AN / HT",
              features: ["Multi-sites", "API Cloud"],
              highlight: false,
            },
          ].map((plan) => (
            <div
              key={plan.id}
              className={`p-10 rounded-[3.5rem] bg-slate-900/50 border flex flex-col transition-all hover:scale-105 duration-500 ${
                plan.highlight
                  ? "border-blue-600 ring-4 ring-blue-600/10"
                  : "border-white/5"
              }`}
            >
              <h3 className="text-2xl font-black uppercase italic mb-8">
                {plan.name}
              </h3>
              <div className="mb-10">
                <span className="text-5xl font-black italic">{plan.price}</span>
                <span className="text-slate-500 text-[10px] block font-black uppercase mt-2 tracking-widest">
                  {plan.period}
                </span>
              </div>
              <ul className="space-y-4 mb-12 flex-1">
                {plan.features.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-tighter"
                  >
                    <CheckCircle2 size={14} className="text-blue-600" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                href={
                  plan.id === "TRIAL"
                    ? "/auth/register"
                    : `/auth/register?plan=${plan.id}`
                }
                className={`w-full py-5 rounded-3xl font-black uppercase text-[10px] text-center tracking-widest transition-all ${
                  plan.highlight
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-600/40"
                    : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                {plan.id === "TRIAL" ? "Démarrer l'essai" : "Choisir ce plan"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-24 px-6 text-center">
        <div className="flex flex-col items-center gap-8">
          <img
            src="/QSLogo.PNG"
            alt="Qualisoft"
            className="h-10 opacity-30 grayscale"
          />
          <p className="max-w-md text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] leading-relaxed">
            Qualisoft RD 2030 • Le Noyau technologique de l&apos;Excellence
            Opérationnelle • Dakar • Senegal
          </p>
        </div>
      </footer>

      {/* --- MODAL MASTER (ACCÈS PROPRIÉTAIRE) --- */}
      {showMasterModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-xl p-6 animate-in fade-in duration-300">
          <div className="bg-[#0F172A] border border-amber-500/20 w-full max-w-md rounded-[4rem] p-12 relative text-center shadow-2xl shadow-amber-500/5">
            <button
              onClick={() => setShowMasterModal(false)}
              className="absolute top-10 right-10 text-slate-600 hover:text-white transition-colors"
            >
              <X size={28} />
            </button>
            <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-amber-500/20">
              <Fingerprint size={40} className="text-amber-500" />
            </div>
            <h2 className="text-3xl font-black uppercase italic mb-3 text-white">
              Noyau <span className="text-amber-500">Master</span>
            </h2>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] mb-10 italic">
              Accès Intégral • Propriété Qualisoft
            </p>

            <form onSubmit={handleMasterSubmit} className="space-y-6">
              <input
                type="password"
                autoFocus
                value={masterKey}
                onChange={(e) => setMasterKey(e.target.value)}
                placeholder="AUTHENTIFICATION SECRÈTE"
                className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl text-white font-black text-center italic focus:border-amber-500 outline-none transition-all placeholder:text-slate-800"
              />
              <button className="w-full py-6 bg-amber-500 text-slate-950 rounded-4xl font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-amber-500/20 hover:scale-105 transition-all active:scale-95">
                Débloquer l&apos;instance
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
