//* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import { Crown, Fingerprint, Rocket, X, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function LandingPage() {
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [masterKey, setMasterKey] = useState("");
  const router = useRouter();

  const handleMasterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ✅ Clé de sécurité Qualisoft Élite 2030
    if (masterKey === "QUALISOFT_2030_ADMIN") {
      setShowMasterModal(false);
      router.push("/dashboard");
    } else {
      alert("Clé Master Invalide - Accès au Noyau Refusé");
      setMasterKey("");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white selection:bg-blue-600/30 selection:text-blue-200 font-sans italic">
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-[#0B0F1A]/80 backdrop-blur-2xl border-b border-white/5 px-6 md:px-12 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center border border-white/10 shadow-lg shadow-blue-600/20">
            <span className="font-black text-xl text-white not-italic">Q</span>
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter leading-none hidden md:block">
            Qualisoft <span className="text-blue-600">ELITE 2030</span>
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

      {/* --- HERO --- */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <img
            src="/QS_FondEcran.webp"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-[#0B0F1A] via-transparent to-[#0B0F1A]"></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-[0.3em] mb-10">
            <Zap size={14} className="fill-blue-400" /> Digitalisation &
            Excellence Normative
          </div>
          <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] mb-10 italic">
            Pilotez votre <br />{" "}
            <span className="text-blue-600">Conformité.</span>
          </h1>
          <p className="max-w-3xl mx-auto text-slate-400 text-lg md:text-xl font-medium italic mb-14">
            La plateforme SaaS de référence pour le management Qualité intégré
            au Sénégal et dans l&apos;UEMOA.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link
              href="/auth/register-trial"
              className="px-12 py-6 bg-blue-600 rounded-4xl text-xs font-black uppercase tracking-[0.2em] hover:bg-blue-500 shadow-2xl shadow-blue-600/40 transition-all flex items-center justify-center gap-3"
            >
              Lancer mon essai 14J <Rocket size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* --- MODAL MASTER (FIXÉ : Z-INDEX MAXIMAL) --- */}
      {showMasterModal && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/95 backdrop-blur-xl p-6">
          <div className="bg-[#0F172A] border border-amber-500/20 w-full max-w-md rounded-[4rem] p-12 relative text-center shadow-2xl shadow-amber-500/20">
            <button
              onClick={() => setShowMasterModal(false)}
              className="absolute top-10 right-10 text-slate-600 hover:text-white"
            >
              <X size={28} />
            </button>
            <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-amber-500/20">
              <Fingerprint size={40} className="text-amber-500" />
            </div>
            <h2 className="text-3xl font-black uppercase italic mb-10 text-white">
              Noyau <span className="text-amber-500">Master</span>
            </h2>
            <form onSubmit={handleMasterSubmit} className="space-y-6">
              <input
                type="password"
                autoFocus
                value={masterKey}
                onChange={(e) => setMasterKey(e.target.value)}
                placeholder="AUTHENTIFICATION SECRÈTE"
                className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl text-white font-black text-center italic focus:border-amber-500 outline-none placeholder:text-slate-800"
              />
              <button
                type="submit"
                className="w-full py-6 bg-amber-500 text-slate-950 rounded-4xl font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-amber-500/20 hover:scale-105 transition-all"
              >
                Débloquer l&apos;instance
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
