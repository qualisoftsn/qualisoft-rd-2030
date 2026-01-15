import * as nodemailer from 'nodemailer';

/**
 * Configuration du transporteur SMTP utilisant les variables d'environnement
 */
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false, // true pour 465, false pour 587
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * ✅ ENVOI EMAIL DE BIENVENUE + FACTURE (Closing)
 * Utilise T_Email du modèle Tenant
 */
export async function sendWelcomeEmail(tenant: any, pdfBuffer: Buffer) {
  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: tenant.T_Email, // Champ T_Email du schéma Prisma
    subject: `🚀 Activation de votre Licence Qualisoft - ${tenant.T_Name}`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #1d4ed8;">Félicitations ${tenant.T_CeoName} !</h2>
        <p>Nous avons le plaisir de vous informer que votre instance <b>Qualisoft</b> a été activée avec succès.</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #1e293b;">Détails de l'abonnement :</h4>
          <ul style="list-style: none; padding: 0;">
            <li><b>Plan :</b> ${tenant.T_Plan}</li>
            <li><b>Durée d'engagement :</b> ${tenant.T_ContractDuration} mois</li>
            <li><b>Renouvellement :</b> ${tenant.T_TacitRenewal ? 'Tacite' : 'Manuel'}</li>
            <li><b>Date d'expiration :</b> ${tenant.T_SubscriptionEndDate ? new Date(tenant.T_SubscriptionEndDate).toLocaleDateString() : 'N/A'}</li>
          </ul>
        </div>

        <p>Vous trouverez ci-joint votre facture acquittée au format PDF.</p>
        <p>L'équipe Support Qualisoft reste à votre entière disposition pour vous accompagner dans votre démarche QSE.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #777; text-align: center;">Ceci est un message automatique, merci de ne pas y répondre.</p>
      </div>
    `,
    attachments: [
      {
        filename: `Facture_Qualisoft_${tenant.T_Name}.pdf`,
        content: pdfBuffer,
      },
    ],
  };

  return transporter.sendMail(mailOptions);
}

/**
 * ✅ ENVOI EMAIL DE SUPPORT / DIALOGUE (Réponse Ticket ou Relance)
 * Utilise T_Email du modèle Tenant
 */
export async function sendCustomSupportEmail(tenant: any, subject: string, message: string) {
  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: tenant.T_Email, // Champ T_Email du schéma Prisma
    subject: subject,
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1d4ed8; margin: 0;">Support Qualisoft</h2>
        </div>
        
        <p>Bonjour ${tenant.T_CeoName},</p>
        
        <div style="background-color: #f0f4ff; padding: 20px; border-left: 4px solid #1d4ed8; border-radius: 4px; margin: 20px 0; font-style: italic;">
          ${message.replace(/\n/g, '<br>')}
        </div>

        <p>Pour toute question complémentaire, vous pouvez répondre à ce mail ou ouvrir un ticket depuis votre plateforme.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center;">Qualisoft RD 2030 - Système de Management Intégré</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}