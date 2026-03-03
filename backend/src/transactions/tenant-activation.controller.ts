/**
 * 👑 MODULE : TenantActivationController
 * -------------------------------------------------------------------------
 * RÔLE : Autorité Master pour le closing financier et l'activation des nœuds.
 * ADRESSE : backend/src/transactions/tenant-activation.controller.ts
 * RÉVISION : 03 Mars 2026 | 15:40 GMT
 */

import { 
  Controller, Post, Body, Param, UseGuards, 
  UnauthorizedException, Req, Logger 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, SubscriptionStatus, TransactionStatus } from '@prisma/client';

@Controller('admin/tenant') // Route appelée par ton Frontend : /admin/tenant/:id/status
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantActivationController {
  private readonly logger = new Logger(TenantActivationController.name);

  constructor(private prisma: PrismaService) {}

  @Post(':id/status')
  @Roles(Role.SUPER_ADMIN) // Seul A. Thiongane ou un Super Admin peut passer ici
  async updateStatus(
    @Param('id') id: string, 
    @Body() body: { action: 'ACTIVATE' | 'SUSPEND' | 'REJECT' },
    @Req() req
  ) {
    this.logger.log(`[MASTER ACTION] : ${body.action} demandée pour le Tenant ${id} par ${req.user.U_Email}`);

    if (body.action === 'ACTIVATE') {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Validation de la transaction "En cours" (TX_Status)
        await tx.transaction.updateMany({
          where: { tenantId: id, TX_Status: TransactionStatus.EN_COURS },
          data: { TX_Status: TransactionStatus.COMPLETE }
        });

        // 2. Calcul de la nouvelle date d'expiration (+1 an par défaut)
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        // 3. Activation souveraine du Tenant
        return await tx.tenant.update({
          where: { T_Id: id },
          data: {
            T_SubscriptionStatus: SubscriptionStatus.ACTIVE,
            T_IsActive: true,
            T_SubscriptionEndDate: expiryDate
          }
        });
      });
    }

    // --- LOGIQUE DE SUSPENSION ---
    if (body.action === 'SUSPEND') {
      return await this.prisma.tenant.update({
        where: { T_Id: id },
        data: {
          T_SubscriptionStatus: SubscriptionStatus.SUSPENDED,
          T_IsActive: false
        }
      });
    }

    throw new UnauthorizedException("Action non reconnue par le Kernel.");
  }
}