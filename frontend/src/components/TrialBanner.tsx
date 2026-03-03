/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * ⏳ MODULE : TrialBanner.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Monitoring de la licence et barrière de sécurité temporelle.
 * FONCTION : Calcul de SLA et redirection automatique en cas d'expiration.
 * RÉVISION : 03 Mars 2026 | 00:05 GMT
 */

"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Clock, AlertTriangle, Zap, X, ShieldCheck, Crown } from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';

// --- 🔱 TYPAGES MATRIX ---
interface TrialData {
  daysLeft: number;
  hoursLeft: number;
  isExpired: boolean;
  subscriptionStatus: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
}

export default function TrialBanner({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const [trialData, setTrialData] = useState<TrialData | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore() as any;

  /**
   * 📡 PROTOCOLE DE VÉRIFICATION KERNEL
   * Interrogation directe de l'API pour valider l'intégrité de la licence.
   */
  useEffect(() => {
    if (!isAuthenticated || pathname?.startsWith('/auth') || isSuperAdmin) {
      setLoading(false);
      return;
    }

    const checkTrialStatus = async () => {
      try {
        const res = await apiClient.get<TrialData>('/tenant/trial-status');
        setTrialData(res.data);
        
        // ⛔ ÉJECTION SI EXPIRATION SCELLÉE
        if (res.data.isExpired || res.data.subscriptionStatus === 'EXPIRED') {
          router.replace('/auth/expired'); 
        }
      } catch (err) {
        console.error("❌ SENTINELLE : Échec de synchronisation de licence.");
      } finally {
        setLoading(false);
      }
    };

    checkTrialStatus();
    const interval = setInterval(checkTrialStatus, 3600000); // Check horaire
    return () => clearInterval(interval);
  }, [pathname, router, isSuperAdmin, isAuthenticated]);

  // --- 🎨 LOGIQUE VISUELLE ÉLITE ---
  const status = useMemo(() => {
    if (!trialData) return null;
    return {
      isCritical: trialData.daysLeft <= 3,
      isWarning: trialData.daysLeft <= 7 && trialData.daysLeft > 3,
      progress: Math.min(100, Math.max(0, 100 - (trialData.daysLeft / 14) * 100))
    };
  }, [trialData]);

  if (loading || !isVisible || !trialData || trialData.subscriptionStatus === 'ACTIVE') {
    return null;
  }

  // 🛡️ MODE SOUVERAIN (SUPER-ADMIN)
  if (isSuperAdmin) {
    return (
      <div className="relative z-100 bg-linear-to-r from-amber-500 to-amber-700 text-slate-900 h-12 flex items-center justify-center px-8 shadow-2xl border-b border-amber-400/50 italic font-sans">
        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-1000">
          <Crown size={18} strokeWidth={3} />
          <p className="text-[11px] font-black uppercase tracking-[0.5em] leading-none m-0">
            Sovereign Mode — Accès Matriciel RD-2026 Illimité
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative z-100 transition-all duration-1000 w-full font-sans italic border-b border-white/10 shadow-4xl
      ${status?.isCritical ? 'bg-linear-to-r from-red-600 to-orange-700' : 
        status?.isWarning ? 'bg-linear-to-r from-orange-500 to-amber-600' : 
        'bg-[#0B0F1A]'}`}>
      
      <div className="max-w-7xl mx-auto px-10 py-4 flex flex-col md:flex-row justify-between items-center text-white gap-6">
        
        {/* 🚨 INDICATEUR DE COMPTE À REBOURS */}
        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-xl border border-white/10 shadow-inner group-hover:rotate-12 transition-transform">
            {status?.isCritical ? (
              <AlertTriangle size={20} className="animate-pulse text-white" />
            ) : (
              <Zap size={20} className="text-amber-300 animate-bounce" />
            )}
          </div>
          
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/70 mb-2 leading-none">
              {status?.isCritical ? 'Alerte : Rupture de service imminente' : 'Période d\'essai Qualisoft Elite'}
            </span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-sm font-black uppercase tracking-tighter">
                <Clock size={16} className={status?.isCritical ? "text-white" : "text-amber-400"} />
                <span className="bg-black/20 px-4 py-1.5 rounded-xl border border-white/5">
                  {trialData.daysLeft} jours restants
                </span>
              </div>
              {status?.isCritical && (
                <span className="text-[9px] bg-white text-red-600 px-3 py-1 rounded-lg font-black animate-pulse tracking-widest uppercase">
                  Action Requise
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 🚀 ACTIONS DE RÉGULARISATION */}
        <div className="flex items-center gap-5 shrink-0">
          <button 
            onClick={() => router.push('/dashboard/settings/billing')}
            className="bg-white text-slate-950 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-blue-600 hover:text-white hover:scale-105 shadow-4xl border-none cursor-pointer flex items-center gap-3 active:scale-95"
          >
            <ShieldCheck size={16} /> Débloquer la Licence Full
          </button>
          
          <button 
            onClick={() => setIsVisible(false)} 
            className="text-white/40 hover:text-white transition-all bg-transparent border-none cursor-pointer p-2 hover:bg-white/10 rounded-full"
            aria-label="Ignorer"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* 📊 BARRE DE PROGRESSION KERNEL */}
      <div className="absolute bottom-0 left-0 h-1.5 w-full bg-black/40">
        <div 
          className={`h-full transition-all duration-2000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.3)]
            ${status?.isCritical ? 'bg-white' : status?.isWarning ? 'bg-amber-400' : 'bg-blue-500'}`}
          style={{ width: `${status?.progress}%` }}
        />
      </div>

      <style jsx>{`
        div {
          animation: slideDown 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}