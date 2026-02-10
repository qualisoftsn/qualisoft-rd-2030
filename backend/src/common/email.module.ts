import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';

/**
 * 📧 EMAIL MODULE : Pivot de Notification Qualisoft RD 2030
 * Ce module est décoré @Global() pour garantir que l'EmailService 
 * est disponible dans tout le cluster sans ré-importations multiples.
 */
@Global()
@Module({
  imports: [
    // Indispensable pour injecter les secrets SMTP dans le service
    ConfigModule,
  ],
  providers: [
    EmailService,
  ],
  exports: [
    EmailService,
  ],
})
export class EmailModule {}