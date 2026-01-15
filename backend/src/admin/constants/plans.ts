import { Plan } from '@prisma/client'; // ✅ Import de l'Enum officiel

export interface PlanDetail {
  id: Plan; // ✅ On impose le type Plan (Enum) et non string
  name: string;
  rawPrice: number;
}

export const PLANS_DATA: PlanDetail[] = [
  { id: Plan.EMERGENCE, name: 'Émergence', rawPrice: 25000 },
  { id: Plan.CROISSANCE, name: 'Croissance', rawPrice: 75000 },
  { id: Plan.ENTREPRISE, name: 'Entreprise', rawPrice: 125000 },
  { id: Plan.GROUPE, name: 'Groupe Élite', rawPrice: 250000 },
];