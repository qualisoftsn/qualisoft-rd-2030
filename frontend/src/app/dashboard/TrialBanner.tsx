/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { Zap, ArrowRight, User, ShieldCheck, Fingerprint } from 'lucide-react';
import Link from 'next/link';
import { differenceInDays, startOfDay } from 'date-fns';

interface TrialBannerProps {
  user: any; // On reçoit l'utilisateur complet depuis le Layout
}

export default function TrialBanner({ user }: TrialBannerProps) {
  // 1. GARDE-FOU : Si pas d'utilisateur ou si la licence est déjà ACTIVE (payée), on n'affiche rien
  if (!user || user?.tenant?.T_SubscriptionStatus === 'ACTIVE') {
    return null;
  }

  // 2. CALCUL DÉRIVÉ (Sans useState = Zéro erreur de cascade)
  const endDateRaw = user?.tenant?.T_SubscriptionEndDate || user?.subscriptionEndDate;
  
  let daysLeft = 14;
  if (endDateRaw) {
    const end = startOfDay(new Date(endDateRaw));
    const now = startOfDay(new Date());
    const diff = differenceInDays(end, now);
    daysLeft = diff > 0 ? diff : 0;
  }

  const isUrgent = daysLeft <= 3;
  const isExpired = daysLeft === 0;

  // 3. PRÉPARATION DES DONNÉES D'IDENTITÉ
  const displayName = `${user.U_FirstName || user.firstName || ''} ${user.U_LastName || user.lastName || ''}`.trim() || "Utilisateur Élite";
  const displayRole = user.U_Role || user.role || 'USER';
  const displayId = (user.U_Id || user.id || '........').substring(0, 8);

  return (
    <div className={`py-2.5 px-8 shadow-2xl relative z-50 border-b border-white/5 transition-all duration-700 ${
      isUrgent 
      ? 'bg-linear-to-r from-red-950 via-red-900 to-black' 
      : 'bg-linear-to-r from-[#0B0F1A] via-blue-950 to-[#0B0F1A]'
    }`}>
      <div className="flex items-center justify-between max-w-full mx-auto italic">
        
        {/* SECTION GAUCHE : STATUT TRIAL */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg animate-pulse ${isUrgent ? 'bg-red-500 shadow-lg shadow-red-500/50' : 'bg-amber-500'}`}>
              <Zap size={14} className="text-white fill-white" />
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] font-black uppercase tracking-widest text-white leading-none">
                {isExpired ? (
                  <span className="text-red-400">🚨 Licence Expirée</span>
                ) : (
                  <>OFFRE TRIAL : <span className="text-amber-400">{daysLeft} JOURS RESTANTS</span></>
                )}
              </p>
            </div>
          </div>
          
          <div className="h-6 w-px bg-white/10 hidden sm:block"></div>
          
          <Link 
            href="/dashboard/settings/billing" 
            className="flex items-center gap-2 text-white hover:text-amber-400 no-underline text-[9px] font-black uppercase tracking-widest transition-all group"
          >
            Passer à l&apos;offre Élite <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* SECTION DROITE : IDENTITÉ SÉCURISÉE */}
        <div className="flex items-center gap-5">
          <div className="flex flex-col items-end border-r border-white/10 pr-5 leading-none">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-white">
              <User size={12} className="text-blue-500" /> {displayName}
            </div>
            
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`text-[8px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 text-white ${
                displayRole === 'ADMIN' ? 'bg-purple-600/80' : 'bg-blue-600/80'
              }`}>
                <ShieldCheck size={10} /> {displayRole}
              </span>
              <span className="text-[8px] text-slate-500 font-bold tracking-widest uppercase">ID: {displayId}</span>
            </div>
          </div>

          <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 shadow-inner">
            <Fingerprint 
              size={18} 
              className={displayRole === 'ADMIN' ? 'text-purple-400' : 'text-slate-700'} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}