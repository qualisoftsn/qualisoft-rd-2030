/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/core/api/api-client";

export type TenantPlan = "ESSAI" | "EMERGENCE" | "CROISSANCE" | "ENTREPRISE" | "GROUPE";
export type MatrixRole = "SUPER_ADMIN" | "ADMIN" | "USER" | "PILOTE" | "COPILOTE" | "RQ" | "DIRECTION" | "HSE" | "SAFETY_OFFICER" | "AUDITEUR" | "OBSERVATEUR";

export interface PublicTenant { T_Id: string; T_Name: string; T_Domain: string; }
export interface UserMatrixEntry {
  U_Id: string;
  U_Email: string;
  U_FirstName: string | null;
  U_LastName: string | null;
  U_Role: MatrixRole;
  U_IsActive: boolean;
  tenantId: string;
}

export interface TenantDetails {
  T_Id: string; T_Name: string; T_Domain: string; T_Plan: TenantPlan; T_IsActive: boolean;
  T_Users: UserMatrixEntry[]; T_CeoName?: string;
  _count?: { T_Users: number; T_Sites: number; };
}

export const matrixApi = {
  getTenants: async () => (await apiClient.get<TenantDetails[]>('/admin/matrix')).data,
  getDetails: async (id: string) => (await apiClient.get<TenantDetails>(`/admin/matrix/details/${id}`)).data,
  impersonate: async (tenantId: string) => (await apiClient.post(`/admin/matrix/impersonate/${tenantId}`)).data,
  createGlobalUser: async (payload: any) => (await apiClient.post<UserMatrixEntry>('/users', payload)).data,
  
  /** ✅ FIX 400 : On filtre les champs système pour Prisma */
  updateUser: async (id: string, payload: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { U_Id, tenantId, id: _, createdAt, updatedAt, ...cleanData } = payload;
    return (await apiClient.patch<UserMatrixEntry>(`/users/${id}`, cleanData)).data;
  },

  getPublicTenants: async () => (await apiClient.get<PublicTenant[]>('/auth/public/tenants')).data,
  getTenantByDomain: async (domain: string) => (await apiClient.get<PublicTenant>(`/auth/domain/${domain}`)).data,
};