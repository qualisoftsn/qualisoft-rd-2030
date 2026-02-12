import { Controller, Get, Post, Body, UseGuards, Req, Param, Patch } from '@nestjs/common';
import { PaqService } from './paq.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('paq')
@UseGuards(JwtAuthGuard)
export class PaqController {
  constructor(private readonly paqService: PaqService) {}

  @Get('dashboard')
  async getDashboard(@Req() req: any) {
    return this.paqService.getDashboard(req.user.tenantId);
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.paqService.findAll(req.user.tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.paqService.findOne(id, req.user.tenantId);
  }

  @Post()
  async create(@Body() data: any, @Req() req: any) {
    return this.paqService.create(data, req.user.tenantId);
  }

  @Patch('actions/:id')
  async updateAction(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    return this.paqService.updateAction(id, req.user.tenantId, data);
  }
}