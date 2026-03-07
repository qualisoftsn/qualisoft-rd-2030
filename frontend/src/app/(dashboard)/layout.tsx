/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 🛰️ MODULE : SOVEREIGN CHASSIS MASTER (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Superstructure 100dvh à triple axe (Sidebar, Viewport, Slim-Rail).
 * DESIGN : ClickUp Elite (Zero Global Scroll, Glassmorphism, PWA Ready).
 * SÉCURITÉ : Kernel Auth (Zustand) + Sentinel RBAC.
 * RÉVISION : 07 Mars 2026 | 15:35 GMT
 * -------------------------------------------------------------------------
 */

import React, { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  ShieldCheck, Activity, Search, LayoutGrid, 
  Home, Zap, Settings, LogOut, Crown, Cpu, Terminal
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
import MatrixLoader from "@/components/shared/MatrixLoader";
import Link from "next/link";

export default function UnifiedDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // 🔐 ACCÈS AU NOYAU D'AUTH (Zustand)
  const { user, isAuthenticated, logout, isInitialized } = useAuthStore() as any;
  
  const [hasMounted, setHasMounted] = useState(false);

  // 1. HYDRATATION DU NOYAU (Prévention des erreurs SSR)
  useEffect(() => { 
    setHasMounted(true); 
  }, []);

  // 2. SENTINELLE DE SÉCURITÉ
  useEffect(() => {
    if (hasMounted && isInitialized && !isAuthenticated) {
      // ✅ Redirection vers la route physique scellée /auth/login
      router.replace("/auth/login?reason=session_required");
    }
  }, [hasMounted, isInitialized, isAuthenticated, router]);

  // 3. MATRICE DE PRIVILÈGES
  const isSuperAdmin = useMemo(() => {
    return user?.U_Role?.toUpperCase() === "SUPER_ADMIN" || user?.U_Email === "ab.thiongane@qualisoft.sn";
  }, [user]);

  // 🔄 ÉCRAN DE BOOTSTRAP (Design SDE)
  if (!hasMounted || !isInitialized || (isAuthenticated && !user)) {
    return <MatrixLoader label="Synchronisation du Noyau Souverain..." />;
  }

  return (
    <div className="h-dvh w-screen bg-[#050810] flex italic font-sans overflow-hidden selection:bg-blue-600/30 relative text-white">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🚩 BANNIÈRES DE CONTEXTE (Priorité Z-Index) */}
      <div className="fixed top-0 left-0 w-full z-100 pointer-events-none">
        <div className="pointer-events-auto">
          <ImpersonationBanner />
          <TrialBanner isSuperAdmin={isSuperAdmin} />
        </div>
      </div>

      {/* 🔱 AXE GAUCHE : SIDEBAR (Structure Fixe) */}
      <aside className="hidden lg:block h-full z-40 shrink-0 border-r border-white/5 bg-[#0B0F1A]">
        <Sidebar isSuperAdmin={isSuperAdmin} />
      </aside>

      {/* 🏗️ AXE CENTRAL : ZONE DE COMMANDE & FLUX CONTENU */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full lg:pr-24">
        
        {/* 🔝 TOP COMMAND BAR (High-Density Glassmorphism) */}
        <header className="h-20 md:h-24 bg-[#0B0F1A]/60 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between px-6 md:px-12 shrink-0 z-50">
          <div className="relative w-full max-w-xl group hidden md:block">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="RECHERCHE DANS LE KERNEL SDE..."
              className="w-full pl-16 pr-8 py-3.5 bg-black/20 border border-white/5 rounded-2xl text-[10px] font-black text-white outline-none focus:border-blue-600/50 transition-all placeholder:text-slate-800 tracking-widest italic"
            />
          </div>

          <div className="flex items-center gap-6 md:gap-8 ml-auto">
            {isSuperAdmin && (
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-amber-500/5 border border-amber-500/20 rounded-xl text-amber-500 text-[8px] font-black tracking-widest uppercase italic">
                <Crown size={12} /> Master Protocol
              </div>
            )}
            <NotificationBell />
            <UserAvatar user={user} isSuperAdmin={isSuperAdmin} />
          </div>
        </header>

        {/* ⚡ ACTION HUB (Contextuel - ClickUp Style) */}
        <div className="z-40 w-full shrink-0">
          <ActionHub />
        </div>

        {/* 📄 VIEWPORT : ZONE DE SCROLL ISOLÉE */}
        <main className="flex-1 relative overflow-hidden bg-[#050810]">
          <div className="h-full w-full overflow-y-auto custom-scrollbar flex flex-col">
            <div className="max-w-400 mx-auto w-full p-6 md:p-10 lg:p-14 animate-in fade-in slide-in-from-bottom-2 duration-700 flex-1 flex flex-col">
              
              {/* TÉLÉMÉTRIE DE SÉCURITÉ */}
              <div className="mb-10 flex items-center justify-between opacity-30 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-3">
                  <Activity size={12} className="text-blue-500" />
                  <p className="text-[8px] font-black uppercase tracking-[0.4em] m-0">
                    NODE: {user?.U_TenantName || "SDE"}.CORE // ID: {user?.U_Id?.slice(0,8)}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[8px] font-black text-slate-600 uppercase tracking-widest">
                  <Terminal size={10} /> {pathname}
                </div>
              </div>

              {/* CONTENU DYNAMIQUE DES MODULES */}
              <div className="flex-1 relative z-10">
                {children}
              </div>

              {/* BUFFER PWA (Prévention de l'occlusion mobile) */}
              <div className="h-32 md:h-12 shrink-0" />
            </div>
          </div>
        </main>
      </div>

      {/* 🚀 AXE DROIT : SLIM RAIL (Navigation Tactique) */}
      <nav className="hidden lg:flex w-24 h-screen bg-[#0B0F1A] border-l border-white/5 flex-col items-center py-12 gap-10 fixed right-0 top-0 z-60 shadow-4xl">
        <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-4">
           <Cpu className="text-blue-500" size={24} />
        </div>

        <SlimLink href="/dashboard/menu" icon={LayoutGrid} active={pathname === "/dashboard/menu"} label="Menu" />
        <div className="w-8 h-px bg-white/5" />
        
        <div className="flex flex-col gap-6">
          <SlimLink href="/dashboard" icon={Home} active={pathname === "/dashboard"} label="Cockpit" />
          <SlimLink href="/dashboard/objectifs" icon={Zap} active={pathname === "/dashboard/objectifs"} label="Objectifs" />
          <SlimLink href="/dashboard/settings" icon={Settings} active={pathname === "/dashboard/settings"} label="Profil" />
        </div>

        <div className="flex-1" />
        
        <button
          onClick={() => { logout(); router.push("/auth/login"); }}
          className="w-14 h-14 rounded-3xl bg-rose-600/5 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all cursor-pointer border-none group"
          title="DÉCONNEXION SÉCURISÉE"
        >
          <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
        </button>
      </nav>

      {/* 🧪 GLOBAL SDE OVERRIDES */}
      <style jsx global>{`
        body { 
          overflow: hidden !important; 
          height: 100dvh; 
          width: 100vw; 
          background: #050810;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// --- SOUS-COMPOSANTS ATOMIQUES SCELLÉS ---

function SlimLink({ href, icon: Icon, active, label }: any) {
  return (
    <Link
      href={href}
      className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all group relative",
        active ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-110" : "bg-white/5 text-slate-700 hover:text-white hover:bg-white/10"
      )}
    >
      <Icon size={22} strokeWidth={active ? 2.5 : 2} />
      <div className="absolute right-20 bg-black border border-white/10 px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap text-[8px] font-black uppercase tracking-widest text-blue-500 shadow-4xl translate-x-4 group-hover:translate-x-0">
        {label}
      </div>
    </Link>
  );
}

function UserAvatar({ user, isSuperAdmin }: any) {
  return (
    <div className="flex items-center gap-5 border-l border-white/5 pl-8">
      <div className="text-right leading-none hidden xl:block space-y-2">
        <p className="text-[12px] font-black text-white m-0 tracking-tighter uppercase italic">{user?.U_FirstName} {user?.U_LastName}</p>
        <p className={cn("text-[7px] m-0 font-black uppercase tracking-[0.3em]", isSuperAdmin ? "text-amber-500" : "text-blue-500")}>
          {isSuperAdmin ? "Matrix Architect" : user?.U_Role}
        </p>
      </div>
      <div className={cn(
        "w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center border border-white/10 text-white shadow-2xl transform hover:scale-105 hover:rotate-3 transition-all cursor-pointer",
        isSuperAdmin ? "bg-amber-600" : "bg-blue-600"
      )}>
        <span className="text-base font-black not-italic">{user?.U_FirstName?.[0]}{user?.U_LastName?.[0]}</span>
      </div>
    </div>
  );
}