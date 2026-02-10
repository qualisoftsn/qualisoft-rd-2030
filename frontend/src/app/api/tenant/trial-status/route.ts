/**
 * CHEMIN ABSOLU : /src/app/api/tenant/trial-status/route.ts
 * PROJET : Qualisoft Elite (Frontend)
 * RÔLE : Calcul du statut d'essai basé sur le Schema Prisma réel (Zéro Hallucination)
 */

import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import prisma from '../../../../lib/prisma';
import { differenceInDays, differenceInHours } from 'date-fns';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // 🛡️ REQUÊTE STRICTE SELON TON SCHEMA.PRISMA
    const tenant = await prisma.tenant.findUnique({
      where: { T_Id: session.user.tenantId },
      select: {
        T_SubscriptionStatus: true, // Remplace T_IsTrial
        T_SubscriptionEndDate: true, // Remplace T_TrialEndsAt
        T_Name: true,
        T_Plan: true
      }
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant introuvable" }, { status: 404 });
    }

    // 🧠 LOGIQUE MÉTIER : Déduction du statut d'essai
    const isTrial = tenant.T_SubscriptionStatus === 'TRIAL';
    const now = new Date();
    // Si pas de date de fin définie, on met une date par défaut ou null
    const trialEnd = tenant.T_SubscriptionEndDate ? new Date(tenant.T_SubscriptionEndDate) : new Date();

    const daysRemaining = differenceInDays(trialEnd, now);
    const hoursRemaining = differenceInHours(trialEnd, now);

    return NextResponse.json({
      isTrial: isTrial,
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      hoursRemaining: hoursRemaining > 0 ? hoursRemaining : 0,
      isExpired: now > trialEnd && isTrial,
      tenantName: tenant.T_Name,
      plan: tenant.T_Plan
    });

  } catch (error) {
    console.error("🚨 [Trial-Status] Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}