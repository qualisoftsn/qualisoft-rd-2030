/**
 * CHEMIN ABSOLU : /frontend/src/services/matrix.service.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Interface de communication avec le Noyau Master.
 */

import apiClient from "@/core/api/api-client";

// --- ENUMS & TYPES DE BASE ---
export type TenantPlan = "ESSAI" | "EMERGENCE" | "CROISSANCE" | "ENTREPRISE" | "GROUPE";
export type MatrixRole = "SUPER_ADMIN" | "ADMIN" | "USER" | "PILOTE" | "COPILOTE" | "RQ" | "DIRECTION" | "HSE" | "SAFETY_OFFICER" | "AUDITEUR" | "OBSERVATEUR";

// --- INTERFACES ADMINISTRATION ---
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
  _count: {
    T_Users: number;
    T_Sites: number;
  };
}

export interface PublicTenant {
  T_Id: string;
  T_Name: string;
  T_Domain: string;
}

export interface PublicUser {
  U_Id: string;
  U_Email: string;
  U_FirstName: string | null;
  U_LastName: string | null;
}

export interface ProvisioningPayload {
  companyName: string;
  domain: string;
  admin1Email: string;
  admin2Email: string;
}

// --- CORE API MATRIX ---
export const matrixApi = {
  
  // 📋 Administration Master (Cockpit)
  getTenants: async (): Promise<TenantDetails[]> => {
    const res = await apiClient.get<TenantDetails[]>('/admin/matrix/tenants');
    return res.data;
  },

  getDetails: async (id: string): Promise<TenantDetails> => {
    const res = await apiClient.get<TenantDetails>(`/admin/matrix/details/${id}`);
    return res.data;
  },

  // 🚀 Initialisation (Provisioning)
  initialize: async (data: ProvisioningPayload): Promise<{ success: boolean; tenantId: string; message: string }> => {
    const res = await apiClient.post('/auth/register-tenant', data);
    return res.data;
  },

  // 🎭 Impersonation
  impersonate: async (tenantId: string): Promise<{ token: string; user: unknown }> => {
    const res = await apiClient.post(`/admin/matrix/${tenantId}/impersonate`);
    return res.data;
  },

  // 🖋️ Gestion Collaborateurs (C'est ici que l'appel partait vers une route inexistante)
  createUser: async (tenantId: string, userData: unknown): Promise<UserMatrixEntry> => {
    const res = await apiClient.post<UserMatrixEntry>(`/auth/tenants/${tenantId}/users`, userData);
    return res.data;
  },

  // ✅ ACCÈS PUBLICS (LOGIN CASCADE)
  // Les routes ci-dessous pointent maintenant vers les chemins @Get('public/...') du contrôleur
  getPublicTenants: async (): Promise<PublicTenant[]> => {
    const res = await apiClient.get<PublicTenant[]>('/auth/public/tenants');
    return res.data;
  },

  getPublicTenantUsers: async (tenantId: string): Promise<PublicUser[]> => {
    const res = await apiClient.get<PublicUser[]>(`/auth/public/tenants/${tenantId}/users`);
    return res.data;
  }
};