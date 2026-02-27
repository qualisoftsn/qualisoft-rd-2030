/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { randomInt } from 'crypto';
import prisma from '@/core/lib/prisma'; 
import { sendEmail } from '@/core/services/email'; 
import { Plan, SubscriptionStatus, Role } from '@/types/elite-sde';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const code = randomInt(100000, 999999).toString();

    // 🛡️ CREATION INITIALE : Plan ESSAI + Statut PENDING
    await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          T_Name: `ORGANISATION ${email.split('@')[0].toUpperCase()}`,
          T_Email: email,
          T_Domain: `trial-${Date.now()}`,
          T_Plan: Plan.ESSAI, // Le plan est déjà ESSAI
          T_SubscriptionStatus: SubscriptionStatus.PENDING, // Bloqué en attente du code
          T_CeoName: code, // Stockage temporaire du code OTP
          T_ContractDuration: 0,
          T_TacitRenewal: false,
          T_IsActive: false
        }
      });

      await tx.user.create({
        data: {
          U_Email: email,
          U_PasswordHash: "WAITING_VERIFICATION",
          U_Role: Role.ADMIN,
          U_IsActive: false,
          tenantId: tenant.T_Id
        }
      });
    });

    await sendEmail({
      to: email,
      subject: 'Votre code d\'accès Qualisoft (Essai 14 jours)',
      html: `
        <div style="font-family:sans-serif; max-width:500px; border:1px solid #e5e7eb; padding:30px; border-radius:15px;">
          <h2 style="color:#2563eb italic">QUALISOFT <span style="font-weight:100">SMI</span></h2>
          <p>Voici votre code pour activer votre <b>Plan ESSAI</b> :</p>
          <div style="font-size:32px; font-weight:bold; letter-spacing:10px; background:#f8fafc; padding:20px; text-align:center; color:#1e40af; border:1px dashed #3b82f6;">
            ${code}
          </div>
        </div>`
    });

    return NextResponse.json({ message: 'Code transmis' });
  } catch (error: any) {
    console.error("[TRIAL_REQUEST_ERROR]", error);
    return NextResponse.json({ error: "Erreur lors de l'initialisation de l'essai" }, { status: 500 });
  }
}