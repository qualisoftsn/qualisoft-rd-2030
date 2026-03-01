/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🌉 MODULE : ADMIN SERVICE (BRIDGE DE COMPATIBILITÉ)
 * -------------------------------------------------------------------------
 * RÔLE : Intergiciel de transition vers l'architecture Matrix API.
 * FONCTION : Rediriger les appels de provisionnement hérités vers le 
 * nouveau contrôleur sécurisé sans casser la structure existante.
 * FIX : Ajout du champ 'customSlug' requis par ProvisioningPayload.
 * -------------------------------------------------------------------------
 * DATE : 01 Mars 2026 | 23:30 GMT
 */

import { matrixApi, ProvisioningPayload } from './matrix.service';

// Conservation stricte de l'interface d'origine pour la sécurité des types
export interface TenantStats {
  T_Id: string;
  T_Name: string;
  T_Domain: string;
  T_Plan: string;
  T_IsActive: boolean;
  _count?: { T_Users: number };
}

export const adminService = {
  /**
   * 📡 Récupération de l'annuaire souverain
   * Délégation transparente au Matrix Controller.
   */
  getTenants: async () => {
    return await matrixApi.getTenants();
  },

  /**
   * 🚀 Déploiement d'Instance (SDE)
   * Nettoie et formate les données héritées pour correspondre au 
   * payload strict exigé par la Matrice Qualisoft.
   */
  deployInstance: async (data: any) => {
    // 1. Extraction du nom de l'organisation
    const resolvedCompanyName = data.name || data.companyName || 'Organisation Inconnue';

    // 2. Génération robuste du customSlug pour prévenir les erreurs TypeScript
    const generatedSlug = resolvedCompanyName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");

    // 3. Construction stricte du payload
    const payload: ProvisioningPayload = {
        companyName: resolvedCompanyName,
        customSlug: data.customSlug || generatedSlug, // ✅ Le champ manquant est désormais injecté
        email: data.adminEmail || data.email,
        ceoName: data.ceoName || 'Non renseigné',
        adminFirstName: data.adminFirstName || 'Administrateur',
        adminLastName: data.adminLastName || 'Système',
        address: data.address || 'Siège Social',
        phone: data.phone || '000000000'
    };

    return await matrixApi.initialize(payload);
  }
};