/* eslint-disable react-hooks/set-state-in-effect */
//* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function TrialBanner() {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      const tenant = user.tenant;

      // ✅ Ne pas afficher si le compte est déjà actif (hors période d'essai)
      if (tenant?.T_SubscriptionStatus === 'ACTIVE') {
        setIsVisible(false);
        return;
      }

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

  if (!isVisible || daysLeft === null) return null;

  const isUrgent = daysLeft <= 3;
  const bgClass = isUrgent 
    ? "bg-gradient-to-r from-red-600 to-orange-600" 
    : "bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800";

  return (
    <div className={`${bgClass} text-white py-2.5 px-6 shadow-xl relative z-50 border-b border-white/10`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 animate-fade-in">
          <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-md">
            <Clock size={16} className={isUrgent ? "animate-pulse" : ""} />
          </div>
          <p className="text-sm font-black italic tracking-tight uppercase">
            Période d&apos;essai Qualisoft : 
            <span className="ml-2 bg-white text-blue-900 px-2 py-0.5 rounded-md font-black not-italic mx-1">
              {daysLeft} JOURS
            </span> 
            restants avant expiration.
          </p>
        </div>

        <Link 
          href="/dashboard/settings/billing" 
          className="group flex items-center gap-2 bg-white/10 hover:bg-white text-white hover:text-blue-900 border border-white/30 px-4 py-1.5 rounded-full transition-all duration-300 no-underline"
        >
          <span className="text-[10px] font-black uppercase italic tracking-widest">Activer ma Licence Elite</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}