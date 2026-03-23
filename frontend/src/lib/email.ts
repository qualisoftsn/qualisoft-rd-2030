// frontend/src/lib/email.ts
import nodemailer from 'nodemailer';

export interface SendLeadEmailOptions {
  to: string;
  subject: string;
  nom: string;
  entreprise: string;
  email: string;
  telephone: string;
  plan?: string;
  timestamp: string;
}

export async function sendLeadEmail({
  to,
  subject,
  nom,
  entreprise,
  email,
  telephone,
  plan,
  timestamp,
}: SendLeadEmailOptions): Promise<boolean> {
  try {
    // Création du transporteur SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // false pour 587 (STARTTLS)
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // À ajuster selon ton certificat
      },
    });

    // Vérification de la connexion
    await transporter.verify();

    // Contenu de l'email
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject,
      text: `
NOUVELLE DEMANDE D'ESSAI PRIORITAIRE - QUALISOFT ELITE
=======================================================

📅 Date: ${new Date(timestamp).toLocaleString('fr-SN')}
👤 Nom: ${nom}
🏢 Entreprise: ${entreprise}
📧 Email: ${email}
📱 Téléphone: ${telephone}
🎯 Plan sélectionné: ${plan || 'Non spécifié'}

---
Cette demande provient de la Landing Page Qualisoft Elite.
Pour traiter cette demande, connectez-vous au Matrix Admin.
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155; background: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
    .header p { margin: 8px 0 0 0; opacity: 0.9; font-size: 14px; }
    .content { padding: 30px; }
    .field { margin: 16px 0; padding: 12px; background: #f1f5f9; border-radius: 8px; }
    .label { font-weight: 600; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    .value { font-weight: 500; color: #1e293b; font-size: 14px; }
    .cta { display: inline-block; background: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin-top: 24px; font-weight: 600; text-align: center; }
    .footer { text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 Nouvelle Demande d'Essai</h1>
      <p>Qualisoft Elite - Portail Public</p>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">📅 Date de soumission</div>
        <div class="value">${new Date(timestamp).toLocaleString('fr-SN', { dateStyle: 'medium', timeStyle: 'short' })}</div>
      </div>
      <div class="field">
        <div class="label">👤 Nom Complet</div>
        <div class="value">${nom}</div>
      </div>
      <div class="field">
        <div class="label">🏢 Entreprise</div>
        <div class="value">${entreprise}</div>
      </div>
      <div class="field">
        <div class="label">📧 Email Professionnel</div>
        <div class="value"><a href="mailto:${email}" style="color: #3b82f6;">${email}</a></div>
      </div>
      <div class="field">
        <div class="label">📱 Téléphone / WhatsApp</div>
        <div class="value"><a href="tel:${telephone.replace(/[^0-9+]/g, '')}" style="color: #3b82f6;">${telephone}</a></div>
      </div>
      <div class="field">
        <div class="label">🎯 Plan d'intérêt</div>
        <div class="value">${plan ? `<span style="background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 9999px; font-size: 12px;">${plan.toUpperCase()}</span>` : 'Non spécifié'}</div>
      </div>
      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/leads" class="cta">→ Traiter cette demande dans le Matrix</a>
      </div>
    </div>
    <div class="footer">
      <p>Cet email a été généré automatiquement par Qualisoft Elite.<br>Ne pas répondre directement à ce message.</p>
      <p style="margin-top: 12px;">${process.env.NEXT_PUBLIC_COMPANY_NAME} • ${process.env.NEXT_PUBLIC_COMPANY_PHONE}</p>
    </div>
  </div>
</body>
</html>
      `.trim(),
    };

    // Envoi de l'email
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email lead envoyé:', info.messageId);
    return true;
    
  } catch (error) {
    console.error('❌ Erreur envoi email lead:', error);
    return false;
  }
}

export default sendLeadEmail;