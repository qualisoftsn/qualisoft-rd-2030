'use client';

/**
 * ⏳ MODULE : TRIAL COUNTDOWN (SURVEILLANCE LICENCE)
 * -------------------------------------------------------------------------
 * FONCTION : Monitoring en temps réel de la validité de l'instance.
 * RÔLE : Verrouillage de l'accès en mode "Lecture Seule" après expiration.
 * ISOLATION : Basé sur les métadonnées scellées de l'objet Tenant.
 */

import React from 'react';
import { AlertTriangle, Lock, ShieldAlert, Rocket } from 'lucide-react';
import { differenceInDays, startOfDay } from 'date-fns';

interface TrialCountdownProps {
  endDate: string | Date;
  status: string;
}

export default function TrialCountdown({ endDate, status }: TrialCountdownProps) {
  // ✅ PROTECTION SDE : Si l'instance est déjà validée (ACTIVE), on n'affiche rien.
  if (!endDate || status !== 'TRIAL') return null;

  // Calcul du délai avant interruption de service
  const daysLeft = differenceInDays(
    startOfDay(new Date(endDate)), 
    startOfDay(new Date())
  );

  // --- LOGIQUE DE VERROUILLAGE MATRIX ---

  // 1. PHASE : SERVICE INTERROMPU (Verrouillage en Lecture Seule)
  if (daysLeft < 0) {
    return (
      <div className="bg-slate-950 border-b-2 border-red-600/50 p-6 flex items-center justify-center gap-10 animate-in slide-in-from-top duration-700 sticky top-0 z-110 shadow-2xl backdrop-blur-md italic font-sans">
        <div className="flex items-center gap-4">
           <Lock className="text-red-500 animate-pulse" size={24} />
           <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-white">
                Instance Qualisoft en <span className="text-red-600 underline decoration-2">Lecture Seule</span>
              </p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">Le périmètre d&apos;écriture est désactivé.</p>
           </div>
        </div>
        <button className="bg-red-600 hover:bg-red-500 text-white px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-2xl shadow-red-600/30 border-none cursor-pointer">
          Restaurer la licence
        </button>
      </div>
    );
  }

  // 2. PHASE : URGENCE CRITIQUE (<= 2 jours)
  if (daysLeft <= 2) {
    return (
      <div className="bg-red-600 p-4 flex items-center justify-center gap-6 sticky top-0 z-110 shadow-2xl italic font-sans animate-pulse">
        <ShieldAlert className="text-white" size={24} />
        <p className="text-sm font-black uppercase tracking-tighter text-white">
          URGENCE MASTER : Verrouillage de l&apos;instance dans <span className="underline">{daysLeft} {daysLeft === 1 ? 'jour' : 'jours'}</span> !
        </p>
        <Rocket size={20} className="text-white animate-bounce" />
      </div>
    );
  }

  // 3. PHASE : ALERTE PRÉVENTIVE (<= 7 jours)
  if (daysLeft <= 7) {
    return (
      <div className="bg-amber-500 p-4 flex items-center justify-center gap-6 sticky top-0 z-110 border-b-2 border-amber-600 shadow-xl italic font-sans">
        <AlertTriangle className="text-slate-950" size={24} />
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-950 italic">
          Pilotage : Votre période d&apos;essai Qualisoft expire dans <span className="font-mono text-lg">{daysLeft}</span> jours.
        </p>
        <button className="bg-slate-950 text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border-none cursor-pointer">Activer</button>
      </div>
    );
  }

  return null;
}