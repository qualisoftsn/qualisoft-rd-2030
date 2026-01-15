import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersManagementController {
  @Get()
  @Roles(Role.ADMIN, Role.AUDITEUR) // INTERNAL_AUDIT remplacé par AUDITOR
  async listAllUsers() {
    // ...
  }
}