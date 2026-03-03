/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : src/app/dashboard/layout.tsx
 * -------------------------------------------------------------------------
 * CORRECTIF : Suppression des props 'user' (Désormais gérées via Zustand).
 * RÉVISION : 03 Mars 2026 | 09:30 GMT
 */

"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";
import Sidebar from "@/app/dashboard/sidebar";
import TrialBanner from "@/components/TrialBanner"; // Assurez-vous du bon chemin

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore() as any;
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [hasMounted, isAuthenticated, router]);

  const isSuperAdmin = useMemo(() => {
    return user?.U_Role?.toUpperCase() === "SUPER_ADMIN" || user?.U_Email === "ab.thiongane@qualisoft.sn";
  }, [user]);

  if (!hasMounted || !isAuthenticated || !user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A]">
        <Loader2 className="animate-spin text-blue-600 mb-6" size={50} />
        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
          Initialisation Matrix...
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0B0F1A] flex italic font-sans overflow-hidden selection:bg-blue-600/30">
      
      {/* 🧭 SIDEBAR SOUVERAINE */}
      {/* FIX : On ne passe plus 'user', il est récupéré dans le store du composant */}
      <Sidebar isSuperAdmin={isSuperAdmin} />
      
      <div className="flex-1 flex flex-col pl-80 pr-20 min-w-0 relative">
        
        {/* ⏳ BANNIÈRE DE LICENCE */}
        {/* FIX : Même logique ici pour alléger le layout */}
        <TrialBanner isSuperAdmin={isSuperAdmin} />

        <main className="flex-1 relative overflow-y-auto p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}