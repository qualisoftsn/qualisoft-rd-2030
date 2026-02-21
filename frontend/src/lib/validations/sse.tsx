/**
 * 🛡️ MODULE : SSE VALIDATION SCHEMA (ZOD MATRIX CORE)
 * -------------------------------------------------------------------------
 * FONCTION : Schéma de validation haute-fidélité pour les incidents et accidents.
 * RÔLE : Garantir l'intégrité absolue des données avant injection dans le SDE.
 * NORME : Conforme à la clause §10.2 de l'ISO 45001 (Traitement des évènements).
 * ISOLATION : Structure multi-tenant garantissant l'étanchéité des données.
 */

import { z } from 'zod';

export const sseIncidentSchema = z.object({
  // 🏷️ CLASSIFICATION ISO (Lignes 13-14 : Correction par raffinement strict)
  type: z.string().refine(
    (val) => ['ACCIDENT_TRAVAIL', 'ACCIDENT_TRAJET', 'PRESQU_ACCIDENT', 'INCIDENT_ENV'].includes(val),
    { message: "La classification de l'événement est obligatoire pour le scellage." }
  ),

  // 🕒 HORODATAGE SCELLÉ (Traçabilité temporelle certifiée)
  dateHeure: z.string().min(1, "L'horodatage des faits est requis pour la traçabilité ISO."),

  // 📍 LOCALISATION (Point d'occurrence géographique)
  lieu: z.string().min(3, "La zone d'occurrence doit être spécifiée précisément (Site/Zone)."),

  // 📝 CIRCONSTANCES (Preuve documentaire factuelle)
  description: z.string().min(10, "La description doit être détaillée pour l'analyse des causes fondamentales."),

  // 🚦 IMPACT CONTINUITÉ (Isolation du flux de gravité)
  // Utilisation de z.preprocess pour forcer la conversion avant validation
  avecArret: z.preprocess(
    (val) => (typeof val === "string" ? val === "true" : val),
    z.boolean({ message: "Le statut de l'arrêt doit être défini (OUI/NON)." })
  ),

  // 📉 GRAVITÉ NUMÉRIQUE (Ligne 37 : Correction par coercition chaînée)
  // On élimine l'objet littéral interne pour éviter l'erreur de propriété inconnue.
  nbJoursArret: z.preprocess(
    (val) => (val === "" || val === undefined ? 0 : Number(val)),
    z.number().min(0, "Le nombre de jours d'arrêt ne peut être une valeur négative.")
  ),
});

/**
 * 🧬 TYPE SCELLÉ : SSEINCIDENTINPUT
 * Ce type est utilisé par le Kernel pour l'inférence de données à travers 
 * les couches de l'application Multi-Tenant.
 */
export type SSEIncidentInput = z.infer<typeof sseIncidentSchema>;