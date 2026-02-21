/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/core/api/api-client";

/**
 * 👑 MODULE : MATRIX CORE SERVICE (SUPERVISION & PROVISIONING)
 * -------------------------------------------------------------------------
 * RÔLE : Contrôleur d'API central pour l'écosystème Qualisoft Elite.
 * FONCTIONS : 
 * 1. Administration Multi-Tenant (Super Admin)
 * 2. Gestion Souveraine des Identités
 * 3. Provisionnement Public (Essai Trial + Lead Magnet)
 * 4. Résolution de Domaines (SDE)
 * -------------------------------------------------------------------------
 * SÉCURITÉ : Les routes /admin sont protégées par le Guard 'SuperAdmin'.
 * Les routes /public sont ouvertes pour l'onboarding.
 */

// --- TYPAGES STRICTS ÉLITE ---

export type TenantPlan = "ESSAI" | "EMERGENCE" | "CROISSANCE" | "ENTREPRISE" | "ELITE" | "GROUPE";

export type MatrixRole = 
  | "SUPER_ADMIN" | "ADMIN" | "USER" | "PILOTE" | "COPILOTE" 
  | "RQ" | "DIRECTION" | "HSE" | "SAFETY_OFFICER" | "AUDITEUR" | "OBSERVATEUR";

export interface PublicTenant { 
  T_Id: string; 
  T_Name: string; 
  T_Domain: string; 
}

/**
 * Payload pour le provisionnement manuel (Console Master)
 */
export interface ProvisioningPayload { 
  companyName: string; 
  ceoName: string; 
  email: string; 
  adminFirstName: string; 
  adminLastName: string; 
  phone: string; 
  address: string; 
}

/**
 * Payload Unifié (Landing Page) : Trial + Resource Download
 */
export interface UnifiedTrialPayload {
  fullname: string;
  email: string;
  company: string;
  wantsDownload?: boolean;
  resourceId?: string;
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

// --- CORE API OBJECT ---

export const matrixApi = {
  
  // =========================================================
  // 🏢 ADMINISTRATION DES INSTANCES (SUPER-ADMIN ONLY)
  // =========================================================

  /** Récupère la liste exhaustive des Tenants scellés */
  getTenants: async () => (await apiClient.get<TenantDetails[]>('/admin/matrix')).data,
  
  /** Analyse profonde d'un Tenant spécifique */
  getDetails: async (id: string) => (await apiClient.get<TenantDetails>(`/admin/matrix/details/${id}`)).data,
  
  /** Provisionnement classique depuis la Master Console */
  initialize: async (data: ProvisioningPayload) => (await apiClient.post('/admin/matrix/initialize', data)).data,
  
  /** Usurpation d'identité pour maintenance ou audit de conformité */
  impersonate: async (tenantId: string) => (await apiClient.post(`/admin/matrix/impersonate/${tenantId}`)).data,
  
  
  // =========================================================
  // 👤 GESTION SOUVERAINE DES IDENTITÉS
  // =========================================================

  /** Création d'un utilisateur directement rattaché à un Tenant spécifique */
  createGlobalUser: async (payload: any) => {
    return (await apiClient.post<UserMatrixEntry>(`/admin/matrix/tenants/${payload.tenantId}/users`, payload)).data;
  },
  
  /** Mise à jour des privilèges et accès (Nettoyage de sécurité inclus) */
  updateUser: async (id: string, payload: any) => {
    const { U_Id, tenantId, id: _, createdAt, updatedAt, ...cleanPayload } = payload;
    return (await apiClient.patch<UserMatrixEntry>(`/admin/matrix/users/${id}`, cleanPayload)).data;
  },

  /** Révocation définitive d'un accès utilisateur */
  deleteUser: async (id: string) => (await apiClient.delete(`/users/${id}`)).data,


  // =========================================================
  // 🚀 PROVISIONNEMENT PUBLIC (LANDING PAGE & LEADS)
  // =========================================================

  /**
   * INITIALISATION ÉLITE UNIFIÉE
   * Crée un Tenant (TRIAL), un utilisateur ADMIN, et autorise le téléchargement.
   * C'est le point d'entrée du formulaire d'Essai de la Landing Page.
   */
  initializeTrialWithResource: async (data: UnifiedTrialPayload) => {
    // On mappe les données vers le contrôleur de provisionnement public
    return (await apiClient.post('/matrix/public/onboarding-trial', data)).data;
  },


  // =========================================================
  // 🌍 ROUTES PUBLIQUES & RÉSOLUTION DE DOMAINES (SDE)
  // =========================================================

  /** Récupère l'annuaire public des instances actives */
  getPublicTenants: async () => {
    try {
      const response = await apiClient.get<PublicTenant[]>('/matrix/public/tenants');
      return response.data;
    } catch (error) {
      console.error("❌ Matrix Kernel : Échec de récupération du registre public", error);
      return [];
    }
  },

  /** Résout un sous-domaine pour vérifier l'existence d'une instance (ex: senelec.qualisoft.sn) */
  getTenantByDomain: async (slug: string) => {
    try {
      const response = await apiClient.get<PublicTenant>(`/auth/domain/${slug}`);
      return response.data;
    } catch (error) {
      console.warn(`⚠️ Matrix Kernel : Nœud '${slug}' non identifié sur le réseau.`);
      return null;
    }
  },
};