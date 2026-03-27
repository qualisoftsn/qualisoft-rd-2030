/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : DashboardLayout (Session Protection & Orchestration)
 * RÔLE : Protection de session souveraine et orchestration de l'interface
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité + Security
 */

import { useAuthStore } from "@/store/authStore";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Strict typing)
// ============================================================================

export interface UserAuth {
  U_Id: string;
  U_Email: string;
  U_FirstName: string;
  U_LastName: string;
  U_Role: string;
  U_TenantId?: string;
  U_TenantName?: string;
  U_IsActive?: boolean;
}

export interface AuthState {
  user: UserAuth | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface DashboardLayoutProps {
  children: React.ReactNode;
}

export interface LoadingStateProps {
  label: string;
  sublabel: string;
}

export interface SessionExpiredProps {
  onRetry: () => void;
}

// ============================================================================
// SOUS-COMPOSANT : LOADING STATE
// ============================================================================

function LoadingState({ label, sublabel }: LoadingStateProps) {
  return (
    <div 
      className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] italic"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative flex items-center justify-center mb-4 md:mb-6" aria-hidden="true">
        <Loader2
          className="animate-spin text-blue-400 w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16"
          strokeWidth={3}
        />
        <ShieldCheck
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500/20 w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8"
        />
      </div>
      <p className="text-[9px] md:text-[10px] lg:text-[11px] font-black text-blue-400 uppercase tracking-widest animate-pulse m-0 text-center px-4">
        {label}
      </p>
      <span className="text-[7px] md:text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1 md:mt-2">
        {sublabel}
      </span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : SESSION EXPIRED
// ============================================================================

function SessionExpired({ onRetry }: SessionExpiredProps) {
  return (
    <div 
      className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] italic p-4"
      role="alert"
      aria-live="assertive"
    >
      <div className="bg-[#0F172A] border border-red-500/20 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 max-w-md w-full text-center shadow-2xl">
        <AlertCircle size={40} className="w-10 h-10 md:w-12 md:h-12 text-red-400 mx-auto mb-4 md:mb-6" aria-hidden="true" />
        <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tighter mb-2 md:mb-3">
          Session Expirée
        </h2>
        <p className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-4 md:mb-6 leading-relaxed">
          Votre accréditation Matrix a expiré. Veuillez vous réauthentifier pour accéder au dashboard.
        </p>
        <button
          onClick={onRetry}
          className="w-full py-3 md:py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Se réauthentifier"
        >
          Se Réauthentifier
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  
  // 🧠 Extraction typée de l'état du store Zustand
  const { user, isAuthenticated, isLoading } = useAuthStore() as { 
    user: UserAuth | null; 
    isAuthenticated: boolean;
    isLoading: boolean;
  };

  // 🛡️ GESTION DE L'HYDRATATION
  const [hasMounted, setHasMounted] = useState(false);
  const [sessionCheckComplete, setSessionCheckComplete] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // 🔒 SENTINELLE SOUVERAINE : Redirection si perte de session
  useEffect(() => {
    if (!hasMounted || isLoading) return;

    if (!isAuthenticated) {
      // Store current path for redirect after login
      const currentPath = window.location.pathname;
      if (currentPath !== '/auth/login') {
        router.replace(`/auth/login?callbackUrl=${encodeURIComponent(currentPath)}`);
      }
    } else {
      setSessionCheckComplete(true);
    }
  }, [hasMounted, isLoading, isAuthenticated, router]);

  /**
   * 👑 MATRICE D'ACCRÉDITATION
   * Détermination du mode "Architecte Master" (Super Admin)
   */
  const isSuperAdmin = useMemo(() => {
    if (!user) return false;
    const role = user.U_Role?.toUpperCase() || '';
    return (
      role === "SUPER_ADMIN" || 
      role === "ADMIN" ||
      user.U_Email === "ab.thiongane@qualisoft.sn"
    );
  }, [user]);

  // Handle retry for expired session
  const handleRetry = useCallback(() => {
    router.push('/auth/login');
  }, [router]);

  // ⏳ ÉCRAN DE SYNCHRONISATION DU NOYAU
  if (!hasMounted || isLoading || !sessionCheckComplete) {
    return (
      <LoadingState 
        label="Synchronisation Matrix..." 
        sublabel="Authentification Souveraine RD-2026" 
      />
    );
  }

  // Session expired state
  if (!isAuthenticated || !user) {
    return <SessionExpired onRetry={handleRetry} />;
  }

  return (
    <div 
      className="h-screen bg-[#0B0F1A] flex italic font-sans overflow-hidden selection:bg-blue-600/30"
      role="application"
      aria-label="Dashboard Qualisoft Elite"
    >
      {/* 🧭 SIDEBAR SOUVERAINE */}
      <aside 
        className="fixed top-0 left-0 h-full w-64 md:w-72 lg:w-80 bg-[#0B0F1A] border-r border-white/5 z-40"
        role="navigation"
        aria-label="Menu principal"
      >
        <Sidebar isSuperAdmin={isSuperAdmin} />
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col pl-64 md:pl-72 lg:pl-80 pr-4 md:pr-6 lg:pr-8 min-w-0 relative">
        
        {/* Skip Link for Accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-black focus:uppercase focus:text-[10px] focus:tracking-widest"
        >
          Aller au contenu principal
        </a>

        <main 
          id="main-content"
          className="flex-1 relative overflow-y-auto p-4 md:p-6 lg:p-8 xl:p-10 custom-scrollbar bg-[#0B0F1A]"
          role="main"
          aria-label="Contenu principal du dashboard"
        >
          <div className="max-w-7xl mx-auto animate-in fade-in duration-1000 slide-in-from-bottom-2">
            
            {/* 🚩 INDICATEUR DE CONTEXTE */}
            <div 
              className="mb-4 md:mb-6 flex items-center gap-2 md:gap-3 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default"
              role="status"
              aria-label={`Contexte: ${user.U_TenantName || 'Sagam/Elite Cluster'}`}
            >
              <ShieldCheck size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 text-blue-400" aria-hidden="true" />
              <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 truncate">
                Nœud : {user.U_TenantName || "Sagam/Elite Cluster"}
              </span>
            </div>

            {children}
          </div>

          {/* 📡 FOOTER DE TÉLÉMÉTRIE */}
          <footer 
            className="mt-12 md:mt-16 lg:mt-20 py-6 md:py-8 lg:py-10 border-t border-white/5 opacity-20 flex flex-col sm:flex-row justify-between items-center gap-2 md:gap-3"
            role="contentinfo"
          >
            <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest">
              Qualisoft Elite RD 2026
            </p>
            <p className="text-[7px] md:text-[8px] font-mono text-slate-500">
              SDE_MATRIX_STABLE_BUILD_1.4
            </p>
          </footer>
        </main>
      </div>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(37,99,235,0.2);border-radius:20px}.custom-scrollbar::-webkit-scrollbar-thumb:hover{background:#2563eb}`}</style>
    </div>
  );
}