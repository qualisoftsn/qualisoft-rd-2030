/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * CHEMIN ABSOLU : /frontend/src/services/matrix.service.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Interface de communication avec le Noyau Master.
 */

import apiClient from "@/core/api/api-client";

// --- TYPES SCELLÉS ---
export type TenantPlan = "ESSAI" | "EMERGENCE" | "CROISSANCE" | "ENTREPRISE" | "GROUPE";
export type MatrixRole = "SUPER_ADMIN" | "ADMIN" | "USER" | "PILOTE" | "COPILOTE" | "RQ" | "DIRECTION" | "HSE" | "SAFETY_OFFICER" | "AUDITEUR" | "OBSERVATEUR";

export interface UserMatrixEntry {
  U_Id: string;
  U_Email: string;
  U_FirstName: string | null;
  U_LastName: string | null;
  U_Role: MatrixRole;
  U_IsActive: boolean;
  U_CreatedAt?: string;
}

export interface TenantDetails {
  T_Id: string;
  T_Name: string;
  T_Domain: string;
  T_Plan: TenantPlan;
  T_IsActive: boolean;
  T_Users: UserMatrixEntry[];
  T_Address?: string;
  T_Phone?: string;
  T_CeoName?: string;
  _count: { T_Users: number; T_Sites: number; };
}

export interface ProvisioningPayload {
  companyName: string;
  ceoName: string;
  email: string;
  password?: string;
  adminFirstName: string;
  adminLastName: string;
  phone: string;
  address: string;
}

export interface PublicTenant { T_Id: string; T_Name: string; T_Domain: string; }
export interface PublicUser { U_Id: string; U_Email: string; U_FirstName: string | null; U_LastName: string | null; }

// --- CORE API MATRIX ---
export const matrixApi = {
  
  getTenants: async (): Promise<TenantDetails[]> => {
    const res = await apiClient.get<TenantDetails[]>('/admin/matrix');
    return res.data;
  },

  getDetails: async (id: string): Promise<TenantDetails> => {
    const res = await apiClient.get<TenantDetails>(`/admin/matrix/${id}`);
    return res.data;
  },

  initialize: async (data: ProvisioningPayload): Promise<{ success: boolean; tenantId: string; message: string }> => {
    const res = await apiClient.post('/auth/register-tenant', data);
    return res.data;
  },

  // 🎭 Prise de contrôle (Impersonation)
  impersonate: async (tenantId: string): Promise<{ token: string; user: any }> => {
    const res = await apiClient.post(`/admin/matrix/${tenantId}/impersonate`);
    return res.data;
  },

  // 🖋️ Gestion Collaborateurs
  createUser: async (tenantId: string, userData: any): Promise<UserMatrixEntry> => {
    const res = await apiClient.post<UserMatrixEntry>(`/admin/matrix/${tenantId}/users`, userData);
    return res.data;
  },

  // ✅ ACCÈS PUBLICS (LOGIN CASCADE)
  getPublicTenants: async (): Promise<PublicTenant[]> => {
    const res = await apiClient.get<PublicTenant[]>('/admin/matrix');
    return res.data;
  },

  getPublicTenantUsers: async (tenantId: string): Promise<PublicUser[]> => {
    const res = await apiClient.get<PublicUser[]>(`/admin/matrix/${tenantId}/users`);
    return res.data;
  }
};