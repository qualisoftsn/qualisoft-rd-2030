import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('actions')
@UseGuards(JwtAuthGuard)
export class ActionsController {
  constructor(private readonly actionsService: ActionsService) {}

  @Get()
  async findAll(@Req() req: any) {
    // Extraction sécurisée du Tenant depuis le Token JWT
    return this.actionsService.findAll(req.user.tenantId);
  }

  @Post()
  async create(@Body() data: any, @Req() req: any) {
    // Liaison automatique au Créateur et au Tenant via le Token
    return this.actionsService.create(data, req.user.tenantId, req.user.U_Id);
  }

  /**
   * @route   POST /api/actions/from-reclamation/:id
   * @desc    Génère une action corrective liée à une réclamation spécifique
   */
  @Post('from-reclamation/:id')
  async createFromReclamation(@Param('id') id: string, @Req() req: any) {
    return this.actionsService.createFromReclamation(
      id, 
      req.user.tenantId, 
      req.user.U_Id
    );
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }, @Req() req: any) {
    return this.actionsService.updateStatus(id, body.status, req.user.tenantId);
  }
}