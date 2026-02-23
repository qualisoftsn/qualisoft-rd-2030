import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

interface InviteRequest {
  company: string;
  email: string;
  message?: string;
}

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  private transporter: nodemailer.Transporter | undefined;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    try {
      // 🔄 MAPPING AVEC TON .ENV
      const host = this.configService.get<string>('MAIL_HOST');
      const port = this.configService.get<number>('MAIL_PORT');
      const user = this.configService.get<string>('MAIL_USER');
      const pass = this.configService.get<string>('MAIL_PASS');

      if (!user || !pass) {
        this.logger.error("🛑 Identifiants MAIL_USER ou MAIL_PASS manquants dans le .env");
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: host || 'smtp.gmail.com',
        port: port || 587,
        secure: port === 465, // true pour 465, false pour 587
        auth: { user, pass },
      });
      
      this.logger.log('✅ Service Mail Qualisoft Elite prêt (SMTP Gmail)');
    } catch (error: unknown) {
      this.logger.error('❌ Erreur lors de l\'initialisation du transporteur SMTP');
    }
  }

  async sendInviteRequest(dto: InviteRequest): Promise<{ success: boolean; message: string }> {
    if (!this.transporter) {
      throw new InternalServerErrorException("Le serveur de messagerie n'est pas configuré.");
    }

    const { company, email, message } = dto;
    const recipient = this.configService.get<string>('MAIL_USER') || 'abdoulayethiongane@gmail.com';

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM') || '"Qualisoft Elite" <qualisoft@qualisoft.sn>',
        to: recipient,
        subject: `🚀 Nouveau Prospect : ${company}`,
        html: `
          <div style="font-family: sans-serif; border: 1px solid #e2e8f0; padding: 30px; border-radius: 15px; max-width: 600px;">
            <h2 style="color: #2563eb; font-style: italic;">QUALISOFT ELITE RD 2030</h2>
            <p><strong>Société :</strong> ${company}</p>
            <p><strong>Email :</strong> ${email}</p>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 15px; border-left: 4px solid #2563eb;">
              <p style="margin: 0;">${message || 'Aucun message particulier.'}</p>
            </div>
          </div>
        `,
      });

      this.logger.log(`✅ Demande envoyée pour : ${company}`);
      return { success: true, message: "notre demande a été transmise avec succès." };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erreur inconnue";
      this.logger.error(`❌ Échec envoi mail prospect : ${msg}`);
      throw new InternalServerErrorException("Impossible d'envoyer la demande pour le moment.");
    }
  }
}