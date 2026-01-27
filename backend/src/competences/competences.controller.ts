import { Controller, Get, Post, Body, Param, Patch, UseGuards, Req } from '@nestjs/common';
import { CompetencesService } from './competences.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('competences')
@UseGuards(JwtAuthGuard)
export class CompetencesController {
  constructor(private readonly competencesService: CompetencesService) {}

  @Get('matrix')
  async getMatrix(@Req() req: any) {
    return this.competencesService.getMatrix(req.user.tenantId);
  }

  @Post('evaluate')
  async evaluate(@Body() body: any, @Req() req: any) {
    return this.competencesService.evaluate(body, req.user.tenantId);
  }

  @Post()
  async create(@Body() body: any, @Req() req: any) {
    return this.competencesService.create(body, req.user.tenantId);
  }

  @Patch(':id/archive')
  async archive(@Param('id') id: string, @Req() req: any) {
    return this.competencesService.remove(id, req.user.tenantId);
  }
}