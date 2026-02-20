/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

/**
 * 👤 MODULE : USER NAVIGATION (L'IDENTITÉ MATRICIELLE)
 * -------------------------------------------------------------------------
 * FONCTION : Affichage du profil utilisateur et de son accréditation (Rôle).
 * RÔLE : Identifier le citoyen actif dans l'instance du Tenant.
 * PHILOSOPHIE : Design Elite, typographie souveraine, chargement asynchrone protégé.
 */

import React, { useEffect, useState } from 'react';
import { User as UserIcon, ShieldCheck } from 'lucide-react';

export default function UserNav() {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // 🧬 Extraction du scellé utilisateur depuis le stockage local
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUserData(JSON.parse(stored));
      } catch (e) {
        console.error("Erreur de déchiffrement du profil local");
      }
    }
  }, []);

  // 🦴 SQUELETTE DE CHARGEMENT (Évite le Cumulative Layout Shift)
  if (!userData) return (
    <div className="flex items-center gap-4 opacity-30 animate-pulse">
      <div className="flex flex-col items-end gap-1">
        <div className="w-24 h-3 bg-slate-300 rounded-full" />
        <div className="w-16 h-2 bg-slate-200 rounded-full" />
      </div>
      <div className="w-11 h-11 bg-slate-200 rounded-2xl" />
    </div>
  );

  // Génération des initiales pour l'avatar de secours
  const initials = `${userData.U_FirstName?.[0] || ''}${userData.U_LastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="flex items-center gap-4 cursor-pointer group select-none italic">
      {/* MÉTADONNÉES DE L'AGENT */}
      <div className="text-right hidden sm:block">
        <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tighter leading-none">
          {userData.U_FirstName} {userData.U_LastName}
        </p>
        <div className="flex items-center justify-end gap-1.5 mt-1.5">
          <ShieldCheck size={10} className="text-blue-500" />
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest leading-none">
            {userData.U_Role === 'ADMIN' ? 'Responsable Qualité' : userData.U_Role} • ELITE
          </p>
        </div>
      </div>

      {/* AVATAR SOUVERAIN */}
      <div className="w-11 h-11 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-xl border border-white/5 group-hover:bg-blue-600 group-hover:scale-105 transition-all duration-300">
        <span className="group-hover:animate-pulse">
          {initials || <UserIcon size={20} />}
        </span>
      </div>
    </div>
  );
}