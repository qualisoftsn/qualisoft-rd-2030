import { Controller, Get, Post, Body, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { SseService } from './sse.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('sse')
@UseGuards(JwtAuthGuard)
export class SseController {
  constructor(private readonly sseService: SseService) {}

  // 📈 ROUTE POUR LES ANALYTICS (TF/TG)
  // On utilise la route racine '/sse' pour correspondre à ton frontend
  @Get()
  async findAll(@Req() req: any) {
    return this.sseService.findAll(req.user.tenantId);
  }

  // 🛡️ ROUTE POUR LA MATRICE DES RISQUES (DUER)
  @Get('risks')
  async findAllRisks(@Req() req: any) {
    return this.sseService.findAllRisks(req.user.tenantId);
  }

  @Post()
  async create(@Body() data: any, @Req() req: any) {
    return this.sseService.create(data, req.user.tenantId, req.user.U_Id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.sseService.delete(id, req.user.tenantId);
  }
}