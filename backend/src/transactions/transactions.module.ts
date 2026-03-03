/**
 * 🛰️ MODULE : TransactionsModule
 * -------------------------------------------------------------------------
 * RÉVISION : 03 Mars 2026 | 15:45 GMT
 */

import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TenantActivationController } from './tenant-activation.controller'; // <-- IMPORT
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    TransactionsController, 
    TenantActivationController // <-- AJOUT DU CONTRÔLEUR MASTER
  ],
  providers: [TransactionsService],
  exports: [TransactionsService]
})
export class TransactionsModule {}