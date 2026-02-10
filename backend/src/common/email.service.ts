import { Injectable, Logger, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Attachment } from 'nodemailer/lib/mailer';

/**
 * 🛠️ TYPES STRICTS ELITE
 */
interface EmailAttachment extends Attachment {
  filename: string;
  content: any; // Buffer, Stream ou String selon Nodemailer
  contentType?: string;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  template?: string; // Conservé pour intégration future (ex: Handlebars/EJS)
  context?: Record<string, unknown>; // Remplacement de any par un record typé
  attachments?: EmailAttachment[];
}

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    // Initialisation via ConfigService (Priorité aux variables d'environnement)
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST') || 'smtp.gmail.com',
      port: Number(this.configService.get<number>('MAIL_PORT')) || 587,
      secure: this.configService.get<boolean>('MAIL_SECURE') || false,
      auth: {
        user: this.configService.get<string>('MAIL_USER') || 'abdoulayethiongane@gmail.com',
        pass: this.configService.get<string>('MAIL_PASS') || 'wwralsbrpvhweasa',
      },
    });
  }

  /**
   * 🛡️ VÉRIFICATION DU CANAL AU DÉMARRAGE
   */
  async onModuleInit() {
    try {
      await this.transporter.verify();
      this.logger.log('✅ Canal SMTP Qualisoft scellé et opérationnel.');
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`🚨 Échec de connexion SMTP : ${msg}`);
    }
  }

  /**
   * 🚀 SERVICE D'ENVOI UNIVERSEL QUALISOFT
   * Aucune option n'a été supprimée. Typage renforcé.
   */
  async sendMail(options: SendEmailOptions) {
    const fromUser = this.configService.get<string>('MAIL_USER') || 'no-reply@qualisoft.sn';
    
    try {
      const mailOptions = {
        from: `"Qualisoft ELITE 2030" <${fromUser}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
        // template et context sont conservés ici pour les extensions de moteur de template
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`📧 Mail expédié : ${options.to} [MessageID: ${info.messageId}]`);
      return info;
      
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Erreur d'expédition SMTP : ${msg}`);
      throw new InternalServerErrorException(`Impossible d'envoyer le mail : ${msg}`);
    }
  }

  /**
   * 🛰️ TEMPLATE ÉLITE : NOTIFICATION DE PROVISIONING
   * Intégration directe du template HTML pour les nouveaux Tenants.
   */
  async sendProvisioningWelcome(
    adminEmail: string, 
    companyName: string, 
    domain: string, 
    password: string
  ): Promise<void> {
    const loginUrl = `https://${domain}.qualisoft.sn/auth/login`;
    
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 24px; padding: 40px; background-color: #ffffff;">
        <h1 style="color: #0f172a; font-size: 26px; text-transform: uppercase; font-style: italic; font-weight: 900; letter-spacing: -0.05em;">
          QUALI<span style="color: #2563eb;">SOFT</span> <span style="color: #64748b; font-weight: 400;">ELITE</span>
        </h1>
        <div style="margin: 30px 0; border-left: 4px solid #2563eb; padding-left: 20px;">
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            L'instance Qualisoft RD 2030 pour <strong>${companyName.toUpperCase()}</strong> a été déployée avec succès.
          </p>
        </div>
        <div style="background-color: #f8fafc; padding: 25px; border-radius: 20px; border: 1px solid #f1f5f9;">
          <p style="margin: 0 0 15px 0; font-size: 12px; color: #2563eb; text-transform: uppercase; font-weight: 900; letter-spacing: 0.1em;">Accès Administratifs</p>
          <p style="margin: 0; font-size: 15px; color: #0f172a;"><strong>Identifiant :</strong> ${adminEmail}</p>
          <p style="margin: 8px 0 0 0; font-size: 15px; color: #0f172a;"><strong>Clé d'accès :</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${password}</code></p>
        </div>
        <div style="margin-top: 30px; text-align: center;">
          <a href="${loginUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 18px 34px; border-radius: 16px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 13px; letter-spacing: 0.1em;">
            Ouvrir la Console Elite
          </a>
        </div>
        <p style="margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; font-style: italic;">
          Ceci est une notification automatique. Sécurité Zero-Trust : changez votre mot de passe dès l'accès.
        </p>
      </div>
    `;

    await this.sendMail({
      to: adminEmail,
      subject: `🚀 Déploiement Qualisoft : ${companyName}`,
      html,
    });
  }
}