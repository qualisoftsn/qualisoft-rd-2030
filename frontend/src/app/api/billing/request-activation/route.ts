//* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE API : BILLING ACTIVATION (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Traitement des demandes d'activation et envoi des notifications SMTP.
 * RÉVISION : 04 Mars 2026 | 23:37 GMT
 * -------------------------------------------------------------------------
 */

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
      return NextResponse.json({ success: false, error: 'Données matricielles manquantes' }, { status: 400 });
    }

    // Email à l'Architecte Master (Admin)
    await transporter.sendMail({
      from: '"Qualisoft - Matrix" <ab.thiongane@qualisoft.sn>',
      to: 'ab.thiongane@qualisoft.sn',
      subject: `🔔 DEMANDE D'ACTIVATION - Prospect: ${userName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #2563eb;">Nouvelle demande d'activation de Nœud</h2>
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
            ⚡ Action requise : Séquençage commercial sous 24h.
          </p>
          <a href="https://admin.qualisoft.sn/tenants/${tenantId}" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">
            Accéder à la console Master
          </a>
        </div>
      `,
    });

    // Email de confirmation au prospect
    await transporter.sendMail({
      from: '"Qualisoft Elite" <ab.thiongane@qualisoft.sn>',
      to: userEmail,
      subject: 'Qualisoft - Votre demande d\'activation est en cours de traitement',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="color: #059669;">Protocole d'activation initié ✅</h2>
          <p>Bonjour ${userName},</p>
          <p>Votre demande de scellage a été transmise avec succès à notre Architecte Master.</p>
          <p><strong>Prochaines étapes :</strong></p>
          <ol>
            <li>Notre équipe vous contactera sous 24h ouvrées.</li>
            <li>Ajustement des paramètres de votre cluster (Émergence, Croissance, etc.).</li>
            <li>Scellage définitif et activation continue.</li>
          </ol>
          <p style="margin-top: 30px; color: #666;">L'équipe Qualisoft Matrix reste à votre disposition.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: 'Protocole transmis' });

  } catch (error) {
    console.error('[ACTIVATION_REQUEST_ERROR]:', error);
    return NextResponse.json({ success: false, error: 'Échec de transmission SMTP' }, { status: 500 });
  }
}