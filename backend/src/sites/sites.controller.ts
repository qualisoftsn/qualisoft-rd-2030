import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  ForbiddenException,
  Query,
  Logger
} from '@nestjs/common';
import { SitesService, SiteInput } from './sites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Role } from '@prisma/client';

@Controller('sites')
@UseGuards(JwtAuthGuard)
export class SitesController {
  private readonly logger = new Logger(SitesController.name);

  constructor(private readonly sitesService: SitesService) {}

  private checkAdmin(userRole: Role) {
    const allowedRoles: Role[] = [Role.ADMIN, Role.SUPER_ADMIN];
    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenException("Accès refusé : Action réservée aux administrateurs.");
    }
  }

  @Post()
  async create(
    @GetUser('U_Role') role: Role,
    @GetUser('tenantId') tenantId: string, 
    @Body() dto: SiteInput
  ) {
    this.checkAdmin(role);
    this.logger.log(`🏗️ Création site pour tenant: ${tenantId}`);
    return this.sitesService.create(tenantId, dto);
  }

  @Get()
  async findAll(
    @GetUser('tenantId') tenantId: string,
    @Query('all') all: string
  ) {
    this.logger.log(`📥 Fetching sites pour tenant: ${tenantId}`);
    // Sécurité supplémentaire : si tenantId est vide, on renvoie []
    if (!tenantId) return [];
    return this.sitesService.findAll(tenantId, all === 'true');
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @GetUser('tenantId') tenantId: string
  ) {
    return this.sitesService.findOne(id, tenantId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @GetUser('U_Role') role: Role,
    @GetUser('tenantId') tenantId: string, 
    @Body() dto: SiteInput
  ) {
    this.checkAdmin(role);
    return this.sitesService.update(id, tenantId, dto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @GetUser('U_Role') role: Role,
    @GetUser('tenantId') tenantId: string
  ) {
    this.checkAdmin(role);
    return this.sitesService.remove(id, tenantId);
  }
}