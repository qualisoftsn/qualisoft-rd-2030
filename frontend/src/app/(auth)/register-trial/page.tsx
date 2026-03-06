/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🚀 MODULE : src/app/(public)/register-trial/page.tsx
 * -------------------------------------------------------------------------
 * FONCTION : Landing page stratégique et capture de leads (Trial 14j).
 * RÔLE : Génération d'intérêt et accès "Master Key" pour maintenance.
 * DESIGN : Architecture Sovereign Blue / High-Density Layout.
 * -------------------------------------------------------------------------
 * RÉVISION : 02 Mars 2026 | 17:16 GMT
 */

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Activity, ArrowRight, CheckCircle2, Crown, Fingerprint, 
  Lock, Mail, Rocket, ShieldCheck, Sparkles, X 
} from "lucide-react";
import { toast, Toaster } from "sonner";

export default function LandingPage() {
  const router = useRouter();
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [masterKey, setMasterKey] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleMasterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterKey === "QUALISOFT_2026_ADMIN") {
      toast.success("Autorité Master confirmée.");
      router.push("/dashboard");
    } else {
      toast.error("Clé Master révoquée ou invalide.");
      setMasterKey("");
    }
  };

  const handleTrialRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success("Position scellée dans le Registre Master.");
    }, 1500);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white selection:bg-blue-600/30 font-sans italic overflow-x-hidden text-left">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-[#0B0F1A]/80 backdrop-blur-2xl border-b border-white/5 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl font-black text-2xl not-italic">Q</div>
          <div className="hidden md:block">
            <h1 className="text-xl font-black uppercase tracking-tighter m-0 leading-none italic">Qualisoft <span className="text-blue-600">ELITE RD 2026</span></h1>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1 m-0 italic">Sovereign Performance System</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <button onClick={() => setShowMasterModal(true)} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-amber-500 transition-all bg-transparent border-none cursor-pointer italic">
            <Crown size={16} /> <span className="hidden sm:inline">Accès Master</span>
          </button>
          <div className="flex flex-col items-end leading-none">
            <span className="text-[9px] font-black uppercase text-blue-500 animate-pulse italic">Lancement : 02 Fév 2026</span>
            <span className="text-[7px] font-bold text-slate-700 uppercase italic mt-1">Master Build 4.0</span>
          </div>
        </div>
      </nav>

      {/* --- HERO --- */}
      <section className="relative pt-48 pb-24 px-6 min-h-screen flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none grayscale contrast-125">
           <img src="/images/qs_fondecran.webp" alt="Background" className="w-full h-full object-cover scale-110 blur-[2px]" />
           <div className="absolute inset-0 bg-linear-to-b from-[#0B0F1A] via-transparent to-[#0B0F1A]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-12">
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] shadow-xl animate-in fade-in slide-in-from-top-4 duration-1000">
            <Rocket size={18} className="animate-bounce" /> Disponibilité Initiale : 02/02/2026
          </div>

          <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] italic m-0 animate-in slide-in-from-bottom-8 duration-1000">
            Pilotez notre <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 via-indigo-400 to-blue-300">Conformité.</span>
          </h1>

          <p className="max-w-4xl mx-auto text-slate-500 text-lg md:text-2xl font-bold italic m-0 opacity-80 leading-relaxed">
            L&apos;excellence normative ISO 9001 & 27001 digitalisée pour 2026. <br className="hidden md:block" />
            Rejoignez le registre Master pour 14 jours d&apos;accès exclusif.
          </p>

          <div className="max-w-lg mx-auto bg-slate-900/40 border border-white/5 p-10 rounded-[3rem] lg:rounded-[4rem] shadow-4xl backdrop-blur-3xl relative">
            {!submitted ? (
              <form onSubmit={handleTrialRegistration} className="space-y-6">
                <div className="text-left space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-6 italic">Registre d&apos;Essai Master</label>
                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input type="email" required placeholder="nom@organisation.com" className="w-full bg-black/50 border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-white font-bold italic outline-none focus:border-blue-500 transition-all placeholder:opacity-10" />
                  </div>
                </div>
                <button disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-white hover:text-blue-600 text-white font-black py-6 rounded-3xl transition-all flex items-center justify-center gap-4 shadow-3xl active:scale-95 text-[12px] uppercase tracking-widest border-none cursor-pointer italic">
                  {isSubmitting ? <Activity size={20} className="animate-spin" /> : <>RÉSERVER MON ACCÈS ÉLITE <Sparkles size={20} /></>}
                </button>
              </form>
            ) : (
              <div className="py-12 space-y-6 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/20 shadow-2xl"><CheckCircle2 size={48} strokeWidth={1.5} /></div>
                <h3 className="text-3xl font-black uppercase italic tracking-tighter m-0">Accès <span className="text-emerald-500">Scellé</span></h3>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic m-0">Rendez-vous le 02 février pour la synchronisation.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- MASTER MODAL --- */}
      {showMasterModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-3xl p-6">
          <div className="bg-[#0F172A] border border-amber-500/20 w-full max-w-lg rounded-[3.5rem] lg:rounded-[4.5rem] p-12 lg:p-16 relative text-center shadow-4xl animate-in zoom-in duration-500">
            <button onClick={() => setShowMasterModal(false)} className="absolute top-10 right-10 text-slate-700 hover:text-white transition-colors border-none bg-transparent cursor-pointer"><X size={32} /></button>
            <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-amber-500/20 shadow-2xl"><Fingerprint size={40} className="text-amber-500" /></div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter m-0">Noyau <span className="text-amber-500">Master</span></h2>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-3 italic">Authentification d&apos;Autorité SDE</p>
            <form onSubmit={handleMasterSubmit} className="mt-10 space-y-8">
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
                <input type="password" autoFocus required value={masterKey} onChange={e => setMasterKey(e.target.value)} placeholder="CLÉ SECRÈTE" className="w-full bg-black/50 border border-white/10 p-6 pl-16 rounded-3xl text-white font-black text-center italic tracking-[0.5em] focus:border-amber-500 outline-none transition-all placeholder:tracking-normal placeholder:text-[9px]" />
              </div>
              <button type="submit" className="w-full py-6 bg-amber-500 text-slate-950 rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl active:scale-95 border-none cursor-pointer">DÉBLOQUER L&apos;INSTANCE</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}