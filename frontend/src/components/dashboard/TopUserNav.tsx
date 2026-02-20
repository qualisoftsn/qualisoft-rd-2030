/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
/**
 * 👤 MODULE : USER IDENTITY NAVIGATION
 * -------------------------------------------------------------------------
 * FONCTION : Interface de gestion du profil et du rôle actif.
 * RÔLE : Identifier le citoyen Matrix et son niveau d'accréditation.
 * PHILOSOPHIE : Présence forte, typographie souveraine.
 */

import React, { useEffect, useState } from 'react';
import { User as UserIcon, ShieldCheck } from 'lucide-react';

export default function UserNav() {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    /**
     * 🔐 RÉCUPÉRATION DU CONTEXTE SCELLÉ
     * On interroge le stockage pour identifier l'utilisateur du Tenant.
     */
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUserData(JSON.parse(stored));
      } catch (e) {
        console.error("Échec de lecture du profil Matrix");
      }
    }
  }, []);

  if (!userData) return (
    <div className="flex items-center gap-4 opacity-30 animate-pulse">
      <div className="w-12 h-3 bg-slate-300 rounded-full" />
      <div className="w-10 h-10 bg-slate-200 rounded-xl" />
    </div>
  );

  const initials = `${userData.U_FirstName?.[0] || ''}${userData.U_LastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="flex items-center gap-4 cursor-pointer group italic">
      <div className="text-right hidden sm:block">
        <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight leading-none">
          {userData.U_FirstName} {userData.U_LastName}
        </p>
        <div className="flex items-center justify-end gap-2 mt-2">
          <ShieldCheck size={10} className="text-blue-500" />
          <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest leading-none">
            {userData.U_Role || 'CONSULTANT'} • ELITE MATRIX
          </p>
        </div>
      </div>
      
      {/* AVATAR SOUVERAIN */}
      <div className="w-11 h-11 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-xl border border-white/10 group-hover:bg-blue-600 transition-all group-hover:scale-105 duration-300">
        {initials || <UserIcon size={20} />}
      </div>
    </div>
  );
}