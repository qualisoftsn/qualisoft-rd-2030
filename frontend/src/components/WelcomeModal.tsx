/**
 * 🚀 MODULE : WelcomeModal.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Onboarding visuel et confirmation de scellage d'instance.
 * RÉVISION : 03 Mars 2026 | 00:15 GMT
 */

"use client";

import { ArrowRight, Rocket, ShieldCheck, Sparkles } from "lucide-react";

export default function WelcomeModal({ userName, onClose }: { userName: string, onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center z-9999 p-8 italic font-sans animate-in fade-in duration-700">
      <div className="bg-white p-16 rounded-[5rem] shadow-[0_0_120px_rgba(37,99,235,0.3)] max-w-xl text-center border border-slate-100 relative overflow-hidden">
        <Sparkles className="absolute -top-10 -right-10 text-blue-600 opacity-10 rotate-12" size={200} />

        <div className="w-28 h-28 bg-blue-600 rounded-[3rem] flex items-center justify-center text-white mx-auto mb-10 shadow-3xl shadow-blue-600/40 animate-bounce">
          <Rocket size={56} />
        </div>

        <h2 className="text-5xl font-black text-slate-950 mb-6 uppercase italic tracking-tighter leading-none">
          Bienvenue, <br /> <span className="text-blue-600">Agent {userName.split(' ')[0]}</span>
        </h2>

        <div className="flex items-center justify-center gap-3 mb-10">
          <ShieldCheck size={20} className="text-emerald-500" />
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Instance Elite Scellée & Opérationnelle</p>
        </div>

        <p className="text-slate-600 mb-12 text-sm font-bold leading-relaxed italic px-6">
          Votre cockpit de pilotage est désormais synchronisé avec le Siège Social. 
          Les actifs scellés et les protocoles de sécurité Matrix sont actifs.
        </p>

        <button
          onClick={onClose}
          className="w-full bg-slate-950 text-white py-8 rounded-[2.5rem] font-black uppercase italic tracking-[0.4em] hover:bg-blue-600 transition-all shadow-4xl flex items-center justify-center gap-5 active:scale-95 border-none cursor-pointer"
        >
          ACCÉDER AU COCKPIT <ArrowRight size={24} />
        </button>
      </div>
    </div>
  );
}
