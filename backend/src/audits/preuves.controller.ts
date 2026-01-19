import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PreuvesService } from './preuves.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('preuves')
@UseGuards(JwtAuthGuard)
export class PreuvesController {
  constructor(private readonly preuvesService: PreuvesService) {}

  @Post()
  async create(@Body() data: any) {
    return this.preuvesService.create(data);
  }
}