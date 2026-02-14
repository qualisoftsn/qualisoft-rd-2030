/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * CHEMIN ABSOLU : /frontend/src/services/matrix.service.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Interface de communication souveraine avec le Noyau Master et les sous-domaines.
 */

import apiClient from "@/core/api/api-client";

// --- 💎 TYPES SCELLÉS ---
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

// --- 🛰️ CORE API MATRIX ---
export const matrixApi = {
  
  /**
   * 📋 RÉCUPÉRATION DU REGISTRE COMPLET (ADMIN MASTER)
   */
  getTenants: async (): Promise<TenantDetails[]> => {
    const res = await apiClient.get<TenantDetails[]>('/admin/matrix');
    return res.data;
  },

  /**
   * 🔍 RÉCUPÉRATION DES DÉTAILS D'UN NŒUD (ADMIN MASTER)
   */
  getDetails: async (id: string): Promise<TenantDetails> => {
    const res = await apiClient.get<TenantDetails>(`/admin/matrix/details/${id}`);
    return res.data;
  },

  /**
   * 🏗️ INITIALISATION D'UN NOUVEAU NŒUD (ADMIN MASTER)
   */
  initialize: async (data: ProvisioningPayload): Promise<{ success: boolean; tenantId: string; message: string }> => {
    const res = await apiClient.post('/admin/matrix/initialize', data);
    return res.data;
  },

  /**
   * 🎭 PROTOCOLE D'INCARNATION (SUPER-ADMIN)
   */
  impersonate: async (tenantId: string): Promise<{ token: string; user: any }> => {
    const res = await apiClient.post(`/admin/matrix/impersonate/${tenantId}`);
    return res.data;
  },

  /**
   * 🖋️ ENRÔLEMENT D'UN COLLABORATEUR (ADMIN MASTER)
   * ✅ RÉTABLI : Correction de l'erreur de build sur matrix/[id]/page.tsx
   */
  createUser: async (tenantId: string, userData: any): Promise<UserMatrixEntry> => {
    const res = await apiClient.post<UserMatrixEntry>(`/admin/matrix/tenants/${tenantId}/users`, userData);
    return res.data;
  },

  /**
   * 🔓 [PUBLIC] RÉCUPÉRATION DES ORGANISATIONS ACTIVES
   */
  getPublicTenants: async (): Promise<PublicTenant[]> => {
    const res = await apiClient.get<PublicTenant[]>('/auth/public/tenants');
    return res.data;
  },

  /**
   * 🛰️ [PUBLIC] IDENTIFICATION PAR DOMAINE
   */
  getTenantByDomain: async (domain: string): Promise<PublicTenant> => {
    const res = await apiClient.get<PublicTenant>(`/auth/domain/${domain}`);
    return res.data;
  },

  /**
   * 🔓 [PUBLIC] RÉCUPÉRATION DES UTILISATEURS D'UN TENANT
   */
  getPublicTenantUsers: async (tenantId: string): Promise<PublicUser[]> => {
    const res = await apiClient.get<PublicUser[]>(`/auth/public/tenants/${tenantId}/users`);
    return res.data;
  }
};