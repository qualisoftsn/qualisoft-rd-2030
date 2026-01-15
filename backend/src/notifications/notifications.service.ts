import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendActionAlert(userEmail: string, actionTitle: string, dueDate: Date) {
    try {
      this.logger.log(`📧 Envoi d'alerte à ${userEmail} pour l'action : ${actionTitle}`);
      
      // Dans une version réelle, configurez votre SMTP dans AppModule
      /*
      await this.mailerService.sendMail({
        to: userEmail,
        subject: '⚠️ Alerte QSE : Action en attente',
        template: './action-alert', 
        context: { actionTitle, dueDate: dueDate.toLocaleDateString() },
      });
      */
      
      return { success: true, message: 'Notification simulée avec succès' };
    } catch (error: any) {
      this.logger.error(`❌ Échec envoi mail : ${error.message}`);
    }
  }
}