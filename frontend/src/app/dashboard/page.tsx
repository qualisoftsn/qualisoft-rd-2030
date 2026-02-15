/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

/**
 * 🛰️ UNITÉ DE NAVIGATION RÉGALIENNE RD-2030
 * Rôle : Propulser l'utilisateur vers son cockpit spécifique.
 * AMÉLIORATION : Conscience territoriale (Master vs Tenant).
 */
export default function DashboardRedirect() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [error, setError] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Sécurité Session
    if (!user) {
      // On laisse un micro-délai pour que le Store se charge si besoin
      const timer = setTimeout(() => {
         if (!useAuthStore.getState().user) router.push("/auth/login");
      }, 500);
      return () => clearTimeout(timer);
    }
    
    setIsReady(true);

    const role = user.U_Role?.toUpperCase();
    const processId = user.assignedProcessId || '';

    // 🛡️ DÉTECTION TERRITORIALE
    // On vérifie où on se trouve physiquement (URL)
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0].toLowerCase();
    
    // Liste des domaines réservés au "Master" (Siège)
    const masterDomains = ['app', 'elite', 'www', 'localhost', 'qualisoft'];
    const isMasterTerritory = masterDomains.includes(subdomain);

    try {
      // 🧭 LOGIQUE D'AIGUILLAGE SOUVERAINE
      switch (role) {
        case 'SUPER_ADMIN':
          // 🚨 SUBTILITÉ CRUCIALE :
          // Si je suis Super Admin MAIS que je suis chez un client (ex: sde.qualisoft.sn),
          // je ne dois PAS aller sur Matrix, mais sur le Dashboard local pour piloter/aider.
          if (isMasterTerritory) {
             router.push("/admin/matrix"); // Vue souveraine globale (Siège)
          } else {
             router.push("/dashboard/admin_rq"); // Vue locale (Terrain)
          }
          break;

        case 'ADMIN':
        case 'ADMIN_RQ':
        case 'RQ':
          router.push("/dashboard/admin_rq"); // Pilotage SMI 360°
          break;

        case 'PILOTE':
        case 'COPILOTE':
          if (processId) {
            router.push(`/dashboard/processus/cockpit/${processId}`); // Accès direct au cockpit
          } else {
            router.push("/dashboard/consultation"); // Fallback si pas de processus
          }
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
          router.push("/dashboard/admin_rq"); // Fallback sécurisé
      }
    } catch (err) {
      console.error("Erreur de routage Matrix:", err);
      setError(true);
    }
  }, [user, router]);

  if (error) {
    return (
      <div className="h-screen bg-[#0B0F1A] flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-white font-black text-2xl uppercase italic mb-4">Erreur de Trajectoire</h2>
        <p className="text-slate-500 text-xs mb-8 uppercase font-bold tracking-widest">Le noyau n&apos;a pas pu déterminer votre cockpit.</p>
        <button onClick={() => window.location.href = "/auth/login"} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-blue-500 transition-all">
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