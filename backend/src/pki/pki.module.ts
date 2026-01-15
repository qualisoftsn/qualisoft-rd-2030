import { Module } from '@nestjs/common';
import { PkiService } from './pki.service';

@Module({
  providers: [PkiService],
  exports: [PkiService], // <--- C'EST CETTE LIGNE QUI MANQUE !
})
export class PkiModule {}