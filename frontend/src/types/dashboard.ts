/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📊 TYPE : DASHBOARD STATS (SMI COCKPIT)
 * -------------------------------------------------------------------------
 * RÔLE : Contrat de données pour le pilotage stratégique.
 * CONFORMITÉ : §9.1 ISO 9001 (Surveillance, mesure, analyse).
 */

export interface DashboardStats {
  indicateursCles: {
    risquesActifs: number;
    ncNonTraitees: number;
  };
  securite: any[]; // Liste des événements SSE récents
  statutGlobal: string; // Ex: 'CERTIFIÉ', 'STABLE', 'EN ALERTE'
  // Ajoutez ici d'autres champs si notre backend en renvoie
}