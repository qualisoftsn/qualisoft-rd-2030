import { Controller, Get, Param } from '@nestjs/common';
import { MatrixService } from './matrix.service';

@Controller('matrix')
export class MatrixController {
  constructor(private readonly matrixService: MatrixService) {}

  @Get('tenants')
  async findAll() {
    return await this.matrixService.findAllTenants();
  }

  @Get('details/:id')
  async findOne(@Param('id') id: string) {
    return await this.matrixService.getTenantDetails(id);
  }

  // Routes Publiques pour le Frontend (Login Cascade)
  @Get('public/tenants')
  async findPublicTenants() {
    return await this.matrixService.findPublicTenants();
  }

  @Get('public/tenants/:tenantId/users')
  async findPublicUsers(@Param('tenantId') tenantId: string) {
    return await this.matrixService.findPublicUsersByTenant(tenantId);
  }
}