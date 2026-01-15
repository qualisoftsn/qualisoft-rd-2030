import { 
  Controller, Get, Post, Body, Param, Delete, 
  UseGuards, Req 
} from '@nestjs/common';
import { CompetencesService } from './competences.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('competences')
@UseGuards(JwtAuthGuard) // 🛡️ Protection obligatoire
export class CompetencesController {
  constructor(private readonly competencesService: CompetencesService) {}

  @Get('matrix')
  async getMatrix(@Req() req: any) {
    // 🛡️ Isolation par TenantId extraite du JWT
    return this.competencesService.getMatrix(req.user.tenantId);
  }

  @Post()
  async create(@Body() body: any, @Req() req: any) {
    return this.competencesService.create(body, req.user.tenantId);
  }

  @Post('evaluate')
  async evaluate(@Body() body: any, @Req() req: any) {
    // Le service s'occupe de l'upsert sécurisé
    return this.competencesService.evaluate(body, req.user.tenantId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.competencesService.remove(id, req.user.tenantId);
  }
}