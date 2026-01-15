import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * ENVOI D'ALERTE MULTI-CANAL (SMS + EMAIL)
   * Cette méthode est le point d'entrée unique pour les alertes critiques SSE/MASE
   */
  async sendCriticalAlert(to: string, phoneNumber: string, subject: string, message: string) {
    this.logger.warn(`🚀 ALERTE CRITIQUE : Déclenchement du protocole de notification...`);

    const results = await Promise.allSettled([
      this.sendEmail(to, subject, message),
      this.sendSMS(phoneNumber, message),
    ]);

    this.logger.log('Résultats des notifications traitées.');
    return results;
  }

  /**
   * LOGIQUE EMAIL (Prête pour intégration Nodemailer/SendGrid)
   */
  async sendEmail(to: string, subject: string, message: string): Promise<boolean> {
    try {
      this.logger.log(`📧 Tentative d'envoi Email à ${to} | Sujet: ${subject}`);
      
      // Simulation d'envoi - Ici sera injecté le transporteur SMTP
      // Exemple: await this.mailerService.sendMail({ to, subject, text: message });
      
      this.logger.log(`✅ Email envoyé avec succès à ${to}`);
      return true;
    } catch (error: unknown) {
      // ✅ Correction TS18046 : Type Guard sécurisé
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`❌ Échec envoi Email: ${errorMessage}`);
      return false;
    }
  }

  /**
   * LOGIQUE SMS (Prête pour intégration Twilio/Infobip)
   */
  async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    try {
      if (!phoneNumber) {
        this.logger.warn('⚠️ Aucun numéro de téléphone fourni. SMS annulé.');
        return false;
      }

      this.logger.log(`📱 Tentative d'envoi SMS au ${phoneNumber}`);
      
      // Simulation d'envoi - Ici sera injectée l'API Twilio
      // Exemple: await this.twilioClient.messages.create({ body: message, to: phoneNumber });

      this.logger.log(`✅ SMS envoyé avec succès au ${phoneNumber}`);
      return true;
    } catch (error: unknown) {
      // ✅ Correction TS18046 : Type Guard sécurisé
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`❌ Échec envoi SMS: ${errorMessage}`);
      return false;
    }
  }

  /**
   * NOTIFICATION SIMPLE (Utilisée pour les rappels de tâches ou GED)
   */
  async sendStandardNotification(to: string, message: string) {
    return this.sendEmail(to, 'Notification Qualisoft', message);
  }
}