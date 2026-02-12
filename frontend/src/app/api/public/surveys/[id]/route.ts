/* eslint-disable @typescript-eslint/no-explicit-any */
/* NOM COMPLET : src/app/api/public/surveys/[id]/route.ts
   CORRECTIF : Compatibilité Next.js 15+ (Params as Promise)
*/

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. GET : Récupérer les détails de l'enquête
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // 👈 TYPAGE CORRIGÉ
) {
  try {
    // 👈 DÉBALLAGE DE LA PROMESSE (OBLIGATOIRE EN NEXT.JS 15+)
    const { id } = await params; 

    const campaign = await prisma.surveyCampaign.findUnique({
      where: { SC_Id: id },
      select: {
        SC_Title: true,
        SC_Target: true,
        SC_Status: true,
        SC_Questions: true,
        SC_TenantId: true
      }
    });

    if (!campaign) {
      return NextResponse.json({ error: "Enquête introuvable ou archivée" }, { status: 404 });
    }

    if (campaign.SC_Status !== 'OPEN') {
      return NextResponse.json({ error: "Cette enquête est actuellement fermée." }, { status: 403 });
    }

    return NextResponse.json(campaign);

  } catch (error) {
    console.error("Erreur Public Survey GET:", error);
    return NextResponse.json({ error: "Erreur système" }, { status: 500 });
  }
}

// 2. POST : Enregistrer les réponses
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // 👈 TYPAGE CORRIGÉ
) {
  try {
    // 👈 DÉBALLAGE DE LA PROMESSE
    const { id } = await params;
    
    const body = await req.json();
    const { respondent, responses, comment } = body; 

    let totalScore = 0;
    let countScore = 0;

    if (Array.isArray(responses)) {
        responses.forEach((r: any) => {
            if (typeof r.value === 'number') {
                totalScore += r.value;
                countScore++;
            }
        });
    }

    const finalScore = countScore > 0 ? Math.round(totalScore / countScore) : 0;

    const result = await prisma.surveyResult.create({
      data: {
        RES_CampaignId: id,
        RES_Respondent: respondent || "Anonyme",
        RES_Score: finalScore,
        RES_Details: responses,
        RES_Comment: comment,
        RES_Status: finalScore < 5 ? "PENDING" : "PROCESSED",
      }
    });

    return NextResponse.json({ success: true, id: result.RES_Id }, { status: 201 });

  } catch (error) {
    console.error("Erreur Public Survey POST:", error);
    return NextResponse.json({ error: "Échec de l'enregistrement" }, { status: 500 });
  }
}