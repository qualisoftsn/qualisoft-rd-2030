import { Controller, Post, Get, Body, UseGuards, Req, Logger } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  private readonly logger = new Logger(TransactionsController.name);

  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * @route   POST /transactions/initialize
   * @desc    Initialisation d'un flux de paiement automatique (Futur)
   */
  @Post('initialize')
  async initialize(@Body() body: any, @Req() req) {
    const tenantId = req.user.tenantId;
    return this.transactionsService.initialize(body, tenantId);
  }

  /**
   * @route   POST /transactions/declare
   * @desc    Déclaration manuelle d'un paiement effectué avec preuve (Wave/Orange)
   */
  @Post('declare') // ✅ Route pour le closing manuel avec preuve
  async declare(@Body() body: any, @Req() req) {
    const tenantId = req.user.tenantId;
    this.logger.log(`Déclaration de paiement reçue pour le Tenant: ${tenantId}`);
    return this.transactionsService.declare(body, tenantId);
  }

  /**
   * @route   GET /transactions/my-history
   * @desc    Récupérer l'historique des flux du client
   */
  @Get('my-history')
  async findAll(@Req() req) {
    const tenantId = req.user.tenantId;
    return this.transactionsService.findAll(tenantId);
  }
}