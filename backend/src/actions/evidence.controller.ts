import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('evidences')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EvidenceController {
  @Post()
  @Roles(Role.ADMIN, Role.USER, Role.SAFETY_OFFICER) // INCIDENT_SAFETY -> SAFETY_OFFICER
  async upload(@Body() data: any) {
    return { message: "Evidence traitée" };
  }

  @Post('audit')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.USER, Role.AUDITEUR) // INTERNAL_AUDIT -> AUDITOR
  async uploadAuditEvidence(@Body() data: any) {
    return { message: "Evidence Audit traitée" };
  }
}