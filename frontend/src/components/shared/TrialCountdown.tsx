/**
 * ⏳ MODULE : TrialCountdown.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Monitoring temps réel et protection de l'instance.
 * FONCTION : Verrouillage "Lecture Seule" après expiration du bail.
 * RÉVISION : 02 Mars 2026 | 19:10 GMT
 */

"use client";

import { differenceInDays, startOfDay } from "date-fns";
import { AlertTriangle, Lock, Rocket, ShieldAlert, Key } from "lucide-react";

interface TrialCountdownProps {
  endDate: string | Date;
  status: string;
}

export default function TrialCountdown({ endDate, status }: TrialCountdownProps) {
  // ✅ PROTECTION SDE : Rien à afficher si la licence est "ACTIVE" (Full)
  if (!endDate || status !== "TRIAL") return null;

  const daysLeft = differenceInDays(
    startOfDay(new Date(endDate)),
    startOfDay(new Date())
  );

  // 🔴 PHASE 1 : INSTANCE VÉROUILLÉE (Lecture Seule)
  if (daysLeft < 0) {
    return (
      <div className="bg-[#0B0F1A] border-b-4 border-red-600 p-8 flex items-center justify-between gap-10 animate-in slide-in-from-top duration-700 sticky top-0 z-110 shadow-4xl backdrop-blur-xl italic font-sans text-left">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-red-600/20 rounded-2xl border border-red-600/30 animate-pulse">
            <Lock className="text-red-600" size={32} />
          </div>
          <div>
            <h4 className="text-lg font-black uppercase tracking-tighter text-white m-0">
              Instance Qualisoft en <span className="text-red-600 underline underline-offset-4">Lecture Seule</span>
            </h4>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 m-0 leading-none">
              Le bail d&apos;exploitation est expiré. Le périmètre d&apos;écriture est désactivé.
            </p>
          </div>
        </div>
        <button className="bg-red-600 hover:bg-white hover:text-red-600 text-white px-12 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-3xl border-none cursor-pointer flex items-center gap-4">
          <Key size={18} /> Restaurer la licence
        </button>
      </div>
    );
  }

  // 🟠 PHASE 2 : ALERTE CRITIQUE (<= 2 jours)
  if (daysLeft <= 2) {
    return (
      <div className="bg-red-600 p-5 flex items-center justify-center gap-8 sticky top-0 z-110 shadow-2xl italic font-sans animate-pulse">
        <ShieldAlert className="text-white" size={28} />
        <p className="text-sm font-black uppercase tracking-tighter text-white m-0">
          ALERTE MASTER : Verrouillage du Nœud Matrix dans <span className="underline decoration-4 text-white font-black">{daysLeft} {daysLeft === 1 ? "jour" : "jours"}</span> !
        </p>
        <Rocket size={24} className="text-white animate-bounce" />
      </div>
    );
  }

  // 🟡 PHASE 3 : ALERTE PRÉVENTIVE (<= 7 jours)
  if (daysLeft <= 7) {
    return (
      <div className="bg-amber-400 p-5 flex items-center justify-center gap-8 sticky top-0 z-110 border-b-2 border-amber-500 shadow-xl italic font-sans">
        <AlertTriangle className="text-slate-900" size={24} />
        <p className="text-[12px] font-black uppercase tracking-widest text-slate-950 m-0 leading-none">
          PILOTAGE : La période d&apos;essai Qualisoft Elite expire dans <span className="bg-slate-950 text-white px-3 py-1 rounded-lg font-mono text-lg ml-2">{daysLeft}</span> jours.
        </p>
        <button className="bg-slate-950 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-none cursor-pointer hover:scale-105 transition-transform">
          Activer l&apos;Instance
        </button>
      </div>
    );
  }

  return null;
}
