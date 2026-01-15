'use client';

import React from 'react';
import { AlertTriangle, Lock, ShieldAlert } from 'lucide-react';
import { differenceInDays, startOfDay } from 'date-fns';

interface TrialCountdownProps {
  endDate: string | Date;
  status: string;
}

export default function TrialCountdown({ endDate, status }: TrialCountdownProps) {
  // 🛡️ Garde-fou : Si pas de date ou si l'instance n'est pas en mode "ACTIVE", on n'affiche rien
  if (!endDate || status !== 'ACTIVE') return null;

  // ✅ CALCUL DÉRIVÉ DIRECT (Pas de useState/useEffect = Zéro erreur de cycle)
  // On compare les dates en début de journée pour un décompte précis
  const daysLeft = differenceInDays(
    startOfDay(new Date(endDate)), 
    startOfDay(new Date())
  );

  // --- LOGIQUE D'AFFICHAGE GRADUELLE ---

  // 1. CAS : EXSPIRÉ (Verrouillage en Lecture Seule)
  if (daysLeft < 0) {
    return (
      <div className="bg-black border-b border-red-900/50 p-4 flex items-center justify-center gap-6 animate-in slide-in-from-top duration-700 sticky top-0 z-60">
        <Lock className="text-red-600 animate-pulse" size={20} />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic">
          Instance Qualisoft en <span className="text-red-600 underline decoration-2">Mode Lecture Seule</span>. Période d&apos;essai terminée.
        </p>
        <button className="bg-red-600 hover:bg-red-500 text-white px-8 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-red-600/20">
          Régulariser maintenant
        </button>
      </div>
    );
  }

  // 2. CAS : URGENCE (2 jours ou moins) - Rouge clignotant
  if (daysLeft <= 2) {
    return (
      <div className="bg-red-600 p-3 flex items-center justify-center gap-4 animate-pulse sticky top-0 z-60 shadow-xl shadow-red-600/20">
        <ShieldAlert className="text-white" size={20} />
        <p className="text-[11px] font-black uppercase tracking-tighter text-white italic">
          URGENCE MASTER : Il ne vous reste que {daysLeft} {daysLeft === 1 ? 'jour' : 'jours'} avant le verrouillage de votre instance !
        </p>
      </div>
    );
  }

  // 3. CAS : ALERTE (7 jours ou moins) - Ambre/Orange
  if (daysLeft <= 7) {
    return (
      <div className="bg-amber-500 p-3 flex items-center justify-center gap-4 sticky top-0 z-60 border-b border-amber-600/20">
        <AlertTriangle className="text-slate-900" size={20} />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 italic">
          Attention : Votre période d&apos;essai Qualisoft RD 2030 expire dans {daysLeft} jours.
        </p>
      </div>
    );
  }

  // Au-dessus de 7 jours, on reste discret pour laisser l'utilisateur travailler sereinement
  return null;
}