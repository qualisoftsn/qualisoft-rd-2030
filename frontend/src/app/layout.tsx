/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/**
 * 🛰️ MODULE : DashboardLayout.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Structure maîtresse de l'application après authentification.
 * SÉCURITÉ : Isolation Matrix, Détection Mascarade, Zéro NextAuth.
 * RÉVISION : 03 Mars 2026 | 20:30 GMT
 */

"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2, ShieldCheck } from "lucide-react";

// COMPOSANTS SOUVERAINS
import Sidebar from "@/app/dashboard/sidebar";
import TrialBanner from "@/components/TrialBanner";
import ImpersonationBanner from "@/components/layout/ImpersonationBanner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore() as any;
  const [hasMounted, setHasMounted] = useState(false);

  /**
   * 🛡️ PROTOCOLE D'HYDRATATION
   * Empêche les erreurs de désynchronisation entre le serveur et le client.
   */
  useEffect(() => {
    setHasMounted(true);
  }, []);

  /**
   * 🛡️ VÉRIFICATION DE SÉCURITÉ ATOMIQUE
   * Si le store Zustand ne détecte plus de session, redirection immédiate vers le sas.
   */
  useEffect(() => {
    if (hasMounted && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [hasMounted, isAuthenticated, router]);

  /**
   * 👑 LOGIQUE D'ACCRÉDITATION
   * On identifie si l'utilisateur possède l'autorité Master.
   */
  const isSuperAdmin = useMemo(() => {
    return (
      user?.U_Role?.toUpperCase() === "SUPER_ADMIN" || 
      user?.U_Email === "ab.thiongane@qualisoft.sn"
    );
  }, [user]);

  // --- ÉTAT DE TRANSITION MATRIX ---
  if (!hasMounted || !isAuthenticated || !user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] relative overflow-hidden">
        {/* Lueur de fond Matrix */}
        <div className="absolute w-125 h-125 bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        
        <div className="relative z-10 flex flex-col items-center gap-6">
          <Loader2 className="animate-spin text-blue-600" size={60} strokeWidth={3} />
          <div className="space-y-2 text-center">
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.6em] m-0 italic">
              Synchronisation Matrix OS...
            </p>
            <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest m-0">
              Vérification des Sceaux de Sécurité RD-2026
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0B0F1A] flex italic font-sans overflow-hidden selection:bg-blue-600/30">
      
      {/* 🎭 BANNIÈRE DE MASCARADE (Apparaît uniquement si isImpersonated === true) */}
      <ImpersonationBanner />

      {/* 🧭 SIDEBAR SOUVERAINE (Fixée à gauche) */}
      <Sidebar isSuperAdmin={isSuperAdmin} />
      
      {/* 🚀 ZONE DE CONTENU DYNAMIQUE */}
      <div className="flex-1 flex flex-col relative min-w-0 transition-all duration-500">
        
        {/* ⏳ BANNIÈRE DE LICENCE / TRIAL (S'adapte si Mascarade active) */}
        <div className={`transition-all duration-500 ${user.isImpersonated ? 'mt-10' : 'mt-0'}`}>
          <TrialBanner isSuperAdmin={isSuperAdmin} />
        </div>

        {/* MAIN VIEWPORT */}
        <main className="flex-1 relative overflow-y-auto px-10 py-8 custom-scrollbar">
          {/* Container max-width pour l'élégance et la lisibilité */}
          <div className="max-w-350 mx-auto animate-in fade-in slide-in-from-bottom-2 duration-1000 pb-20">
            
            {/* Indicateur visuel discret de session */}
            <div className="flex justify-end mb-6 opacity-20 hover:opacity-100 transition-opacity">
               <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                 <ShieldCheck size={12} className="text-blue-500" />
                 <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                   Session Sécurisée : {user.tenant?.T_Name || "Nœud Local"}
                 </span>
               </div>
            </div>

            {children}
          </div>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(37, 99, 235, 0.1); 
          border-radius: 10px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2563eb; }
      `}</style>
    </div>
  );
}