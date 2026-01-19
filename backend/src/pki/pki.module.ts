import { Module } from '@nestjs/common';
import { PkiService } from './pki.service';

@Module({
  providers: [PkiService],
  exports: [PkiService], // ✅ Exportation confirmée pour permettre l'injection dans d'autres services
})
export class PkiModule {}