/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ UNITÉ DE NAVIGATION RÉGALIENNE
 * RÔLE : Aiguillage souverain selon le Rôle & Territoire.
 * RÉVISION : 02 Mars 2026 | 17:23 GMT
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

export default function DashboardRedirect() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    const checkTrajectoire = () => {
      const u = useAuthStore.getState().user;
      if (!u) { router.push("/auth/login"); return; }

      try {
        const role = u.U_Role?.toUpperCase();
        const procId = u.assignedProcessId || "";
        const sub = window.location.hostname.split(".")[0].toLowerCase();
        const isMaster = ["app", "elite", "www", "localhost", "qualisoft"].includes(sub);

        if (role === "SUPER_ADMIN") {
          router.push(isMaster ? "/admin/matrix" : "/dashboard/admin_rq");
        } else if (["ADMIN", "ADMIN_RQ", "RQ", "DIRECTION"].includes(role)) {
          router.push("/dashboard/admin_rq");
        } else if (["PILOTE", "COPILOTE"].includes(role)) {
          router.push(procId ? `/dashboard/processus/cockpit/${procId}` : "/dashboard/consultation");
        } else if (role === "AUDITEUR") {
          router.push("/dashboard/audit-center");
        } else {
          router.push("/dashboard/consultation");
        }
      } catch (err) {
        setError(true);
      }
    };

    const timer = setTimeout(checkTrajectoire, 500);
    return () => clearTimeout(timer);
  }, [user, router]);

  if (error) return (
    <div className="h-screen bg-[#0B0F1A] flex flex-col items-center justify-center text-center p-10 italic">
      <h2 className="text-white font-black text-3xl uppercase tracking-tighter m-0">Trajectoire Interrompue</h2>
      <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em] mt-4">Impossible de localiser le cockpit opérationnel.</p>
      <button onClick={() => window.location.href = "/auth/login"} className="mt-8 px-10 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest border-none cursor-pointer shadow-2xl">Réinitialiser la matrice</button>
    </div>
  );

  return (
    <div className="h-screen bg-[#0B0F1A] flex flex-col items-center justify-center gap-8 italic">
      <div className="relative">
        <div className="w-20 h-20 border-b-2 border-blue-600 rounded-full animate-spin" />
        <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 animate-pulse" size={24} />
      </div>
      <div className="text-center space-y-2">
        <p className="text-white font-black text-[11px] uppercase tracking-[0.5em] animate-pulse m-0">Vérif des droits ...</p>
        <p className="text-slate-700 text-[9px] font-bold uppercase tracking-widest m-0">Ouverture de votre Tableau de Bord</p>
      </div>
    </div>
  );
}