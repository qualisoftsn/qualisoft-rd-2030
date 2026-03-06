/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : DashboardLayout.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Protection de session souveraine et orchestration de l'interface.
 * FONCTION : Élimination du Prop Drilling pour compatibilité Zustand.
 * RÉVISION : 03 Mars 2026 | 01:50 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import { useAuthStore } from "@/store/authStore";
import { Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

// ✅ IMPORT : Sidebar autonome (ne nécessite plus de prop 'user')
import Sidebar from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // 🧠 On extrait l'état du store Zustand
  const { user, isAuthenticated } = useAuthStore() as any;

  // 🛡️ GESTION DE L'HYDRATATION (Évite les erreurs de rendu serveur/client)
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // 🔒 SENTINELLE SOUVERAINE : Redirection si perte de session (Zéro NextAuth)
  useEffect(() => {
    if (hasMounted && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [hasMounted, isAuthenticated, router]);

  /**
   * 👑 MATRICE D'ACCRÉDITATION
   * Détermination du mode "Architecte Master" (Super Admin)
   */
  const isSuperAdmin = useMemo(() => {
    if (!user) return false;
    const role = user?.U_Role?.toUpperCase();
    return (
      role === "SUPER_ADMIN" || user?.U_Email === "ab.thiongane@qualisoft.sn"
    );
  }, [user]);

  // ⏳ ÉCRAN DE SYNCHRONISATION DU NOYAU
  if (!hasMounted || !isAuthenticated || !user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] italic">
        <div className="relative flex items-center justify-center">
          <Loader2
            className="animate-spin text-blue-600 mb-6"
            size={64}
            strokeWidth={3}
          />
          <ShieldCheck
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500/20"
            size={30}
          />
        </div>
        <p className="text-[11px] font-black text-blue-500 uppercase tracking-[0.5em] animate-pulse m-0">
          Synchronisation Matrix...
        </p>
        <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest mt-2">
          Authentification Souveraine RD-2026
        </span>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0B0F1A] flex italic font-sans overflow-hidden selection:bg-blue-600/30">
      {/* 🧭 SIDEBAR SOUVERAINE */}
      {/* ✅ CORRECTIF : Suppression de la prop 'user' pour alignement avec le nouveau type du composant */}
      <Sidebar isSuperAdmin={isSuperAdmin} />

      <div className="flex-1 flex flex-col pl-80 pr-20 min-w-0 relative">
        <main className="flex-1 relative overflow-y-auto p-10 custom-scrollbar bg-[#0B0F1A]">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-1000 slide-in-from-bottom-2">
            {/* 🚩 INDICATEUR DE CONTEXTE (Optionnel) */}
            <div className="mb-6 flex items-center gap-3 opacity-30 grayscale hover:grayscale-0 transition-all cursor-default">
              <ShieldCheck size={14} className="text-blue-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Nœud : {user.U_TenantName || "Sagam/Elite Cluster"}
              </span>
            </div>

            {children}
          </div>

          {/* 📡 FOOTER DE TÉLÉMÉTRIE */}
          <footer className="mt-20 py-10 border-t border-white/5 opacity-20 flex justify-between items-center">
            <p className="text-[9px] font-black uppercase tracking-widest">
              Qualisoft Elite RD 2026
            </p>
            <p className="text-[8px] font-mono">SDE_MATRIX_STABLE_BUILD_1.4</p>
          </footer>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(37, 99, 235, 0.2);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
}
