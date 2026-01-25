import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

/**
 * SERVICE DE CONTACT & PROSPECTION - QUALISOFT ELITE RD 2030
 * Gère l'envoi des demandes d'invitation et les formulaires de contact.
 */
@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  // Configuration du transporteur Mail (SMTP Gmail)
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'abdoulayethiongane@gmail.com',
      pass: process.env.EMAIL_APP_PASSWORD, // Doit être configuré dans le .env (App Password)
    },
  });

  /**
   * Envoi d'une demande d'invitation (Prospect Elite)
   * @param dto Objet contenant les informations du prospect
   */
  async sendInviteRequest(dto: { company: string; email: string; message?: string }) {
    try {
      this.logger.log(`📩 Tentative d'envoi de mail pour : ${dto.company}`);

      await this.transporter.sendMail({
        from: '"Elite System 🚀" <abdoulayethiongane@gmail.com>',
        to: 'abdoulayethiongane@gmail.com', // Envoyé à toi-même pour suivi
        subject: `🔥 Nouveau Prospect Elite : ${dto.company}`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border: 1px solid #e2e8f0; padding: 30px; border-radius: 15px; color: #1e293b; max-width: 600px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #2563eb; font-style: italic; font-weight: 900; letter-spacing: -1px; margin: 0;">QUALI<span style="color: #1e293b;">SOFT</span> ELITE</h1>
              <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #94a3b8; margin-top: 5px;">Département RD 2030</p>
            </div>
            
            <h2 style="font-size: 18px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">Nouvelle demande de déploiement</h2>
            
            <div style="margin: 20px 0;">
              <p><strong>Organisation :</strong> <span style="color: #2563eb;">${dto.company}</span></p>
              <p><strong>Email de contact :</strong> <a href="mailto:${dto.email}" style="color: #2563eb;">${dto.email}</a></p>
              <p><strong>Message :</strong></p>
              <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; font-style: italic; border-left: 4px solid #cbd5e1;">
                ${dto.message || 'Aucun message particulier transmis.'}
              </div>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="font-size: 12px; color: #64748b;">Ce mail a été généré automatiquement par le Noyau Qualisoft Elite.</p>
            </div>
          </div>
        `,
      });

      this.logger.log(`✅ Mail envoyé avec succès pour le prospect : ${dto.company}`);
      return { 
        success: true, 
        message: "Votre demande a été transmise au département Elite avec succès." 
      };

    } catch (error: unknown) {
      // ✅ Correction TS18046 : Gestion sécurisée du type 'unknown'
      const stackTrace = error instanceof Error ? error.stack : 'Détails indisponibles';
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`❌ Échec de l'envoi du mail prospect (${dto.company}) : ${errorMessage}`);
      this.logger.debug(stackTrace);

      throw new InternalServerErrorException(
        "Le service de messagerie Elite est temporairement indisponible. Veuillez réessayer plus tard."
      );
    }
  }
}