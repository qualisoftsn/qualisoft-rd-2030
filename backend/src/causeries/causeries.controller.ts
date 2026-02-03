import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Logger } from '@nestjs/common';
import { CauseriesService } from './causeries.service';
import { CreateCauserieDto } from './dto/create-causerie.dto';
import { UpdateCauserieDto } from './dto/update-causerie.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('HSE - Causeries')
@ApiBearerAuth()
@Controller('causeries')
@UseGuards(JwtAuthGuard)
export class CauseriesController {
  constructor(private readonly causeriesService: CauseriesService) {}

  @Post()
  @ApiOperation({ summary: 'Enregistrer une causerie §7.3' })
  create(@Body() dto: CreateCauserieDto, @Req() req: any) {
    // Utilisation de U_Id (standard Qualisoft) au lieu de userId
    return this.causeriesService.create(dto, req.user.tenantId, req.user.U_Id);
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