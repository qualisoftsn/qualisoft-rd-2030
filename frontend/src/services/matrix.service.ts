/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/core/api/api-client";

// --- TYPES SOUVERAINS ---
export type TenantPlan = "ESSAI" | "EMERGENCE" | "CROISSANCE" | "ENTREPRISE" | "GROUPE";
export type MatrixRole = "SUPER_ADMIN" | "ADMIN" | "USER" | "PILOTE" | "COPILOTE" | "RQ" | "DIRECTION" | "HSE" | "SAFETY_OFFICER" | "AUDITEUR" | "OBSERVATEUR";

export interface PublicTenant { 
  T_Id: string; 
  T_Name: string; 
  T_Domain: string; 
}

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
  T_Id: string;
  T_Name: string;
  T_Domain: string;
  T_Plan: TenantPlan;
  T_IsActive: boolean;
  T_Users: UserMatrixEntry[];
  _count?: { T_Users: number; T_Sites: number; };
}

export interface ProvisioningPayload {
  companyName: string;
  ceoName: string;
  email: string;
  adminFirstName: string;
  adminLastName: string;
  phone: string;
  address: string;
}

export interface MatrixUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: MatrixRole;
  tenantId: string;
}

// --- API MATRIX ---
export const matrixApi = {
  getTenants: async () => (await apiClient.get<TenantDetails[]>('/admin/matrix')).data,
  getDetails: async (id: string) => (await apiClient.get<TenantDetails>(`/admin/matrix/details/${id}`)).data,
  initialize: async (data: ProvisioningPayload) => (await apiClient.post('/admin/matrix/initialize', data)).data,
  impersonate: async (tenantId: string) => (await apiClient.post(`/admin/matrix/impersonate/${tenantId}`)).data,
  
  createGlobalUser: async (payload: MatrixUserPayload) => (await apiClient.post<UserMatrixEntry>('/users', payload)).data,
  updateUser: async (id: string, payload: Partial<MatrixUserPayload>) => {
    const { tenantId, ...updateData } = payload as any;
    return (await apiClient.patch<UserMatrixEntry>(`/users/${id}`, updateData)).data;
  },
  deleteUser: async (id: string) => (await apiClient.delete(`/users/${id}`)).data,

  // --- MÉTHODES PUBLIQUES DE LOGIN ---
  getPublicTenants: async (): Promise<PublicTenant[]> => {
    const res = await apiClient.get<PublicTenant[]>('/auth/public/tenants');
    return res.data;
  },
  getTenantByDomain: async (domain: string): Promise<PublicTenant> => {
    const res = await apiClient.get<PublicTenant>(`/auth/domain/${domain}`);
    return res.data;
  }
};