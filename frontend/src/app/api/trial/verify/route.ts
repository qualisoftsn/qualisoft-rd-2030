/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { addDays } from 'date-fns';
import prisma from '@/core/lib/prisma';
import { SubscriptionStatus } from '@/types/elite-sde';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    // Vérification du code stocké dans le champ CEO
    const tenant = await prisma.tenant.findFirst({
      where: {
        T_Email: email,
        T_CeoName: code,
        T_SubscriptionStatus: SubscriptionStatus.PENDING
      }
    });

    if (!tenant) {
      return NextResponse.json({ message: 'Code de vérification invalide' }, { status: 401 });
    }

    // 🟢 ACTIVATION DU STATUT TRIAL
    await prisma.$transaction(async (tx) => {
      await tx.tenant.update({
        where: { T_Id: tenant.T_Id },
        data: {
          T_SubscriptionStatus: SubscriptionStatus.TRIAL, // Activation réelle de l'essai
          T_SubscriptionEndDate: addDays(new Date(), 14), // Scellage des 14 jours
          T_CeoName: null, // Nettoyage du code OTP
          T_IsActive: true
        }
      });

      await tx.user.updateMany({
        where: { tenantId: tenant.T_Id, U_Email: email },
        data: { U_IsActive: true, U_FirstLogin: true }
      });
    });

    const response = NextResponse.json({ success: true, redirect: '/dashboard' });
    
    // Scellage de la session via Cookies HttpOnly
    response.cookies.set('qualisoft_tenant_id', tenant.T_Id, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 14, // 14 jours
      path: '/' 
    });
    
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: "Erreur lors de l'activation" }, { status: 500 });
  }
}