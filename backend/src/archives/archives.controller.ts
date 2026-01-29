// File: backend/src/archives/archives.controller.ts
import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ArchivesService } from './archives.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('archives')
@UseGuards(JwtAuthGuard)
export class ArchivesController {
  constructor(private readonly archivesService: ArchivesService) {}

  /**
   * Route : GET /archives
   * Extrait tout le patrimoine désactivé du tenant
   */
  @Get()
  async getArchives(@Req() req: any) {
    return this.archivesService.getGlobalArchives(req.user.tenantId);
  }

  /**
   * Route : POST /archives/restore
   * Réactive une entité (Document, Processus, etc.)
   */
  @Post('restore')
  async restore(@Req() req: any, @Body() body: { id: string, type: string }) {
    return this.archivesService.restore(req.user.tenantId, body.id, body.type);
  }
}