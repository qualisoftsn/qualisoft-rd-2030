import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseInterceptors, 
  ClassSerializerInterceptor, 
  Headers, 
  BadRequestException 
} from '@nestjs/common';
import { ProcessusTypeService } from './processus-type.service';

@Controller('processus-types')
@UseInterceptors(ClassSerializerInterceptor)
export class ProcessusTypeController {
  constructor(private readonly service: ProcessusTypeService) {}

  /**
   * 🔍 Récupère les types de processus filtrés par le Header 'x-tenant-id'
   */
  @Get()
  async findAll(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException("Le header 'x-tenant-id' est manquant.");
    }
    return this.service.findAll(tenantId);
  }

  /**
   * 🆕 Crée un type de processus en injectant le tenantId du header dans les data
   */
  @Post()
  async create(
    @Body() data: any, 
    @Headers('x-tenant-id') tenantId: string
  ) {
    if (!tenantId) {
      throw new BadRequestException("Le header 'x-tenant-id' est manquant.");
    }
    // On injecte le tenantId pour que le service puisse faire la liaison Prisma
    return this.service.create({ ...data, tenantId });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}