/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/core/api/api-client";

/**
 * 👑 MODULE : MATRIX CORE SERVICE (SOUVERAINETÉ & PROVISIONING)
 * -------------------------------------------------------------------------
 * RÔLE : Contrôleur d'API central pour l'écosystème Qualisoft Elite RD 2030.
 * FIX : Ajout de 'customSlug' dans ProvisioningPayload pour résoudre l'erreur de build.
 * -------------------------------------------------------------------------
 * DATE : 01 Mars 2026 | 15:45 GMT
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
 * ✅ FIX : Ajout du champ 'customSlug' réclamé par le compilateur
 */
export interface ProvisioningPayload { 
  companyName: string; 
  customSlug: string;    // <--- AJOUT CRUCIAL ICI
  ceoName: string; 
  email: string; 
  adminFirstName: string; 
  adminLastName: string; 
  phone: string; 
  address: string;
  adminPassword?: string; 
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
  
  /** Analyse profonde d'un Tenant spécifique (Visualisation Master) */
  getDetails: async (id: string) => (await apiClient.get<TenantDetails>(`/admin/matrix/details/${id}`)).data,
  
  /** 🚀 INITIALISATION MATRIX : Création de l'infrastructure pour un client */
  initialize: async (data: ProvisioningPayload) => {
    return (await apiClient.post('/admin/matrix/initialize', data)).data;
  },
  
  /** Usurpation d'identité : Tunnel sécurisé vers un nœud client pour support */
  impersonate: async (tenantId: string) => (await apiClient.post(`/admin/matrix/impersonate/${tenantId}`)).data,
  
  
  // =========================================================
  // 👤 GESTION SOUVERAINE DES IDENTITÉS
  // =========================================================

  /** Création d'un utilisateur racine rattaché à un Tenant */
  createGlobalUser: async (payload: any) => {
    return (await apiClient.post<UserMatrixEntry>(`/admin/matrix/tenants/${payload.tenantId}/users`, payload)).data;
  },
  
  /** Mise à jour des privilèges (Sanitization du payload incluse) */
  updateUser: async (id: string, payload: any) => {
    /// eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { U_Id, tenantId, id: _, createdAt, updatedAt, ...cleanPayload } = payload;
    return (await apiClient.patch<UserMatrixEntry>(`/admin/matrix/users/${id}`, cleanPayload)).data;
  },

  /** Révocation définitive d'un accès (Purge du noyau) */
  deleteUser: async (id: string) => (await apiClient.delete(`/users/${id}`)).data,


  // =========================================================
  // 🚀 PROVISIONNEMENT PUBLIC (LANDING PAGE & ONBOARDING)
  // =========================================================

  /**
   * POINT D'ENTRÉE TRIAL : Crée un accès Essai 14j automatiquement.
   */
  initializeTrialWithResource: async (data: UnifiedTrialPayload) => {
    return (await apiClient.post('/matrix/public/onboarding-trial', data)).data;
  },


  // =========================================================
  // 🌍 RÉSOLUTION DE DOMAINES & REGISTRE PUBLIC
  // =========================================================

  /** Annuaire public des instances actives (Sélecteur de Tenant au Login) */
  getPublicTenants: async () => {
    try {
      const response = await apiClient.get<PublicTenant[]>('/matrix/public/tenants');
      return response.data;
    } catch (error) {
      console.error("❌ Matrix Kernel : Registre public inaccessible", error);
      return [];
    }
  },

  /** Vérifie la légitimité d'un sous-domaine (ex: senelec.qualisoft.sn) */
  getTenantByDomain: async (slug: string) => {
    try {
      const response = await apiClient.get<PublicTenant>(`/auth/domain/${slug}`);
      return response.data;
    } catch (error) {
      console.warn(`⚠️ Matrix Kernel : Nœud '${slug}' non répertorié.`);
      return null;
    }
  },
};