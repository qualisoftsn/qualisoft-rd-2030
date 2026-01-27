"use client";

import React, { useEffect, useState } from 'react';
import { 
  Zap, 
  ArrowRight, 
  User, 
  Fingerprint, 
  AlertOctagon, 
  Crown, 
  Clock, 
  Mail,
  CheckCircle,
  Lock
} from 'lucide-react';
import Link from 'next/link';
import { differenceInDays, startOfDay, parseISO, isPast, isToday } from 'date-fns';
import apiClient from '@/core/api/api-client';

// --- INTERFACES STRICTES ---
interface Tenant {
  T_Id?: string;
  T_SubscriptionStatus: 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'SUSPENDED';
  T_SubscriptionEndDate?: string;
  T_Plan?: string;
}

interface UserProfile {
  U_FirstName?: string;
  U_LastName?: string;
  U_Email?: string;
  U_Role?: string;
  U_Id?: string;
  U_Tenant?: Tenant;
}

type TrialPhase = 'NORMAL' | 'WARNING_7D' | 'URGENT_3D' | 'CRITICAL_12D' | 'EXPIRED';

export default function TrialBanner({ user, onReadOnlyChange }: { 
  user: UserProfile | null; 
  onReadOnlyChange?: (isReadOnly: boolean) => void;
}) {
  const [isActivating, setIsActivating] = useState(false);
  const [activationSent, setActivationSent] = useState(false);
  const [phase, setPhase] = useState<TrialPhase>('NORMAL');

  if (!user) return null;

  const tenant = user?.U_Tenant;
  const isMaster = user?.U_Role === 'SUPER_ADMIN';
  const subscriptionStatus = tenant?.T_SubscriptionStatus || 'TRIAL';
  
  // 👑 Le Master n'est pas soumis aux restrictions
  if (subscriptionStatus === 'ACTIVE' && !isMaster) return null;

  const endDateRaw = tenant?.T_SubscriptionEndDate;
  let daysLeft = 14; 
  let endDate: Date | null = null;

  if (endDateRaw) {
    try {
      endDate = startOfDay(parseISO(endDateRaw));
      const now = startOfDay(new Date());
      const diff = differenceInDays(endDate, now);
      daysLeft = diff > 0 ? diff : 0;
    } catch { 
      daysLeft = 0; 
    }
  }

  // Détermination de la phase pour affichage et actions
  useEffect(() => {
    let currentPhase: TrialPhase = 'NORMAL';
    
    if (subscriptionStatus === 'EXPIRED' || daysLeft === 0) {
      currentPhase = 'EXPIRED';
    } else if (daysLeft <= 3) {
      currentPhase = 'URGENT_3D';
    } else if (daysLeft <= 7) {
      currentPhase = 'WARNING_7D';
    }
    
    // Vérification spéciale pour J-12 (alerte mail)
    if (daysLeft === 2 && subscriptionStatus === 'TRIAL') {
      currentPhase = 'CRITICAL_12D';
      trigger12DaysAlert();
    }

    setPhase(currentPhase);
    
    // Notifier le parent si mode lecture seule
    const isReadOnly = subscriptionStatus === 'EXPIRED' || daysLeft === 0;
    onReadOnlyChange?.(isReadOnly);
    
    // Déclencher l'alerte J-7 si nécessaire (une seule fois par session)
    if (daysLeft === 7 && typeof window !== 'undefined') {
      const alertSent = sessionStorage.getItem('trial-7days-alert');
      if (!alertSent) {
        trigger7DaysAlert();
        sessionStorage.setItem('trial-7days-alert', 'true');
      }
    }
  }, [daysLeft, subscriptionStatus]);

  // Envoi alerte J-7
  const trigger7DaysAlert = async () => {
    try {
      await apiClient.post('/notifications/trial-reminder', {
        daysLeft: 7,
        tenantId: tenant?.T_Id,
        email: user.U_Email,
        type: 'MID_TRIAL'
      });
    } catch (e) {
      console.error('Erreur envoi alerte J-7:', e);
    }
  };

  // Envoi alerte J-12
  const trigger12DaysAlert = async () => {
    try {
      await apiClient.post('/notifications/trial-reminder', {
        daysLeft: 2, // J-12 = 2 jours restants
        tenantId: tenant?.T_Id,
        email: user.U_Email,
        type: 'CRITICAL_12D'
      });
    } catch (e) {
      console.error('Erreur envoi alerte J-12:', e);
    }
  };

  // Demande d'activation (envoi mail à ab.qualisoft.sn)
  const handleActivationRequest = async () => {
    if (!tenant?.T_Id || !user.U_Email) return;
    
    setIsActivating(true);
    try {
      await apiClient.post('/billing/request-activation', {
        tenantId: tenant.T_Id,
        userEmail: user.U_Email,
        userName: `${user.U_FirstName} ${user.U_LastName}`,
        currentPlan: tenant.T_Plan,
        daysLeft: daysLeft
      });
      setActivationSent(true);
    } catch (error) {
      console.error('Erreur demande activation:', error);
      alert('Erreur lors de l\'envoi de la demande. Veuillez réessayer.');
    } finally {
      setIsActivating(false);
    }
  };

  const isExpired = phase === 'EXPIRED';
  const isCritical = phase === 'CRITICAL_12D' || phase === 'URGENT_3D';
  const isWarning = phase === 'WARNING_7D';

  // Styles dynamiques basés sur la phase
  const bgStyles = {
    EXPIRED: 'bg-red-600',
    CRITICAL_12D: 'bg-gradient-to-r from-red-900 via-red-800 to-black',
    URGENT_3D: 'bg-gradient-to-r from-red-950 to-black',
    WARNING_7D: 'bg-gradient-to-r from-amber-900/80 to-black',
    NORMAL: 'bg-gradient-to-r from-[#0B0F1A] via-blue-950 to-[#0B0F1A]'
  };

  return (
    <div className={`py-3 px-8 shadow-2xl relative z-50 border-b border-white/5 transition-all duration-700 font-sans ${bgStyles[phase]}`}>
      <div className="flex flex-col lg:flex-row items-center justify-between max-w-full mx-auto italic gap-4">
        
        {/* Section Gauche : Info Trial */}
        <div className="flex items-center gap-6 flex-wrap justify-center lg:justify-start">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isExpired ? 'bg-white text-red-600' : isCritical ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`}>
              {isExpired ? <Lock size={16} /> : <Zap size={16} className="text-white fill-white" />}
            </div>
            <div className="flex flex-col">
              <p className="text-[11px] font-black uppercase tracking-widest text-white leading-none">
                {isExpired ? (
                  <span className="animate-in fade-in flex items-center gap-2">
                    <Lock size={14} /> ESSAI TERMINÉ : MODE LECTURE SEULE ACTIVÉ
                  </span>
                ) : (
                  <>PÉRIODE D&apos;ESSAI : <span className={isCritical ? 'text-red-400' : 'text-amber-400'}>{daysLeft} JOURS RESTANTS</span></>
                )}
              </p>
              {isCritical && !isExpired && (
                <p className="text-[9px] text-red-300 mt-1">
                  ⚠️ Votre accès sera limité dans {daysLeft} jour{daysLeft > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          
          <div className="h-6 w-px bg-white/10 hidden sm:block"></div>
          
          <Link 
            href="/dashboard/settings/billing" 
            className={`flex items-center gap-2 text-white hover:text-amber-400 text-[10px] font-black uppercase tracking-widest transition-all group ${isExpired ? 'underline decoration-white/50' : ''}`}
          >
            {isExpired ? "Régulariser ma licence" : "Voir les offres Qualisoft"} 
            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Section Centre : Bouton Activation (visible si pas expiré) */}
        {!isExpired && (
          <div className="flex items-center gap-4">
            {activationSent ? (
              <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase">
                <CheckCircle size={14} />
                Demande envoyée à Qualisoft
              </div>
            ) : (
              <button
                onClick={handleActivationRequest}
                disabled={isActivating}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-amber-400 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isActivating ? (
                  <Clock className="animate-spin" size={14} />
                ) : (
                  <Crown size={14} className="text-amber-600" />
                )}
                {isActivating ? 'Envoi...' : 'Activer mon compte'}
              </button>
            )}
          </div>
        )}

        {/* Section Droite : User Info */}
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

      {/* Message additionnel pour J-12 et J-7 */}
      {(phase === 'CRITICAL_12D' || phase === 'WARNING_7D') && (
        <div className="mt-2 text-center">
          <p className="text-[9px] text-white/80 font-medium">
            {phase === 'WARNING_7D' 
              ? "📧 Un email récapitulatif vous a été envoyé avec les étapes pour activer votre compte."
              : "📧 Alerte envoyée à votre équipe commerciale. Réponse sous 24h ouvrées garantie."}
          </p>
        </div>
      )}
    </div>
  );
}