/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
/**
 * ðŸ›¡ï¸ MODULE : SessionSync
 * -------------------------------------------------------------------------
 * FONCTION : Gardien de la continuitÃ© de session SDE (Sovereign Data Environment).
 * RÃ”LE : EmpÃªche la perte de contexte lors des rechargements navigateurs.
 * DESIGN : Overlay de sÃ©curitÃ© Qualisoft Elite.
 */

import { useAuth } from '@/core/providers/auth-provider';
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Loader2, ShieldCheck } from "lucide-react";

export default function SessionSync({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useAuth();
  const setLogin = useAuthStore((state) => state.setLogin);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // RÃ©cupÃ©ration automatique si le cookie NextAuth est valide mais que la RAM du Store est vide
    if (status === "authenticated" && user && !user) {
      console.log("ðŸ§¬ [RECOVERY] RÃ©hydratation de la session depuis le cookie scellÃ©...");
      setLogin({
        token: (session as any).accessToken || "",
        user: session.user as any
      });
    }
  }, [session, status, user, setLogin]);

  // Interface de chargement "Qualisoft Sovereign"
  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] text-white gap-6">
        <div className="relative">
            <Loader2 className="animate-spin text-blue-500" size={64} />
            <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-200" size={24} />
        </div>
        <div className="text-center">
            <p className="text-sm font-black uppercase tracking-[0.4em] animate-pulse italic">
                VÃ©rification IdentitÃ© Souveraine...
            </p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2">Noyau Matrix RD 2026</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}