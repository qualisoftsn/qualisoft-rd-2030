/* eslint-disable @typescript-eslint/no-explicit-any */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * ⏳ MODULE : TRIAL BANNER SOUVERAIN (PILOTAGE CONTRACTUEL)
 * -------------------------------------------------------------------------
 * FONCTION : Monitoring en temps réel de la durée de vie de l'instance SDE.
 * RÔLE : Informer l'utilisateur de l'état de sa licence.
 * SÉCURITÉ : Interrogation directe du Kernel (API) pour éviter la triche locale.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 00:35 GMT
 */

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Clock, AlertTriangle, Zap, X, ShieldCheck } from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';

// --- TYPAGES ---
interface TrialData {
  daysLeft: number;
  hoursLeft: number;
  isExpired: boolean;
  subscriptionStatus: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
}

interface TrialBannerProps {
  isSuperAdmin: boolean;
  user?: any; // Maintenu pour rétrocompatibilité si passé en prop depuis le Layout
}

export default function TrialBanner({ isSuperAdmin }: TrialBannerProps) {
  const [trialData, setTrialData] = useState<TrialData | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const pathname = usePathname();

  // 🛡️ Récupération de l'état global via Zustand
  const { isAuthenticated } = useAuthStore() as any;

  useEffect(() => {
    // Ne pas exécuter sur les pages publiques ou si non connecté
    if (!pathname || !isAuthenticated || pathname.startsWith('/auth')) {
      setLoading(false);
      return;
    }

    // Le Super Admin n'est pas soumis aux règles de Trial
    if (isSuperAdmin) {
      setLoading(false);
      return;
    }

    const checkTrialStatus = async () => {
      try {
        // Interrogation sécurisée via notre intercepteur corrigé
        const res = await apiClient.get<TrialData>('/tenant/trial-status');
        setTrialData(res.data);
        
        // ⛔ BARRIÈRE D'EXPIRATION
        if (res.data.isExpired || res.data.subscriptionStatus === 'EXPIRED') {
          router.replace('/essai/expire'); // Force la redirection vers la page de blocage
        }
      } catch (err) {
        console.error("❌ Impossible de vérifier le statut de la licence.");
      } finally {
        setLoading(false);
      }
    };

    checkTrialStatus();
    
    // Vérification silencieuse en arrière-plan (Toutes les 60 minutes)
    const interval = setInterval(checkTrialStatus, 3600000); 
    return () => clearInterval(interval);
  }, [pathname, router, isSuperAdmin, isAuthenticated]);

  // Si en cours de chargement, masqué par l'utilisateur, ou abonnement actif/payé
  if (loading || !isVisible || !trialData || trialData.subscriptionStatus === 'ACTIVE') {
    return null;
  }

  // 🛡️ AFFICHAGE MODE SUPER-ADMIN (LE GROWN)
  if (isSuperAdmin) {
    return (
      <div className="relative z-50 bg-linear-to-r from-amber-500 to-amber-700 text-slate-900 h-10 flex items-center justify-center px-6 shadow-md border-b border-amber-400/30 italic">
        <div className="flex items-center gap-3">
          <CrownIcon size={16} />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] leading-none m-0">
            Sovereign Mode — Accès Matriciel Illimité
          </p>
        </div>
      </div>
    );
  }

  // --- LOGIQUE VISUELLE DU TRIAL ---
  const isCritical = trialData.daysLeft <= 3;
  const isWarning = trialData.daysLeft <= 7 && trialData.daysLeft > 3;

  return (
    <div className={`relative z-50 transition-all duration-700 w-full ${
      isCritical ? 'bg-linear-to-r from-red-600 to-orange-600 shadow-red-900/40' : 
      isWarning ? 'bg-linear-to-r from-orange-500 to-amber-500 shadow-orange-900/30' : 
      'bg-linear-to-r from-slate-900 to-indigo-950 shadow-xl'
    } italic font-sans overflow-hidden border-b border-white/10`}>
      
      <div className="max-w-7xl mx-auto px-8 py-3 flex flex-col md:flex-row justify-between items-center text-white gap-4">
        
        {/* INDICATEUR D'ÉTAT */}
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md shrink-0 border border-white/10">
            {isCritical ? <AlertTriangle size={18} className="animate-pulse" /> : <Zap size={18} className="text-amber-300" />}
          </div>
          
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] leading-none mb-1 text-white/80">
              {isCritical ? '⚠️ Alerte : Fin imminente du service' : 'Période d\'essai Qualisoft'}
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase">
                <Clock size={12} className={isCritical ? "text-white" : "text-amber-300"} />
                <span className="bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                  {trialData.daysLeft} jours restants
                </span>
              </div>
              {isCritical && (
                <span className="text-[8px] bg-white text-red-600 px-2 py-0.5 rounded font-black animate-pulse shadow-inner uppercase tracking-widest">
                  Action Requise
                </span>
              )}
            </div>
          </div>
        </div>

        {/* APPELS À L'ACTION */}
        <div className="flex items-center gap-4 shrink-0">
          <button 
            onClick={() => router.push('/dashboard/settings/billing')}
            className="bg-white text-slate-950 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 shadow-xl border-none cursor-pointer flex items-center gap-2"
          >
            <ShieldCheck size={14} /> Débloquer la Licence
          </button>
          
          <button 
            onClick={() => setIsVisible(false)} 
            className="text-white/50 hover:text-white transition-all bg-transparent border-none cursor-pointer p-1 hover:bg-white/10 rounded-lg"
            aria-label="Fermer la bannière"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* BARRE DE PROGRESSION SOUVERAINE (Indique le temps écoulé sur 14 jours standards) */}
      <div className="absolute bottom-0 left-0 h-1 w-full bg-black/30">
        <div 
          className={`h-full transition-all duration-1000 ${isCritical ? 'bg-red-400' : isWarning ? 'bg-amber-400' : 'bg-indigo-400'}`}
          // Calcul inverse : si 14 jours, barre vide (0%). Si 0 jours, barre pleine (100%).
          style={{ width: `${Math.min(100, Math.max(0, 100 - (trialData.daysLeft / 14) * 100))}%` }}
        />
      </div>
    </div>
  );
}

// Composant SVG interne
function CrownIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
  );
}