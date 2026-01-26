/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/app/dashboard/sidebar';
import TrialBanner from '@/app/dashboard/TrialBanner'; 
import { Search, ShieldCheck, Bell } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<{ user: any; isMounted: boolean }>({
    user: null,
    isMounted: false
  });

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const masterAccess = localStorage.getItem('master_access') === 'true';
    let user = null;
    
    if (stored) {
      try { 
        user = JSON.parse(stored);
        // Si master_access est actif, on injecte visuellement le rôle MASTER
        if (masterAccess) user.U_Role = 'SUPER_ADMIN';
      } catch (e) { console.error("Session Error"); }
    }
    
    setSession({ user, isMounted: true });
  }, []);

  // Empêcher les erreurs d'hydratation (Flash blanc/noir)
  if (!session.isMounted) return <div className="min-h-screen bg-[#0B0F1A]" />;

  const u = session.user;
  const initials = (u?.U_FirstName && u?.U_LastName) 
    ? `${u.U_FirstName[0]}${u.U_LastName[0]}`.toUpperCase() 
    : (u?.U_Email ? u.U_Email[0].toUpperCase() : "QS");

  return (
    <div className="min-h-screen bg-[#0B0F1A] flex italic selection:bg-blue-600/30 font-sans">
      {/* SIDEBAR FIXE */}
      <Sidebar />

      {/* ZONE DE CONTENU PRINCIPALE */}
      <div className="flex-1 flex flex-col pl-72 min-w-0 relative">
        
        {/* BANNIÈRE DE STATUT (Essai / Master) */}
        <TrialBanner user={session.user} />

        {/* HEADER ÉLITE */}
        <header className="h-20 bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative w-full max-w-lg group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="RECHERCHE DANS LE NOYAU..." 
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600" 
              />
            </div>
          </div>

          <div className="flex items-center gap-8">
            {/* NOTIFICATIONS */}
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-[#0F172A]"></span>
            </button>

            {/* PROFIL SIGNALÉ */}
            <div className="flex items-center gap-4 group cursor-pointer border-l border-white/10 pl-8">
              <div className="text-right hidden xl:block text-white">
                <p className="text-xs font-black uppercase tracking-tight">
                  {u?.U_FirstName} {u?.U_LastName}
                </p>
                <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${u?.U_Role === 'SUPER_ADMIN' ? 'text-amber-500' : 'text-blue-500'}`}>
                  {u?.U_Role || 'UTILISATEUR'}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 text-white font-black shadow-lg transition-transform group-hover:scale-105 ${u?.U_Role === 'MASTER' ? 'bg-amber-600' : 'bg-blue-600'}`}>
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* CONTENU DE LA PAGE */}
        <main className="p-10 flex-1 relative">
          {children}
        </main>

        {/* FOOTER DISCRET */}
        <footer className="py-6 px-10 border-t border-white/5 flex justify-between items-center opacity-40">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Qualisoft Elite RD 2030 - Noyau de Gouvernance</p>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-slate-500" />
            <span className="text-[8px] font-black text-slate-500 uppercase">Certifié Sécurité Multi-Tenant</span>
          </div>
        </footer>
      </div>
    </div>
  );
}