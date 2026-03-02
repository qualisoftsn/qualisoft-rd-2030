/* eslint-disable react-hooks/set-state-in-effect */
/**
 * 🛰️ MODULE : src/app/page.tsx
 * -------------------------------------------------------------------------
 * FONCTION : Point d'Entrée Master & Unité d'Aiguillage de la Matrix OS.
 * RÔLE : Analyse de l'état du Noyau (Auth) et propulsion vers le cockpit.
 * SÉCURITÉ : Zéro NextAuth. Synchronisation avec le store Zustand Matrix.
 * DESIGN : High-Density Sovereign Splash Screen.
 * -------------------------------------------------------------------------
 * RÉVISION : 02 Mars 2026 | 17:42 GMT
 */

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2, ShieldCheck, Activity, Cpu } from "lucide-react";

export default function RootMasterPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [hasMounted, setHasMounted] = useState(false);

  /**
   * 🛡️ PROTOCOLE D'HYDRATATION
   * Empêche tout décalage de rendu entre le serveur et le client.
   * On s'assure que le store Zustand est bien synchronisé avec le LocalStorage.
   */
  useEffect(() => {
    setHasMounted(true);
  }, []);

  /**
   * 🚀 UNITÉ DE PROPULSION (AIGUILLAGE)
   * Analyse l'état de la session après montage du composant.
   */
  useEffect(() => {
    if (hasMounted) {
      const timer = setTimeout(() => {
        if (isAuthenticated && user) {
          // Propulsion vers le Dashboard Redirector (qui gère les sous-cockpits)
          router.replace("/dashboard");
        } else {
          // Redirection vers le Portail d'Habilitation
          router.replace("/auth/login");
        }
      }, 1200); // Délai tactique pour l'affichage de la marque

      return () => clearTimeout(timer);
    }
  }, [hasMounted, isAuthenticated, user, router]);

  /**
   * 🎨 INTERFACE DE TRANSITION SOUVERAINE
   * Affichée pendant l'analyse de la trajectoire utilisateur.
   */
  return (
    <div className="h-screen bg-[#0B0F1A] flex flex-col items-center justify-center italic font-sans selection:bg-blue-600/30 overflow-hidden relative">
      
      {/* 🌌 ATMOSPHÈRE DE FOND (MATRIX GLOW) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-blue-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-150 h-150 bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10 animate-in fade-in zoom-in duration-1000">
        
        {/* 🔝 LOGO SDE MASTER NODE */}
        <div className="flex flex-col items-center gap-6">
          <div className="w-24 h-24 bg-white rounded-4xl flex items-center justify-center border-4 border-white/10 shadow-[0_0_50px_rgba(37,99,235,0.2)]">
            <span className="text-5xl font-black text-[#0B0F1A] not-italic">Q</span>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-black uppercase tracking-tighter text-white m-0 leading-none">
              QUALI<span className="text-blue-600">SOFT</span> ELITE
            </h1>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.6em] mt-4 italic leading-none opacity-50">
              Sovereign Operating System
            </p>
          </div>
        </div>

        {/* 📊 INDICATEURS DE CHARGEMENT NOYAU */}
        <div className="flex flex-col items-center gap-6 w-64">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" strokeWidth={3} />
            <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 opacity-50" size={16} />
          </div>
          
          <div className="space-y-3 w-full">
             <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-slate-600">
                <span className="flex items-center gap-1"><Cpu size={10} /> Kernel Sync</span>
                <span className="animate-pulse">Active</span>
             </div>
             <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 animate-progress shadow-[0_0_8px_#2563eb]" style={{ width: '100%' }} />
             </div>
          </div>
        </div>

        {/* 📜 MENTION DE CONFORMITÉ */}
        <div className="absolute bottom-12 flex flex-col items-center gap-4 opacity-20">
          <div className="flex items-center gap-3">
             <Activity size={14} className="text-blue-500" />
             <span className="text-[9px] font-black text-white uppercase tracking-[0.4em]">Qualisoft RD 2026</span>
          </div>
          <p className="text-[7px] font-bold text-slate-500 uppercase tracking-[0.2em] italic">
            Certifié conforme aux protocoles de sécurité QHSE
          </p>
        </div>
      </div>

      {/* 🎭 CSS ANIMATIONS */}
      <style jsx global>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0); }
        }
        .animate-progress {
          animation: progress 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
}