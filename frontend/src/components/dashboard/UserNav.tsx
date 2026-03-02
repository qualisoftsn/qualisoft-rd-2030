/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
/**
 * 👤 MODULE : UserNav.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Gestion de l'identité et des accréditations (Zéro NextAuth).
 * SOURCE : useAuthStore (Zustand) pour une réactivité totale.
 * RÉVISION : 02 Mars 2026 | 18:48 GMT
 */

"use client";

import { useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { User as UserIcon, ShieldCheck } from 'lucide-react';

export default function UserNav() {
  const { user } = useAuthStore() as any;

  // Squelette de chargement souverain
  if (!user) return (
    <div className="flex items-center gap-4 opacity-20 animate-pulse italic">
      <div className="flex flex-col items-end gap-2">
        <div className="w-24 h-3 bg-slate-400 rounded-full" />
        <div className="w-16 h-2 bg-slate-300 rounded-full" />
      </div>
      <div className="w-12 h-12 bg-slate-400 rounded-2xl" />
    </div>
  );

  const initials = useMemo(() => {
    return `${user.U_FirstName?.[0] || ''}${user.U_LastName?.[0] || ''}`.toUpperCase();
  }, [user]);

  return (
    <div className="flex items-center gap-5 cursor-pointer group italic font-sans select-none">
      {/* MÉTADONNÉES DE L'AGENT */}
      <div className="text-right hidden sm:block">
        <p className="text-[13px] font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tighter leading-none m-0">
          {user.U_FirstName} {user.U_LastName}
        </p>
        <div className="flex items-center justify-end gap-2 mt-2">
          <ShieldCheck size={12} className="text-blue-600" />
          <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] leading-none m-0">
            {user.U_Role === 'ADMIN' ? 'RESP. QUALITÉ' : user.U_Role} • ELITE
          </p>
        </div>
      </div>
      
      {/* AVATAR SOUVERAIN */}
      <div className="relative">
        <div className="w-12 h-12 bg-slate-950 text-white rounded-[1.25rem] flex items-center justify-center font-black text-sm shadow-2xl border border-white/10 group-hover:bg-blue-600 group-hover:scale-105 group-hover:rotate-3 transition-all duration-500 overflow-hidden">
          {initials || <UserIcon size={20} />}
          {/* Overlay de scan au survol */}
          <div className="absolute inset-0 bg-linear-to-t from-blue-600/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        {/* Badge de statut en ligne scellé */}
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-[#F8FAFC] rounded-full shadow-lg" />
      </div>
    </div>
  );
}