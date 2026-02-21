/**
 * 🛡️ SCHÉMA ZOD : VALIDATION SSE (BARRIÈRE D'INTÉGRITÉ)
 * -------------------------------------------------------------------------
 * FONCTION : Protéger le Kernel contre l'injection de données corrompues.
 * RÔLE : Assurer la conformité stricte des rapports d'incidents (ISO 45001).
 */

import { z } from 'zod';

export const sseSchema = z.object({
  type: z.string().min(1, "La classification de l'événement est requise."),
  dateHeure: z.string().min(1, "L'horodatage de l'événement est obligatoire."),
  lieu: z.string().min(1, "Le périmètre (lieu) de l'incident est requis."),
  description: z.string().min(10, "L'expertise exige une description circonstanciée (min. 10 caractères)."),
  
  // ✅ Typage booléen strict (ni optionnel, ni undefined)
  avecArret: z.boolean({
    required_error: "L'impact sur la continuité (Arrêt) doit être spécifié.",
  }), 
  
  nbJoursArret: z.number().min(0, "Le nombre de jours d'arrêt ne peut être négatif."),
  causesImmediates: z.string().default(''),
}).refine((data) => {
  // 📐 RÈGLES MÉTIER QUALISOFT ELITE
  // 1. Si "avecArret" est vrai, il faut au moins 1 jour d'arrêt.
  if (data.avecArret && data.nbJoursArret === 0) return false;
  // 2. Si "avecArret" est faux, le nombre de jours doit obligatoirement être 0.
  if (!data.avecArret && data.nbJoursArret > 0) return false;
  
  return true;
}, {
  message: "Incohérence détectée entre la déclaration d'arrêt et le nombre de jours spécifié.",
  path: ["nbJoursArret"] // Le message d'erreur sera rattaché à ce champ spécifique
});

// ✅ Génération du type strict à partir du schéma consolidé
export type SSEFormData = z.infer<typeof sseSchema>;