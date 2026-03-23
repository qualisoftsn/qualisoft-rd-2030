// frontend/src/app/api/quiz/questions/route.ts
import { NextResponse } from 'next/server';
import { QUIZ_QUESTIONS } from '@/config/quiz';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function GET() {
  try {
    // On ne renvoie que les champs nécessaires (pas le weight côté client)
    const questions = QUIZ_QUESTIONS.map(({ id, clause, question }) => ({
      id,
      clause,
      question,
    }));

    return NextResponse.json(
      { 
        success: true, 
        questions,
        totalQuestions: questions.length,
      }, 
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('❌ Erreur API quiz questions:', error);
    return NextResponse.json(
      { error: 'Impossible de charger les questions du quiz' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}