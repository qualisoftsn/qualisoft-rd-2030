import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, UsePipes, ValidationPipe
} from '@nestjs/common';
import { QualityObjectivesService } from './quality-objectives.service';
import { CreateQualityObjectiveDto } from './dto/create-quality-objective.dto';
import { UpdateQualityObjectiveDto } from './dto/update-quality-objective.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { QueryObjectivesDto } from './dto/query-objectives.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ObjectiveStatus } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user: {
    U_Id: string;
    tenantId: string;
  };
}

@Controller('quality-objectives')
@UseGuards(JwtAuthGuard)
export class QualityObjectivesController {
  constructor(private readonly qualityObjectivesService: QualityObjectivesService) {}

  @Get('stats')
  async getStats(@Request() req: AuthenticatedRequest) {
    return this.qualityObjectivesService.getStats(req.user.tenantId);
  }

  @Get()
  async findAll(@Request() req: AuthenticatedRequest, @Query() query: QueryObjectivesDto) {
    return this.qualityObjectivesService.findAll(req.user.tenantId, query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.qualityObjectivesService.findOne(id, req.user.tenantId);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() dto: CreateQualityObjectiveDto, @Request() req: AuthenticatedRequest) {
    return this.qualityObjectivesService.create(dto, req.user.tenantId, req.user.U_Id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Param('id') id: string, @Body() dto: UpdateQualityObjectiveDto, @Request() req: AuthenticatedRequest) {
    return this.qualityObjectivesService.update(id, dto, req.user.tenantId, req.user.U_Id);
  }

  @Patch(':id/progress')
  async updateProgress(@Param('id') id: string, @Body() dto: UpdateProgressDto, @Request() req: AuthenticatedRequest) {
    return this.qualityObjectivesService.updateProgress(id, dto, req.user.tenantId);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string, 
    @Body('status') status: ObjectiveStatus,
    @Body('comment') comment: string,
    @Request() req: AuthenticatedRequest
  ) {
    return this.qualityObjectivesService.updateStatus(id, status, req.user.tenantId, comment);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.qualityObjectivesService.remove(id, req.user.tenantId, req.user.U_Id);
  }

  @Post(':id/indicators/:indicatorId/link')
  async linkIndicator(
    @Param('id') id: string,
    @Param('indicatorId') indicatorId: string,
    @Request() req: AuthenticatedRequest
  ) {
    return this.qualityObjectivesService.linkIndicator(id, indicatorId, req.user.tenantId);
  }
}