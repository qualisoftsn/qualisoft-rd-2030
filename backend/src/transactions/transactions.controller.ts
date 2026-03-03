/**
 * 🛰️ MODULE : TransactionsController
 * -------------------------------------------------------------------------
 * RÔLE : Gestion des flux financiers (Tenant & Master).
 * RÉVISION : 03 Mars 2026 | 14:53 GMT
 */

import { Controller, Post, Get, Body, UseGuards, Req, Logger, Patch, Param } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { DeclareTransactionDto, InitializeTransactionDto } from './dto/transaction.dto';

@Controller('admin/transactions') // Harmonisation avec le préfixe admin du frontend
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransactionsController {
  private readonly logger = new Logger(TransactionsController.name);

  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * 👑 [MASTER ONLY] : Récupération des flux en attente pour le CRM
   */
  @Get('pending')
  @Roles(Role.SUPER_ADMIN)
  async getPendingForCrm() {
    this.logger.log(`[CRM] Accès au registre des transactions en attente.`);
    return this.transactionsService.findPendingForAdmin();
  }

  /**
   * 📱 [TENANT] : Déclaration manuelle d'un paiement (Wave/Orange)
   */
  @Post('declare')
  async declare(@Body() dto: DeclareTransactionDto, @Req() req) {
    const tenantId = req.user.tenantId;
    this.logger.log(`[TENANT:${tenantId}] Déclaration de flux : ${dto.TX_Reference}`);
    return this.transactionsService.declare(dto, tenantId);
  }

  /**
   * ⏲️ [TENANT] : Historique des flux du nœud
   */
  @Get('my-history')
  async findMyHistory(@Req() req) {
    const tenantId = req.user.tenantId;
    return this.transactionsService.findAll(tenantId);
  }

  /**
   * ⚡ [TENANT] : Initialisation auto (Futur Payement Gateway)
   */
  @Post('initialize')
  async initialize(@Body() dto: InitializeTransactionDto, @Req() req) {
    const tenantId = req.user.tenantId;
    return this.transactionsService.initialize(dto, tenantId);
  }
}