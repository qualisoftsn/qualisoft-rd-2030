export enum PlanType {
  EMERGENCE = 'EMERGENCE',
  CROISSANCE = 'CROISSANCE',
  ENTREPRISE = 'ENTREPRISE',
  GROUPE = 'GROUPE',
}

export const PLAN_LIMITS = {
  [PlanType.EMERGENCE]: { rq: 1, pilotes: 3, copilotes: 0 },
  [PlanType.CROISSANCE]: { rq: 1, pilotes: 6, copilotes: 0 },
  [PlanType.ENTREPRISE]: { rq: 2, pilotes: 10, copilotes: 10 },
  [PlanType.GROUPE]: { rq: 999, pilotes: 999, copilotes: 999 }, // Illimité
};