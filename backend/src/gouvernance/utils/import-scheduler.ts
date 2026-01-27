import { GovernanceType, ActivityStatus } from '@prisma/client';
import { addWeeks, startOfYear, startOfWeek } from 'date-fns';

interface CsvGovernanceRow {
  'N°'?: string | number;
  'Activités '?: string;
  'INTITULE '?: string;
  'INTITULE'?: string;
  'Date Prévue'?: string;
  'DATE PREVISIONNELLE'?: string;
  'THEMES '?: string;
  'Thème'?: string;
  'LIEU PREVISIONNEL'?: string;
  'Observation'?: string;
  'Commentaires'?: string;
  [key: string]: any;
}

/**
 * ✅ RÉÉCRITURE ÉLITE : Transformation CSV vers Prisma
 */
export const transformCsvToGovernance = (csvData: CsvGovernanceRow[], type: GovernanceType, tenantId: string) => {
  return csvData.map((row) => {
    const plannedDateStr = row['Date Prévue'] || row['DATE PREVISIONNELLE'] || '';
    
    return {
      GA_Num: row['N°']?.toString() || 'SMI-EXT',
      GA_Title: (row['Activités '] || row['INTITULE '] || row['INTITULE'] || 'Activité sans titre').toUpperCase(),
      GA_Type: type,
      GA_Theme: row['THEMES '] || row['Thème'] || null,
      GA_DatePlanned: parseExcelDate(plannedDateStr),
      GA_Location: row['LIEU PREVISIONNEL'] || 'Visioconférence Teams',
      GA_Observations: row['Observation'] || row['Commentaires'] || null,
      GA_Status: ActivityStatus.PLANNED,
      tenantId: tenantId,
    };
  });
};

/**
 * 🛰️ HELPER : Conversion intelligente des dates Excel/Texte
 */
function parseExcelDate(dateStr: string): Date {
  if (!dateStr || dateStr === '---' || dateStr.trim() === '') return new Date();
  
  // 1. Gestion du format ISO direct (YYYY-MM-DD)
  if (dateStr.includes('-')) {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
  }

  // 2. Intelligence Qualisoft : Gestion des "Semaines" (ex: "Semaine 12")
  const weekMatch = dateStr.toLowerCase().match(/semaine\s*(\d+)/);
  if (weekMatch && weekMatch[1]) {
    const weekNum = parseInt(weekMatch[1], 10);
    const yearStart = startOfYear(new Date());
    // On calcule le début de la semaine correspondante
    return addWeeks(startOfWeek(yearStart, { weekStartsOn: 1 }), weekNum - 1);
  }

  // 3. Fallback par défaut
  return new Date();
}