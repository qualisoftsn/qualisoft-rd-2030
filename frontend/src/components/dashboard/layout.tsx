/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : DashboardLayout.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Protection de session et orchestration Matrix UI.
 * RÉVISION : 02 Mars 2026 | 18:35 GMT
 */

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";
import Sidebar from "@/app/dashboard/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore() as any;
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => { setHasMounted(true); }, []);

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
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] italic">
        <Loader2 className="animate-spin text-blue-600 mb-6" size={50} strokeWidth={3} />
        <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] animate-pulse m-0">Synchronisation Matrix...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0B0F1A] flex italic font-sans overflow-hidden selection:bg-blue-600/30">
      <Sidebar user={user} isSuperAdmin={isSuperAdmin} />
      <div className="flex-1 flex flex-col pl-80 pr-20 min-w-0 relative">
        <main className="flex-1 relative overflow-y-auto p-10 custom-scrollbar bg-[#0B0F1A]">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}