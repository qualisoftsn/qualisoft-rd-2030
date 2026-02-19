/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/core/api/api-client";

export type TenantPlan = "ESSAI" | "EMERGENCE" | "CROISSANCE" | "ENTREPRISE" | "GROUPE";
export type MatrixRole = "SUPER_ADMIN" | "ADMIN" | "USER" | "PILOTE" | "COPILOTE" | "RQ" | "DIRECTION" | "HSE" | "SAFETY_OFFICER" | "AUDITEUR" | "OBSERVATEUR";

export interface PublicTenant { T_Id: string; T_Name: string; T_Domain: string; }
export interface ProvisioningPayload { companyName: string; ceoName: string; email: string; adminFirstName: string; adminLastName: string; phone: string; address: string; }
export interface UserMatrixEntry { U_Id: string; U_Email: string; U_FirstName: string | null; U_LastName: string | null; U_Role: MatrixRole; U_IsActive: boolean; tenantId: string; }
export interface TenantDetails { T_Id: string; T_Name: string; T_Domain: string; T_Plan: TenantPlan; T_IsActive: boolean; T_Users: UserMatrixEntry[]; T_CeoName?: string; _count?: { T_Users: number; T_Sites: number; }; }

export const matrixApi = {
  
  getTenants: async () => (await apiClient.get<TenantDetails[]>('/admin/matrix')).data,
  getDetails: async (id: string) => (await apiClient.get<TenantDetails>(`/admin/matrix/details/${id}`)).data,
  
  initialize: async (data: ProvisioningPayload) => (await apiClient.post('/admin/matrix/initialize', data)).data,
  impersonate: async (tenantId: string) => (await apiClient.post(`/admin/matrix/impersonate/${tenantId}`)).data,
  
  // 🚩 CORRECTION : Utilisation de la route sécurisée Matrix pour l'enrôlement
  createGlobalUser: async (payload: any) => (await apiClient.post<UserMatrixEntry>(`/admin/matrix/tenants/${payload.tenantId}/users`, payload)).data,
  
  // 🚩 CORRECTION : Utilisation de la route sécurisée Matrix pour l'édition souveraine
  updateUser: async (id: string, payload: any) => {
    /// eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { U_Id, tenantId, id: _, createdAt, updatedAt, ...cleanPayload } = payload;
    return (await apiClient.patch<UserMatrixEntry>(`/admin/matrix/users/${id}`, cleanPayload)).data;
  },

  deleteUser: async (id: string) => (await apiClient.delete(`/users/${id}`)).data,

  // 🚩 ROUTES PUBLIQUES (Alignées sur le nouveau contrôleur 'matrix')
  getPublicTenants: async () => {
    try {
      const response = await apiClient.get<PublicTenant[]>('/matrix/public/tenants');
      return response.data;
    } catch (error) {
      console.error("❌ Matrix Kernel : Échec de récupération du registre public", error);
      return [];
    }
  },

  getTenantByDomain: async (slug: string) => {
    try {
      const response = await apiClient.get<PublicTenant>(`/auth/domain/${slug}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Matrix Kernel : Nœud '${slug}' non identifié sur le réseau.`);
      return null;
    }
  },
};