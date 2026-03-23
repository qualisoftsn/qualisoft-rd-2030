/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 🛰️ MODULE : SOVEREIGN CHASSIS MASTER (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Superstructure 100dvh à triple axe (Sidebar, Viewport, Slim-Rail)
 * VERSION : 2.0 - Corrections Tailwind + Accessibilité + Design System Elite
 * DESIGN : ClickUp Elite (Zero Global Scroll, Edge-to-Edge, PWA Ready, WCAG AA)
 * SÉCURITÉ : Kernel Auth (Zustand) + Sentinel RBAC + CSP Ready
 * RÉVISION : 19 Mars 2026 | 11:30 GMT
 * -------------------------------------------------------------------------
 */

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  ShieldCheck, Activity, Search, LayoutGrid, 
  Home, Zap, Settings, LogOut, Crown, Cpu, Terminal,
  Bell, User
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Toaster } from "sonner";
import { cn } from "@/core/utils/cn";
import Link from "next/link";

// COMPOSANTS SCELLÉS
import Sidebar from "@/components/layout/Sidebar";
import ActionHub from "@/components/layout/ActionHub";
import NotificationBell from "@/components/dashboard/NotificationBell";
import TrialBanner from "@/components/TrialBanner";
import ImpersonationBanner from "@/components/layout/ImpersonationBanner";
import MatrixLoader from "@/components/shared/MatrixLoader";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface UserData {
  U_Id: string;
  U_Email: string;
  U_Role: string;
  U_FirstName: string;
  U_LastName: string;
  U_TenantName?: string;
  U_Avatar?: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface SlimLinkProps {
  href: string;
  icon: React.ElementType;
  active: boolean;
  label: string;
}

interface UserAvatarProps {
  user: UserData | null;
  isSuperAdmin: boolean;
  onLogout: () => void;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const MAX_CONTENT_WIDTH = 'max-w-[1800px]'; // Remplacement de max-w-450 invalide
const Z_INDEX_BANNERS = 50; // Remplacement de z-100 non standard

// ============================================================================
// SOUS-COMPOSANT : SLIM LINK (Navigation tactique)
// ============================================================================

function SlimLink({ href, icon: Icon, active, label }: SlimLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all group relative border focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0B0F1A]",
        active 
          ? "bg-blue-600/10 border-blue-500/30 text-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)] scale-110" 
          : "bg-transparent border-transparent text-slate-600 hover:text-white hover:bg-white/5 hover:border-white/10"
      )}
      aria-current={active ? 'page' : undefined}
      aria-label={label}
      title={label}
    >
      <Icon size={22} strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
      
      {/* Tooltip au survol */}
      <span 
        className="absolute right-20 bg-black border border-white/10 px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap text-[9px] font-black uppercase tracking-widest text-blue-400 shadow-2xl translate-x-4 group-hover:translate-x-0 z-50"
        role="tooltip"
      >
        {label}
      </span>
    </Link>
  );
}

// ============================================================================
// SOUS-COMPOSANT : USER AVATAR
// ============================================================================

