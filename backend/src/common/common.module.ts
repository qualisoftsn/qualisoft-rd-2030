import { Module, Global } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { GenericCrudService } from './generic-crud.service';
import { EmailService } from './email.service';

@Module({
  providers: [GenericCrudService, EmailService],
  exports: [GenericCrudService, EmailService], // 🔑 TRÈS IMPORTANT : Sans cela, personne ne peut le voir
})
export class CommonModule {}