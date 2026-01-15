import { Controller, Post, Get, Patch, Body, Query, Param, UseGuards, Req, Delete } from '@nestjs/common';
import { ReclamationsService } from './reclamations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reclamations')
@UseGuards(JwtAuthGuard)
export class ReclamationsController {
  constructor(private readonly reclamationsService: ReclamationsService) {}

  @Get()
  async findAll(@Req() req: any, @Query('processusId') pid?: string) {
    return this.reclamationsService.findAll(req.user.tenantId, pid);
  }

  @Post()
  async create(@Body() body: any, @Req() req: any) {
    return this.reclamationsService.create(body, req.user.tenantId, req.user.U_Id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.reclamationsService.update(id, body);
  }

  @Post(':id/link-paq')
  async linkPAQ(@Param('id') id: string, @Req() req: any) {
    return this.reclamationsService.linkToPAQ(id, req.user.U_Id, req.user.tenantId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.reclamationsService.remove(id);
  }
}