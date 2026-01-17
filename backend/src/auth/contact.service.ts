import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'abdoulayethiongane@gmail.com',
      pass: process.env.EMAIL_APP_PASSWORD, 
    },
  });

  async sendInviteRequest(dto: { company: string; email: string; message?: string }) {
    try {
      await this.transporter.sendMail({
        from: '"Elite System" <abdoulayethiongane@gmail.com>',
        to: 'abdoulayethiongane@gmail.com',
        subject: `🚀 Nouveau Prospect : ${dto.company}`,
        text: `Entreprise: ${dto.company}\nEmail: ${dto.email}\nMessage: ${dto.message || 'Aucun'}`,
      });
      return { success: true };
    } catch (error) {
      this.logger.error("Erreur mail", error);
      throw error;
    }
  }
}
