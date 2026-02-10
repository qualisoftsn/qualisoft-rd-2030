"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

/**
 * 🛰️ UNITÉ DE NAVIGATION RÉGALIENNE
 * Rôle : Propulser l'utilisateur vers son cockpit spécifique dès l'entrée dans le noyau.
 */
export default function DashboardRedirect() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const role = user.U_Role?.toUpperCase();

    switch (role) {
      case 'SUPER_ADMIN':
        router.push("/admin/matrix"); // Console de Supervision Global
        break;
      case 'ADMIN':
      case 'ADMIN_RQ':
        router.push("/dashboard/admin_rq"); // Pilotage 360° du SMI (Vue Administrateur)
        break;
      case 'PILOTE':
        // Tunneling direct vers le cockpit du processus assigné
        router.push(`/dashboard/processus/cockpit/${user.assignedProcessId || ''}`);
        break;
      case 'AUDITEUR':
        router.push("/dashboard/audit-center"); // Planning & Rapports
        break;
      case 'OBSERVATEUR':
        router.push("/dashboard/consultation"); // Vue Read-only (Consultation)
        break;
      default:
        router.push("/dashboard/admin_rq"); // Fallback sécurisé
    }
  }, [user, router]);

  return (
    <div className="h-screen bg-[#0B0F1A] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
          Synchronisation avec le Noyau Matrix...
        </p>
      </div>
    </div>
  );
}