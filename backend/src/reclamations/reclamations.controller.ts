import { Body, Controller, Delete, Get, Logger, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReclamationsService } from './reclamations.service';

@Controller('reclamations')
@UseGuards(JwtAuthGuard)
export class ReclamationsController {
  private readonly logger = new Logger(ReclamationsController.name);

  constructor(private readonly reclamationsService: ReclamationsService) {}

  @Get()
  async findAll(@Req() req: any, @Query('processusId') pid?: string) {
    return this.reclamationsService.findAll(req.user.tenantId, pid);
  }

  @Post()
  async create(@Body() body: any, @Req() req: any) {
    this.logger.log(`📩 Création réclamation pour Tenant: ${req.user.tenantId}`);
    return this.reclamationsService.create(body, req.user.tenantId, req.user.U_Id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    // Note: On pourrait ajouter une vérification de tenantId ici aussi
    return this.reclamationsService.update(id, body);
  }

  @Post(':id/link-paq')
  async linkPAQ(@Param('id') id: string, @Req() req: any) {
    this.logger.log(`🔗 Liaison PAQ demandée pour Réclamation: ${id}`);
    return this.reclamationsService.linkToPAQ(id, req.user.U_Id, req.user.tenantId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.reclamationsService.remove(id, req.user.tenantId);
  }
}