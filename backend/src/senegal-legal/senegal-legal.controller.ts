import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { SenegalLegalService } from './senegal-legal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('senegal-legal')
@UseGuards(JwtAuthGuard)
export class SenegalLegalController {
  constructor(private readonly service: SenegalLegalService) {}

  @Get()
  async getAll(@Req() req: any) { return this.service.findAll(req.user.tenantId); }

  @Get('stats')
  async getStats(@Req() req: any) { return this.service.getStats(req.user.tenantId); }

  @Post()
  async create(@Req() req: any, @Body() dto: any) { return this.service.create(req.user.tenantId, dto); }

  @Patch(':id/status')
  async updateStatus(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.service.updateStatus(req.user.tenantId, id, body.status);
  }
}