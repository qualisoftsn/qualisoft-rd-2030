import { Plan } from '@prisma/client'; // ✅ Import de l'Enum officiel

export interface PlanDetail {
  id: Plan; // ✅ On impose le type Plan (Enum) et non string
  name: string;
  rawPrice: number;
}

export const PLANS_DATA: PlanDetail[] = [
  { id: Plan.EMERGENCE, name: 'Émergence', rawPrice: 55000 },
  { id: Plan.CROISSANCE, name: 'Croissance', rawPrice: 105000 },
  { id: Plan.ENTREPRISE, name: 'Entreprise', rawPrice: 175000 },
  { id: Plan.GROUPE, name: 'Groupe Élite', rawPrice: 350000 },
];