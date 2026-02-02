import { 
  Body, 
  Controller, 
  Delete, 
  Get, 
  Logger, 
  Param, 
  Patch, 
  Post, 
  Query, 
  Req, 
  UseGuards 
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReclamationsService } from './reclamations.service';
import { CreateReclamationDto } from './dto/create-reclamation.dto';
import { UpdateReclamationDto } from './dto/update-reclamation.dto';

@ApiTags('Client - Réclamations & Satisfaction')
@ApiBearerAuth()
@Controller('reclamations')
@UseGuards(JwtAuthGuard)
export class ReclamationsController {
  private readonly logger = new Logger(ReclamationsController.name);

  constructor(private readonly reclamationsService: ReclamationsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste du registre des réclamations client' })
  async findAll(@Req() req: any, @Query('processusId') pid?: string) {
    // req.user est injecté par le JwtAuthGuard
    return this.reclamationsService.findAll(req.user.tenantId, pid);
  }

  @Post()
  @ApiOperation({ summary: 'Enregistrer une nouvelle réclamation' })
  async create(@Body() dto: CreateReclamationDto, @Req() req: any) {
    this.logger.log(`Création réclamation par l'utilisateur ${req.user.U_Id}`);
    // Utilisation du DTO typé pour activer la validation automatique
    return this.reclamationsService.create(dto, req.user.tenantId, req.user.U_Id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour le traitement d\'une réclamation' })
  async update(
    @Param('id') id: string, 
    @Body() dto: UpdateReclamationDto, 
    @Req() req: any
  ) {
    this.logger.log(`Mise à jour réclamation ${id} - Tenant: ${req.user.tenantId}`);
    return this.reclamationsService.update(id, req.user.tenantId, dto);
  }

  @Post(':id/link-paq')
  @ApiOperation({ summary: 'Transformer la réclamation en action corrective dans le PAQ' })
  async linkPAQ(@Param('id') id: string, @Req() req: any) {
    return this.reclamationsService.linkToPAQ(id, req.user.U_Id, req.user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une réclamation' })
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.reclamationsService.remove(id, req.user.tenantId);
  }
}