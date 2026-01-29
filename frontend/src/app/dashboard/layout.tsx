/* eslint-disable react-hooks/set-state-in-effect */
// File: frontend/src/app/dashboard/layout.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/store/authStore'; // Import Zustand
import Sidebar from './sidebar';
import TrialBanner from './TrialBanner'; 
import { Search, ShieldCheck, Bell, Crown } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Récupération depuis Zustand
  const { user, token } = useAuthStore();
  const [hasMounted, setHasMounted] = useState(false);

  // Attendre l'hydratation de Zustand (évite le flash)
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const SUPER_ADMIN_EMAIL = "ab.thiongane@qualisoft.sn";

  // Calcul des droits
  const isSuperAdmin = useMemo(() => {
    if (!user) return false;
    const masterAccess = localStorage.getItem('master_access') === 'true';
    return (
      user.U_Email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ||
      user.U_Role?.toUpperCase() === "SUPER_ADMIN" ||
      masterAccess
    );
  }, [user]);

  const initials = useMemo(() => {
    if (!user) return "QS";
    if (user.U_FirstName && user.U_LastName) {
      return `${user.U_FirstName[0]}${user.U_LastName[0]}`.toUpperCase();
    }
    return user.U_Email?.[0]?.toUpperCase() || "QS";
  }, [user]);

  // Pendant l'hydratation initiale, afficher un loader
  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Si pas de user après hydratation (middleware devrait avoir bloqué, mais par sécurité)
  if (!user || !token) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 text-sm mb-4">Session requise</p>
          <a href="/auth/login" className="px-6 py-3 bg-blue-600 rounded-xl text-white text-xs font-black uppercase">
            Connexion
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] flex italic selection:bg-blue-600/30 font-sans overflow-hidden">
      
      <Sidebar user={user} isSuperAdmin={isSuperAdmin} />

      <div className="flex-1 flex flex-col pl-72 min-w-0 relative">
        
        <TrialBanner user={user} isSuperAdmin={isSuperAdmin} />

        <header className="h-20 bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative w-full max-w-lg group">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors ${isSuperAdmin ? 'group-focus-within:text-amber-500' : 'group-focus-within:text-blue-500'}`} size={18} />
              <input 
                type="text" 
                placeholder="RECHERCHE..." 
                className={`w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white outline-none transition-all placeholder:text-slate-600 uppercase italic tracking-widest ${isSuperAdmin ? 'focus:border-amber-500/50' : 'focus:border-blue-500/50'}`} 
              />
            </div>
          </div>

          <div className="flex items-center gap-8">
            {isSuperAdmin && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full">
                <Crown size={12} className="text-amber-500" />
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Sovereign</span>
              </div>
            )}

            <button className="relative p-2 text-slate-400 hover:text-white transition-all active:scale-90 group">
              <Bell size={20} className="group-hover:rotate-12 transition-transform" />
              <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-[#0F172A] animate-pulse ${isSuperAdmin ? 'bg-amber-500' : 'bg-blue-600'}`} />
            </button>

            <div className="flex items-center gap-4 group cursor-pointer border-l border-white/10 pl-8 transition-opacity hover:opacity-80">
              <div className="text-right hidden xl:block text-white">
                <p className="text-xs font-black uppercase tracking-tight italic">
                  {user.U_FirstName} {user.U_LastName}
                </p>
                <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-0.5 ${isSuperAdmin ? 'text-amber-500' : 'text-blue-500'}`}>
                  {user.U_Role}
                </p>
              </div>
              
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 text-white font-black shadow-lg ${isSuperAdmin ? 'bg-amber-600' : 'bg-blue-600'}`}>
                <span className="text-sm tracking-tighter not-italic">{initials}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-10 flex-1 relative overflow-y-auto">
          {children}
        </main>

        <footer className="py-6 px-10 border-t border-white/5 flex justify-between items-center opacity-40 shrink-0">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Qualisoft Elite</p>
          <div className="flex items-center gap-3">
            <ShieldCheck size={12} className={isSuperAdmin ? "text-amber-500" : "text-blue-500"} />
            <span className="text-[8px] font-black text-slate-400 uppercase italic">
              {isSuperAdmin ? 'Root' : 'Sécurisé'}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}