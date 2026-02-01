import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CauseriesService } from './causeries.service';
import { CreateCauserieDto } from './dto/create-causerie.dto';
import { UpdateCauserieDto } from './dto/update-causerie.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('causeries')
@UseGuards(JwtAuthGuard)
export class CauseriesController {
  constructor(private readonly causeriesService: CauseriesService) {}

  @Post()
  create(@Body() dto: CreateCauserieDto, @Req() req: any) {
    return this.causeriesService.create(dto, req.user.tenantId, req.user.userId);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.causeriesService.findAll(req.user.tenantId);
  }

  @Get('stats')
  getStats(@Req() req: any) {
    return this.causeriesService.getStats(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.causeriesService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCauserieDto, @Req() req: any) {
    return this.causeriesService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.causeriesService.remove(id, req.user.tenantId);
  }
}