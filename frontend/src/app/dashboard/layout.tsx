/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/app/dashboard/sidebar';
import TrialBanner from '@/app/dashboard/TrialBanner'; 
import { Bell, Search, ChevronDown, Sparkles, ShieldCheck } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<{ user: any; isMounted: boolean }>({
    user: null,
    isMounted: false
  });

  useEffect(() => {
    const stored = localStorage.getItem('user');
    let user = null;
    if (stored) {
      try { user = JSON.parse(stored); } catch (e) { console.error("Session Error"); }
    }
    // Une seule mise à jour d'état pour tout le cycle de vie
    setSession({ user, isMounted: true });
  }, []);

  // Empêcher toute erreur d'hydratation
  if (!session.isMounted) return <div className="min-h-screen bg-[#0B0F1A]" />;

  const u = session.user;
  const initials = (u?.U_FirstName && u?.U_LastName) ? `${u.U_FirstName[0]}${u.U_LastName[0]}`.toUpperCase() : "QS";

  return (
    <div className="min-h-screen bg-[#0B0F1A] flex italic selection:bg-blue-600/30">
      <Sidebar />
      <div className="flex-1 flex flex-col pl-72 min-w-0 relative">
        
        {/* ✅ APPEL CORRIGÉ : On passe l'objet user complet */}
        <TrialBanner user={session.user} />

        <header className="h-20 bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative w-full max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input type="text" placeholder="RECHERCHE NOYAU..." className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white outline-none" />
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="text-right hidden xl:block text-white">
                <p className="text-xs font-black uppercase">{u?.U_FirstName} {u?.U_LastName}</p>
                <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{u?.U_Role || 'ADMIN'}</p>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center border border-white/10 text-white font-black shadow-lg">
                {initials}
              </div>
            </div>
          </div>
        </header>

        <main className="p-10 flex-1 relative">
          {children}
        </main>

        <footer className="py-6 px-10 border-t border-white/5 opacity-30 flex justify-between">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Qualisoft RD 2030</p>
          <ShieldCheck size={14} className="text-slate-500" />
        </footer>
      </div>
    </div>
  );
}