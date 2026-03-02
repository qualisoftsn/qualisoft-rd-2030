/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : src/app/(dashboard)/layout.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Orchestration de l'interface Matrix OS.
 * SÉCURITÉ : Zéro NextAuth. Sentinelle de session via Zustand.
 * RÉVISION : 02 Mars 2026 | 17:23 GMT
 */

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Role, User } from "@/types/elite-sde";
import { 
  Bell, Crown, Home, Info, LayoutGrid, Loader2, 
  LogOut, LucideIcon, Search, Settings, ShieldCheck, Zap 
} from "lucide-react";
import Link from "next/link";
import Sidebar from "./sidebar";
import TrialBanner from "@/components/TrialBanner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);

  // Extraction typée du Noyau Auth
  const { user, logout, isAuthenticated } = useAuthStore() as {
    user: User | null;
    logout: () => void;
    isAuthenticated: boolean;
  };

  // 🛠️ FIX HYDRATATION : Décalage pile d'exécution
  useEffect(() => {
    const timer = setTimeout(() => setHasMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // 🔒 SENTINELLE : Redirection si perte de session
  useEffect(() => {
    if (hasMounted && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [hasMounted, isAuthenticated, router]);

  const isSuperAdmin = useMemo(() => {
    return user?.U_Role === Role.SUPER_ADMIN || user?.U_Email === "ab.thiongane@qualisoft.sn";
  }, [user]);

  const initials = useMemo(() => {
    if (!user) return "QS";
    return `${user.U_FirstName?.[0] || ""}${user.U_LastName?.[0] || ""}`.toUpperCase() || "QS";
  }, [user]);

  const handleLogout = () => {
    document.cookie = "qualisoft_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; Secure; SameSite=Lax";
    logout();
    router.push("/auth/login");
  };

  if (!hasMounted || !isAuthenticated || !user) {
    return (
      <div className="h-screen bg-[#0B0F1A] flex flex-col items-center justify-center gap-6 italic">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
        <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] animate-pulse">SDE Matrix OS : Synchronisation ...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0B0F1A] flex italic font-sans overflow-hidden selection:bg-blue-600/30">
      {/* SIDEBAR SOUVERAINE (320px) */}
      <Sidebar user={user} isSuperAdmin={isSuperAdmin} />

      <div className="flex-1 flex flex-col pl-80 pr-20 min-w-0 relative">
        <TrialBanner user={user} isSuperAdmin={isSuperAdmin} />

        {/* TOPBAR STRATÉGIQUE */}
        <header className="h-20 bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-10 sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative w-full max-w-lg group">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors ${isSuperAdmin ? "group-focus-within:text-amber-500" : "group-focus-within:text-blue-500"}`} size={18} />
              <input type="text" placeholder="RECHERCHE NOYAU..." className={`w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white outline-none transition-all placeholder:text-slate-700 uppercase italic tracking-widest ${isSuperAdmin ? "focus:border-amber-500/50" : "focus:border-blue-500/50"}`} />
            </div>
          </div>

          <div className="flex items-center gap-8">
            {isSuperAdmin && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full shrink-0">
                <Crown size={12} className="text-amber-500" />
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Sovereign Mode</span>
              </div>
            )}

            <button className="relative p-2 text-slate-500 hover:text-white transition-all group cursor-pointer bg-transparent border-none">
              <Bell size={20} className="group-hover:rotate-12 transition-transform" />
              <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-[#0F172A] ${isSuperAdmin ? "bg-amber-500" : "bg-blue-600"}`} />
            </button>

            <div className="flex items-center gap-4 border-l border-white/10 pl-8 shrink-0">
              <div className="text-right hidden xl:block text-white leading-none">
                <p className="text-xs font-black uppercase tracking-tight italic mb-1">{user.U_FirstName} {user.U_LastName}</p>
                <p className={`text-[9px] font-black uppercase tracking-widest ${isSuperAdmin ? "text-amber-500" : "text-blue-500"}`}>{isSuperAdmin ? "Architecte Master" : user.U_Role}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center border border-white/10 text-white font-black shadow-lg ${isSuperAdmin ? "bg-amber-600 shadow-amber-900/20" : "bg-blue-600 shadow-blue-900/20"}`}>
                <span className="text-xs not-italic">{initials}</span>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN COCKPIT */}
        <main className="flex-1 relative overflow-y-auto p-10 custom-scrollbar bg-[#0B0F1A]">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>

          <footer className="py-12 border-t border-white/5 flex justify-between items-center opacity-30 mt-20 shrink-0">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em]">Qualisoft Elite RD 2026</p>
            <div className="flex items-center gap-3">
              <ShieldCheck size={12} className={isSuperAdmin ? "text-amber-500" : "text-blue-500"} />
              <span className="text-[8px] font-black text-slate-400 uppercase italic">{isSuperAdmin ? "Noyau Maître" : "Certifié ISO 9001:2015"}</span>
            </div>
          </footer>
        </main>
      </div>

      {/* NAV SLIM DROITE (Quick Actions) */}
      <nav className="w-20 h-screen bg-[#0F172A] border-l border-white/5 flex flex-col items-center py-8 gap-8 fixed right-0 top-0 z-50 shrink-0">
        <Link href="/dashboard/menu" className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group ${pathname === "/dashboard/menu" ? "bg-blue-600 text-white shadow-xl shadow-blue-900/40" : "bg-white/5 text-slate-600 hover:text-white hover:bg-white/10"}`}>
          <LayoutGrid size={22} className="group-hover:scale-110 transition-transform" />
        </Link>
        <div className="w-8 h-px bg-white/5" />
        <div className="flex flex-col gap-6">
          <SlimNavItem href="/dashboard" icon={Home} label="Cockpit" active={pathname === "/dashboard"} isSuperAdmin={isSuperAdmin} />
          <SlimNavItem href="/dashboard/objectifs" icon={Zap} label="Objectifs" active={pathname === "/dashboard/objectifs"} isSuperAdmin={isSuperAdmin} />
          <SlimNavItem href="/dashboard/settings" icon={Settings} label="Profil" active={pathname === "/dashboard/settings"} isSuperAdmin={isSuperAdmin} />
        </div>
        <div className="flex-1" />
        <div className="flex flex-col gap-6 mb-4">
          <button className="w-12 h-12 rounded-2xl bg-white/5 text-slate-700 flex items-center justify-center hover:text-blue-400 transition-all cursor-pointer border-none"><Info size={20} /></button>
          <button onClick={handleLogout} className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all cursor-pointer border-none"><LogOut size={20} /></button>
        </div>
      </nav>
    </div>
  );
}

function SlimNavItem({ href, icon: Icon, label, active, isSuperAdmin }: any) {
  return (
    <Link href={href} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group relative ${active ? (isSuperAdmin ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-900/20" : "bg-blue-600 text-white shadow-lg shadow-blue-900/20") : "bg-white/5 text-slate-600 hover:text-white hover:bg-white/10"}`}>
      <Icon size={20} />
      <div className="absolute right-24 bg-[#0F172A] border border-white/10 px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-2xl z-50">
        <p className={`text-[9px] font-black uppercase italic tracking-widest m-0 ${active ? (isSuperAdmin ? "text-amber-500" : "text-blue-500") : "text-slate-400"}`}>{label}</p>
      </div>
      {active && <div className={`absolute -left-1 w-1 h-6 rounded-full ${isSuperAdmin ? "bg-amber-500" : "bg-blue-600"}`} />}
    </Link>
  );
}