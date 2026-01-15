import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer'; // Pense à faire : npm install nodemailer

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configuration du transporteur (Utilise tes variables d'environnement .env)
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.MAIL_PORT) || 587,
      secure: false, // true pour le port 465, false pour les autres
      auth: {
        user: process.env.MAIL_USER || 'ton-email@qualisoft.sn',
        pass: process.env.MAIL_PASS || 'ton-mot-de-passe',
      },
    });
  }

  /**
   * 📧 Service d'envoi de mail universel Qualisoft
   */
  async sendMail(options: { 
    to: string; 
    subject: string; 
    text?: string; 
    html?: string;     // ✅ AJOUTÉ : Pour accepter le template HTML Élite
    template?: string; 
    context?: any; 
    attachments?: any[] 
  }) {
    try {
      const mailOptions = {
        from: `"Qualisoft RD 2030" <${process.env.MAIL_USER || 'no-reply@qualisoft.sn'}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html, // ✅ On injecte ici le code HTML du template
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Mail envoyé avec succès à : ${options.to} [ID: ${info.messageId}]`);
      return info;
      
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`❌ Erreur SMTP Qualisoft : ${msg}`);
      throw new InternalServerErrorException(`Impossible d'envoyer le mail : ${msg}`);
    }
  }
}