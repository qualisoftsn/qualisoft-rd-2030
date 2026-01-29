/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Clock, AlertTriangle, Zap, X } from 'lucide-react';
import apiClient from '@/core/api/api-client';

interface TrialData {
  daysLeft: number;
  hoursLeft: number;
  isExpired: boolean;
  subscriptionStatus: 'TRIAL' | 'ACTIVE' | 'EXPIRED';
}

export default function TrialBanner() {
  const [trialData, setTrialData] = useState<TrialData | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Vérifier si on est sur une page trial ou dashboard
    if (pathname.startsWith('/essai')) return;

    const checkTrialStatus = async () => {
      try {
        // Appel API pour vérifier le statut du tenant courant
        const res = await apiClient.get('/tenant/trial-status');
        setTrialData(res.data);
        
        // Si expiré, redirection forcée
        if (res.data.isExpired) {
          router.push('/essai/expire');
        }
      } catch (err) {
        // Pas en mode trial ou non connecté
        setTrialData(null);
      } finally {
        setLoading(false);
      }
    };

    checkTrialStatus();
    // Rafraîchir toutes les heures
    const interval = setInterval(checkTrialStatus, 3600000);
    return () => clearInterval(interval);
  }, [pathname, router]);

  if (loading || !trialData || trialData.subscriptionStatus !== 'TRIAL' || !isVisible) {
    return null;
  }

  const isCritical = trialData.daysLeft <= 3;
  const isWarning = trialData.daysLeft <= 7;

  return (
    <div className={`fixed top-0 left-0 right-0 z-100 transition-all duration-500 ${
      isCritical 
        ? 'bg-red-500/20 border-b border-red-500/40 animate-pulse' 
        : isWarning 
          ? 'bg-orange-500/10 border-b border-orange-500/30' 
          : 'bg-blue-500/10 border-b border-blue-500/20'
    } backdrop-blur-xl`}>
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-xl ${
            isCritical ? 'bg-red-500 text-white' : 
            isWarning ? 'bg-orange-500 text-white' : 
            'bg-blue-500/20 text-blue-400'
          }`}>
            {isCritical ? <AlertTriangle size={18} /> : <Zap size={18} />}
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`text-[11px] font-black uppercase tracking-widest ${
              isCritical ? 'text-red-400' : 
              isWarning ? 'text-orange-400' : 
              'text-blue-400'
            }`}>
              {isCritical ? '⚠️ Essai critique' : 'Essai gratuit activé'}
            </span>
            
            <div className="h-4 w-px bg-white/10" />
            
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-300">
              <Clock size={14} className={isCritical ? 'text-red-400' : 'text-slate-400'} />
              <span>
                {trialData.daysLeft > 0 
                  ? `${trialData.daysLeft} jour${trialData.daysLeft > 1 ? 's' : ''} restant${trialData.daysLeft > 1 ? 's' : ''}`
                  : `${trialData.hoursLeft} heure${trialData.hoursLeft > 1 ? 's' : ''}`
                }
              </span>
            </div>

            {isCritical && (
              <span className="hidden md:inline text-[10px] text-red-400 font-black uppercase animate-pulse">
                • Vos données seront supprimées dans {trialData.hoursLeft}h
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/subscription/upgrade')}
            className={`${
              isCritical 
                ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20' 
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
            } text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2`}
          >
            Passer en Pro
          </button>
          
          <button 
            onClick={() => setIsVisible(false)}
            className="text-slate-500 hover:text-white transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Barre de progression visuelle */}
      <div className="h-0.5 w-full bg-slate-800">
        <div 
          className={`h-full transition-all duration-1000 ${
            isCritical ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-blue-500'
          }`}
          style={{ 
            width: `${Math.max(0, (trialData.daysLeft / 14) * 100)}%` 
          }}
        />
      </div>
    </div>
  );
}