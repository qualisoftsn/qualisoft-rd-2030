// frontend/src/config/quiz.ts

export type QuizAnswer = 'OUI' | 'UN PEU' | 'NON';

export interface QuizQuestion {
  id: string;
  clause: string; // Ex: "§4.1", "§5.1"
  question: string;
  weight: number; // Impact sur le score (1-3)
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // §4 Contexte de l'organisme (2 questions)
  {
    id: 'q1',
    clause: '§4.1',
    question: 'Votre organisation a-t-elle identifié les enjeux internes et externes pertinents pour son SMI ?',
    weight: 2,
  },
  {
    id: 'q2',
    clause: '§4.2',
    question: 'Les besoins et attentes des parties intéressées (clients, autorités, employés) sont-ils documentés et revus régulièrement ?',
    weight: 2,
  },
  
  // §5 Leadership (2 questions)
  {
    id: 'q3',
    clause: '§5.1',
    question: 'La direction démontre-t-elle son engagement envers le SMI par des actions concrètes et mesurables ?',
    weight: 3,
  },
  {
    id: 'q4',
    clause: '§5.3',
    question: 'Les rôles, responsabilités et autorités liés au SMI sont-ils clairement définis et communiqués ?',
    weight: 2,
  },
  
  // §6 Planification (2 questions)
  {
    id: 'q5',
    clause: '§6.1',
    question: 'Votre organisation a-t-elle une démarche structurée pour identifier et traiter les risques et opportunités ?',
    weight: 3,
  },
  {
    id: 'q6',
    clause: '§6.2',
    question: 'Des objectifs qualité mesurables et alignés avec la politique sont-ils définis et suivis ?',
    weight: 2,
  },
  
  // §7 Support (2 questions)
  {
    id: 'q7',
    clause: '§7.2',
    question: 'Les compétences nécessaires pour chaque poste sont-elles identifiées, évaluées et développées ?',
    weight: 2,
  },
  {
    id: 'q8',
    clause: '§7.5',
    question: 'Vos informations documentées (procédures, enregistrements) sont-elles maîtrisées, accessibles et protégées ?',
    weight: 2,
  },
  
  // §8 Réalisation des activités (3 questions)
  {
    id: 'q9',
    clause: '§8.1',
    question: 'La planification et la maîtrise opérationnelle de vos processus sont-elles documentées et appliquées ?',
    weight: 3,
  },
  {
    id: 'q10',
    clause: '§8.2',
    question: 'Les exigences relatives aux produits/services sont-elles déterminées, revues et communiquées avant engagement ?',
    weight: 2,
  },
  {
    id: 'q11',
    clause: '§8.5',
    question: 'La production et la prestation de service sont-elles réalisées dans des conditions maîtrisées et traçables ?',
    weight: 2,
  },
  
  // §9 Évaluation des performances (2 questions)
  {
    id: 'q12',
    clause: '§9.1',
    question: 'Des indicateurs de performance sont-ils définis, mesurés et analysés pour piloter votre SMI ?',
    weight: 3,
  },
  {
    id: 'q13',
    clause: '§9.2',
    question: 'Des audits internes sont-ils planifiés et réalisés pour vérifier la conformité et l\'efficacité du SMI ?',
    weight: 2,
  },
  
  // §10 Amélioration (2 questions)
  {
    id: 'q14',
    clause: '§10.2',
    question: 'Les non-conformités sont-elles traitées avec des actions correctives efficaces et vérifiées ?',
    weight: 3,
  },
  {
    id: 'q15',
    clause: '§10.3',
    question: 'Votre organisation améliore-t-elle continuellement la pertinence, l\'adéquation et l\'efficacité du SMI ?',
    weight: 2,
  },
];

// Calcul du score et du niveau de maturité
export function calculateQuizScore(answers: Record<string, QuizAnswer>): {
  score: number;
  maxScore: number;
  percentage: number;
  level: 'NIVEAU_1' | 'NIVEAU_2' | 'NIVEAU_3' | 'NIVEAU_4' | 'NIVEAU_5';
  recommendations: string[];
} {
  let totalPoints = 0;
  let maxPoints = 0;
  const weakClauses: string[] = [];

  QUIZ_QUESTIONS.forEach(q => {
    const answer = answers[q.id];
    const weight = q.weight;
    maxPoints += weight * 3; // Max 3 points par question (OUI = 3, UN PEU = 2, NON = 0)

    if (answer === 'OUI') {
      totalPoints += weight * 3;
    } else if (answer === 'UN PEU') {
      totalPoints += weight * 2;
      weakClauses.push(q.clause);
    } else {
      // NON = 0 point
      weakClauses.push(q.clause);
    }
  });

  const percentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
  
  // Détermination du niveau de maturité (échelle ISO 9004)
  let level: 'NIVEAU_1' | 'NIVEAU_2' | 'NIVEAU_3' | 'NIVEAU_4' | 'NIVEAU_5';
  let recommendations: string[] = [];

  if (percentage < 30) {
    level = 'NIVEAU_1';
    recommendations = [
      'Prioriser la formalisation de vos processus clés',
      'Documenter les responsabilités et autorités',
      'Mettre en place un registre des risques de base',
      'Former le personnel aux fondamentaux ISO 9001',
      'Établir une politique qualité simple et communicable',
    ];
  } else if (percentage < 50) {
    level = 'NIVEAU_2';
    recommendations = [
      'Structurer votre démarche d\'amélioration continue',
      'Définir des indicateurs de performance pour chaque processus',
      'Planifier des audits internes réguliers',
      'Documenter les procédures opérationnelles critiques',
      'Impliquer la direction dans les revues de processus',
    ];
  } else if (percentage < 70) {
    level = 'NIVEAU_3';
    recommendations = [
      'Optimiser la gestion des risques et opportunités',
      'Renforcer l\'implication de la direction dans les revues',
      'Digitaliser la gestion documentaire pour plus d\'efficacité',
      'Standardiser les processus support (RH, Achats, IT)',
      'Développer la culture qualité à tous les niveaux',
    ];
  } else if (percentage < 90) {
    level = 'NIVEAU_4';
    recommendations = [
      'Déployer des analyses prédictives sur vos indicateurs',
      'Intégrer l\'innovation dans votre démarche d\'amélioration',
      'Étendre le SMI à l\'ensemble de votre écosystème',
      'Automatiser les processus à faible valeur ajoutée',
      'Développer des partenariats stratégiques durables',
    ];
  } else {
    level = 'NIVEAU_5';
    recommendations = [
      'Partager vos bonnes pratiques comme référence sectorielle',
      'Pionnier dans l\'intégration IA/automatisation du SMI',
      'Mentorer d\'autres organisations dans leur démarche qualité',
      'Innover dans les modèles de management collaboratif',
      'Contribuer à l\'évolution des normes ISO',
    ];
  }

  // Recommandations spécifiques aux clauses faibles
  if (weakClauses.length > 0) {
    const uniqueClauses = [...new Set(weakClauses)];
    recommendations.unshift(`🎯 Renforcer la maîtrise des clauses: ${uniqueClauses.join(', ')}`);
  }

  return {
    score: totalPoints,
    maxScore: maxPoints,
    percentage,
    level,
    recommendations: recommendations.slice(0, 5), // Top 5 recommandations
  };
}

export default QUIZ_QUESTIONS;