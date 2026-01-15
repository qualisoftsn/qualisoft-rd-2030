import { z } from 'zod';

export const sseSchema = z.object({
  type: z.string().min(1, "Le type est requis"),
  dateHeure: z.string(),
  lieu: z.string().min(1, "Le lieu est requis"),
  description: z.string().min(10, "Description trop courte"),
  // ✅ On retire .optional() et on force une valeur par défaut
  // Cela garantit que le type de sortie est 'boolean' et non 'boolean | undefined'
  avecArret: z.boolean(), 
  nbJoursArret: z.number(),
  causesImmediates: z.string().default(''),
});

// ✅ On génère le type à partir du schéma corrigé
export type SSEFormData = z.infer<typeof sseSchema>;