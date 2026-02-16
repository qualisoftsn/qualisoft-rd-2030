/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * CHEMIN ABSOLU : /frontend/src/services/matrix.service.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Kernel de communication API. Contrat de données souverain.
 */

import apiClient from "@/core/api/api-client";

// ==========================================
// 🧩 INTERFACES DE CONTRAT (STRICTES)
// ==========================================

export type TenantPlan = "ESSAI" | "EMERGENCE" | "CROISSANCE" | "ENTREPRISE" | "GROUPE";
export type MatrixRole = 
  | "SUPER_ADMIN" | "ADMIN" | "USER" | "PILOTE" | "COPILOTE" 
  | "RQ" | "DIRECTION" | "HSE" | "SAFETY_OFFICER" | "AUDITEUR" | "OBSERVATEUR";

export interface PublicTenant { 
  T_Id: string; 
  T_Name: string; 
  T_Domain: string; 
}

/** ✅ RESTAURATION : Interface requise par deploy/page.tsx */
export interface ProvisioningPayload {
  companyName: string;
  ceoName: string;
  email: string;
  adminFirstName: string;
  adminLastName: string;
  phone: string;
  address: string;
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
  _count?: {
    T_Users: number;
    T_Sites: number;
  };
}

/** ✅ RESTAURATION : Interface pour la gestion utilisateur globale */
export interface MatrixUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: MatrixRole;
  tenantId: string;
}

// ==========================================
// 🏛️ MATRIX API ENGINE
// ==========================================

export const matrixApi = {
  
  // 🏢 GESTION DES TENANTS
  getTenants: async (): Promise<TenantDetails[]> => {
    const res = await apiClient.get<TenantDetails[]>('/admin/matrix');
    return res.data;
  },

  getDetails: async (id: string): Promise<TenantDetails> => {
    const res = await apiClient.get<TenantDetails>(`/admin/matrix/details/${id}`);
    return res.data;
  },

  /** Déploiement via le payload ProvisioningPayload */
  initialize: async (data: ProvisioningPayload): Promise<any> => {
    const res = await apiClient.post('/admin/matrix/initialize', data);
    return res.data;
  },

  impersonate: async (tenantId: string): Promise<{ token: string; user: any }> => {
    const res = await apiClient.post(`/admin/matrix/impersonate/${tenantId}`);
    return res.data;
  },

  // 👥 GESTION DES UTILISATEURS
  createGlobalUser: async (payload: MatrixUserPayload): Promise<UserMatrixEntry> => {
    const res = await apiClient.post<UserMatrixEntry>('/users', payload);
    return res.data;
  },

  updateUser: async (id: string, payload: Partial<MatrixUserPayload>): Promise<UserMatrixEntry> => {
    // Extraction chirurgicale pour éviter les erreurs de structure Prisma
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tenantId, ...updateData } = payload as any;
    const res = await apiClient.patch<UserMatrixEntry>(`/users/${id}`, updateData);
    return res.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  // 🌍 AUTH & DOMAINES
  getPublicTenants: async (): Promise<PublicTenant[]> => {
    const res = await apiClient.get<PublicTenant[]>('/auth/public/tenants');
    return res.data;
  },

  getTenantByDomain: async (domain: string): Promise<PublicTenant> => {
    const res = await apiClient.get<PublicTenant>(`/auth/domain/${domain}`);
    return res.data;
  }
};