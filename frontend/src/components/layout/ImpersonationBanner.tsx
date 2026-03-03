/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : ImpersonationBanner.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Barre d'alerte haute visibilité lors d'une session d'impersonation.
 * FONCTION : Rappel visuel et procédure de retour au compte Master.
 * RÉVISION : 03 Mars 2026 | 20:15 GMT
 */

"use client";

import React from 'react';
import { ShieldAlert, ZapOff, UserCircle, ArrowLeftCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ImpersonationBanner() {
  const router = useRouter();
  const { user, logout } = useAuthStore() as any;

  // 🛡️ Se déclenche uniquement si le flag 'isImpersonated' est présent dans le JWT/Store
  if (!user || !user.isImpersonated) return null;

  /**
   * ⚡ RUPTURE DU LIEN (Retour Master)
   * Pour un retour propre et sans erreur, on vide la session masquée 
   * et on redirige vers le login Matrix.
   */
  const handleExitMasquerade = () => {
    const tid = toast.loading("Rupture de la session d'impersonation...");
    
    // Nettoyage des sceaux
    document.cookie = "qualisoft_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    logout(); // Vide le store Zustand

    setTimeout(() => {
      toast.success("Retour au plancher Master effectué.", { id: tid });
      router.push('/auth/login'); // L'admin se reconnecte en Master
    }, 800);
  };

  return (
    <div className="fixed top-0 left-0 w-full z-9999 animate-in slide-in-from-top duration-500">
      <div className="bg-linear-to-r from-amber-600 via-red-600 to-amber-600 h-10 flex items-center justify-between px-6 shadow-2xl">
        
        {/* INFO GAUCHE */}
        <div className="flex items-center gap-3">
          <ShieldAlert size={16} className="text-white animate-pulse" />
          <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] m-0 italic">
            Mode Mascarade Actif <span className="mx-2 opacity-50">|</span> 
            Session : <span className="underline decoration-2 underline-offset-4">{user.U_Email}</span>
          </p>
        </div>

        {/* INFO CENTRE (Mise en garde) */}
        <div className="hidden lg:flex items-center gap-2">
          <span className="text-[9px] font-black text-white/80 uppercase tracking-widest italic">
            Attention : Toutes les actions sont enregistrées au nom du client.
          </span>
        </div>

        {/* ACTION DROITE */}
        <button 
          onClick={handleExitMasquerade}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border-none px-4 py-1.5 rounded-full transition-all cursor-pointer group"
        >
          <span className="text-[9px] font-black text-white uppercase tracking-widest italic">Quitter la session</span>
          <ZapOff size={14} className="text-white group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
}