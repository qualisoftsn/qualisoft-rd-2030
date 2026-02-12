import { 
  Controller, Get, Post, Patch, Delete, 
  Body, Param, Query, UseGuards, Req 
} from '@nestjs/common';
import { ProcessusService } from './processus.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ProcessFamily } from '@prisma/client';

@ApiTags('Management - Cœur Processus (§4.4)')
@Controller('processus')
@UseGuards(JwtAuthGuard)
export class ProcessusController {
  constructor(private readonly processusService: ProcessusService) {}

  @Get()
  @ApiOperation({ summary: 'Cartographie : Liste filtrée par autorité' })
  findAll(@Req() req: any, @Query('family') family?: ProcessFamily) {
    return this.processusService.findAll(req.user.tenantId, req.user, family);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Cockpit 360° : Vue intégrale du pilote' })
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.processusService.findOne(id, req.user.tenantId, req.user);
  }

  @Get('analytics/:id')
  @ApiOperation({ summary: 'KPI Flash : Santé du processus' })
  getAnalytics(@Param('id') id: string, @Req() req: any) {
    return this.processusService.getAnalytics(id, req.user.tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Création d\'un maillon de la cartographie' })
  create(@Req() req: any, @Body() body: any) {
    return this.processusService.create(req.user.tenantId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mise à jour (Pilote ou RQ uniquement)' })
  update(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    return this.processusService.update(id, req.user.tenantId, req.user, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Désactivation du processus (Archivage SMI)' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.processusService.remove(id, req.user.tenantId, req.user);
  }
}