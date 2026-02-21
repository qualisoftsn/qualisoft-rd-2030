/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * ⏳ HOOK : USE TRIAL STATUS (MOTEUR DE VERROUILLAGE SDE)
 * -------------------------------------------------------------------------
 * FONCTION : Évaluation chronologique de la validité du Tenant actif.
 * RÔLE : Déclencher les phases de restriction (WARNING, CRITICAL, EXPIRED) 
 * et basculer l'interface en mode "Lecture Seule" pour protéger l'intégrité.
 * ISOLATION : Base son calcul uniquement sur les métadonnées scellées.
 */

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { differenceInDays, parseISO, startOfDay } from 'date-fns';
import apiClient from '@/core/api/api-client'; // Remplacement du fetch brut pour la sécurité

export function useTrialStatus() {
  const { user } = useAuthStore();
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [phase, setPhase] = useState<'ACTIVE' | 'WARNING' | 'CRITICAL' | 'EXPIRED'>('ACTIVE');

  useEffect(() => {
    // Contournement TypeScript strict pour accéder à la structure imbriquée de l'User
    const currentUser = user as any;

    if (!currentUser?.U_Tenant) return;

    const tenant = currentUser.U_Tenant;
    const status = tenant.T_SubscriptionStatus;
    
    // 🛑 PHASE 1 : Expiration déjà confirmée par la base de données
    if (status === 'EXPIRED') {
      setIsReadOnly(true);
      setPhase('EXPIRED');
      setDaysLeft(0);
      return;
    }

    // ✅ PHASE 2 : Licence standard activée (Hors période d'essai)
    if (status === 'ACTIVE') {
      setIsReadOnly(false);
      setPhase('ACTIVE');
      return;
    }

    // ⏳ PHASE 3 : Calcul en temps réel pour la période d'essai (TRIAL)
    if (tenant.T_SubscriptionEndDate) {
      const end = startOfDay(parseISO(tenant.T_SubscriptionEndDate));
      const now = startOfDay(new Date());
      const days = differenceInDays(end, now);
      
      setDaysLeft(days > 0 ? days : 0);
      
      if (days <= 0) {
        setIsReadOnly(true);
        setPhase('EXPIRED');
        // Synchronisation critique avec le Kernel Matrix
        updateExpiredStatus(tenant.T_Id);
      } else if (days <= 3) {
        setPhase('CRITICAL');
        setIsReadOnly(false);
      } else if (days <= 7) {
        setPhase('WARNING');
        setIsReadOnly(false);
      }
    }
  }, [user]);

  /**
   * 🔒 VERROUILLAGE KERNEL
   * Notifie la base de données centrale de l'expiration du périmètre.
   */
  const updateExpiredStatus = async (tenantId?: string) => {
    if (!tenantId) return;
    try {
      // apiClient injecte automatiquement le token JWT et le x-tenant-id
      await apiClient.post('/tenant/update-status', { tenantId, status: 'EXPIRED' });
    } catch (e) {
      console.error('Qualisoft Erreur : Échec de la mise à jour du statut d\'expiration.', e);
    }
  };

  const currentUser = user as any;

  return { 
    isReadOnly, 
    daysLeft, 
    phase, 
    isTrial: currentUser?.U_Tenant?.T_SubscriptionStatus === 'TRIAL' 
  };
}