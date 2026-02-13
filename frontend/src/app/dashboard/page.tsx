/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

/**
 * 🛰️ UNITÉ DE NAVIGATION RÉGALIENNE RD-2030
 * Rôle : Propulser l'utilisateur vers son cockpit spécifique.
 */
export default function DashboardRedirect() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [error, setError] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsReady(true);
      return;
    }
    setIsReady(true);

    if (!user) {
      // 🛡️ Aucune session détectée : Retour au portail
      router.push("/auth/login");
      return;
    }

    const role = user.U_Role?.toUpperCase();
    const processId = user.assignedProcessId || '';

    try {
      switch (role) {
        case 'SUPER_ADMIN':
          router.push("/admin/matrix"); // Vue souveraine globale
          break;
        case 'ADMIN':
        case 'ADMIN_RQ':
        case 'RQ':
          router.push("/dashboard/admin_rq"); // Pilotage SMI 360°
          break;
        case 'PILOTE':
        case 'COPILOTE':
          router.push(`/dashboard/processus/cockpit/${processId}`); // Accès direct au cockpit
          break;
        case 'AUDITEUR':
          router.push("/dashboard/audit-center"); // Centre de gestion des audits
          break;
        case 'DIRECTION':
          router.push("/dashboard/revue-direction"); // Vue de pilotage stratégique
          break;
        case 'OBSERVATEUR':
          router.push("/dashboard/consultation"); // Vue lecture seule
          break;
        default:
          router.push("/dashboard/admin_rq"); // Fallback sécurisé (Admin RQ)
      }
    } catch (err) {
      console.error("Erreur de routage Matrix:", err);
      setError(true);
    }
  }, [user, isReady, router]);

  if (error) {
    return (
      <div className="h-screen bg-[#0B0F1A] flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-white font-black text-2xl uppercase italic mb-4">Erreur de Trajectoire</h2>
        <p className="text-slate-500 text-xs mb-8 uppercase font-bold tracking-widest">Le noyau n&apos;a pas pu déterminer votre cockpit.</p>
        <button onClick={() => window.location.href = "/auth/login"} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px]">
          Réinitialiser la session
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0B0F1A] flex items-center justify-center font-sans italic">
      <div className="flex flex-col items-center gap-8">
        <div className="relative">
          <div className="w-20 h-20 border-b-2 border-blue-600 rounded-full animate-spin" />
          <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 animate-pulse" size={24} />
        </div>
        <div className="text-center space-y-2">
          <p className="text-white font-black text-xs uppercase tracking-[0.4em] animate-pulse">
            Analyse des droits Matrix...
          </p>
          <p className="text-slate-600 text-[9px] font-bold uppercase tracking-widest">
            Propulsion vers votre cockpit opérationnel
          </p>
        </div>
      </div>
    </div>
  );
}