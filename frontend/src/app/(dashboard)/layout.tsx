/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : DashboardLayout.tsx (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Superstructure du Cockpit - Orchestration Sidebar & ActionHub.
 * FONCTION : Protection des routes via Zustand, Isolation Multi-Tenant.
 * UX/UI : Design 100dvh "ClickUp Style", Zéro Scroll Global, PWA Ready.
 * RÉVISION : 04 Mars 2026 | 22:46 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2, ShieldCheck } from "lucide-react";

// ✅ IMPORTS DES MODULES SCELLÉS
import Sidebar from "@/app/dashboard/sidebar"; 
import ActionHub from "@/components/layout/ActionHub"; 
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
   * Redirection immédiate si le jeton Matrix est absent (Zéro NextAuth).
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

  // ⏳ ÉCRAN DE DÉMARRAGE DU NOYAU (Plein écran strict)
  if (!hasMounted || !isAuthenticated || !user) {
    return (
      <div className="h-dvh w-full flex flex-col items-center justify-center bg-[#0B0F1A] italic font-sans overflow-hidden">
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
    // CONTENEUR RACINE : Fixe, sans scroll, 100% de la hauteur PWA
    <div className="h-dvh w-full bg-[#0B0F1A] flex italic font-sans overflow-hidden selection:bg-blue-600/30">
      
      {/* 🧭 NAVIGATION RÉGALIENNE (Sidebar fixe à gauche, rétractable sur mobile) */}
      <div className="hidden lg:block z-40">
        <Sidebar isSuperAdmin={isSuperAdmin} />
      </div>
      
      {/* 🏗️ ZONE DE TRAVAIL ÉLITE (Prend l'espace restant, gère son propre scroll) */}
      <div className="flex-1 flex flex-col min-w-0 relative lg:pl-80 h-dvh">
        
        {/* ⚡ ACTION HUB (La barre de commande supérieure, fixée en haut) */}
        <div className="sticky top-0 z-30 w-full shrink-0">
          <ActionHub />
        </div>
        
        {/* 👤 TOP USER NAV (Responsive : adaptée mobile et desktop) */}
        <div className="absolute top-4 right-4 md:top-8 md:right-12 z-50">
          <TopUserNav />
        </div>

        {/* 📄 CONTENU DYNAMIQUE DES PROCESSUS (Scroll interne fluide) */}
        <main className="flex-1 relative overflow-y-auto overflow-x-hidden p-4 md:p-8 lg:p-12 custom-scrollbar bg-[#0B0F1A]">
          <div className="max-w-7xl mx-auto pt-16 md:pt-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 min-h-full pb-20">
            
            {/* 🚩 EN-TÊTE DE CONTEXTE */}
            <div className="mb-8 md:mb-10 flex items-center gap-3 opacity-40 grayscale hover:grayscale-0 transition-all">
               <ShieldCheck size={14} className="text-blue-500 shrink-0" />
               <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-white m-0 truncate">
                 {user.U_TenantDomain?.toUpperCase() || 'ELITE'} • Périmètre Sécurisé
               </p>
            </div>

            {/* CONTENU DE LA PAGE */}
            <div className="relative z-10">
              {children}
            </div>
            
          </div>
        </main>

        {/* 📡 FOOTER DE TÉLÉMÉTRIE (Subliminal) */}
        <footer className="absolute bottom-4 right-4 md:bottom-6 md:right-12 opacity-20 pointer-events-none z-0 hidden sm:block">
          <p className="text-[7px] md:text-[8px] font-black uppercase text-slate-500 tracking-widest m-0">
            Sovereign OS v2026.1 • Qualisoft Elite
          </p>
        </footer>
      </div>

      <style jsx global>{`
        /* Barre de défilement d'élite intra-conteneur */
        .custom-scrollbar::-webkit-scrollbar { 
          width: 5px; 
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track { 
          background: transparent; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(37, 99, 235, 0.15); 
          border-radius: 10px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
          background: rgba(37, 99, 235, 0.4); 
        }
      `}</style>
    </div>
  );
}