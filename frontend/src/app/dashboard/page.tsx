/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * 🛰️ UNITÉ DE NAVIGATION RÉGALIENNE RD-2030
 * Rôle : Propulser l'utilisateur vers son cockpit spécifique.
 * AMÉLIORATION : Conscience territoriale (Master vs Tenant).
 * VERSION : 2.0 (Zéro Next-Auth / Full Zustand Matrix)
 */
export default function DashboardRedirect() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [error, setError] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');

  useEffect(() => {
    // 1. DÉTECTION DU RÉGIME DE SESSION
    // On laisse un micro-délai pour l'hydratation du store Zustand
    const checkSession = () => {
      const currentUser = useAuthStore.getState().user;

      if (!currentUser) {
        // Pas d'utilisateur trouvé après analyse
        router.push("/auth/login");
        return;
      }

      try {
        const role = currentUser.U_Role?.toUpperCase();
        const processId = currentUser.assignedProcessId || "";

        // 🛡️ ANALYSE DU TERRITOIRE PHYSIQUE
        const hostname = window.location.hostname;
        const subdomain = hostname.split(".")[0].toLowerCase();

        // Domaines réservés au Noyau Central (Matrix)
        const masterDomains = ["app", "elite", "www", "localhost", "qualisoft"];
        const isMasterTerritory = masterDomains.includes(subdomain);

        // 🧭 LOGIQUE D'AIGUILLAGE SOUVERAINE
        switch (role) {
          case "SUPER_ADMIN":
            // Si Super Admin chez un client -> Dashboard local. Si au siège -> Matrix.
            if (isMasterTerritory) {
              router.push("/admin/matrix"); 
            } else {
              router.push("/dashboard/admin_rq"); 
            }
            break;

          case "ADMIN":
          case "ADMIN_RQ":
          case "RQ":
            router.push("/dashboard/admin_rq"); // Pilotage SMI 360°
            break;

          case "PILOTE":
          case "COPILOTE":
            if (processId) {
              router.push(`/dashboard/processus/cockpit/${processId}`);
            } else {
              router.push("/dashboard/consultation");
            }
            break;

          case "AUDITEUR":
            router.push("/dashboard/audit-center");
            break;

          case "DIRECTION":
            router.push("/dashboard/revue-direction");
            break;

          case "OBSERVATEUR":
            router.push("/dashboard/consultation");
            break;

          default:
            router.push("/dashboard/admin_rq"); // Fallback de sécurité
        }
        setStatus('ready');
      } catch (err) {
        console.error("🚨 ÉCHEC DU CALCUL DE TRAJECTOIRE :", err);
        setError(true);
      }
    };

    const timer = setTimeout(checkSession, 500);
    return () => clearTimeout(timer);
  }, [user, router]);

  // 🚩 INTERFACE D'ERREUR SOUVERAINE
  if (error) {
    return (
      <div className="h-screen bg-[#0B0F1A] flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-white font-black text-2xl uppercase italic mb-4">
          Erreur de Trajectoire
        </h2>
        <p className="text-slate-500 text-xs mb-8 uppercase font-bold tracking-widest">
          Le noyau n&apos;a pas pu déterminer votre cockpit opérationnel.
        </p>
        <button
          onClick={() => (window.location.href = "/auth/login")}
          className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-blue-500 transition-all shadow-lg"
        >
          Réinitialiser la session
        </button>
      </div>
    );
  }

  // 🛰️ INTERFACE DE TRANSITION (WARP SPEED)
  return (
    <div className="h-screen bg-[#0B0F1A] flex items-center justify-center font-sans italic">
      <div className="flex flex-col items-center gap-8">
        <div className="relative">
          <div className="w-20 h-20 border-b-2 border-blue-600 rounded-full animate-spin" />
          <Loader2
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 animate-pulse"
            size={24}
          />
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