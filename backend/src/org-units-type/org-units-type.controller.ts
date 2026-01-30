import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { OrgUnitsTypeService } from './org-units-type.service';

@Controller('org-units-types') // <--- ÉLÉMENT CRUCIAL AJOUTÉ
@UseInterceptors(ClassSerializerInterceptor)
export class OrgUnitsTypeController {
  constructor(private readonly service: OrgUnitsTypeService) {}

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Post()
  async create(@Body() data: any) {
    return this.service.create(data);
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