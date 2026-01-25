import apiClient from '@/core/api/api-client';

export interface TenantStats {
  T_Id: string;
  T_Name: string;
  T_Domain: string;
  T_Plan: string;
  T_SubscriptionStatus: string;
  T_SubscriptionEndDate: string | null;
  T_IsActive: boolean;
  T_CreatedAt: string;
  _count: {
    T_Users: number;
  };
}

export const adminService = {
  /**
   * Récupère toutes les instances déployées
   */
  getTenants: async (): Promise<TenantStats[]> => {
    const response = await apiClient.get('/super-admin/provisioning/tenants');
    return response.data;
  },

  /**
   * Déclenche le provisioning d'une nouvelle instance
   */
  deployInstance: async (data: {
    name: string;
    domain: string;
    adminEmail: string;
    plan: string;
  }) => {
    const response = await apiClient.post('/super-admin/provisioning/deploy', data);
    return response.data;
  }
};