"use client";
/**
 * 🚀 MODULE : WELCOME MODAL
 * -------------------------------------------------------------------------
 * FONCTION : Onboarding initial de l'utilisateur.
 * RÔLE : Confirmer l'activation de l'instance et souhaiter la bienvenue.
 * PHILOSOPHIE : Célébration technologique, design "Elite".
 */

import { ArrowRight, Rocket, ShieldCheck } from "lucide-react";

interface WelcomeModalProps {
  userName: string;
  onClose: () => void;
}

export default function WelcomeModal({ userName, onClose }: WelcomeModalProps) {
  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center z-9999 p-6 italic font-sans animate-in fade-in duration-500">
      <div className="bg-white p-12 rounded-[4rem] shadow-[0_0_100px_rgba(37,99,235,0.2)] max-w-lg text-center border border-slate-100 relative overflow-hidden">
        {/* Décoration Matrix */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-600/5 blur-3xl rounded-full" />

        <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-white mx-auto mb-8 shadow-2xl shadow-blue-600/30 animate-bounce">
          <Rocket size={48} />
        </div>

        <h2 className="text-4xl font-black text-slate-950 mb-4 uppercase italic tracking-tighter leading-none">
          Bienvenue, <br />
          <span className="text-blue-600">{userName} !</span>
        </h2>

        <div className="flex items-center justify-center gap-2 mb-8">
          <ShieldCheck size={16} className="text-emerald-500" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Instance Elite Scellée & Opérationnelle
          </p>
        </div>

        <p className="text-slate-600 mb-10 text-sm font-medium leading-relaxed italic">
          notre environnement de pilotage **Qualisoft Elite** est prêt. Nous
          avons synchronisé notre siège social, vos actifs et vos protocoles
          administrateur.
        </p>

        <button
          onClick={onClose}
          className="w-full bg-slate-950 text-white px-10 py-6 rounded-3xl font-black uppercase italic tracking-[0.3em] hover:bg-blue-600 transition-all shadow-2xl flex items-center justify-center gap-4 active:scale-95 border-none cursor-pointer"
        >
          C&apos;est parti, j&apos;accède au cockpit !
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
