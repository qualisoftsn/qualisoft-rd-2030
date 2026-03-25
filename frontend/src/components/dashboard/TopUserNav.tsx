/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 👤 MODULE : TopUserNav.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Affichage de l'identité et du grade Matrix de l'agent.
 * RÉVISION : 02 Mars 2026 | 23:15 GMT
 */

"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { ShieldCheck, ChevronDown, Fingerprint, Activity } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function TopUserNav() {
  const { user } = useAuthStore() as any;
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const initials = useMemo(() => {
    if (!user) return "QS";
    return `${user.U_FirstName?.[0] || ""}${user.U_LastName?.[0] || ""}`.toUpperCase();
  }, [user]);

  if (!mounted || !user) {
    return (
      <div className="flex items-center gap-4 opacity-20 animate-pulse italic">
        <div className="flex flex-col items-end gap-2">
          <div className="w-24 h-2 bg-slate-700 rounded-full" />
          <div className="w-16 h-2 bg-slate-800 rounded-full" />
        </div>
        <div className="w-10 h-10 bg-slate-800 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6 cursor-pointer group select-none italic font-sans relative transition-all duration-500">
      
      <div className="text-right hidden sm:flex flex-col items-end">
        <p className="text-[13px] font-black text-white group-hover:text-blue-500 transition-colors uppercase tracking-tighter m-0 leading-none">
          {user.U_FirstName} {user.U_LastName}
        </p>
        
        <div className="flex items-center justify-end gap-2 mt-2 bg-blue-600/5 px-3 py-1 rounded-lg border border-blue-500/10 group-hover:border-blue-500/30 transition-all">
          <ShieldCheck size={10} className="text-blue-500" />
          <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em] m-0 leading-none">
            {user.U_Role === 'ADMIN' ? 'RESP. QUALITÉ' : user.U_Role} • {user.U_TenantName || 'ELITE'}
          </p>
        </div>
      </div>
      
      <div className="relative">
        <div className="w-12 h-12 bg-[#0F172A] text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-2xl border border-white/10 group-hover:bg-blue-600 group-hover:rotate-6 transition-all duration-500 relative overflow-hidden">
          <span className="relative z-10 tracking-tighter not-italic">{initials}</span>
          <div className="absolute inset-0 bg-linear-to-t from-blue-600/40 via-transparent to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-[#0B0F1A] rounded-full" />
      </div>

      <ChevronDown size={14} className="text-slate-600 group-hover:text-white transition-all" />

      {/* FILIGRANE DE SÉCURITÉ */}
      <Fingerprint className="absolute -right-4 -top-4 text-white opacity-[0.03] pointer-events-none scale-[2.5]" size={80} />
    </div>
  );
}
