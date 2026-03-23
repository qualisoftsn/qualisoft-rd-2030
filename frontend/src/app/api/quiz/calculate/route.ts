// frontend/src/app/api/quiz/calculate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { QUIZ_QUESTIONS, calculateQuizScore, QuizAnswer } from '@/config/quiz';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answers } = body;

    // Validation : toutes les questions doivent avoir une réponse
    const questionIds = QUIZ_QUESTIONS.map(q => q.id);
    const missingAnswers = questionIds.filter(id => !answers[id]);
    
    if (missingAnswers.length > 0) {
      return NextResponse.json(
        { error: `Réponses manquantes pour: ${missingAnswers.join(', ')}` },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validation des valeurs de réponse
    const validAnswers: QuizAnswer[] = ['OUI', 'UN PEU', 'NON'];
    for (const [questionId, answer] of Object.entries(answers)) {
      if (!validAnswers.includes(answer as QuizAnswer)) {
        return NextResponse.json(
          { error: `Réponse invalide pour la question ${questionId}: ${answer}` },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // Calcul du score
    const result = calculateQuizScore(answers as Record<string, QuizAnswer>);

    return NextResponse.json(
      {
        success: true,
        result: {
          ...result,
          // On ajoute des détails pour le rapport PDF
          details: QUIZ_QUESTIONS.map(q => ({
            clause: q.clause,
            question: q.question,
            answer: answers[q.id],
            weight: q.weight,
          })),
          completedAt: new Date().toISOString(),
        },
      },
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('❌ Erreur API quiz calculate:', error);
    return NextResponse.json(
      { error: 'Erreur lors du calcul du score' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}