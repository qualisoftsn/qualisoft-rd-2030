/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : Layout Maître Matrix (ELITE SDE)
 * ---------------------------------------------------------------------------
 * RÔLE : Isolation 100dvh, Sidebar ClickUp, Zéro NextAuth.
 * ---------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 23:58 GMT
 */

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Role } from "@/types/elite-sde";
import { Crown, Loader2, Search, ShieldCheck, Fingerprint, LayoutGrid, LogOut, Home, Zap, Settings } from "lucide-react";
import Link from "next/link";
import Sidebar from "./sidebar";
import TrialBanner from "@/components/TrialBanner";
import ImpersonationBanner from "@/components/layout/ImpersonationBanner";
import NotificationBell from "@/components/dashboard/notification-bell";
import { cn } from "@/core/utils/cn";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const { user, logout, isAuthenticated, isInitialized } = useAuthStore() as any;

  useEffect(() => { setHasMounted(true); }, []);

  useEffect(() => {
    if (hasMounted && isInitialized && !isAuthenticated) router.replace("/auth/login");
  }, [hasMounted, isInitialized, isAuthenticated, router]);

  const isSuperAdmin = useMemo(() => user?.U_Role === Role.SUPER_ADMIN || user?.U_Email === "ab.thiongane@qualisoft.sn", [user]);

  if (!hasMounted || !isInitialized || (isAuthenticated && !user)) return <GlobalLoader />;

  return (
    <div className="h-screen w-screen bg-[#0B0F1A] flex overflow-hidden italic font-black uppercase selection:bg-blue-600/30">
      
      <ImpersonationBanner />
      <Sidebar isSuperAdmin={isSuperAdmin} />

      {/* 🧩 CONTENU CENTRAL (Locked 100dvh) */}
      <div className="flex-1 flex flex-col pl-80 pr-20 transition-all duration-700">
        <TrialBanner isSuperAdmin={isSuperAdmin} />

        {/* 🔝 TOP COMMAND BAR */}
        <header className="shrink-0 h-28 bg-[#0F172A]/40 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between px-16 sticky top-0 z-50">
          <div className="relative w-full max-w-2xl group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input type="text" placeholder="RECHERCHE DANS LE NOYAU SDE..." className="w-full pl-16 pr-8 py-5 bg-white/5 border border-white/10 rounded-3xl text-[10px] font-black text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-800 tracking-widest italic shadow-inner" />
          </div>

          <div className="flex items-center gap-10">
            {isSuperAdmin && (
              <div className="flex items-center gap-4 px-6 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-[10px] tracking-widest shadow-xl">
                <Crown size={14} /> SOVEREIGN MODE
              </div>
            )}
            <NotificationBell />
            <div className="flex items-center gap-8 border-l border-white/10 pl-10">
              <div className="text-right leading-none hidden xl:block">
                <p className="text-sm font-black text-white m-0 tracking-tighter">{user?.U_FirstName} {user?.U_LastName}</p>
                <p className={cn("text-[9px] mt-2 m-0 tracking-[0.3em]", isSuperAdmin ? "text-amber-500" : "text-blue-500")}>
                  {isSuperAdmin ? "MASTER ARCHITECT" : user?.U_Role}
                </p>
              </div>
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-white/10 text-white shadow-2xl", isSuperAdmin ? "bg-amber-600" : "bg-blue-600")}>
                <span className="text-lg not-italic">{user?.U_FirstName?.[0]}{user?.U_LastName?.[0]}</span>
              </div>
            </div>
          </div>
        </header>

        {/* 🌌 SCROLLABLE VIEWPORT (§ISO) */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-16 relative">
          <div className="max-w-400 mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-32">
            {children}
          </div>
          
          <footer className="shrink-0 py-20 border-t border-white/5 flex justify-between items-center opacity-20">
            <p className="text-[10px] text-slate-500 tracking-[0.5em] m-0">QUALISOFT ELITE MATRIX RD-2026</p>
            <div className="flex items-center gap-4 text-slate-400 text-[9px] tracking-widest">
              <ShieldCheck size={14} className="text-blue-500" /> CERTIFIÉ ISO 9001:2015
            </div>
          </footer>
        </main>
      </div>

      {/* 🚀 SLIM NAVIGATION DROITE (ClickUp Style) */}
      <nav className="w-24 h-screen bg-[#0F172A] border-l border-white/5 flex flex-col items-center py-12 gap-12 fixed right-0 top-0 z-50 shadow-4xl">
        <SlimLink href="/dashboard/menu" icon={LayoutGrid} active={pathname === "/dashboard/menu"} />
        <div className="w-10 h-px bg-white/10" />
        <div className="flex flex-col gap-10">
          <SlimLink href="/dashboard" icon={Home} active={pathname === "/dashboard"} />
          <SlimLink href="/dashboard/objectifs" icon={Zap} active={pathname === "/dashboard/objectifs"} />
          <SlimLink href="/dashboard/settings" icon={Settings} active={pathname === "/dashboard/settings"} />
        </div>
        <div className="flex-1" />
        <button onClick={() => { logout(); router.push("/auth/login"); }} className="w-14 h-14 rounded-2xl bg-rose-600/10 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all cursor-pointer border-none shadow-xl shadow-rose-900/10">
          <LogOut size={24} />
        </button>
      </nav>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

function SlimLink({ href, icon: Icon, active }: any) {
  return (
    <Link href={href} className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all group", active ? "bg-blue-600 text-white shadow-2xl shadow-blue-900/50 scale-110" : "bg-white/5 text-slate-600 hover:text-white hover:bg-white/10")}>
      <Icon size={26} className="group-hover:scale-110 transition-transform" />
    </Link>
  );
}

function GlobalLoader() {
  return (
    <div className="h-screen w-screen bg-[#0B0F1A] flex flex-col items-center justify-center gap-10 italic font-black uppercase text-blue-500 overflow-hidden">
      <div className="relative">
        <Loader2 className="w-24 h-24 animate-spin" strokeWidth={1} />
        <Fingerprint className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500/20" size={40} />
      </div>
      <span className="text-[11px] tracking-[0.6em] animate-pulse">SDE Matrix OS : Synchronisation...</span>
    </div>
  );
}