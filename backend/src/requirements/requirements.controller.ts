import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Req } from '@nestjs/common';
import { RequirementsService } from './requirements.service';
import { CreateRequirementDto } from './dto/create-requirement.dto';
import { MarkCompliantDto } from './dto/mark-compliant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Compliance - Regulatory Requirements')
@Controller('requirements')
@UseGuards(JwtAuthGuard)
export class RequirementsController {
  constructor(private readonly requirementsService: RequirementsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle exigence réglementaire' })
  create(@Body() createDto: CreateRequirementDto, @Req() req: any) {
    return this.requirementsService.create(createDto, req.user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les exigences du tenant' })
  findAll(
    @Req() req: any,
    @Query('category') category?: string
  ) {
    return this.requirementsService.getRequirements(req.user.tenantId, category);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Obtenir le calendrier de conformité unifié' })
  getCalendar(@Req() req: any) {
    return this.requirementsService.getComplianceCalendar(req.user.tenantId);
  }

  @Patch(':id/compliant')
  @ApiOperation({ summary: 'Marquer une exigence comme conforme' })
  markAsCompliant(
    @Param('id') id: string,
    @Body() dto: MarkCompliantDto
  ) {
    return this.requirementsService.markAsCompliant(id, dto.evidenceUrl);
  }
}