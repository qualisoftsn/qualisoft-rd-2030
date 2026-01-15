import { GovernanceType, ActivityStatus } from '@prisma/client';

/**
 * Utilitaire pour transformer les données CSV en format Prisma
 * Gère les trois types d'onglets du fichier Excel Qualité
 */
export const transformCsvToGovernance = (csvData: any[], type: GovernanceType, tenantId: string) => {
  return csvData.map((row) => {
    // Logique de conversion des dates spécifiques (ex: 2022-04-12 ou format texte)
    const plannedDate = row['Date Prévue'] || row['DATE PREVISIONNELLE'];
    
    return {
      GA_Num: row['N°'] || row['N° '],
      GA_Title: row['Activités '] || row['INTITULE '] || row['INTITULE'],
      GA_Type: type,
      GA_Theme: row['THEMES '] || null,
      GA_DatePlanned: parseExcelDate(plannedDate),
      GA_AnalysisPeriod: row['Periode Analyse IP -\nEvaluation  '] || row['Période d\'Analyse'] || null,
      GA_IpDate: row['Date Envoi IP '] ? parseExcelDate(row['Date Envoi IP ']) : null,
      GA_Deadline: row['DATE AU PLUS TARD'] ? parseExcelDate(row['DATE AU PLUS TARD']) : null,
      GA_Location: row['LIEU PREVISIONNEL'] || 'Teams',
      GA_Observations: row['Observation'] || row['Commentaires \n(Raisons Report)'] || null,
      GA_Status: ActivityStatus.PLANNED,
      tenantId: tenantId,
    };
  });
};

// Fonction helper pour normaliser les dates du fichier 2022
function parseExcelDate(dateStr: string) {
  if (!dateStr || dateStr === '---') return null;
  // Gestion du format ISO YYYY-MM-DD présent dans ton CSV
  if (dateStr.includes('-')) return new Date(dateStr);
  // Pour les formats type "Semaine du...", on prend le lundi de ladite semaine
  if (dateStr.toLowerCase().includes('semaine')) {
     // Logique simplifiée : extraction de l'année/mois/jour si possible
     return new Date('2022-06-01'); // Exemple par défaut pour le prototype
  }
  return new Date();
}