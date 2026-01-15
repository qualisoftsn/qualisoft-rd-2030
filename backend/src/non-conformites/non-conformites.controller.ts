import { 
  Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query 
} from '@nestjs/common';
// Correction Erreur TS2307 : Import aligné sur le nom du fichier (sans le 's')
import { NonConformiteService } from './non-conformites.service'; 
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('non-conformites')
@UseGuards(JwtAuthGuard)
export class NonConformiteController {
  constructor(private readonly ncService: NonConformiteService) {}

  @Get()
  findAll(@Req() req: any, @Query('processusId') processusId?: string) {
    return this.ncService.findAll(req.user.tenantId, processusId);
  }

  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.ncService.create(body, req.user.tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.ncService.update(id, req.user.tenantId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.ncService.remove(id, req.user.tenantId);
  }

  /**
   * 🚀 GÉNÉRER ACTION DEPUIS NC
   */
  @Post(':id/link-paq')
  linkToPAQ(@Param('id') id: string, @Req() req: any) {
    return this.ncService.linkToPAQ(id, req.user.U_Id, req.user.tenantId);
  }
}