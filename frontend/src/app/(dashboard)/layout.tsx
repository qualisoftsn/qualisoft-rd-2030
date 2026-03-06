/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 🛰️ MODULE : SOVEREIGN CHASSIS MASTER (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Superstructure 100dvh à triple axe (Sidebar, Viewport, Slim-Rail).
 * DESIGN : ClickUp Elite (Zero Global Scroll, Glassmorphism, PWA Ready).
 * SÉCURITÉ : Kernel Auth (Zustand) + Sentinel RBAC.
 * RÉVISION : 06 Mars 2026 | 21:55 GMT
 * -------------------------------------------------------------------------
 */

import React, { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Loader2, ShieldCheck, Activity, Search, LayoutGrid, 
  Home, Zap, Settings, LogOut, Fingerprint, Crown 
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Toaster } from "sonner";
import { cn } from "@/core/utils/cn";

// COMPOSANTS SCELLÉS
import Sidebar from "@/components/layout/sidebar";
import ActionHub from "@/components/layout/ActionHub";
import NotificationBell from "@/components/dashboard/notification-bell";
import TrialBanner from "@/components/TrialBanner";
import ImpersonationBanner from "@/components/layout/ImpersonationBanner";
import Link from "next/link";

export default function UnifiedDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, isInitialized } = useAuthStore() as any;
  const [hasMounted, setHasMounted] = useState(false);

  // 1. Hydratation Matrix
  useEffect(() => { setHasMounted(true); }, []);

  // 2. Sentinelle de Sécurité (Redirection si session rompue)
  useEffect(() => {
    if (hasMounted && isInitialized && !isAuthenticated) {
      router.replace("/auth/login?reason=session_required");
    }
  }, [hasMounted, isInitialized, isAuthenticated, router]);

  // 3. Matrice de Rôles
  const isSuperAdmin = useMemo(() => {
    return user?.U_Role?.toUpperCase() === "SUPER_ADMIN" || user?.U_Email === "ab.thiongane@qualisoft.sn";
  }, [user]);

  // ÉCRAN DE BOOTSTRAP (DESIGN ELITE)
  if (!hasMounted || !isInitialized || (isAuthenticated && !user)) {
    return <GlobalLoader />;
  }

  return (
    <div className="h-dvh w-screen bg-[#0B0F1A] flex italic font-sans overflow-hidden selection:bg-blue-600/30 relative text-white">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🚩 BANNIÈRES DE CONTEXTE (STICKY TOP) */}
      <div className="fixed top-0 left-0 w-full z-100 pointer-events-none">
        <div className="pointer-events-auto">
          <ImpersonationBanner />
          <TrialBanner isSuperAdmin={isSuperAdmin} />
        </div>
      </div>

      {/* 🔱 AXE GAUCHE : SIDEBAR (Fixe) */}
      <aside className="hidden lg:block h-full z-40 shrink-0 border-r border-white/5">
        <Sidebar isSuperAdmin={isSuperAdmin} />
      </aside>

      {/* 🏗️ AXE CENTRAL : ZONE DE COMMANDE & CONTENU */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full lg:pr-24">
        
        {/* 🔝 TOP COMMAND BAR (High-Density) */}
        <header className="h-24 md:h-28 bg-[#0F172A]/40 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between px-6 md:px-12 shrink-0 z-50">
          <div className="relative w-full max-w-xl group hidden md:block">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="RECHERCHE DANS LE NOYAU SDE..."
              className="w-full pl-16 pr-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white outline-none focus:border-blue-600 transition-all placeholder:text-slate-800 tracking-widest italic"
            />
          </div>

          <div className="flex items-center gap-6 md:gap-10 ml-auto">
            {isSuperAdmin && (
              <div className="hidden sm:flex items-center gap-3 px-5 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-[9px] font-black tracking-widest uppercase shadow-2xl">
                <Crown size={14} /> Sovereign Mode
              </div>
            )}
            <NotificationBell />
            <UserAvatar user={user} isSuperAdmin={isSuperAdmin} />
          </div>
        </header>

        {/* ⚡ ACTION HUB (Contextuel) */}
        <div className="z-40 w-full shrink-0">
          <ActionHub />
        </div>

        {/* 📄 VIEWPORT : SCROLL INTERNE UNIQUEMENT */}
        <main className="flex-1 relative overflow-y-auto custom-scrollbar bg-[#0B0F1A]">
          <div className="max-w-400 mx-auto p-6 md:p-10 lg:p-14 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-full flex flex-col">
            
            {/* TÉLÉMÉTRIE DE SESSION */}
            <div className="mb-8 flex items-center gap-3 opacity-20 hover:opacity-100 transition-opacity">
              <Activity size={12} className="text-blue-500" />
              <p className="text-[8px] font-black uppercase tracking-[0.4em] m-0">
                {user.U_TenantDomain || "SDE"}.CORE • SECURE_NODE_{user.U_Id?.slice(0,5)}
              </p>
            </div>

            <div className="flex-1 relative z-10 flex flex-col">
              {children}
            </div>

            {/* ESPACEMENT PWA MOBILE */}
            <div className="h-24 md:h-10 shrink-0" />
          </div>
        </main>
      </div>

      {/* 🚀 AXE DROIT : SLIM RAIL (ClickUp Style) */}
      <nav className="hidden lg:flex w-24 h-screen bg-[#0F172A] border-l border-white/5 flex-col items-center py-10 gap-10 fixed right-0 top-0 z-60 shadow-4xl">
        <SlimLink href="/dashboard/menu" icon={LayoutGrid} active={pathname === "/dashboard/menu"} label="Menu" />
        <div className="w-8 h-px bg-white/10" />
        <div className="flex flex-col gap-8">
          <SlimLink href="/dashboard" icon={Home} active={pathname === "/dashboard"} label="Cockpit" />
          <SlimLink href="/dashboard/objectifs" icon={Zap} active={pathname === "/dashboard/objectifs"} label="Cibles" />
          <SlimLink href="/dashboard/settings" icon={Settings} active={pathname === "/dashboard/settings"} label="Profil" />
        </div>
        <div className="flex-1" />
        <button
          onClick={() => { logout(); router.push("/auth/login"); }}
          className="w-14 h-14 rounded-2xl bg-rose-600/10 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all cursor-pointer border-none shadow-xl group"
          title="DÉCONNEXION"
        >
          <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
        </button>
      </nav>

      {/* 🧪 CSS OVERRIDES */}
      <style jsx global>{`
        body { overflow: hidden !important; height: 100dvh; }
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// --- SOUS-COMPOSANTS ATOMIQUES ---

function SlimLink({ href, icon: Icon, active, label }: any) {
  return (
    <Link
      href={href}
      className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all group relative",
        active ? "bg-blue-600 text-white shadow-2xl scale-110" : "bg-white/5 text-slate-600 hover:text-white hover:bg-white/10"
      )}
    >
      <Icon size={24} />
      <div className="absolute right-20 bg-[#0B0F1A] border border-white/10 px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap text-[8px] font-black uppercase tracking-widest text-blue-500 shadow-4xl">
        {label}
      </div>
    </Link>
  );
}

function UserAvatar({ user, isSuperAdmin }: any) {
  return (
    <div className="flex items-center gap-5 border-l border-white/10 pl-8">
      <div className="text-right leading-none hidden xl:block">
        <p className="text-sm font-black text-white m-0 tracking-tighter">{user?.U_FirstName} {user?.U_LastName}</p>
        <p className={cn("text-[8px] mt-1.5 m-0 font-black uppercase tracking-widest", isSuperAdmin ? "text-amber-500" : "text-blue-500")}>
          {isSuperAdmin ? "Master Architect" : user?.U_Role}
        </p>
      </div>
      <div className={cn(
        "w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center border-2 border-white/10 text-white shadow-2xl transform hover:rotate-6 transition-transform cursor-pointer",
        isSuperAdmin ? "bg-amber-600" : "bg-blue-600"
      )}>
        <span className="text-lg font-black not-italic">{user?.U_FirstName?.[0]}{user?.U_LastName?.[0]}</span>
      </div>
    </div>
  );
}

function GlobalLoader() {
  return (
    <div className="h-screen w-screen bg-[#0B0F1A] flex flex-col items-center justify-center gap-10">
      <div className="relative">
        <Loader2 className="w-24 h-24 animate-spin text-blue-600" strokeWidth={1} />
        <Fingerprint className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500/20" size={44} />
      </div>
      <div className="text-center space-y-3">
        <p className="text-[11px] font-black uppercase text-blue-500 tracking-[0.8em] animate-pulse m-0">Matrix OS Initializing</p>
        <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.3em] m-0">Synchronisation du Noyau Souverain</p>
      </div>
    </div>
  );
}