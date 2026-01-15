import { 
  Controller, Get, Post, Body, UseGuards, Req, 
  BadRequestException, Param, Patch 
} from '@nestjs/common';
import { AuditsService } from './audits.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('audits')
@UseGuards(JwtAuthGuard)
export class AuditsController {
  constructor(private readonly auditsService: AuditsService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.auditsService.findAll(req.user.tenantId);
  }

  @Post()
  async create(@Body() data: any, @Req() req: any) {
    // 🛡️ Validation stricte : Le processus est OBLIGATOIRE pour la conformité ISO
    if (!data.AU_Title || !data.AU_ProcessusId || !data.AU_SiteId || !data.AU_LeadId) {
      throw new BadRequestException(
        "Validation échouée : Titre, Processus, Site et Auditeur Lead sont requis."
      );
    }
    return this.auditsService.create(data, req.user.tenantId);
  }

  @Patch(':id/sign-acceptance')
  async sign(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    if (!body.signatureHash) {
      throw new BadRequestException("Le hash de signature est requis.");
    }
    return this.auditsService.signAcceptance(
      id, 
      req.user.U_Id, 
      req.user.tenantId, 
      body.signatureHash
    );
  }

  @Post(':id/submit-report')
  async submitReport(@Param('id') id: string, @Body() reportData: any, @Req() req: any) {
    return this.auditsService.closeAuditWithReport(
      id, 
      reportData, 
      req.user.tenantId, 
      req.user.U_Id
    );
  }
}