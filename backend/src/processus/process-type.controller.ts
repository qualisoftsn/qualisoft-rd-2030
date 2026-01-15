import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { GenericCrudService } from '../common/generic-crud.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Gouvernance - Types de Processus')
@UseGuards(JwtAuthGuard)
@Controller('process-types')
export class ProcessTypeController {
  private readonly model = 'processType'; // Doit correspondre au nom dans Prisma

  constructor(private readonly genericCrud: GenericCrudService) {}

  @Get()
  findAll(@GetUser('tenantId') tenantId: string) {
    return this.genericCrud.findAll(this.model, tenantId);
  }

  @Post()
  create(
    @GetUser('tenantId') tenantId: string,
    @Body() data: any, // Tu pourras affiner avec un CreateProcessTypeDto
  ) {
    return this.genericCrud.create(this.model, tenantId, data);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @GetUser('tenantId') tenantId: string,
    @Body() data: any,
  ) {
    return this.genericCrud.update(this.model, id, tenantId, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('tenantId') tenantId: string) {
    return this.genericCrud.delete(this.model, id, tenantId);
  }
}