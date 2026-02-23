/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Configuration SMTP (à adapter avec vos credentials)
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
    const body = await request.json();
    const { daysLeft, tenantId, email, type } = body;

    if (!email || !tenantId) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    let subject = '';
    let content = '';
    const toEmail = email;

    if (type === 'MID_TRIAL' && daysLeft === 7) {
      // Email au prospect à J-7
      subject = 'Qualisoft - Mi-parcours de notre essai (7 jours restants)';
      content = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">Vous êtes à mi-parcours ! 🚀</h2>
          <p>Bonjour,</p>
          <p>Il vous reste <strong>7 jours</strong> pour explorer Qualisoft sans limitation.</p>
          <p>N'oubliez pas :</p>
          <ul>
            <li>✅ Créer vos premiers processus</li>
            <li>✅ Inviter notre équipe</li>
            <li>✅ Tester les audits et indicateurs</li>
          </ul>
          <p>Besoin d'aide ? Répondez à cet email ou cliquez sur le bouton "Activer" dans notre dashboard.</p>
          <a href="https://qualisoft.sn/dashboard" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px;">Continuer mon essai</a>
        </div>
      `;
    } else if (type === 'CRITICAL_12D' && daysLeft === 2) {
      // Email au prospect à J-12 (2 jours restants)
      subject = '⚠️ Qualisoft - notre essai expire dans 2 jours';
      content = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">notre essai expire bientôt ! ⏰</h2>
          <p>Bonjour,</p>
          <p>Plus que <strong>2 jours</strong> avant la fin de notre période d'essai de 14 jours.</p>
          <p><strong>Passé ce délai, notre accès passera en lecture seule.</strong></p>
          <p>Pour conserver l'accès complet à vos données et continuer à utiliser Qualisoft :</p>
          <ol>
            <li>Cliquez sur "Activer mon compte" dans notre dashboard</li>
            <li>Choisissez notre formule (Émergence, Croissance ou Entreprise)</li>
            <li>Notre équipe vous contactera sous 24h</li>
          </ol>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">Besoin d'une extension ? Contactez-nous immédiatement.</p>
        </div>
      `;
      
      // BCC à l'admin pour suivi commercial
      await transporter.sendMail({
        from: '"Qualisoft" <ab.thiongane@qualisoft.sn>',
        to: email,
        bcc: 'abthiongane@qualisoft.sn', // Copie cachée à l'admin
        subject: `[ALERTE COMMERCIALE] Prospect J-2: ${email}`,
        html: `<p>Le prospect ${email} (Tenant: ${tenantId}) est à J-2 avant expiration.</p>`,
      });
    } else {
      return NextResponse.json({ error: 'Type non reconnu' }, { status: 400 });
    }

    // Envoi de l'email principal
    await transporter.sendMail({
      from: '"Qualisoft" <ab.thiongane@qualisoft.sn>',
      to: toEmail,
      subject,
      html: content,
    });

    return NextResponse.json({ success: true, message: 'Email envoyé' });

  } catch (error) {
    console.error('Erreur envoi email trial:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}