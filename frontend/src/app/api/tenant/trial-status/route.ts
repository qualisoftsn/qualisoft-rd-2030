//* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/core/lib/auth";
import prisma from '@/core/lib/prisma';
import { differenceInDays, differenceInHours } from 'date-fns';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // 🟢 CORRECTION 1 : Vérification stricte que l'user existe
    if (!session || !session.user) {
     return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // 🟢 CORRECTION 2 : Typage explicite pour accéder à 'tenantId'
    const user = session.user as any;

    const tenant = await prisma.tenant.findUnique({
      where: { T_Id: user.tenantId },
      select: {
        T_SubscriptionStatus: true,
        T_SubscriptionEndDate: true,
        T_Name: true
      }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant non trouvé' }, { status: 404 });
    }

    if (tenant.T_SubscriptionStatus !== 'TRIAL') {
      return NextResponse.json({ 
        subscriptionStatus: tenant.T_SubscriptionStatus,
        isTrial: false 
      });
    }

    const endDate = tenant.T_SubscriptionEndDate || new Date();
    const now = new Date();
    
    const daysLeft = differenceInDays(endDate, now);
    const hoursLeft = differenceInHours(endDate, now);
    const isExpired = daysLeft < 0;

    return NextResponse.json({
      subscriptionStatus: 'TRIAL',
      isTrial: true,
      daysLeft: Math.max(0, daysLeft),
      hoursLeft: Math.max(0, hoursLeft),
      isExpired,
      endDate: tenant.T_SubscriptionEndDate,
      tenantName: tenant.T_Name
    });

  } catch (error) {
    console.error("Erreur API Trial Status:", error); // Ajout d'un log pour t'aider au cas où
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}