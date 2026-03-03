/**
 * 🛰️ MODULE : DashboardLayout.tsx
 * -------------------------------------------------------------------------
 * RÉPARATION : Suppression définitive des erreurs de setState et boucles.
 * SÉCURITÉ : Zéro NextAuth (Store Zustand).
 * RÉVISION : 03 Mars 2026 | 17:50 GMT
 */

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2, Fingerprint } from "lucide-react";

// ✅ COMPOSANTS SCELLÉS
import Sidebar from "./sidebar";
import TrialBanner from "@/components/TrialBanner";
import ImpersonationBanner from "@/components/layout/ImpersonationBanner";
import NotificationBell from "@/components/dashboard/notification-bell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  // 1. On initialise mounted à false pour bloquer le SSR
  const [mounted, setMounted] = useState(false);

  // 2. Récupération du store (Ligne 30)
  const { user, isAuthenticated } = useAuthStore() as any;

  // 3. Un SEUL effet pour valider le montage (Ligne 35 corrigée)
  useEffect(() => {
    setMounted(true);
  }, []);

  // 4. Gestion des redirections sécurisées
  useEffect(() => {
    if (mounted && isAuthenticated === false) {
      router.replace("/auth/login");
    }
  }, [mounted, isAuthenticated, router]);

  // Matrix Accreditation
  const isSuperAdmin = useMemo(() => {
    return user?.U_Role === 'SUPER_ADMIN' || user?.U_Email === "ab.thiongane@qualisoft.sn";
  }, [user]);

  /**
   * 🛡️ ÉCRAN DE PROTECTION (ANTI-LOCK)
   * Si on n'est pas monté, ou si on attend l'auth, on affiche le loader Matrix.
   */
  if (!mounted || isAuthenticated === null || (isAuthenticated && !user)) {
    return (
      <div className="h-screen bg-[#0B0F1A] flex flex-col items-center justify-center gap-8">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin" strokeWidth={3} />
          <Fingerprint className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500/20" size={24} />
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] animate-pulse m-0">
            SDE Matrix OS : Synchronisation...
          </p>
        </div>
      </div>
    );
  }

  // 🏁 RENDU FINAL
  return (
    <div className="h-screen bg-[#0B0F1A] flex overflow-hidden italic font-sans">
      <ImpersonationBanner />
      <Sidebar isSuperAdmin={isSuperAdmin} />

      <div className="flex-1 flex flex-col pl-80 pr-20 relative transition-all duration-500">
        <TrialBanner isSuperAdmin={isSuperAdmin} />
        
        <header className="h-24 bg-[#0F172A]/40 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-12 sticky top-0 z-40">
          <div className="flex-1" />
          <div className="flex items-center gap-10">
            <NotificationBell />
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 text-white font-black shadow-2xl ${isSuperAdmin ? "bg-amber-600" : "bg-blue-600"}`}>
              {user?.U_FirstName?.[0]}{user?.U_LastName?.[0]}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-1000">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}