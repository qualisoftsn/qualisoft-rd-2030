import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { WastesService } from './wastes.service';
import { CreateWasteDto } from './dto/create-waste.dto';
import { UpdateWasteDto } from './dto/update-waste.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Environment - Waste Management')
@Controller('wastes')
@UseGuards(JwtAuthGuard)
export class WastesController {
  constructor(private readonly wastesService: WastesService) {}

  @Post()
  create(@Body() createWasteDto: CreateWasteDto, @Req() req: any) {
    return this.wastesService.create(createWasteDto, req.user.tenantId);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.wastesService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    // ✅ FIX : Ajout du tenantId (Argument 2)
    return this.wastesService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateWasteDto: UpdateWasteDto, 
    @Req() req: any
  ) {
    // ✅ FIX : Ajout du tenantId (Argument 3)
    return this.wastesService.update(id, updateWasteDto, req.user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    // ✅ FIX : Ajout du tenantId (Argument 2)
    return this.wastesService.remove(id, req.user.tenantId);
  }

  @Get('stats')
  getStats(
    @Req() req: any, 
    @Query('period') period: "YEAR" | "MONTH" | "QUARTER" // ✅ FIX : Typage strict
  ) {
    return this.wastesService.getStats(req.user.tenantId, period);
  }
}