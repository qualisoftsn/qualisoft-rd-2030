import { Controller, Get, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { PartiesInteresseesService } from './parties-interessees.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('parties-interessees')
@UseGuards(JwtAuthGuard)
export class PartiesInteresseesController {
  constructor(private readonly partiesInteresseesService: PartiesInteresseesService) {}

  @Post()
  async create(@Body() dto: any, @Request() req: any) {
    return this.partiesInteresseesService.create(dto, req.user.tenantId);
  }

  @Get()
  async findAll(@Query('type') type: any, @Request() req: any) {
    return this.partiesInteresseesService.findAll(req.user.tenantId, type);
  }
}