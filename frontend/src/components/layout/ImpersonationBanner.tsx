//* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 🛰️ MODULE : ImpersonationBanner.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Barre d'alerte haute visibilité lors d'une session d'impersonation.
 * FONCTION : Rappel visuel et procédure de retour au compte Master.
 * SÉCURITÉ : Zustand Only.
 * RÉVISION : 09 Mars 2026 | 17:05 GMT
 * -------------------------------------------------------------------------
 */

import React from 'react';
import { ShieldAlert, ZapOff } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ImpersonationBanner() {
  const router = useRouter();
  const { user, logout } = useAuthStore() as any;

  if (!user || !user.isImpersonated) return null;

  const handleExitMasquerade = () => {
    const tid = toast.loading("Rupture de la session d'impersonation...");
    document.cookie = "qualisoft_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    logout(); 

    setTimeout(() => {
      toast.success("Retour au plancher Master effectué.", { id: tid });
      router.push('/auth/login');
    }, 800);
  };

  return (
    <div className="fixed top-0 left-0 w-full z-9999 animate-in slide-in-from-top duration-500">
      <div className="bg-linear-to-r from-amber-600 via-red-600 to-amber-600 h-10 flex items-center justify-between px-6 shadow-2xl">
        
        <div className="flex items-center gap-3">
          <ShieldAlert size={16} className="text-white animate-pulse" />
          <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] m-0 italic truncate max-w-50 md:max-w-none">
            Mode Mascarade <span className="mx-2 opacity-50 hidden sm:inline">|</span> 
            <span className="hidden sm:inline">Session : <span className="underline decoration-2 underline-offset-4">{user.U_Email}</span></span>
          </p>
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <span className="text-[9px] font-black text-white/80 uppercase tracking-widest italic">
            Attention : Toutes les actions sont enregistrées au nom du client.
          </span>
        </div>

        <button 
          onClick={handleExitMasquerade}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border-none px-4 py-1.5 rounded-full transition-all cursor-pointer group shrink-0"
        >
          <span className="hidden sm:inline text-[9px] font-black text-white uppercase tracking-widest italic">Quitter</span>
          <ZapOff size={14} className="text-white group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
}