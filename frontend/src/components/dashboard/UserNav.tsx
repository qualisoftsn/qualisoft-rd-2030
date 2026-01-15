/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useEffect, useState } from 'react';
import { User as UserIcon } from 'lucide-react';

export default function UserNav() {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUserData(JSON.parse(stored));
      } catch (e) {
        console.error("Erreur storage");
      }
    }
  }, []);

  // Si pas encore chargé, on affiche un squelette simple
  if (!userData) return (
    <div className="flex items-center gap-3 opacity-50">
      <div className="w-8 h-3 bg-slate-200 rounded animate-pulse" />
      <div className="w-10 h-10 bg-slate-100 rounded-full animate-pulse" />
    </div>
  );

  const initials = `${userData.U_FirstName?.[0] || ''}${userData.U_LastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="flex items-center gap-3 cursor-pointer group">
      <div className="text-right hidden sm:block">
        <p className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase italic">
          {userData.U_FirstName} {userData.U_LastName}
        </p>
        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">
          {userData.U_Role === 'ADMIN' ? 'Responsable Qualité' : userData.U_Role} • ELITE
        </p>
      </div>
      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg border border-white/10">
        {initials || <UserIcon size={20} />}
      </div>
    </div>
  );
}