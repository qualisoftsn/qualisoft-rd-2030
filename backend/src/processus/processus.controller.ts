import { 
  Controller, Get, Post, Patch, Delete, 
  Body, Param, Query, UseGuards, Req 
} from '@nestjs/common';
import { ProcessusService } from './processus.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ProcessFamily } from '@prisma/client';

@ApiTags('Management - Cœur Processus')
@Controller('processus')
@UseGuards(JwtAuthGuard)
export class ProcessusController {
  constructor(private readonly processusService: ProcessusService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des processus (Filtrage étanche par Pilote ou Famille)' })
  @ApiQuery({ name: 'family', enum: ProcessFamily, required: false, description: 'Filtrer par PILOTAGE, OPERATIONNEL ou SUPPORT' })
  findAll(
    @Req() req: any, 
    @Query('family') family?: ProcessFamily
  ) {
    // On passe req.user pour que le service puisse appliquer le cloisonnement
    return this.processusService.findAll(req.user.tenantId, req.user, family);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fiche d\'identité 360° du cockpit (Accès restreint §8.5.1)' })
  @ApiParam({ name: 'id', description: 'ID unique du processus' })
  findOne(
    @Param('id') id: string, 
    @Req() req: any
  ) {
    // Vérification de l'étanchéité : Seul le pilote ou le RQ peut entrer
    return this.processusService.findOne(id, req.user.tenantId, req.user);
  }

  @Get('analytics/:id')
  @ApiOperation({ summary: 'Indicateurs agrégés de performance du processus' })
  getAnalytics(
    @Param('id') id: string, 
    @Req() req: any
  ) {
    return this.processusService.getAnalytics(id, req.user.tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Initialisation d\'un nouveau processus dans le SMI' })
  create(
    @Req() req: any, 
    @Body() body: any
  ) {
    return this.processusService.create(req.user.tenantId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mise à jour de la configuration (Réservé au Pilote ou RQ)' })
  update(
    @Param('id') id: string, 
    @Req() req: any, 
    @Body() body: any
  ) {
    // On passe req.user pour vérifier que celui qui modifie est bien le propriétaire
    return this.processusService.update(id, req.user.tenantId, req.user, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Transférer le processus vers la Chambre Forte (Archivage)' })
  remove(
    @Param('id') id: string, 
    @Req() req: any
  ) {
    // Seul le pilote ou le profil souverain peut désactiver son processus
    return this.processusService.remove(id, req.user.tenantId, req.user);
  }
}