import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('sse-events')
@UseGuards(JwtAuthGuard)
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  create(@Body() dto: CreateIncidentDto, @Req() req: any) {
    return this.incidentsService.create(dto, req.user.tenantId);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.incidentsService.findAll(req.user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.incidentsService.remove(id, req.user.tenantId);
  }
}