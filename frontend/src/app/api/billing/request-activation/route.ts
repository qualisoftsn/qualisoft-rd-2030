import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { tenantId, userEmail, userName, currentPlan, daysLeft } = await request.json();

    if (!tenantId || !userEmail) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // Email à l'admin (ab.qualisoft.sn)
    await transporter.sendMail({
      from: '"Qualisoft - Admin" <ab.thiongane@qualisoft.sn>',
      to: 'ab.thiongane@qualisoft.sn',
      subject: `🔔 DEMANDE D'ACTIVATION - Prospect: ${userName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #2563eb;">Nouvelle demande d'activation</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f3f4f6;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Entreprise</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${userName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Email</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${userEmail}</td>
            </tr>
            <tr style="background: #f3f4f6;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Tenant ID</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${tenantId}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Plan actuel</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${currentPlan || 'ESSAI'}</td>
            </tr>
            <tr style="background: #f3f4f6;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Jours restants</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd; color: ${daysLeft <= 3 ? 'red' : 'green'}; font-weight: bold;">
                ${daysLeft} jours
              </td>
            </tr>
          </table>
          <p style="background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b;">
            ⚡ Action requise : Contacter le prospect sous 24h pour finaliser l'activation.
          </p>
          <a href="https://admin.qualisoft.sn/tenants/${tenantId}" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">
            Voir la fiche client
          </a>
        </div>
      `,
    });

    // Email de confirmation au prospect
    await transporter.sendMail({
      from: '"Qualisoft" <ab.thiongane@qualisoft.sn>',
      to: userEmail,
      subject: 'Qualisoft - Votre demande d\'activation a été transmise',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="color: #059669;">Demande reçue avec succès ! ✅</h2>
          <p>Bonjour ${userName},</p>
          <p>Votre demande d'activation a été transmise à notre équipe commerciale.</p>
          <p><strong>Prochaines étapes :</strong></p>
          <ol>
            <li>Notre équipe vous contactera sous 24h ouvrées</li>
            <li>Présentation des formules adaptées à vos besoins</li>
            <li>Activation immédiate après validation</li>
          </ol>
          <p style="margin-top: 30px; color: #666;">L'équipe Qualisoft reste à votre disposition.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: 'Demande envoyée' });

  } catch (error) {
    console.error('Erreur demande activation:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}