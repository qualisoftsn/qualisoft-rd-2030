import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { SenegalLegalService } from './senegal-legal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateLegalRequirementDto } from './dto/create-legal-requirement.dto';

@Controller('senegal-legal')
@UseGuards(JwtAuthGuard)
export class SenegalLegalController {
  constructor(private readonly service: SenegalLegalService) {}

  @Post()
  create(@Body() dto: CreateLegalRequirementDto, @Req() req: any) {
    return this.service.create(dto, req.user.tenantId, req.user.U_Id);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.service.findAll(req.user.tenantId);
  }

  @Get('stats')
  getStats(@Req() req: any) {
    return this.service.getComplianceStats(req.user.tenantId);
  }

  @Patch(':id/status')
async updateStatus(
  @Param('id') id: string,
  @Body() body: { status: string; evidence?: string },
  @Req() req: any
  ) {
    // ✅ On passe req.user.tenantId en 3ème position comme prévu dans le service
    // ✅ On s'assure que evidence est au moins une chaîne vide ou géré comme optionnel
    return this.service.updateStatus(id, body.status, req.user.tenantId, body.evidence);
  }

  @Get('report')
  generateReport(@Req() req: any) {
    return this.service.generateComplianceReport(req.user.tenantId);
  }
}