/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 🛰️ HOOK : useDashboard (TÉLÉMÉTRIE KERNEL)
 * -------------------------------------------------------------------------
 * FONCTION : Récupération asynchrone des KPIs du Tenant courant.
 * RÔLE : Alimenter les graphiques et les StatCards avec des données scellées.
 * MÉCANISME : Utilise TanStack Query pour la mise en cache et le polling.
 */

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/core/api/api-client';

// Structure typée pour garantir l'intégrité des données reçues
export interface DashboardStats {
  totalSSE: number;
  openNC: number;
  lateActions: number;
  paqRate: number;
  incidentTrend: { type: string; _count: number }[];
  recentEvents: any[];
}

export function useDashboard() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      /**
       * 🔒 APPEL SCELLÉ
       * Le endpoint '/analyses/dashboard' est filtré dynamiquement 
       * par le middleware NestJS en fonction du JWT du Tenant.
       */
      const { data } = await apiClient.get('/analyses/dashboard');
      return data;
    },
    // Rafraîchissement automatique toutes les 30 secondes pour un pilotage "live"
    refetchInterval: 30000, 
    // Maintien des données précédentes pendant le rechargement pour éviter les sauts d'UI
    placeholderData: (previousData) => previousData, 
    staleTime: 10000,
  });
}