import { Global, Module } from '@nestjs/common';
import { GenericCrudService } from './generic-crud.service';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * 🛠️ MODULE GÉNÉRIQUE CRUD (§7.1.3)
 * Ce module est décoré avec @Global() pour être accessible 
 * dans toute l'application sans avoir à le ré-importer partout.
 */
@Global()
@Module({
  imports: [PrismaModule], // Nécessaire car le service utilise Prisma
  providers: [GenericCrudService],
  exports: [GenericCrudService], // On l'exporte pour que les autres services puissent l'injecter
})
export class GenericCrudModule {}