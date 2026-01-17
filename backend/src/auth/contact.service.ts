import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  // Configuration du transporteur (Gmail)
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'abdoulayethiongane@gmail.com',
      // ⚠️ Utilisez ici un "Mot de passe d'application" Google, pas votre mot de passe habituel
      pass: process.env.EMAIL_APP_PASSWORD, 
    },
  });

  async sendInviteRequest(dto: { company: string; email: string; message?: string }) {
    const { company, email, message } = dto;

    try {
      // 1. Notification pour vous (CEO Qualisoft)
      await this.transporter.sendMail({
        from: '"Elite System" <abdoulayethiongane@gmail.com>',
        to: 'abdoulayethiongane@gmail.com',
        subject: `🚀 Nouveau Prospect : ${company}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #2563eb;">Nouvelle demande d'accès</h2>
            <p><strong>Entreprise :</strong> ${company}</p>
            <p><strong>Email :</strong> ${email}</p>
            <p><strong>Message :</strong> ${message || 'Aucun message.'}</p>
            <hr />
            <p style="font-size: 10px; color: #666;">Envoyé depuis le cockpit Qualisoft RD 2030</p>
          </div>
        `,
      });

      // 2. Auto-réponse pour le client (Professionnalisme)
      await this.transporter.sendMail({
        from: '"Qualisoft Elite" <abdoulayethiongane@gmail.com>',
        to: email,
        subject: 'Bienvenue chez Qualisoft Elite',
        html: `
          <div style="font-family: sans-serif; text-align: center; padding: 40px;">
            <h1 style="color: #1e293b;">Merci de votre intérêt, ${company} !</h1>
            <p style="color: #475569;">Votre demande d'accès au cockpit Elite a été transmise à nos experts.</p>
            <p>Un consultant vous contactera sous 24h pour organiser votre démonstration personnalisée.</p>
            <br />
            <a href="https://elite.qualisoft.sn" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Visiter notre site</a>
          </div>
        `,
      });

      this.logger.log(`✨ Demande d'invitation traitée pour ${company}`);
      return { success: true };
    } catch (error) {
      this.logger.error("❌ Erreur lors de l'envoi du mail", error);
      throw error;
    }
  }
}