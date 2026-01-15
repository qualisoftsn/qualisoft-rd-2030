/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useEffect, useState } from 'react';

export default function TopUserNav() {
  const [userInfo, setUserInfo] = useState<{ name: string; initials: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserInfo({
        name: `${user.U_FirstName} ${user.U_LastName}`,
        initials: `${user.U_FirstName[0]}${user.U_LastName[0]}`.toUpperCase()
      });
    }
  }, []);

  // Affichage pendant le chargement pour éviter le saut visuel
  if (!userInfo) return <div className="h-10 w-32 bg-slate-800/20 animate-pulse rounded-xl" />;

  return (
    <div className="flex items-center gap-3 group cursor-pointer">
      <div className="text-right hidden sm:block">
        <p className="text-[11px] font-black text-white uppercase tracking-tighter group-hover:text-blue-500 transition-colors italic">
          {userInfo.name}
        </p>
        <div className="flex items-center justify-end gap-1 mt-0.5">
           <span className="text-[9px] font-bold text-blue-400 uppercase italic tracking-widest">
             Responsable SMI • ELITE
           </span>
        </div>
      </div>
      
      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg border border-white/10 group-hover:scale-105 transition-transform">
        {userInfo.initials}
      </div>
    </div>
  );
}