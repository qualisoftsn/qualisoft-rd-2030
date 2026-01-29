/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import Sidebar from './sidebar';
import TrialBanner from './TrialBanner'; 
import { 
  Search, ShieldCheck, Bell, Crown, 
  LayoutGrid, Home, HelpCircle, LogOut, 
  Settings, ChevronLeft, Zap, Info
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, token, logout } = useAuthStore();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const SUPER_ADMIN_EMAIL = "ab.thiongane@qualisoft.sn";

  const isSuperAdmin = useMemo(() => {
    if (!user) return false;
    const masterAccess = typeof window !== 'undefined' ? localStorage.getItem('master_access') === 'true' : false;
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

  const handleLogout = () => {
    logout();
    if (typeof window !== 'undefined') {
        localStorage.removeItem("master_access");
        window.location.href = "/auth/login";
    }
  };

  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !token) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center font-sans italic">
        <div className="text-center">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mb-6">Authentification Requise</p>
          <Link href="/auth/login" className="px-10 py-4 bg-blue-600 rounded-2xl text-white text-[10px] font-black uppercase shadow-2xl shadow-blue-900/40">
            Reconnexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0B0F1A] flex italic selection:bg-blue-600/30 font-sans overflow-hidden">
      
      {/* ⬅️ SIDEBAR GAUCHE (FIXE) */}
      <Sidebar user={user} isSuperAdmin={isSuperAdmin} />

      {/* 🚀 CONTENEUR CENTRAL (FLUIDE) */}
      <div className="flex-1 flex flex-col pl-72 pr-20 min-w-0 relative">
        
        <TrialBanner user={user} isSuperAdmin={isSuperAdmin} />

        {/* 🔝 HEADER ÉLITE (STICKY) */}
        <header className="h-20 bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative w-full max-w-lg group">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors ${isSuperAdmin ? 'group-focus-within:text-amber-500' : 'group-focus-within:text-blue-500'}`} size={18} />
              <input 
                type="text" 
                placeholder="RECHERCHE NOYAU..." 
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
                <p className="text-xs font-black uppercase tracking-tight italic leading-none">
                  {user.U_FirstName} {user.U_LastName}
                </p>
                <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1.5 ${isSuperAdmin ? 'text-amber-500' : 'text-blue-500'}`}>
                  {user.U_Role}
                </p>
              </div>
              
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center border border-white/10 text-white font-black shadow-lg ${isSuperAdmin ? 'bg-amber-600' : 'bg-blue-600'}`}>
                <span className="text-xs tracking-tighter not-italic">{initials}</span>
              </div>
            </div>
          </div>
        </header>

        {/* 📄 MAIN CONTENT (SCROLLABLE) */}
        <main className="flex-1 relative overflow-y-auto p-10 custom-scrollbar bg-[#0B0F1A]">
          <div className="max-w-400 mx-auto animate-in fade-in duration-700">
            {children}
          </div>
          
          <footer className="py-12 border-t border-white/5 flex justify-between items-center opacity-30 mt-20">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em]">Qualisoft Elite RD 2026</p>
            <div className="flex items-center gap-3">
              <ShieldCheck size={12} className={isSuperAdmin ? "text-amber-500" : "text-blue-500"} />
              <span className="text-[8px] font-black text-slate-400 uppercase italic">
                {isSuperAdmin ? 'Système Maître' : 'Certifié ISO 9001'}
              </span>
            </div>
          </footer>
        </main>
      </div>

      {/* ➡️ SLIM-NAV DROITE (FIXE) */}
      <nav className="w-20 h-screen bg-[#0F172A] border-l border-white/5 flex flex-col items-center py-8 gap-8 fixed right-0 top-0 z-50">
        
        {/* LOGO MINI / HUB ACCES */}
        <Link href="/dashboard/menu" className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group ${pathname === '/dashboard/menu' ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'bg-white/5 text-slate-500 hover:text-white hover:bg-white/10'}`}>
          <LayoutGrid size={22} className="group-hover:scale-110 transition-transform" />
          <div className="absolute right-24 bg-[#0F172A] border border-white/10 px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            <p className="text-[10px] font-black uppercase text-blue-500 italic">Menu Hub</p>
          </div>
        </Link>

        <div className="w-8 h-px bg-white/5" />

        {/* QUICK ACTIONS */}
        <div className="flex flex-col gap-6">
            <SlimNavItem href="/dashboard" icon={Home} label="Cockpit" active={pathname === '/dashboard'} isSuperAdmin={isSuperAdmin} />
            <SlimNavItem href="/dashboard/objectifs" icon={Zap} label="KPIs" active={pathname === '/dashboard/objectifs'} isSuperAdmin={isSuperAdmin} />
            <SlimNavItem href="/dashboard/settings" icon={Settings} label="Paramètres" active={pathname === '/dashboard/settings'} isSuperAdmin={isSuperAdmin} />
        </div>

        <div className="flex-1" />

        {/* BOTTOM ACTIONS */}
        <div className="flex flex-col gap-6 mb-4">
            <button className="w-12 h-12 rounded-2xl bg-white/5 text-slate-600 flex items-center justify-center hover:text-blue-400 transition-all group relative">
                <Info size={20} />
                <div className="absolute right-24 bg-[#0F172A] border border-white/10 px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    <p className="text-[9px] font-black uppercase text-slate-400 italic">Support SMI</p>
                </div>
            </button>
            <button 
                onClick={handleLogout}
                className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all group relative"
            >
                <LogOut size={20} />
                <div className="absolute right-24 bg-[#0B0F1A] border border-red-500/20 px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    <p className="text-[9px] font-black uppercase text-red-500 italic">Déconnexion</p>
                </div>
            </button>
        </div>
      </nav>

    </div>
  );
}

// --- SOUS-COMPOSANT SLIM-NAV ITEM ---

function SlimNavItem({ href, icon: Icon, label, active, isSuperAdmin }: any) {
    return (
        <Link 
            href={href} 
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group relative ${active ? (isSuperAdmin ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-900/20' : 'bg-blue-600 text-white shadow-lg shadow-blue-900/20') : 'bg-white/5 text-slate-500 hover:text-white hover:bg-white/10'}`}
        >
            <Icon size={20} />
            <div className="absolute right-24 bg-[#0F172A] border border-white/10 px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                <p className={`text-[9px] font-black uppercase italic tracking-widest ${active ? (isSuperAdmin ? 'text-amber-500' : 'text-blue-500') : 'text-slate-400'}`}>
                    {label}
                </p>
            </div>
            {active && (
                <div className={`absolute -left-1 w-1 h-6 rounded-full ${isSuperAdmin ? 'bg-amber-500' : 'bg-blue-600'}`} />
            )}
        </Link>
    );
}