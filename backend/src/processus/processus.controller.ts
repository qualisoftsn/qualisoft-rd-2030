import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ProcessusService } from './processus.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('processus')
@UseGuards(JwtAuthGuard)
export class ProcessusController {
  constructor(private readonly processusService: ProcessusService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.processusService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.processusService.findOne(id, req.user.tenantId);
  }

  @Get('analytics/:id')
  getAnalytics(@Param('id') id: string, @Req() req: any) {
    return this.processusService.getAnalytics(id, req.user.tenantId);
  }

  @Post()
  create(@Req() req: any, @Body() body: any) {
    return this.processusService.create(req.user.tenantId, body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    return this.processusService.update(id, req.user.tenantId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.processusService.remove(id, req.user.tenantId);
  }
}