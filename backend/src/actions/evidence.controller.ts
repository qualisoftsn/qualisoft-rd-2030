/**
 * 🛰️ MODULE : EvidenceController
 * -------------------------------------------------------------------------
 * RÔLE : Collecte et gestion des preuves d'audit et de conformité.
 * RÉVISION : 03 Mars 2026 | 05:55 GMT
 */

import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EvidenceService } from './evidence.service';

@Controller('evidences')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Post()
  @Roles(Role.ADMIN, Role.USER, Role.SAFETY_OFFICER, Role.AUDITEUR)
  async create(@Body() data: any, @Req() req) {
    return this.evidenceService.create(req.user.tenantId, data);
  }

  @Get()
  async findAll(@Req() req) {
    return this.evidenceService.findAllByTenant(req.user.tenantId);
  }

  @Get('audit/:auditId')
  async findByAudit(@Param('auditId') auditId: string, @Req() req) {
    return this.evidenceService.findByAudit(auditId, req.user.tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    return this.evidenceService.findOne(req.user.tenantId, id);
  }
}