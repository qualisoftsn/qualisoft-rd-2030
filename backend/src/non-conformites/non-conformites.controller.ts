import { 
  Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query 
} from '@nestjs/common';
import { NonConformiteService } from './non-conformites.service'; 
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Qualité - Non-Conformités (NC)')
@Controller('non-conformites')
@UseGuards(JwtAuthGuard)
export class NonConformiteController {
  constructor(private readonly ncService: NonConformiteService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des NC filtrables par processus' })
  findAll(@Req() req: any, @Query('processusId') processusId?: string) {
    return this.ncService.findAll(req.user.tenantId, processusId);
  }

  @Post()
  @ApiOperation({ summary: 'Déclarer une nouvelle Non-Conformité' })
  create(@Body() body: any, @Req() req: any) {
    return this.ncService.create(body, req.user.tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une NC / Analyse des causes' })
  update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.ncService.update(id, req.user.tenantId, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une NC (Admin uniquement conseillé)' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.ncService.remove(id, req.user.tenantId);
  }

  @Post(':id/link-paq')
  @ApiOperation({ summary: 'Générer une Action Corrective (CAPA) dans le PAQ' })
  linkToPAQ(@Param('id') id: string, @Req() req: any) {
    // U_Id provient de ton schéma User
    return this.ncService.linkToPAQ(id, req.user.U_Id, req.user.tenantId);
  }
}