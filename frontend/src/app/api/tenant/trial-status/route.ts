/**
 * CHEMIN ABSOLU : /src/app/api/tenant/trial-status/route.ts
 * PROJET : Qualisoft Elite (Frontend)
 * RÔLE : Calcul du statut d'essai (Audit-Ready)
 * SECURITÉ : Authentification via Cookie HttpOnly (Post-NextAuth)
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/core/lib/prisma'; // Utilisation de l'alias @/
import { differenceInDays, differenceInHours, isAfter } from 'date-fns';

export async function GET() {
  try {
    // 🛡️ RÉCUPÉRATION DU TENANT ID DEPUIS TON COOKIE (Système HttpOnly)
    const cookieStore = await cookies();
    const tenantId = cookieStore.get('qualisoft_tenant_id')?.value;
    const userId = cookieStore.get('qualisoft_user_id')?.value;

    if (!tenantId || !userId) {
      return NextResponse.json({ error: "Session Matrix invalide" }, { status: 401 });
    }

    // 🛡️ REQUÊTE STRICTE SELON SCHEMA.PRISMA (Zéro Hallucination)
    const tenant = await prisma.tenant.findUnique({
      where: { T_Id: tenantId },
      select: {
        T_SubscriptionStatus: true, 
        T_SubscriptionEndDate: true,
        T_Name: true,
        T_Plan: true
      }
    });

    if (!tenant) {
      return NextResponse.json({ error: "Entité introuvable dans la Matrix" }, { status: 404 });
    }

    // 🧠 LOGIQUE MÉTIER : Déduction du cycle de vie de l'abonnement
    const isTrial = tenant.T_SubscriptionStatus === 'TRIAL';
    const now = new Date();
    
    // Si pas de date de fin définie, on considère l'expiration immédiate par sécurité
    const trialEnd = tenant.T_SubscriptionEndDate ? new Date(tenant.T_SubscriptionEndDate) : now;

    const daysRemaining = differenceInDays(trialEnd, now);
    const hoursRemaining = differenceInHours(trialEnd, now);
    const isExpired = isAfter(now, trialEnd);

    // Retour conforme pour ton composant TrialBanner
    return NextResponse.json({
      isTrial: isTrial,
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      hoursRemaining: hoursRemaining > 0 ? hoursRemaining : 0,
      isExpired: isExpired && isTrial,
      tenantName: tenant.T_Name,
      plan: tenant.T_Plan,
      status: tenant.T_SubscriptionStatus
    });

  } catch (error) {
    console.error("🚨 [MATRIX-ABONNEMENT] Erreur critique:", error);
    return NextResponse.json({ error: "Erreur interne du système Matrix" }, { status: 500 });
  }
}