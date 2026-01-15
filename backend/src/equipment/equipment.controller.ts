import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('equipments')
@UseGuards(JwtAuthGuard)
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.equipmentService.findAll(req.user.tenantId);
  }

  @Post()
  async create(@Body() data: any, @Req() req: any) {
    return this.equipmentService.create(data, req.user.tenantId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    return this.equipmentService.update(id, data, req.user.tenantId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.equipmentService.remove(id, req.user.tenantId);
  }
}