/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🌉 MODULE : ADMIN SERVICE (BRIDGE DE COMPATIBILITÉ)
 * -------------------------------------------------------------------------
 * RÔLE : Intergiciel de transition vers l'architecture Matrix API.
 * FONCTION : Rediriger les appels de provisionnement hérités vers le 
 * nouveau contrôleur sécurisé sans casser la structure existante.
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
    const payload: ProvisioningPayload = {
        companyName: data.name || data.companyName || 'Organisation Inconnue',
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