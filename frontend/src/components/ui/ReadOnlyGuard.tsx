/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🔒 MODULE : ReadOnlyGuard.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Sentinelle de modification. Bloque l'écriture, autorise la vue.
 * RÉVISION : 03 Mars 2026 | 02:30 GMT
 */

"use client";

import React from "react";
import { useTrial } from "@/providers/TrialProvider";
import { Lock, ShieldAlert, ArrowUpRight } from "lucide-react";

export function ReadOnlyGuard({ children }: { children: React.ReactNode }) {
  const { isReadOnly } = useTrial();

  if (isReadOnly) {
    return (
      <div className="relative group rounded-[3rem] overflow-hidden italic font-sans">
        
        {/* 🛡️ OVERLAY D'INTERDICTION ÉLITE */}
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-8 animate-in fade-in duration-500">
          <div className="bg-white p-10 rounded-[3.5rem] shadow-4xl flex flex-col items-center text-center border-b-8 border-orange-500 max-w-sm transform group-hover:scale-105 transition-transform">
            <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center text-orange-600 mb-6 shadow-xl animate-pulse">
              <Lock size={36} />
            </div>
            <h4 className="text-2xl font-black text-slate-950 uppercase italic tracking-tighter m-0 leading-none">
              Mode Consultation <br/> <span className="text-orange-600">Uniquement</span>
            </h4>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-4 leading-relaxed italic">
              notre licence Qualisoft Elite a expiré. <br/> 
              Modification et ajout de données suspendus (§ISO 27001).
            </p>
            <button className="mt-8 px-10 py-5 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase italic tracking-[0.2em] shadow-2xl hover:bg-blue-600 transition-all border-none cursor-pointer flex items-center gap-3">
              Régulariser l&apos;instance <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* CONTENU EN "GHOST MODE" (Consultable mais inerte) */}
        <div className="opacity-40 pointer-events-none select-none grayscale-[0.6] blur-[0.5px]">
          {children}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}