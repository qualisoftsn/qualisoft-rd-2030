import { Module } from '@nestjs/common';
import { SitesService } from './sites.service';
import { SitesController } from './sites.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module'; // 🔄 Crucial pour le GenericCrud

@Module({
  imports: [
    PrismaModule, 
    CommonModule // ✅ Permet d'utiliser le GenericCrudService
  ],
  controllers: [SitesController],
  providers: [SitesService],
  exports: [SitesService],
})
export class SitesModule {}