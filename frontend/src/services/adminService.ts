/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * CHEMIN : /frontend/src/services/adminService.ts
 * RÔLE : Fichier de COMPATIBILITÉ (Bridge).
 * Il redirige les anciens appels vers le nouveau matrixApi pour éviter les erreurs de build.
 */

import { matrixApi, ProvisioningPayload } from './matrix.service';

// On garde les anciens types pour satisfaire le compilateur
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
   * Redirige l'ancienne demande de liste vers la nouvelle API
   */
  getTenants: async () => {
    return await matrixApi.getTenants();
  },

  /**
   * Redirige l'ancienne demande de déploiement vers la nouvelle API
   * en adaptant les données à la volée.
   */
  deployInstance: async (data: any) => {
    // Conversion des données pour éviter les crashs
    const payload: ProvisioningPayload = {
        companyName: data.name || data.companyName,
        email: data.adminEmail || data.email,
        ceoName: data.ceoName || 'Non renseigné',
        adminFirstName: data.adminFirstName || 'Admin',
        adminLastName: data.adminLastName || 'System',
        address: data.address || 'Dakar',
        phone: data.phone || '770000000'
    };
    return await matrixApi.initialize(payload);
  }
};