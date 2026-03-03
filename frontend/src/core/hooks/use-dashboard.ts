/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ HOOK : useDashboard.ts
 * -------------------------------------------------------------------------
 * RÔLE : Monitoring des KPIs scellés (§ISO 9001).
 * RÉVISION : 03 Mars 2026 | 01:25 GMT
 */

"use client";

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/core/api/api-client';

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
      // L'apiClient injecte automatiquement le X-Tenant-Id pour l'isolation
      const { data } = await apiClient.get('/analyses/dashboard');
      return data;
    },
    refetchInterval: 30000, // 📡 Polling toutes les 30s (Pilotage Live)
    staleTime: 10000,
    retry: 2, // Limite les tentatives en cas de micro-coupure réseau
  });
}