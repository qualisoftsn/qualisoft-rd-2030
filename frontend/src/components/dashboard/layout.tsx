//* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * 🛰️ MODULE : DASHBOARD LAYOUT (MASTER WRAPPER)
 * -------------------------------------------------------------------------
 * RÔLE : Conteneur souverain pour l'espace connecté (Dashboard).
 * SÉCURITÉ : Vérification d'hydratation et protection des routes intégrées.
 * -------------------------------------------------------------------------
 * DATE : 01 Mars 2026 | 22:34 GMT
 */

import Sidebar from "@/app/dashboard/sidebar";
import TrialBanner from "@/components/TrialBanner";
import { useAuthStore } from "@/store/authStore";
import {
  Bell,
  Crown,
  Home,
  LayoutGrid,
  Loader2,
  LogOut,
  Search,
  Settings,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // 🔐 État global d'authentification (Zustand)
  const { user, logout, isAuthenticated } = useAuthStore() as any;

  // 🛡️ Flag d'hydratation stricte (évite le mismatch Serveur/Client)
  const [mounted, setMounted] = useState(false);

  // Hook d'hydratation : On l'isole complètement pour éviter les alertes du Linter
  useEffect(() => {
    setMounted(true);
  }, []);

  // 🚪 Barrière de Sécurité : Éjection si non authentifié
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [mounted, isAuthenticated, router]);

  // 👑 Détection du mode Architecte (Super Admin)
  const isSuperAdmin = useMemo(() => {
    if (!user) return false;
    return (
      user.U_Email?.toLowerCase() === "ab.thiongane@qualisoft.sn" ||
      user.U_Role?.toUpperCase() === "SUPER_ADMIN"
    );
  }, [user]);

  // 👤 Génération sécurisée des initiales
  const initials = useMemo(() => {
    if (!user) return "QS";
    if (user.U_FirstName && user.U_LastName) {
      return `${user.U_FirstName[0]}${user.U_LastName[0]}`.toUpperCase();
    }
    return user.U_Email?.[0]?.toUpperCase() || "QS";
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  // ⏳ Écran de verrouillage pendant l'hydratation Zustand
  if (!mounted || !user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] animate-pulse italic">
          Synchronisation Matrix...
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0B0F1A] flex italic selection:bg-blue-600/30 font-sans overflow-hidden">
      
      {/* 🧭 SIDEBAR PRINCIPALE (GAUCHE) */}
      <Sidebar user={user as any} isSuperAdmin={isSuperAdmin} />

      <div className="flex-1 flex flex-col pl-80 pr-20 min-w-0 relative">
        
        {/* ⏳ BANNIÈRE DE LICENCE (TRIAL) */}
        <TrialBanner user={user} isSuperAdmin={isSuperAdmin} />

        {/* 🔝 TOPBAR SOUVERAINE */}
        <header className="h-24 bg-[#0B0F1A]/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative w-full max-w-lg group">
              <Search
                className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isSuperAdmin ? "text-amber-500/50 group-focus-within:text-amber-500" : "text-blue-500/50 group-focus-within:text-blue-500"}`}
                size={18}
              />
              <input
                type="text"
                placeholder="RECHERCHE DANS LE NOYAU..."
                className={`w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-3xl text-xs font-black text-white outline-none transition-all placeholder:text-slate-600 uppercase italic tracking-widest ${isSuperAdmin ? "focus:border-amber-500/50 focus:bg-amber-500/5" : "focus:border-blue-500/50 focus:bg-blue-500/5"}`}
              />
            </div>
          </div>

          <div className="flex items-center gap-8">
            {/* BADGE SUPER ADMIN */}
            {isSuperAdmin && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full shadow-lg shadow-amber-900/20">
                <Crown size={14} className="text-amber-500" />
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest leading-none">
                  Sovereign Mode
                </span>
              </div>
            )}

            {/* NOTIFICATIONS */}
            <button className="relative p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all group border border-white/5 cursor-pointer">
              <Bell
                size={20}
                className="group-hover:rotate-12 transition-transform"
              />
              <span
                className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2 border-[#0B0F1A] ${isSuperAdmin ? "bg-amber-500" : "bg-blue-600"}`}
              />
            </button>

            {/* PROFIL UTILISATEUR */}
            <div className="flex items-center gap-4 border-l border-white/10 pl-8">
              <div className="text-right hidden xl:block text-white">
                <p className="text-sm font-black uppercase tracking-tighter italic leading-none mb-1.5">
                  {user.U_FirstName} {user.U_LastName}
                </p>
                <p
                  className={`text-[9px] font-black uppercase tracking-[0.2em] ${isSuperAdmin ? "text-amber-500" : "text-blue-500"}`}
                >
                  {user.U_Role}
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center border border-white/10 text-white font-black shadow-xl ${isSuperAdmin ? "bg-amber-600 shadow-amber-900/40" : "bg-blue-600 shadow-blue-900/40"}`}
              >
                <span className="text-sm tracking-tighter not-italic">
                  {initials}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* 🧩 CONTENU DYNAMIQUE (PAGES) */}
        <main className="flex-1 relative overflow-y-auto p-10 custom-scrollbar bg-[#0B0F1A]">
          <div className="max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-700">
            {children}
          </div>
        </main>
      </div>

      {/* 🧭 SIDEBAR SECONDAIRE (DROITE - NAVIGATION RAPIDE) */}
      <nav className="w-24 h-screen bg-[#0F172A]/90 backdrop-blur-xl border-l border-white/5 flex flex-col items-center py-8 gap-8 fixed right-0 top-0 z-50">
        <Link
          href="/dashboard/menu"
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group border cursor-pointer ${pathname === "/dashboard/menu" ? "bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-900/40" : "bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10 hover:border-white/10"}`}
        >
          <LayoutGrid
            size={24}
            className="group-hover:scale-110 transition-transform"
          />
        </Link>

        <div className="w-10 h-px bg-white/10" />

        <div className="flex flex-col gap-6">
          <SlimNavItem
            href="/dashboard"
            icon={Home}
            active={pathname === "/dashboard"}
            isSuperAdmin={isSuperAdmin}
          />
          <SlimNavItem
            href="/dashboard/objectifs"
            icon={Zap}
            active={pathname === "/dashboard/objectifs"}
            isSuperAdmin={isSuperAdmin}
          />
          <SlimNavItem
            href="/dashboard/settings"
            icon={Settings}
            active={pathname === "/dashboard/settings"}
            isSuperAdmin={isSuperAdmin}
          />
        </div>

        <div className="flex-1" />

        <div className="flex flex-col gap-6 mb-4">
          <button
            onClick={handleLogout}
            className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all group cursor-pointer shadow-lg shadow-red-900/20"
          >
            <LogOut
              size={22}
              className="group-hover:-translate-x-1 transition-transform"
            />
          </button>
        </div>
      </nav>
    </div>
  );
}

// ============================================================================
// COMPOSANT ATOMIQUE : SLIM NAV ITEM
// ============================================================================
function SlimNavItem({ href, icon: Icon, active, isSuperAdmin }: any) {
  return (
    <Link
      href={href}
      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group relative border cursor-pointer ${active ? (isSuperAdmin ? "bg-amber-500 border-amber-400 text-slate-950 shadow-lg shadow-amber-900/40" : "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40") : "bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10 hover:border-white/10"}`}
    >
      <Icon
        size={22}
        className={active ? "" : "group-hover:scale-110 transition-transform"}
      />
      {active && (
        <div
          className={`absolute -left-1 w-1.5 h-8 rounded-full shadow-[0_0_10px_currentColor] ${isSuperAdmin ? "bg-amber-900" : "bg-white"}`}
        />
      )}
    </Link>
  );
}