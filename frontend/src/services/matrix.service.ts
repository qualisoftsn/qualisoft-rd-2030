/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * CHEMIN ABSOLU : /frontend/src/services/matrix.service.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Interface unique de communication API pour la Matrix.
 */

import apiClient from "@/core/api/api-client";

// --- TYPES ---
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
  adminFirstName: string;
  adminLastName: string;
  phone: string;
  address: string;
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

// --- API CLIENT ---
export const matrixApi = {
  
  // --- PARTIE ADMIN (Nécessite Token Master) ---

  /** Récupère la liste complète des tenants */
  getTenants: async (): Promise<TenantDetails[]> => {
    const res = await apiClient.get<TenantDetails[]>('/admin/matrix');
    return res.data;
  },

  /** Récupère les détails profonds d'un tenant */
  getDetails: async (id: string): Promise<TenantDetails> => {
    const res = await apiClient.get<TenantDetails>(`/admin/matrix/details/${id}`);
    return res.data;
  },

  /** Initialise un nouveau tenant */
  initialize: async (data: ProvisioningPayload): Promise<{ success: boolean; tenantId: string; message: string }> => {
    const res = await apiClient.post('/admin/matrix/initialize', data);
    return res.data;
  },

  /** Génère un token d'impersonation */
  impersonate: async (tenantId: string): Promise<{ token: string; user: any }> => {
    const res = await apiClient.post(`/admin/matrix/impersonate/${tenantId}`);
    return res.data;
  },

  /** Crée un utilisateur dans un tenant spécifique */
  createUser: async (tenantId: string, userData: any): Promise<UserMatrixEntry> => {
    const res = await apiClient.post<UserMatrixEntry>(`/admin/matrix/tenants/${tenantId}/users`, userData);
    return res.data;
  },

  // --- PARTIE PUBLIQUE (Login / Auth) ---

  /** Récupère la liste publique des tenants (pour select) */
  getPublicTenants: async (): Promise<PublicTenant[]> => {
    const res = await apiClient.get<PublicTenant[]>('/auth/public/tenants');
    return res.data;
  },

  /** Identifie un tenant par son domaine (ex: sde) */
  getTenantByDomain: async (domain: string): Promise<PublicTenant> => {
    const res = await apiClient.get<PublicTenant>(`/auth/domain/${domain}`);
    return res.data;
  },

  /** Récupère les utilisateurs publics d'un tenant (optionnel) */
  getPublicTenantUsers: async (tenantId: string): Promise<PublicUser[]> => {
    const res = await apiClient.get<PublicUser[]>(`/auth/public/tenants/${tenantId}/users`);
    return res.data;
  }
};