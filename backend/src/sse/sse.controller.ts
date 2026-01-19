import { Controller, Get, Post, Body, Delete, Param, UseGuards, Req, Logger } from '@nestjs/common';
import { SseService } from './sse.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('sse')
@UseGuards(JwtAuthGuard)
export class SseController {
  private readonly logger = new Logger(SseController.name);

  constructor(private readonly sseService: SseService) {}

  // 📈 ROUTE POUR LES ANALYTICS (TF/TG)
  @Get()
  async findAll(@Req() req: any) {
    return this.sseService.findAll(req.user.tenantId);
  }

  // 🛡️ ROUTE POUR LA MATRICE DES RISQUES (DUER) - FONCTIONNALITÉ VALIDÉE
  @Get('risks')
  async findAllRisks(@Req() req: any) {
    return this.sseService.findAllRisks(req.user.tenantId);
  }

  /**
   * CRÉATION : Signaler un accident ou une situation dangereuse
   */
  @Post()
  async create(@Body() data: any, @Req() req: any) {
    this.logger.log(`🚨 Signalement SSE par ${req.user.U_Email} pour le Tenant ${req.user.tenantId}`);
    return this.sseService.create(data, req.user.tenantId, req.user.U_Id);
  }

  /**
   * SUPPRESSION : Retirer un événement (Admin uniquement en principe)
   */
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.sseService.delete(id, req.user.tenantId);
  }
}