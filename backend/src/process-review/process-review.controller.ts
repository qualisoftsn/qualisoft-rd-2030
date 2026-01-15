import { Controller, Get, Post, Put, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ProcessReviewService } from './process-review.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('process-reviews')
@UseGuards(JwtAuthGuard)
export class ProcessReviewController {
  constructor(private readonly reviewService: ProcessReviewService) {}

  /**
   * RÉCUPÉRATION DES ANALYTICS (KPI & TENDANCES)
   * Note : Placée avant :id pour ne pas être interceptée
   */
  @Get('analytics')
  async getAnalytics(@Req() req: any) {
    return this.reviewService.getReviewAnalytics(req.user.tenantId);
  }

  /**
   * LISTE HISTORIQUE DES REVUES
   */
  @Get()
  async findAll(@Req() req: any) {
    return this.reviewService.findAll(req.user.tenantId);
  }

  /**
   * RÉCUPÉRATION D'UNE REVUE SPÉCIFIQUE
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.reviewService.findOne(id);
  }

  /**
   * INITIALISATION / SCAN DE PERFORMANCE
   * Reçoit le docRef choisi par l'utilisateur
   */
  @Post('initialize')
  async init(@Body() body: any, @Req() req: any) {
    return this.reviewService.initializeReview(
      body.processId, 
      parseInt(body.month), 
      parseInt(body.year), 
      req.user.tenantId,
      body.docRef 
    );
  }

  /**
   * MISE À JOUR DES ANALYSES ET DÉCISIONS
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.reviewService.updateReview(id, body, req.user.U_Role);
  }

  /**
   * SIGNATURE ÉLECTRONIQUE (VISA)
   */
  @Post(':id/sign')
  async sign(@Param('id') id: string, @Req() req: any) {
    return this.reviewService.signReview(id, req.user.U_Id, req.user.U_Role);
  }
}