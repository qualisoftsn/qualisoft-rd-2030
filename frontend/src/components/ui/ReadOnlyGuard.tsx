/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
/**
 * 🔒 MODULE : READ ONLY GUARD (SENTINELLE DE LICENCE)
 * -------------------------------------------------------------------------
 * FONCTION : Verrouillage interactif des formulaires en cas d'expiration.
 * RÔLE : Protéger l'intégrité des données tout en permettant la consultation.
 * PHILOSOPHIE : "Compliance Continuity" - On peut voir l'histoire, mais plus l'écrire.
 */

import React from 'react';
import { useTrialStatus } from '@/hooks/useTrialStatus'; // Hook simulant la vérification de licence
import { Lock, ShieldAlert } from 'lucide-react';

interface ReadOnlyGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ReadOnlyGuard({ children, fallback }: ReadOnlyGuardProps) {
  const { isReadOnly } = useTrialStatus();

  // 🛡️ ACTIVATION DU VERROU SOUVERAIN
  if (isReadOnly) {
    return (
      <div className="relative group overflow-hidden rounded-4xl">
        {/* Overlay d'interdiction (UI Elite) */}
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-40 flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-4xl flex flex-col items-center gap-4 text-center border-b-4 border-red-600">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 animate-pulse">
              <Lock size={32} />
            </div>
            <div>
              <h4 className="font-black text-slate-950 uppercase italic tracking-tighter text-xl">Instance Verrouillée</h4>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">Votre période d&apos;essai Qualisoft a expiré</p>
            </div>
            <button className="mt-4 px-8 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase italic tracking-[0.2em] shadow-lg shadow-red-900/20 active:scale-95 transition-all">
              Régulariser ma licence
            </button>
          </div>
        </div>

        {/* Contenu original désactivé mais visible pour audit */}
        <div className="opacity-40 pointer-events-none select-none grayscale-[0.5]">
          {children}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}