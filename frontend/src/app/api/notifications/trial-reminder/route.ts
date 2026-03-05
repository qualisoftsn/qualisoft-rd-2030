//* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE API : TRIAL REMINDER (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Engine SMTP pour les rappels de fin de période d'essai.
 * RÉVISION : 04 Mars 2026 | 23:37 GMT
 * -------------------------------------------------------------------------
 */

import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { daysLeft, tenantId, email, type } = await request.json();

    if (!email || !tenantId) {
      return NextResponse.json({ success: false, error: 'Paramètres du Nœud manquants' }, { status: 400 });
    }

    let subject = '';
    let content = '';

    if (type === 'MID_TRIAL' && daysLeft === 7) {
      subject = 'Qualisoft - Mi-parcours de votre essai Matrix (7 jours restants)';
      content = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">Vous êtes à mi-parcours ! 🚀</h2>
          <p>Bonjour,</p>
          <p>Il vous reste <strong>7 jours</strong> pour explorer Qualisoft Elite sans limitation.</p>
          <ul>
            <li>✅ Sceller vos premiers processus</li>
            <li>✅ Inviter votre équipe de direction</li>
            <li>✅ Vérifier les indicateurs de performance</li>
          </ul>
          <a href="https://app.qualisoft.sn/dashboard" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px;">Accéder à mon espace</a>
        </div>
      `;
    } else if (type === 'CRITICAL_12D' && daysLeft === 2) {
      subject = '⚠️ Qualisoft - Votre Hub expire dans 2 jours';
      content = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Votre espace expire bientôt ! ⏰</h2>
          <p>Bonjour,</p>
          <p>Plus que <strong>2 jours</strong> avant la fin de votre bail de 14 jours.</p>
          <p><strong>Passé ce délai, le Nœud passera en lecture seule.</strong></p>
          <p>Pour maintenir vos opérations :</p>
          <ol>
            <li>Cliquez sur "Activer mon compte" dans le dashboard</li>
            <li>Validez votre protocole de scellage</li>
          </ol>
        </div>
      `;
      
      // Copie de sécurité à l'Architecte Master
      await transporter.sendMail({
        from: '"Qualisoft Core" <ab.thiongane@qualisoft.sn>',
        to: 'ab.thiongane@qualisoft.sn',
        subject: `[ALERTE CLOSING] Prospect J-2: ${email}`,
        html: `<p>Le prospect ${email} (Tenant ID: ${tenantId}) est à J-2 de la clôture de son essai.</p>`,
      });
    } else {
      return NextResponse.json({ success: false, error: 'Type de notification inconnu' }, { status: 400 });
    }

    // Envoi au prospect
    await transporter.sendMail({
      from: '"Qualisoft" <ab.thiongane@qualisoft.sn>',
      to: email,
      subject,
      html: content,
    });

    return NextResponse.json({ success: true, message: 'Protocole de rappel exécuté' });

  } catch (error) {
    console.error('[TRIAL_REMINDER_ERROR]:', error);
    return NextResponse.json({ success: false, error: 'Erreur SMTP' }, { status: 500 });
  }
}