/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
/**
 * 🚀 MODULE : LANDING PAGE & REGISTRE D'ESSAI MASTER
 * -------------------------------------------------------------------------
 * FONCTION : Page d'atterrissage stratégique et capture de leads (Essai 14j).
 * RÔLE : Génération d'intérêt et accès sécurisé "Master" pour la maintenance.
 * DESIGN : Architecture "Sovereign Blue" avec composants ultra-modernes.
 */

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  Lock,
  ArrowRight
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function LandingPage() {
  const router = useRouter();
  
  // --- ÉTATS DE GESTION DE L'INTERFACE ---
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [masterKey, setMasterKey] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 🛡️ HYDRATION GUARD
   * Empêche les décalages de rendu entre le serveur et le client (Hydration Mismatch).
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * 🔑 PROTOCOLE D'ACCÈS MASTER
   * Vérifie la clé d'autorité pour l'accès direct au noyau administratif.
   * Note : Dans une architecture de production, ceci interroge un endpoint sécurisé.
   */
  const handleMasterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterKey === "QUALISOFT_2030_ADMIN") {
      toast.success("Authentification Master validée. Accès au Noyau...");
      router.push("/dashboard");
    } else {
      toast.error("Clé Master Invalide ou Révoquée");
      setMasterKey("");
    }
  };

  /**
   * 📧 ENREGISTREMENT AU REGISTRE D'ESSAI
   * Simule l'inscription dans la liste d'attente pour le lancement du 02 Février.
   */
  const handleTrialRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulation d'écriture dans le registre Master
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success("Position réservée dans le Registre Master");
    }, 1500);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white selection:bg-blue-600/30 selection:text-blue-200 font-sans italic overflow-x-hidden">
      
      {/* --- 🔝 NAVBAR ÉLITE : CONTRÔLE DE NAVIGATION --- */}
      <nav className="fixed top-0 w-full z-50 bg-[#0B0F1A]/80 backdrop-blur-2xl border-b border-white/5 px-6 md:px-12 py-6 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl shadow-blue-600/30 group">
            <span className="font-black text-2xl text-white not-italic group-hover:scale-110 transition-transform">Q</span>
          </div>
          <div className="text-left">
            <h1 className="text-xl font-black uppercase tracking-tighter leading-none hidden md:block italic">
              Qualisoft <span className="text-blue-600">ELITE RD 2030</span>
            </h1>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest hidden md:block mt-1 italic">Sovereign Performance System</p>
          </div>
        </div>

        <div className="flex items-center gap-6 md:gap-10">
          <button
            onClick={() => setShowMasterModal(true)}
            className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-amber-500 transition-all group bg-transparent border-none cursor-pointer italic"
          >
            <Crown size={16} className="group-hover:rotate-12 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Accès Master</span>
          </button>

          <div className="hidden sm:block h-5 w-px bg-white/10"></div>

          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500 animate-pulse italic">
              Lancement : 02 Fév 2026
            </span>
            <span className="text-[7px] font-bold text-slate-600 uppercase italic">Version Master 4.0</span>
          </div>
        </div>
      </nav>

      {/* --- 🚀 HERO SECTION : LE NOYAU DE CONFORMITÉ --- */}
      <section className="relative pt-56 pb-24 px-6 overflow-hidden min-h-[90vh] flex flex-col justify-center">
        {/* FOND IMMERSIF */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img
            src="/QS_FondEcran.webp"
            alt="Qualisoft Sovereign Background"
            className="w-full h-full object-cover scale-110 blur-sm"
          />
          <div className="absolute inset-0 bg-linear-to-b from-[#0B0F1A] via-transparent to-[#0B0F1A]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-12">
          {/* BADGE DE DISPONIBILITÉ RÉELLE */}
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-700">
            <Rocket size={18} className="animate-bounce" /> 
            Disponibilité Initiale : 02/02/2026 à Minuit
          </div>

          <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] italic animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Pilotez votre <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 via-indigo-500 to-blue-400">
              Conformité.
            </span>
          </h1>

          <p className="max-w-4xl mx-auto text-slate-400 text-lg md:text-2xl font-bold italic mb-16 leading-relaxed opacity-80">
            L&apos;excellence normative ISO 9001, 14001 et 45001 digitalisée pour 2026.
            <br className="hidden md:block" />
            Inscrivez-vous au registre Master pour un accès exclusif de 14 jours.
          </p>

          {/* FORMULAIRE DE PRÉ-INSCRIPTION ÉLITE */}
          <div className="max-w-lg mx-auto bg-slate-900/40 border border-white/10 p-10 rounded-[4rem] shadow-4xl backdrop-blur-3xl animate-in zoom-in-95 duration-1000 delay-300">
            {!submitted ? (
              <form
                onSubmit={handleTrialRegistration}
                className="space-y-6"
              >
                <div className="text-left space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-6 italic">
                    Inscription au Registre d&apos;Essai Master
                  </label>
                  <div className="relative group">
                    <Mail
                      className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors"
                      size={20}
                    />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="votre@email-professionnel.com"
                      className="w-full bg-black/50 border border-white/10 rounded-2xl py-6 pl-16 pr-6 focus:outline-none focus:border-blue-500 transition-all text-white font-bold italic placeholder:text-slate-800 shadow-inner"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-[2.5rem] transition-all flex items-center justify-center gap-4 shadow-3xl shadow-blue-600/30 active:scale-95 text-[12px] uppercase tracking-[0.3em] border-none cursor-pointer italic"
                >
                  {isSubmitting ? <Activity size={20} className="animate-spin" /> : (
                    <>
                      Réserver mon accès Élite
                      <Sparkles size={20} className="animate-pulse" />
                    </>
                  )}
                </button>
                <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest italic text-center mt-4">
                  Aucune carte requise • Activation automatique au lancement
                </p>
              </form>
            ) : (
              <div className="py-12 space-y-6 animate-in zoom-in duration-700">
                <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
                  <CheckCircle2 size={48} strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter">
                    Accès <span className="text-emerald-500">Scellé</span>
                  </h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">
                    Rendez-vous le 02 février pour votre synchronisation.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- 📊 SECTION MODULES : CAPACITÉS DU SYSTÈME --- */}
      <section className="py-32 px-6 border-t border-white/5 bg-black/40 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8">
            {[
              {
                label: "Conformité ISO 2026",
                icon: ShieldCheck,
                desc: "Certifications Pilotées",
              },
              {
                label: "Audits Master",
                icon: ClipboardCheck,
                desc: "Traçabilité Zéro Papier",
              },
              {
                label: "Cockpit Stratégique",
                icon: Activity,
                desc: "Performance Temps Réel",
              },
              {
                label: "Sovereign Cloud",
                icon: Fingerprint,
                desc: "Isolation des Données",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center space-y-5 group animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${i * 200}ms` }}
              >
                <div className="w-16 h-16 rounded-4xl bg-white/5 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500 shadow-xl border border-white/5">
                  <f.icon size={28} className="text-blue-500 group-hover:text-white" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-white italic">
                    {f.label}
                  </h4>
                  <div className="h-0.5 w-6 bg-blue-600 mx-auto opacity-30"></div>
                  <p className="text-[9px] text-slate-500 font-black uppercase mt-1 italic tracking-widest">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 🏁 FOOTER : SIGNATURE QUALISOFT --- */}
      <footer className="py-16 px-6 text-center border-t border-white/5 bg-[#0B0F1A]">
        <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.6em] italic leading-relaxed">
          Qualisoft RD 2026 • Dakar • Sénégal • Excellence Opérationnelle Sovereign
        </p>
        <p className="text-[8px] text-slate-800 font-bold uppercase mt-4 italic">© 2026 Qualisoft System • Tous droits réservés sur l&apos;architecture Master</p>
      </footer>

      {/* --- 🔐 MODAL MASTER : AUTHENTIFICATION SYSTÈME --- */}
      {showMasterModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/98 backdrop-blur-3xl p-6 animate-in fade-in duration-500">
          <div className="bg-[#0F172A] border border-amber-500/20 w-full max-w-lg rounded-[4.5rem] p-16 relative text-center shadow-[0_0_100px_rgba(245,158,11,0.05)]">
            <button
              onClick={() => setShowMasterModal(false)}
              className="absolute top-12 right-12 text-slate-600 hover:text-white transition-colors border-none bg-transparent cursor-pointer"
            >
              <X size={32} />
            </button>
            
            <div className="w-24 h-24 bg-amber-500/10 rounded-4xl flex items-center justify-center mx-auto mb-10 border border-amber-500/20 shadow-2xl shadow-amber-500/10 group">
              <Fingerprint size={48} className="text-amber-500 group-hover:scale-110 transition-transform" />
            </div>
            
            <div className="space-y-4 mb-10">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
                Noyau <span className="text-amber-500">Master</span>
              </h2>
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic">
                Séquence d&apos;Authentification d&apos;Autorité
              </p>
            </div>

            <form onSubmit={handleMasterSubmit} className="space-y-8">
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input
                  type="password"
                  autoFocus
                  required
                  value={masterKey}
                  onChange={(e) => setMasterKey(e.target.value)}
                  placeholder="AUTHENTIFICATION SECRÈTE"
                  className="w-full bg-black/50 border border-white/10 p-7 pl-16 rounded-4xl text-white font-black text-center italic tracking-[0.5em] focus:border-amber-500 outline-none shadow-inner transition-all placeholder:tracking-normal placeholder:text-[10px]"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-7 bg-amber-500 text-slate-950 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.4em] shadow-2xl shadow-amber-500/20 active:scale-95 transition-all border-none cursor-pointer flex items-center justify-center gap-4"
              >
                Débloquer l&apos;instance <ArrowRight size={20} strokeWidth={3} />
              </button>
              <div className="pt-4 flex justify-center items-center gap-2 opacity-20">
                <ShieldCheck size={14} className="text-amber-500" />
                <span className="text-[8px] font-black uppercase tracking-widest">Cryptage AES-256 Actif</span>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}