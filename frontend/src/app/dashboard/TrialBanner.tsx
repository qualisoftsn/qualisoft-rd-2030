"use client";

import React from 'react';
import { Zap, ArrowRight, User, Fingerprint, AlertOctagon, Crown } from 'lucide-react';
import Link from 'next/link';
import { differenceInDays, startOfDay, parseISO } from 'date-fns';

// --- INTERFACES STRICTES ---
interface Tenant {
  T_SubscriptionStatus: 'ACTIVE' | 'TRIAL' | 'EXPIRED';
  T_SubscriptionEndDate?: string;
}

interface UserProfile {
  U_FirstName?: string;
  U_LastName?: string;
  U_Role?: string;
  U_Id?: string;
  U_Tenant?: Tenant;
}

export default function TrialBanner({ user }: { user: UserProfile | null }) {
  if (!user) return null;

  const tenant = user?.U_Tenant;
  const isMaster = user?.U_Role === 'SUPER_ADMIN';
  const subscriptionStatus = tenant?.T_SubscriptionStatus || 'TRIAL';
  
  // 👑 Le Master n'est pas soumis à la bannière de restriction
  if (subscriptionStatus === 'ACTIVE' && !isMaster) return null;

  const endDateRaw = tenant?.T_SubscriptionEndDate;
  let daysLeft = 14; 

  if (endDateRaw) {
    try {
      const end = startOfDay(parseISO(endDateRaw));
      const now = startOfDay(new Date());
      const diff = differenceInDays(end, now);
      daysLeft = diff > 0 ? diff : 0;
    } catch { daysLeft = 0; }
  }

  const isExpired = subscriptionStatus === 'TRIAL' && daysLeft === 0;
  const isUrgent = daysLeft <= 3 && !isExpired;

  return (
    <div className={`py-2.5 px-8 shadow-2xl relative z-50 border-b border-white/5 transition-all duration-700 font-sans ${
      isExpired ? 'bg-red-600' : isUrgent ? 'bg-linear-to-r from-red-950 to-black' : 'bg-linear-to-r from-[#0B0F1A] via-blue-950 to-[#0B0F1A]'
    }`}>
      <div className="flex items-center justify-between max-w-full mx-auto italic">
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg ${isExpired ? 'bg-white text-red-600' : 'bg-amber-500 animate-pulse'}`}>
              {isExpired ? <AlertOctagon size={14} /> : <Zap size={14} className="text-white fill-white" />}
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] font-black uppercase tracking-widest text-white leading-none">
                {isExpired ? (
                  <span className="animate-in fade-in">🚨 ESSAI TERMINÉ : MODE LECTURE SEULE ACTIF</span>
                ) : (
                  <>PÉRIODE D&apos;ESSAI : <span className="text-amber-400">{daysLeft} JOURS RESTANTS</span></>
                )}
              </p>
            </div>
          </div>
          
          <div className="h-6 w-px bg-white/10 hidden sm:block"></div>
          
          <Link 
            href="/dashboard/settings/billing" 
            className={`flex items-center gap-2 text-white hover:text-amber-400 text-[9px] font-black uppercase tracking-widest transition-all group ${isExpired ? 'underline decoration-white/50' : ''}`}
          >
            {isExpired ? "Régulariser ma licence Élite" : "Activer la licence Élite RD 2030"} 
            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex flex-col items-end border-r border-white/10 pr-5 leading-none">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-white">
              {isMaster && <Crown size={12} className="text-amber-400" />}
              <User size={12} className="text-blue-500" /> {user.U_FirstName} {user.U_LastName}
            </div>
            <span className={`text-[8px] font-black px-2 py-0.5 rounded-md mt-1 text-white ${isMaster ? 'bg-amber-600' : 'bg-blue-600'}`}>
               {user.U_Role}
            </span>
          </div>
          <Fingerprint size={18} className={isMaster ? 'text-amber-400' : 'text-slate-700'} />
        </div>
      </div>
    </div>
  );
}