function UserAvatar({ user, isSuperAdmin, onLogout }: UserAvatarProps) {
  const getInitials = useCallback((firstName?: string, lastName?: string): string => {
    const first = firstName?.charAt(0)?.toUpperCase() || "";
    const last = lastName?.charAt(0)?.toUpperCase() || "U";
    return first + last;
  }, []);

  const getRoleLabel = useCallback((): string => {
    if (isSuperAdmin) return "Matrix Architect";
    if (user?.U_Role === "ADMIN") return "Administrateur";
    if (user?.U_Role === "MANAGER") return "Responsable";
    return "Opérateur";
  }, [isSuperAdmin, user?.U_Role]);

  const getRoleColor = useCallback((): string => {
    if (isSuperAdmin) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    if (user?.U_Role === "ADMIN") return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    return "text-blue-500 bg-blue-500/10 border-blue-500/20";
  }, [isSuperAdmin, user?.U_Role]);

  if (!user) {
    return (
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-slate-700 animate-pulse" aria-hidden="true" />
    );
  }

  return (
    <div className="flex items-center gap-4 md:gap-5 border-l border-white/5 pl-6 md:pl-8">
      {/* Infos utilisateur (masqué sur mobile) */}
      <div className="text-right leading-none hidden xl:block space-y-2 min-w-0">
        <p className="text-[11px] md:text-[12px] font-black text-white m-0 tracking-tighter uppercase italic truncate max-w-[150px]">
          {user.U_FirstName} {user.U_LastName}
        </p>
        <span className={cn(
          "inline-block text-[7px] md:text-[8px] m-0 font-black uppercase tracking-[0.3em] truncate px-2 py-0.5 rounded border",
          getRoleColor()
        )}>
          {getRoleLabel()}
        </span>
      </div>
      
      {/* Avatar cliquable avec menu */}
      <div className="relative group">
        <button
          className={cn(
            "w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center border border-white/10 text-white shadow-2xl transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-400",
            isSuperAdmin ? "bg-gradient-to-br from-amber-500 to-amber-700" : "bg-gradient-to-br from-blue-500 to-blue-700"
          )}
          aria-label="Menu profil utilisateur"
          aria-haspopup="menu"
        >
          <span className="text-xs font-black not-italic tracking-tighter">
            {getInitials(user.U_FirstName, user.U_LastName)}
          </span>
        </button>
        
        {/* Menu déroulant (simplifié - à enrichir avec un vrai dropdown) */}
        <div className="absolute right-0 top-full mt-2 w-48 bg-[#0B0F1A] border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          <div className="p-3 border-b border-white/5">
            <p className="text-[10px] font-black text-white uppercase">{user.U_FirstName} {user.U_LastName}</p>
            <p className="text-[8px] text-slate-400">{user.U_Email}</p>
          </div>
          <nav className="p-2" role="menu">
            <Link 
              href="/dashboard/profile" 
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-white/5 transition-all no-underline"
              role="menuitem"
            >
              <User size={14} aria-hidden="true" /> Mon Profil
            </Link>
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all border-none bg-transparent cursor-pointer text-left"
              role="menuitem"
            >
              <LogOut size={14} aria-hidden="true" /> Déconnexion
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL : DASHBOARD LAYOUT
// ============================================================================

export default function UnifiedDashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // 🔐 ACCÈS AU NOYAU D'AUTH (Zustand typé)
  const { user, isAuthenticated, logout, isInitialized, isLoading } = useAuthStore();
  
  const [hasMounted, setHasMounted] = useState(false);
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);

  // 1. HYDRATATION DU NOYAU (Prévention des erreurs SSR)
  useEffect(() => { 
    setHasMounted(true); 
  }, []);

  // 2. SENTINELLE DE SÉCURITÉ : Redirection si non authentifié
  useEffect(() => {
    if (hasMounted && isInitialized && !isAuthenticated && !isLoading) {
      const redirectParam = pathname && pathname !== '/dashboard' ? `?redirect=${encodeURIComponent(pathname)}` : '';
      router.replace(`/auth/login${redirectParam}`);
    }
  }, [hasMounted, isInitialized, isAuthenticated, isLoading, router, pathname]);

  // 3. MATRICE DE PRIVILÈGES : Détection Super Admin
  const isSuperAdmin = useMemo(() => {
    if (!user) return false;
    return (
      user.U_Role?.toUpperCase() === "SUPER_ADMIN" || 
      user.U_Email?.toLowerCase() === "ab.thiongane@qualisoft.sn"
    );
  }, [user]);

  // Gestion de la déconnexion
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      router.push("/auth/login?reason=logout");
    } catch (error) {
      console.error("❌ Erreur déconnexion:", error);
      // Fallback : redirection forcée
      window.location.href = "/auth/login";
    }
  }, [logout, router]);

  // 🔄 ÉCRAN DE BOOTSTRAP (Design SDE)
  if (!hasMounted || !isInitialized || isLoading || (isAuthenticated && !user)) {
    return <MatrixLoader label="Synchronisation du Noyau Souverain..." />;
  }

  // Utilisateur non authentifié après chargement
  if (!isAuthenticated) {
    return null; // La redirection useEffect s'en charge
  }

  const safeUser = user as UserData;

  return (
    <div className="h-dvh w-screen bg-[#050810] flex italic font-sans overflow-hidden selection:bg-blue-600/30 relative text-white">
      <Toaster position="top-right" richColors theme="dark" closeButton />
      
      {/* 🚩 BANNIÈRES DE CONTEXTE (Priorité Z-Index) */}
      <div className={cn("fixed top-0 left-0 w-full z-[50] pointer-events-none")}>
        <div className="pointer-events-auto">
          <ImpersonationBanner />
          <TrialBanner isSuperAdmin={isSuperAdmin} />
        </div>
      </div>

      {/* 🔱 AXE GAUCHE : SIDEBAR (Structure Fixe - Desktop) */}
      <aside 
        className={cn(
          "hidden lg:block h-full z-40 shrink-0 border-r border-white/5 bg-[#0B0F1A] transition-transform duration-300",
          isSidebarMobileOpen ? "translate-x-0 fixed inset-y-0 left-0 w-[300px]" : "-translate-x-full lg:translate-x-0"
        )}
        aria-label="Menu de navigation principal"
      >
        <Sidebar isSuperAdmin={isSuperAdmin} />
      </aside>

      {/* Overlay mobile pour la sidebar */}
      {isSidebarMobileOpen && (
        <button
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setIsSidebarMobileOpen(false)}
          aria-label="Fermer le menu"
        />
      )}

      {/* 🏗️ AXE CENTRAL : ZONE DE COMMANDE & FLUX CONTENU */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full lg:pr-24">
        
        {/* 🔝 TOP COMMAND BAR (High-Density Glassmorphism) */}
        <header 
          className="h-16 md:h-20 bg-[#0B0F1A]/80 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between px-4 md:px-8 shrink-0 z-40"
          role="banner"
        >
          {/* Bouton menu mobile */}
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={() => setIsSidebarMobileOpen(true)}
            aria-label="Ouvrir le menu de navigation"
            aria-expanded={isSidebarMobileOpen}
          >
            <LayoutGrid size={20} className="text-slate-400" />
          </button>

          {/* Barre de recherche (Desktop) */}
          <div className="relative w-full max-w-md mx-4 md:mx-0 group hidden md:block">
            <label htmlFor="global-search" className="sr-only">Recherche globale</label>
            <Search 
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors pointer-events-none" 
              size={18} 
              aria-hidden="true"
            />
            <input
              id="global-search"
              type="search"
              placeholder="RECHERCHE KERNEL..."
              className="w-full pl-14 pr-8 py-3 bg-black/40 border border-white/5 rounded-2xl text-[9px] md:text-[10px] font-black text-white outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/30 transition-all placeholder:text-slate-700 tracking-widest italic shadow-inner"
            />
          </div>

          {/* Actions droite */}
          <div className="flex items-center gap-4 md:gap-6 ml-auto">
            {/* Badge Super Admin */}
            {isSuperAdmin && (
              <span 
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-500/5 border border-amber-500/20 rounded-xl text-amber-400 text-[7px] md:text-[8px] font-black tracking-widest uppercase italic shadow-lg"
                role="status"
                aria-label="Mode administrateur principal activé"
              >
                <Crown size={10} aria-hidden="true" /> Master
              </span>
            )}
            
            {/* Notifications */}
            <NotificationBell />
            
            {/* Avatar utilisateur */}
            <UserAvatar user={safeUser} isSuperAdmin={isSuperAdmin} onLogout={handleLogout} />
          </div>
        </header>

        {/* ⚡ ACTION HUB (Contextuel - ClickUp Style) */}
        <div className="z-30 w-full shrink-0 border-b border-white/5 bg-[#0B0F1A]/40">
          <ActionHub />
        </div>

        {/* 📄 VIEWPORT : ZONE DE SCROLL ISOLÉE */}
        <main className="flex-1 relative overflow-hidden bg-[#050810]" role="main" id="main-content">
          <div className="h-full w-full overflow-y-auto custom-scrollbar flex flex-col">
            <div className={cn(
              "w-full mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 flex flex-col",
              MAX_CONTENT_WIDTH
            )}>
              
              {/* TÉLÉMÉTRIE DE SÉCURITÉ (Debug info) */}
              <div className="mb-6 flex items-center justify-between opacity-20 hover:opacity-60 transition-opacity">
                <div className="flex items-center gap-2 md:gap-3">
                  <Activity size={10} className="text-blue-500" aria-hidden="true" />
                  <p className="text-[6px] md:text-[7px] font-black uppercase tracking-[0.4em] m-0 truncate">
                    NODE: {safeUser?.U_TenantName || "SDE"}.CORE
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[6px] md:text-[7px] font-black text-slate-600 uppercase tracking-widest">
                  <Terminal size={9} aria-hidden="true" /> 
                  <span className="truncate max-w-[150px]">{pathname}</span>
                </div>
              </div>

              {/* CONTENU DYNAMIQUE DES MODULES */}
              <div className="flex-1 relative z-10">
                {children}
              </div>

              {/* BUFFER PWA (Prévention de l'occlusion mobile) */}
              <div className="h-20 md:h-12 shrink-0" aria-hidden="true" />
            </div>
          </div>
        </main>
      </div>

      {/* 🚀 AXE DROIT : SLIM RAIL (Navigation Tactique - Desktop) */}
      <nav 
        className="hidden lg:flex w-20 xl:w-24 h-screen bg-[#0B0F1A] border-l border-white/5 flex-col items-center py-6 xl:py-10 gap-4 xl:gap-8 fixed right-0 top-0 z-50 shadow-2xl"
        role="navigation"
        aria-label="Navigation rapide"
      >
        {/* Logo raccourci */}
        <div className="w-10 xl:w-12 h-10 xl:h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-2 shadow-inner">
           <Cpu className="text-blue-500" size={20} aria-hidden="true" />
        </div>

        {/* Liens de navigation */}
        <div className="flex flex-col gap-3 xl:gap-4 w-full items-center">
          <SlimLink href="/dashboard/modules" icon={LayoutGrid} active={pathname === "/dashboard/modules"} label="Modules" />
          <div className="w-6 xl:w-8 h-px bg-white/10" aria-hidden="true" />
          <SlimLink href="/dashboard" icon={Home} active={pathname === "/dashboard"} label="Cockpit" />
          <SlimLink href="/dashboard/objectifs" icon={Zap} active={pathname?.startsWith("/dashboard/objectifs")} label="Objectifs" />
          <SlimLink href="/dashboard/parametres" icon={Settings} active={pathname?.startsWith("/dashboard/parametres")} label="Paramètres" />
        </div>

        {/* Spacer */}
        <div className="flex-1" aria-hidden="true" />
        
        {/* Bouton déconnexion */}
        <button
          onClick={handleLogout}
          className="w-12 xl:w-14 h-12 xl:h-14 rounded-3xl bg-rose-600/5 border border-transparent text-rose-500 flex items-center justify-center hover:bg-rose-600/10 hover:border-rose-500/30 hover:text-rose-400 transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-rose-400"
          title="DÉCONNEXION SÉCURISÉE"
          aria-label="Se déconnecter de l'espace Matrix"
        >
          <LogOut size={18} xl:size={20} className="group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
        </button>
      </nav>

      {/* 🧪 GLOBAL SDE OVERRIDES */}
      <style>{`
        body { 
          overflow: hidden !important; 
          height: 100dvh; 
          width: 100vw; 
          background: #050810;
          -webkit-tap-highlight-color: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Accessibilité : focus visible */
        :focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
        
        /* Smooth scroll pour les ancres internes */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}