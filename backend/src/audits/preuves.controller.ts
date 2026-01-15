import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { PreuvesService } from './preuves.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('preuves')
@UseGuards(JwtAuthGuard)
export class PreuvesController {
  constructor(private readonly preuvesService: PreuvesService) {}

  @Post()
  async create(@Body() data: any, @Req() req: any) {
    // Aligné sur PreuvesService.create(data, T_Id)
    return this.preuvesService.create(data, req.user.tenantId);
  }

  @Get('audit/:auditId')
  async findByAudit(@Param('auditId') auditId: string, @Req() req: any) {
    // Aligné sur PreuvesService.findByAudit(auditId, T_Id)
    return this.preuvesService.findByAudit(auditId, req.user.tenantId);
  }
}