/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : DashboardLayout.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Superstructure du Cockpit - Orchestration Sidebar & ActionHub.
 * FONCTION : Protection des routes, injection d'identité et isolation Multi-Tenant.
 * RÉVISION : 03 Mars 2026 | 02:55 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2, ShieldCheck } from "lucide-react";

// ✅ IMPORTS DES MODULES SCELLÉS
import Sidebar from "@/app/dashboard/sidebar"; 
import ActionHub from "@/components/layout/ActionHub"; // Ton Hub d'actions (ex-TrialBanner)
import TopUserNav from "@/components/dashboard/TopUserNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuthStore() as any;
  const [hasMounted, setHasMounted] = useState(false);

  /**
   * 🛡️ PROTOCOLE D'HYDRATATION
   * Empêche le "flickering" d'UI avant que Zustand ne récupère la session scellée.
   */
  useEffect(() => {
    setHasMounted(true);
  }, []);

  /**
   * 🚪 BARRIÈRE DE SÉCURITÉ KERNEL
   * Redirection immédiate si le jeton Matrix est absent ou corrompu.
   */
  useEffect(() => {
    if (hasMounted && !isAuthenticated) {
      router.replace("/auth/login?session=required");
    }
  }, [hasMounted, isAuthenticated, router]);

  /**
   * 👮 MATRICE D'ACCRÉDITATION
   * Définition du périmètre Super Admin (Bypass Matrix Core).
   */
  const isSuperAdmin = useMemo(() => {
    if (!user) return false;
    return (
      user.U_Role?.toUpperCase() === "SUPER_ADMIN" || 
      user.U_Role?.toUpperCase() === "ROOT" ||
      user.U_Email === "ab.thiongane@qualisoft.sn"
    );
  }, [user]);

  // ⏳ ÉCRAN DE DÉMARRAGE DU NOYAU
  if (!hasMounted || !isAuthenticated || !user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] italic font-sans">
        <div className="relative">
          <Loader2 className="animate-spin text-blue-600 mb-8" size={60} strokeWidth={3} />
          <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500/20" size={32} />
        </div>
        <div className="text-center space-y-2">
          <p className="text-[11px] font-black text-blue-500 uppercase tracking-[0.6em] animate-pulse m-0">
            Initialisation Matrix OS
          </p>
          <p className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.4em] m-0 leading-none">
            Vérification des Sceaux de Sécurité...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0B0F1A] flex italic font-sans overflow-hidden selection:bg-blue-600/30">
      
      {/* 🧭 NAVIGATION RÉGALIENNE (Sidebar fixe à gauche) */}
      <Sidebar isSuperAdmin={isSuperAdmin} />
      
      {/* 🏗️ ZONE DE TRAVAIL ÉLITE */}
      <div className="flex-1 flex flex-col pl-80 min-w-0 relative">
        
        {/* ⚡ ACTION HUB (La barre de commande supérieure) */}
        <ActionHub />
        
        {/* 👤 TOP USER NAV (Positionnée en flottant pour le design RD-2026) */}
        <div className="absolute top-8 right-12 z-50">
          <TopUserNav />
        </div>

        {/* 📄 CONTENU DYNAMIQUE DES PROCESSUS */}
        <main className="flex-1 relative overflow-y-auto p-12 custom-scrollbar bg-[#0B0F1A]">
          <div className="max-w-7xl mx-auto pt-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            
            {/* 🚩 EN-TÊTE DE CONTEXTE (Optionnel) */}
            <div className="mb-10 flex items-center gap-4 opacity-40 grayscale hover:grayscale-0 transition-all">
               <ShieldCheck size={14} className="text-blue-500" />
               <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white m-0">
                 {user.U_TenantName} • Périmètre de Sécurité Actif
               </p>
            </div>

            {children}
            
          </div>
        </main>

        {/* 📡 FOOTER DE TÉLÉMÉTRIE (Subliminal) */}
        <footer className="absolute bottom-6 right-12 opacity-20 pointer-events-none">
          <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">
            Sovereign OS v2026.1 • Qualisoft Elite
          </p>
        </footer>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(37, 99, 235, 0.2); 
          border-radius: 20px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
          background: rgba(37, 99, 235, 0.5); 
        }
      `}</style>
    </div>
  );
}