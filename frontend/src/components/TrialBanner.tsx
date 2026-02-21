/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * ⏳ MODULE : TRIAL BANNER (PILOTAGE CONTRACTUEL)
 * -------------------------------------------------------------------------
 * FONCTION : Monitoring en temps réel de la durée de l'instance.
 * RÔLE : Informer l'utilisateur de l'état de sa licence scellée.
 */

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Clock, AlertTriangle, Zap, X, ShieldCheck } from 'lucide-react';
import apiClient from '@/core/api/api-client';

interface TrialData {
  daysLeft: number;
  hoursLeft: number;
  isExpired: boolean;
  subscriptionStatus: 'TRIAL' | 'ACTIVE' | 'EXPIRED';
}

interface TrialBannerProps {
  user: any; 
  isSuperAdmin: boolean;
}

export default function TrialBanner({ user, isSuperAdmin }: TrialBannerProps) {
  const [trialData, setTrialData] = useState<TrialData | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    // Ne rien afficher sur les pages de login/inscription ou pour les super-admins sans trial
    if (pathname.startsWith('/essai') || (isSuperAdmin && !trialData)) {
      setLoading(false);
      return;
    }

    const checkTrialStatus = async () => {
      try {
        const res = await apiClient.get('/tenant/trial-status');
        setTrialData(res.data);
        
        if (res.data.isExpired) {
          router.push('/essai/expire');
        }
      } catch (err) {
        setTrialData(null);
      } finally {
        setLoading(false);
      }
    };

    checkTrialStatus();
    const interval = setInterval(checkTrialStatus, 3600000); // Check horaire
    return () => clearInterval(interval);
  }, [pathname, router, isSuperAdmin]);

  if (loading || !isVisible || !pathname) return null;

  // 🛡️ AFFICHAGE MODE SUPER-ADMIN (LE GROWN)
  if (isSuperAdmin && !trialData) {
    return (
      <div className="fixed top-0 left-0 right-0 z-110 bg-linear-to-r from-amber-500 to-amber-700 text-white h-12 flex items-center justify-center px-6 shadow-2xl border-b border-white/20 italic">
        <div className="flex items-center gap-4">
          <CrownIcon size={20} />
          <p className="text-[11px] font-black uppercase tracking-[0.3em] leading-none">
            Mode Super Administrateur Qualisoft — Accès Matriciel Illimité
          </p>
        </div>
      </div>
    );
  }

  if (!trialData || trialData.subscriptionStatus !== 'TRIAL') return null;

  const isCritical = trialData.daysLeft <= 3;
  const isWarning = trialData.daysLeft <= 7;

  return (
    <div className={`fixed top-0 left-0 right-0 z-110 transition-all duration-700 ${
      isCritical ? 'bg-red-600 shadow-red-900/40' : 
      isWarning ? 'bg-orange-500 shadow-orange-900/30' : 
      'bg-slate-900 shadow-2xl'
    } italic font-sans`}>
      <div className="max-w-7xl mx-auto px-8 py-3.5 flex justify-between items-center text-white">
        <div className="flex items-center gap-6">
          <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md animate-pulse">
            {isCritical ? <AlertTriangle size={20} /> : <Zap size={20} />}
          </div>
          
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] leading-none mb-1">
              {isCritical ? '⚠️ Alerte Master : Instance Critique' : 'Période d&apos;essai Qualisoft'}
            </span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase opacity-70">
                <Clock size={12} />
                <span>{trialData.daysLeft} jours restants</span>
              </div>
              {isCritical && <span className="text-[8px] bg-white text-red-600 px-2 py-0.5 rounded font-black animate-bounce">Backup Recommandé</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.push('/subscription/upgrade')}
            className="bg-white text-slate-950 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 shadow-xl border-none cursor-pointer"
          >
            Activer la Licence Pro
          </button>
          <button onClick={() => setIsVisible(false)} className="text-white/50 hover:text-white transition-all bg-transparent border-none cursor-pointer">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Barre de progression souveraine */}
      <div className="h-1 w-full bg-black/20">
        <div 
          className="h-full bg-white/40 transition-all duration-1000" 
          style={{ width: `${Math.max(5, (trialData.daysLeft / 14) * 100)}%` }}
        />
      </div>
    </div>
  );
}

function CrownIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
  );
}