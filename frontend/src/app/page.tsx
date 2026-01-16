/* eslint-disable @typescript-eslint/no-unused-vars */
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
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";

export default function LandingPage() {
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [masterKey, setMasterKey] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      {/* --- NAVBAR ÉLITE --- */}
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
          <button
            onClick={() => setShowMasterModal(true)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-amber-500 transition-all group"
          >
            <Crown
              size={14}
              className="group-hover:rotate-12 transition-transform"
            />
            <span className="hidden sm:inline">Accès Master QS</span>
          </button>

          <div className="hidden sm:block h-4 w-px bg-white/10"></div>

          <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 animate-pulse">
            Lancement : 02 Fév 2026
          </span>
        </div>
      </nav>

      {/* --- HERO : LE NOYAU --- */}
      <section className="relative pt-48 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <img
            src="/QS_FondEcran.webp"
            alt="Fond"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-[#0B0F1A] via-transparent to-[#0B0F1A]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-[0.3em] mb-10">
            <Rocket size={14} className="animate-bounce" /> Disponibilité
            Initiale : 02/02/2026 à Minuit
          </div>

          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-10 italic">
            Pilotez votre <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-indigo-500">
              Conformité.
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-slate-400 text-lg md:text-xl font-medium italic mb-14 leading-relaxed">
            L'excellence normative ISO 9001, 14001 et 45001 digitalisée.
            Rejoignez la liste d'attente pour obtenir 14 jours d'accès complet
            dès le lancement.
          </p>

          {/* FORMULAIRE DE PRÉ-INSCRIPTION ATTRACTIF */}
          <div className="max-w-md mx-auto bg-white/5 border border-white/10 p-8 rounded-[3rem] shadow-3xl backdrop-blur-xl">
            {!submitted ? (
              <form
                action="https://formspree.io/f/abdoulayethiongane@gmail.com"
                method="POST"
                className="space-y-4"
                onSubmit={() => setTimeout(() => setSubmitted(true), 1000)}
              >
                <div className="text-left space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">
                    Inscrivez-vous pour le test de 14 jours
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
                      size={18}
                    />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="votre@email.com"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 pr-4 focus:outline-none focus:border-blue-500 transition-all text-white placeholder:text-slate-700"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-600/30 active:scale-95 text-[11px] uppercase tracking-widest"
                >
                  Réserver mon accès Élite
                  <Sparkles size={18} />
                </button>
              </form>
            ) : (
              <div className="py-8 space-y-4 animate-in zoom-in duration-500">
                <div className="w-16 h-16 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-black uppercase italic">
                  C&apos;est enregistré !
                </h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-tight">
                  Rendez-vous le 02 février pour votre essai.
                </p>
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
              {
                label: "ISO 9001/14001",
                icon: ShieldCheck,
                desc: "Conformité Totale",
              },
              {
                label: "Audits Digitaux",
                icon: ClipboardCheck,
                desc: "Zéro Papier",
              },
              {
                label: "Cockpit Direction",
                icon: Activity,
                desc: "Temps Réel",
              },
              {
                label: "Sécurité Master",
                icon: Fingerprint,
                desc: "Isolation Cloud",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center space-y-3 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-blue-600/20 transition-colors">
                  <f.icon size={20} className="text-blue-500" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest">
                    {f.label}
                  </h4>
                  <p className="text-[8px] text-slate-600 font-black uppercase mt-1 italic">
                    {f.desc}
                  </p>
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

      {/* --- MODAL MASTER --- */}
      {showMasterModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-xl p-6 animate-in fade-in duration-300">
          <div className="bg-[#0F172A] border border-amber-500/20 w-full max-w-md rounded-[4rem] p-12 relative text-center shadow-2xl">
            <button
              onClick={() => setShowMasterModal(false)}
              className="absolute top-10 right-10 text-slate-600 hover:text-white"
            >
              <X size={28} />
            </button>
            <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-amber-500/20">
              <Fingerprint size={40} className="text-amber-500" />
            </div>
            <h2 className="text-3xl font-black uppercase italic mb-3">
              Noyau <span className="text-amber-500">Master</span>
            </h2>
            <form onSubmit={handleMasterSubmit} className="space-y-6">
              <input
                type="password"
                autoFocus
                value={masterKey}
                onChange={(e) => setMasterKey(e.target.value)}
                placeholder="AUTHENTIFICATION SECRÈTE"
                className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl text-white font-black text-center italic focus:border-amber-500 outline-none"
              />
              <button className="w-full py-6 bg-amber-500 text-slate-950 rounded-4xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-amber-500/20">
                Débloquer l'instance
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
