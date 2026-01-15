import { Module } from '@nestjs/common';
import { PaqService } from './paq.service';
import { PaqController } from './paq.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PaqController],
  providers: [PaqService],
  exports: [PaqService], // Indispensable pour AppModule
})
export class PaqModule {} // Vérifie bien que c'est "PaqModule" avec cette casse