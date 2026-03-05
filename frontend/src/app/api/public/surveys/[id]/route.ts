/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE API : PUBLIC SURVEYS DYNAMIC ROUTE (elite-sde)
 * -------------------------------------------------------------------------
 * FIX : Next.js 15+ "Params as Promise" parfaitement scellé.
 * RÉVISION : 04 Mars 2026 | 23:37 GMT
 * -------------------------------------------------------------------------
 */

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/core/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Déballage asynchrone des paramètres (Obligation Next.js 15)
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
      return NextResponse.json({ success: false, error: "Nœud d'enquête introuvable." }, { status: 404 });
    }

    if (campaign.SC_Status !== 'OPEN') {
      return NextResponse.json({ success: false, error: "Le registre de cette enquête est verrouillé." }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: campaign });

  } catch (error) {
    console.error("[PUBLIC_SURVEY_GET_ERROR]:", error);
    return NextResponse.json({ success: false, error: "Erreur noyau Matrix" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { respondent, responses, comment } = await req.json(); 

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

    return NextResponse.json({ success: true, data: { id: result.RES_Id } }, { status: 201 });

  } catch (error) {
    console.error("[PUBLIC_SURVEY_POST_ERROR]:", error);
    return NextResponse.json({ success: false, error: "Échec du scellage des réponses" }, { status: 500 });
  }
}