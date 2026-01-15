import { useQuery } from '@tanstack/react-query';
import apiClient from '@/core/api/api-client';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analyses/dashboard');
      return data;
    },
    refetchInterval: 30000, // Rafraîchissement auto toutes les 30s
  });
}