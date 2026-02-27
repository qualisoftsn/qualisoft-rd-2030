/**
 * CHEMIN : /backend/src/matrix/matrix.controller.ts
 */
import { Controller, Get, Post, Body, Param, Logger } from '@nestjs/common';
import { MatrixService } from './matrix.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller() 
export class MatrixController {
  private readonly logger = new Logger(MatrixController.name);

  constructor(private readonly matrixService: MatrixService) {}

  @Public()
  @Get('public/tenants')
  async findPublicTenants() {
    return await this.matrixService.findPublicTenants();
  }

  @Public()
  @Get('public/tenants/:tenantId/users')
  async findPublicUsers(@Param('tenantId') tenantId: string) {
    return await this.matrixService.findPublicUsersByTenant(tenantId);
  }

  @Get('matrix/tenants')
  async findAll() {
    return await this.matrixService.findAllTenants();
  }

  @Get('matrix/details/:id')
  async findOne(@Param('id') id: string) {
    return await this.matrixService.getTenantDetails(id);
  }
}