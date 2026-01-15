import { Module } from '@nestjs/common';
import { NonConformiteService } from './non-conformites.service';
import { NonConformiteController } from './non-conformites.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NonConformiteController],
  providers: [NonConformiteService],
  exports: [NonConformiteService],
})
export class NonConformiteModule {}