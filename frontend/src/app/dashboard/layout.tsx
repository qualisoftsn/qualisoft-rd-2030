/**
 * 🛰️ MODULE : DashboardLayout.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Superstructure de l'interface Qualisoft Elite.
 * RÉPARATION : Éradication du blocage de synchronisation et des erreurs de State.
 * RÉVISION : 03 Mars 2026 | 18:10 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Role } from "@/types/elite-sde";
import { 
  Crown, Home, Info, LayoutGrid, Loader2, 
  LogOut, Search, Settings, ShieldCheck, Zap, Fingerprint
} from "lucide-react";
import Link from "next/link";

import Sidebar from "./sidebar";
import TrialBanner from "@/components/TrialBanner";
import ImpersonationBanner from "@/components/layout/ImpersonationBanner";
import NotificationBell from "@/components/dashboard/notification-bell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const { user, logout, isAuthenticated, isInitialized } = useAuthStore() as any;
  const [mounted, setMounted] = useState(false);

  // 1. Montage client immédiat pour stabiliser l'hydratation
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. Gestion souveraine de la redirection
  useEffect(() => {
    if (mounted && isInitialized && isAuthenticated === false) {
      router.replace("/auth/login");
    }
  }, [mounted, isInitialized, isAuthenticated, router]);

  const isSuperAdmin = useMemo(() => {
    if (!user) return false;
    return user.U_Role === Role.SUPER_ADMIN || user.U_Email === "ab.thiongane@qualisoft.sn";
  }, [user]);

  const initials = useMemo(() => {
    if (!user) return "QS";
    return `${user.U_FirstName?.[0] || ""}${user.U_LastName?.[0] || ""}`.toUpperCase();
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  // ⏳ ÉCRAN DE SYNCHRONISATION KERNEL
  if (!mounted || !isInitialized || (isAuthenticated && !user)) {
    return (
      <div className="h-screen bg-[#0B0F1A] flex flex-col items-center justify-center gap-8 italic font-sans overflow-hidden">
        <div className="relative">
          <Loader2 className="w-20 h-20 text-blue-600 animate-spin" strokeWidth={2} />
          <Fingerprint className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500/20" size={32} />
        </div>
        <div className="text-center">
          <p className="text-[11px] font-black text-blue-500 uppercase tracking-[0.5em] animate-pulse m-0">
            SDE Matrix OS : Synchronisation...
          </p>
          <p className="text-[8px] font-bold text-slate-700 uppercase tracking-[0.3em] mt-2 italic">
            Initialisation des Sceaux de Sécurité
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0B0F1A] flex italic font-sans overflow-hidden selection:bg-blue-600/30">
      
      <ImpersonationBanner />

      <Sidebar isSuperAdmin={isSuperAdmin} />

      <div className={`flex-1 flex flex-col pl-80 pr-20 min-w-0 relative transition-all duration-500 ${user?.isImpersonated ? "pt-10" : "pt-0"}`}>
        
        <TrialBanner isSuperAdmin={isSuperAdmin} />

        <header className="h-24 bg-[#0F172A]/40 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-12 sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-8 flex-1">
            <div className="relative w-full max-w-xl group">
              <Search className={`absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors ${isSuperAdmin ? "group-focus-within:text-amber-500" : "group-focus-within:text-blue-500"}`} size={20} />
              <input 
                type="text" 
                placeholder="RECHERCHE DANS LE NOYAU..." 
                className={`w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black text-white outline-none transition-all placeholder:text-slate-800 uppercase italic tracking-widest ${isSuperAdmin ? "focus:border-amber-500/40 shadow-lg shadow-amber-900/10" : "focus:border-blue-500/40 shadow-lg shadow-blue-900/10"}`} 
              />
            </div>
          </div>

          <div className="flex items-center gap-10">
            {isSuperAdmin && (
              <div className="hidden lg:flex items-center gap-3 px-5 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-full shrink-0 shadow-xl shadow-amber-900/5">
                <Crown size={14} className="text-amber-500" />
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Sovereign Mode</span>
              </div>
            )}

            <NotificationBell />

            <div className="flex items-center gap-6 border-l border-white/10 pl-10 shrink-0">
              <div className="text-right hidden xl:block text-white leading-tight">
                <p className="text-sm font-black uppercase tracking-tight italic m-0">{user?.U_FirstName} {user?.U_LastName}</p>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1 m-0 ${isSuperAdmin ? "text-amber-500" : "text-blue-600"}`}>
                  {isSuperAdmin ? "Architecte Master" : user?.U_Role}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center border border-white/10 text-white font-black shadow-2xl ${isSuperAdmin ? "bg-amber-600 shadow-amber-900/30" : "bg-blue-600 shadow-blue-900/30"}`}>
                <span className="text-sm not-italic">{initials}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 relative overflow-y-auto p-12 custom-scrollbar">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
            {children}
          </div>

          <footer className="py-16 border-t border-white/5 flex justify-between items-center opacity-20 mt-24 shrink-0">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] m-0 leading-none">Qualisoft Elite Matrix RD-2026</p>
            <div className="flex items-center gap-4">
              <ShieldCheck size={14} className={isSuperAdmin ? "text-amber-500" : "text-blue-500"} />
              <span className="text-[9px] font-black text-slate-400 uppercase italic tracking-widest leading-none">
                {isSuperAdmin ? "Noyau Maître Scellé" : "Certifié ISO 9001:2015"}
              </span>
            </div>
          </footer>
        </main>
      </div>

      <nav className="w-20 h-screen bg-[#0F172A] border-l border-white/5 flex flex-col items-center py-10 gap-10 fixed right-0 top-0 z-50 shrink-0 shadow-4xl">
        <Link href="/dashboard/menu" className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group ${pathname === "/dashboard/menu" ? "bg-blue-600 text-white shadow-2xl shadow-blue-900/50" : "bg-white/5 text-slate-600 hover:text-white hover:bg-white/10"}`}>
          <LayoutGrid size={24} className="group-hover:scale-110 transition-transform" />
        </Link>
        <div className="w-10 h-px bg-white/5" />
        <div className="flex flex-col gap-8">
          <SlimNavItem href="/dashboard" icon={Home} label="Cockpit" active={pathname === "/dashboard"} isSuperAdmin={isSuperAdmin} />
          <SlimNavItem href="/dashboard/objectifs" icon={Zap} label="Objectifs" active={pathname === "/dashboard/objectifs"} isSuperAdmin={isSuperAdmin} />
          <SlimNavItem href="/dashboard/settings" icon={Settings} label="Profil" active={pathname === "/dashboard/settings"} isSuperAdmin={isSuperAdmin} />
        </div>
        <div className="flex-1" />
        <div className="flex flex-col gap-8 mb-4">
          <button className="w-12 h-12 rounded-2xl bg-white/5 text-slate-700 flex items-center justify-center hover:text-blue-400 transition-all cursor-pointer border-none shadow-inner"><Info size={22} /></button>
          <button onClick={handleLogout} className="w-12 h-12 rounded-2xl bg-red-600/10 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all cursor-pointer border-none shadow-lg shadow-red-900/10"><LogOut size={22} /></button>
        </div>
      </nav>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(37, 99, 235, 0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}

function SlimNavItem({ href, icon: Icon, label, active, isSuperAdmin }: any) {
  return (
    <Link href={href} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group relative ${active ? (isSuperAdmin ? "bg-amber-500 text-slate-950 shadow-xl shadow-amber-900/30" : "bg-blue-600 text-white shadow-xl shadow-blue-900/30") : "bg-white/5 text-slate-600 hover:text-white hover:bg-white/10"}`}>
      <Icon size={22} />
      <div className="absolute right-28 bg-[#0F172A] border border-white/10 px-5 py-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 pointer-events-none whitespace-nowrap shadow-4xl z-60">
        <p className={`text-[10px] font-black uppercase italic tracking-[0.2em] m-0 ${active ? (isSuperAdmin ? "text-amber-500" : "text-blue-500") : "text-slate-400"}`}>
          {label}
        </p>
      </div>
      {active && <div className={`absolute -left-1 w-1 h-7 rounded-full ${isSuperAdmin ? "bg-amber-500" : "bg-blue-600"}`} />}
    </Link>
  );
}