/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/core/api/api-client";

/**
 * 👑 MODULE : MATRIX CORE SERVICE (SUPERVISION MULTI-TENANT)
 * -------------------------------------------------------------------------
 * RÔLE : Contrôleur d'API pour l'administration globale (Super Admin).
 * FONCTION : Provisionnement, gestion croisée des utilisateurs et usurpation d'identité (Impersonation).
 * SÉCURITÉ : Ces routes sont protégées par le Guard 'SuperAdmin' côté Backend.
 */

// Typages Stricts de la Matrice Qualisoft
export type TenantPlan = "ESSAI" | "EMERGENCE" | "CROISSANCE" | "ENTREPRISE" | "ELITE" | "GROUPE";
export type MatrixRole = "SUPER_ADMIN" | "ADMIN" | "USER" | "PILOTE" | "COPILOTE" | "RQ" | "DIRECTION" | "HSE" | "SAFETY_OFFICER" | "AUDITEUR" | "OBSERVATEUR";

export interface PublicTenant { 
  T_Id: string; 
  T_Name: string; 
  T_Domain: string; 
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
  T_CeoName?: string; 
  _count?: { T_Users: number; T_Sites: number; }; 
}

export const matrixApi = {
  
  // 🏢 LECTURE DES INSTANCES (SDE)
  getTenants: async () => (await apiClient.get<TenantDetails[]>('/admin/matrix')).data,
  getDetails: async (id: string) => (await apiClient.get<TenantDetails>(`/admin/matrix/details/${id}`)).data,
  
  // 🚀 PROVISIONNEMENT & ADMINISTRATION
  initialize: async (data: ProvisioningPayload) => (await apiClient.post('/admin/matrix/initialize', data)).data,
  impersonate: async (tenantId: string) => (await apiClient.post(`/admin/matrix/impersonate/${tenantId}`)).data,
  
  // 👤 GESTION SOUVERAINE DES IDENTITÉS
  createGlobalUser: async (payload: any) => {
    // Ciblage explicite du Tenant pour éviter les erreurs d'affectation
    return (await apiClient.post<UserMatrixEntry>(`/admin/matrix/tenants/${payload.tenantId}/users`, payload)).data;
  },
  
  updateUser: async (id: string, payload: any) => {
    // 🛡️ Nettoyage du payload : On empêche l'altération de l'ID ou du Tenant via le Patch
    const { U_Id, tenantId, id: _, createdAt, updatedAt, ...cleanPayload } = payload;
    return (await apiClient.patch<UserMatrixEntry>(`/admin/matrix/users/${id}`, cleanPayload)).data;
  },

  deleteUser: async (id: string) => (await apiClient.delete(`/users/${id}`)).data,

  // 🌍 ROUTES PUBLIQUES (NON SCELLÉES)
  // Utilisées par l'écran de connexion ou l'annuaire de vérification
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
      console.warn(`⚠️ Matrix Kernel : Sous-domaine '${slug}' non identifié.`);
      return null;
    }
  },
};