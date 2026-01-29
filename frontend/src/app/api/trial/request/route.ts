/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { randomInt } from 'crypto';
import { addMinutes } from 'date-fns';
import { sendEmail } from '@/core/services/email'; // Votre service mail

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    // Validation email
    if (!email || !email.includes('@')) {
      return NextResponse.json({ message: 'Email invalide' }, { status: 400 });
    }
    
    // Vérification si déjà un trial actif
    const existingTrial = await prisma.trialAccount.findFirst({
      where: { 
        email, 
        status: 'ACTIVE',
        expiresAt: { gt: new Date() }
      }
    });
    
    if (existingTrial) {
      // Renvoyer juste un nouveau code si trial actif
      const code = randomInt(100000, 999999).toString();
      await prisma.trialCode.create({
        data: {
          trialId: existingTrial.id,
          code,
          expiresAt: addMinutes(new Date(), 15)
        }
      });
      
      await sendEmail({
        to: email,
        subject: 'Votre code d\'accès Qualisoft (14 jours)',
        html: `<div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">Accès Essai 14 Jours</h1>
          <p>Votre code temporaire :</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; background: #f3f4f6; border-radius: 8px; margin: 20px 0;">
            ${code}
          </div>
          <p style="color: #6b7280; font-size: 12px;">Valide 15 minutes. Ne partagez ce code avec personne.</p>
        </div>`
      });
      
      return NextResponse.json({ message: 'Code renvoyé' });
    }
    
    // Création nouveau trial
    const code = randomInt(100000, 999999).toString();
    
    // Stockage temporaire (à valider ensuite)
    await prisma.trialVerification.create({
      data: {
        email,
        code,
        expiresAt: addMinutes(new Date(), 15),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
      }
    });
    
    await sendEmail({
      to: email,
      subject: 'Code d\'accès Qualisoft - Essai 14 jours',
      html: `...` // Template email avec code
    });
    
    return NextResponse.json({ message: 'Code envoyé' });
    
  } catch (error) {
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}