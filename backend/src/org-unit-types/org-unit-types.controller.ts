import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, UseInterceptors, ClassSerializerInterceptor 
} from '@nestjs/common';
import { OrgUnitTypesService } from './org-unit-types.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('org-unit-types') // ✅ Route alignée avec le frontend
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class OrgUnitTypesController {
  constructor(private readonly service: OrgUnitTypesService) {}

  @Get()
  async findAll(@GetUser('tenantId') tid: string) {
    return this.service.findAll(tid);
  }

  @Post()
  async create(@GetUser('tenantId') tid: string, @Body() data: any) {
    return this.service.create(tid, data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @GetUser('tenantId') tid: string, 
    @Body() data: any
  ) {
    return this.service.update(id, tid, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser('tenantId') tid: string) {
    return this.service.remove(id, tid);
  }
}