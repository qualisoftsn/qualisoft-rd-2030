/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * CHEMIN ABSOLU : /frontend/src/services/matrix.service.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Interface unique de communication API pour la Matrix (Super Admin).
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
  tenantId?: string; // Ajouté pour le contexte
  U_TenantName?: string; // Ajouté pour l'affichage
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

// Payload pour l'initialisation d'un Tenant (Société)
export interface ProvisioningPayload {
  companyName: string;
  ceoName: string;
  email: string;
  adminFirstName: string;
  adminLastName: string;
  phone: string;
  address: string;
}

// 👇 NOUVEAU : Payload pour la gestion complète d'un utilisateur (CRUD Matrix)
export interface MatrixUserPayload {
  id?: string;       // Optionnel (présent uniquement en modification)
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // Optionnel (présent uniquement si on veut le changer/créer)
  role: string;      // Le Rôle sélectionné
  tenantId: string;  // L'organisation de rattachement
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
  
  // =========================================================
  // 🏢 GESTION DES TENANTS (Sociétés)
  // =========================================================

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

  /** Initialise un nouveau tenant (Déploiement Express) */
  initialize: async (data: ProvisioningPayload): Promise<{ success: boolean; tenantId: string; message: string }> => {
    const res = await apiClient.post('/admin/matrix/initialize', data);
    return res.data;
  },

  /** Génère un token d'impersonation (Se connecter en tant que...) */
  impersonate: async (tenantId: string): Promise<{ token: string; user: any }> => {
    const res = await apiClient.post(`/admin/matrix/impersonate/${tenantId}`);
    return res.data;
  },

  // =========================================================
  // 👥 GESTION DES UTILISATEURS (CRUD Super Admin)
  // =========================================================

  /** * CRÉATION UTILISATEUR (Méthode Tenant-Specifique)
   * @deprecated Utiliser createGlobalUser pour la nouvelle Modal
   */
  createUser: async (tenantId: string, userData: any): Promise<UserMatrixEntry> => {
    const res = await apiClient.post<UserMatrixEntry>(`/admin/matrix/tenants/${tenantId}/users`, userData);
    return res.data;
  },

  /** * ✅ CRÉATION UTILISATEUR (Méthode Globale Matrix) 
   * Utilise le nouveau payload avec tenantId inclus
   */
  createGlobalUser: async (payload: MatrixUserPayload): Promise<UserMatrixEntry> => {
    // On poste vers l'endpoint global de création utilisateur
    const res = await apiClient.post<UserMatrixEntry>('/users', payload);
    return res.data;
  },

  /** * ✅ MODIFICATION UTILISATEUR 
   * Met à jour les infos, le rôle ou le mot de passe
   */
  updateUser: async (id: string, payload: Partial<MatrixUserPayload>): Promise<UserMatrixEntry> => {
    const res = await apiClient.patch<UserMatrixEntry>(`/users/${id}`, payload);
    return res.data;
  },

  /** * ✅ SUPPRESSION UTILISATEUR 
   */
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  // =========================================================
  // 🌍 PARTIE PUBLIQUE (Login / Auth)
  // =========================================================

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