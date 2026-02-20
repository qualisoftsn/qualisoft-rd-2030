/* eslint-disable react-hooks/set-state-in-effect */
'use client';

/**
 * 🛰️ MODULE : TRIAL BANNER (SCELLAGE TEMPOREL)
 * -------------------------------------------------------------------------
 * FONCTION : Monitoring visuel de la période d'essai du Tenant.
 * RÔLE : Alerter l'organisation sur l'imminence de l'expiration du service.
 * ISOLATION : Basé sur les métadonnées scellées dans l'objet Tenant de la session.
 */

import React, { useState, useEffect } from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function TrialBanner() {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 🔍 Récupération de l'identité matricielle stockée
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      const tenant = user.tenant;

      // 🛡️ CLAUSE DE SORTIE : Si l'abonnement est déjà "ACTIVE", la bannière s'efface
      if (tenant?.T_SubscriptionStatus === 'ACTIVE') {
        setIsVisible(false);
        return;
      }

      // ⏱️ CALCUL DU DÉLAI DE GRÂCE
      if (tenant?.T_SubscriptionEndDate) {
        const end = new Date(tenant.T_SubscriptionEndDate);
        const now = new Date();
        const diff = end.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        
        setDaysLeft(days > 0 ? days : 0);
        setIsVisible(true);
      }
    }
  }, []);

  // Rendu conditionnel strict
  if (!isVisible || daysLeft === null) return null;

  // 🚨 LOGIQUE D'URGENCE (Phase critique : <= 3 jours)
  const isUrgent = daysLeft <= 3;
  const bgClass = isUrgent 
    ? "bg-gradient-to-r from-red-600 to-orange-600 shadow-red-900/20" 
    : "bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 shadow-blue-900/20";

  return (
    <div className={`${bgClass} text-white py-3 px-6 shadow-2xl relative z-50 border-b border-white/10 animate-in slide-in-from-top duration-500`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* INDICATEUR DE TEMPS */}
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/10">
            <Clock size={18} className={isUrgent ? "animate-pulse text-white" : "text-blue-200"} />
          </div>
          <p className="text-sm font-black italic tracking-tight uppercase leading-none">
            Période d&apos;essai Qualisoft : 
            <span className="ml-3 bg-white text-slate-900 px-3 py-1 rounded-lg font-black not-italic mx-1 shadow-inner">
              {daysLeft} JOURS
            </span> 
            restants avant basculement en mode lecture seule.
          </p>
        </div>

        {/* CTA D'ACTIVATION ELITE */}
        <Link 
          href="/dashboard/settings/billing" 
          className="group flex items-center gap-3 bg-white/10 hover:bg-white text-white hover:text-blue-900 border border-white/30 px-6 py-2 rounded-2xl transition-all duration-500 no-underline shadow-lg"
        >
          <span className="text-[10px] font-black uppercase italic tracking-widest">Activer ma Licence Elite</span>
          <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-300" />
        </Link>
      </div>
    </div>
  );
}