/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 👤 MODULE : TopUserNav.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Gestion visuelle de l'identité et du niveau d'accréditation.
 * PHILOSOPHIE : Présence forte, typographie souveraine RD-2026.
 * SÉCURITÉ : Isolation du contexte via useAuthStore (Zustand).
 * -------------------------------------------------------------------------
 * RÉVISION : 02 Mars 2026 | 18:52 GMT
 */

"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { User as UserIcon, ShieldCheck, ChevronDown, Fingerprint } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function TopUserNav() {
  /**
   * 🔐 RÉCUPÉRATION DU CONTEXTE SCELLÉ
   * Priorité au Store Zustand pour la réactivité, fallback sur le stockage local.
   */
  const { user } = useAuthStore() as any;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Génération sécurisée des initiales (Memoized pour la performance)
  const initials = useMemo(() => {
    if (!user) return "QS";
    const first = user.U_FirstName?.[0] || "";
    const last = user.U_LastName?.[0] || "";
    return `${first}${last}`.toUpperCase() || user.U_Email?.[0]?.toUpperCase();
  }, [user]);

  /** * ⏳ SQUELETTE D'INITIALISATION
   * Affiché pendant la synchronisation du store avec le Kernel.
   */
  if (!mounted || !user) {
    return (
      <div className="flex items-center gap-5 opacity-30 animate-pulse italic">
        <div className="flex flex-col items-end gap-2">
          <div className="w-28 h-3 bg-slate-700 rounded-full" />
          <div className="w-20 h-2 bg-slate-800 rounded-full" />
        </div>
        <div className="w-12 h-12 bg-slate-800 rounded-2xl border border-white/5" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6 cursor-pointer group select-none italic font-sans transition-all duration-500">
      
      {/* 🏷️ MÉTADONNÉES DE L'AGENT RÉGALIEN */}
      <div className="text-right hidden sm:flex flex-col items-end">
        <p className="text-[13px] font-black text-white group-hover:text-blue-500 transition-colors uppercase tracking-tighter leading-none m-0">
          {user.U_FirstName} {user.U_LastName}
        </p>
        
        <div className="flex items-center justify-end gap-2 mt-2 bg-blue-600/5 px-3 py-1 rounded-lg border border-blue-500/10 group-hover:border-blue-500/30 transition-all">
          <ShieldCheck size={10} className="text-blue-500" />
          <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] leading-none m-0">
            {user.U_Role === 'ADMIN' ? 'RESP. QUALITÉ' : user.U_Role} • ELITE MATRIX
          </p>
        </div>
      </div>
      
      {/* 🛡️ AVATAR SOUVERAIN RD-2026 */}
      <div className="relative">
        <div className="w-12 h-12 bg-slate-950 text-white rounded-[1.25rem] flex items-center justify-center font-black text-sm shadow-2xl border border-white/10 group-hover:bg-blue-600 group-hover:scale-105 group-hover:rotate-3 transition-all duration-500 relative overflow-hidden">
          <span className="relative z-10 tracking-tighter not-italic">
            {initials}
          </span>
          
          {/* Scan Effect au Hover */}
          <div className="absolute inset-0 bg-linear-to-t from-blue-600/40 via-transparent to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
        </div>
        
        {/* Indicateur de Statut Synchro */}
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-[#0B0F1A] rounded-full shadow-lg" />
      </div>

      {/* 🔽 MENU D'ACTION RAPIDE */}
      <ChevronDown 
        size={16} 
        className="text-slate-600 group-hover:text-white group-hover:translate-y-1 transition-all" 
      />

      {/* FILIGRANE DE SÉCURITÉ (Subliminal) */}
      <Fingerprint 
        className="absolute right-0 top-0 text-white opacity-[0.02] pointer-events-none translate-x-1/2 -translate-y-1/2 scale-[2]" 
        size={100} 
      />
    </div>
  );
}