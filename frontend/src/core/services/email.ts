import nodemailer from 'nodemailer';

/**
 * 📧 SERVICE : EMAIL ENGINE (SOUVERAINETÉ DE COMMUNICATION)
 * -------------------------------------------------------------------------
 * FONCTION : Expédition de notifications transactionnelles (Alertes, Audits).
 * RÔLE : Informer les acteurs du SMI hors plateforme.
 * BRANDING : Signature Elite RD 2026 par défaut.
 */

export const sendEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465, // SSL/TLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  /**
   * 🖋️ SÉCURISATION DE L'EXPÉDITEUR
   * Note : L'adresse 'from' devrait idéalement être configurée par le Tenant
   * pour une isolation totale de l'identité visuelle.
   */
  return await transporter.sendMail({
    from: '"Qualisoft Elite Matrix" <no-reply@qualisoft.sn>',
    to,
    subject: `[QUALISOFT ELITE] ${subject}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; border-radius: 20px; border: 1px solid #f1f5f9; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 40px; text-align: center;">
          <h1 style="color: white; font-style: italic; font-weight: 900; margin: 0; text-transform: uppercase;">Qualisoft Elite</h1>
        </div>
        <div style="padding: 40px; color: #334155; line-height: 1.6;">
          ${html}
        </div>
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase;">
          Ce message est issu d'un environnement multi-tenant scellé.
        </div>
      </div>
    `,
  });
};