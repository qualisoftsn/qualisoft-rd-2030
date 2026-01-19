import { Controller, Post, Get, Body, UseGuards, Req, Param, Logger } from '@nestjs/common';
import { EvidenceService } from './evidence.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('evidences')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Post()
  @Roles(Role.ADMIN, Role.USER, Role.SAFETY_OFFICER, Role.PILOTE)
  async upload(@Body() data: any, @Req() req: any) {
    return this.evidenceService.create(req.user.tenantId, data);
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.evidenceService.findAllByTenant(req.user.tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.evidenceService.findOne(req.user.tenantId, id);
  }
}