import { 
  Controller, 
  Post, 
  Get,
  Body, 
  Req, 
  Res,
  UseGuards, 
  Param, 
  BadRequestException,
  InternalServerErrorException 
} from '@nestjs/common';
import { Response } from 'express';
import { NcService } from './nc.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PdfService } from '../common/services/pdf.service';

@Controller('audits/nc')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NcController {
  constructor(
    private readonly ncService: NcService,
    private readonly pdfService: PdfService // 👈 Injection du service PDF
  ) {}

  /**
   * CRÉATION : Enregistrement d'une NC avec traçabilité complète
   */
  @Post()
  @Roles(Role.ADMIN, Role.AUDITEUR)
  async create(@Body() dto: any, @Req() req: any) {
    // Utilisation de tenantId et U_Id pour garantir l'isolation des données
    return this.ncService.create(dto, req.user.tenantId, req.user.U_Id);
  }

  /**
   * EXPORT PDF : Génération de la fiche de Non-Conformité
   */
  @Get(':id/export-pdf')
  @Roles(Role.ADMIN, Role.AUDITEUR, Role.USER)
  async exportPdf(@Param('id') id: string, @Req() req: any, @Res() res: Response) {
    try {
      // 1. Récupération des données de la NC (Cast en any pour éviter les erreurs TS 'never')
      const nc = await this.ncService.findOne(id, req.user.tenantId) as any;

      if (!nc) {
        throw new BadRequestException("Fiche de Non-Conformité introuvable.");
      }

      // 2. Génération du PDF via le service commun
      // Note : On utilise ici une méthode dédiée que nous allons ajouter au PdfService
      const pdfBuffer = await this.pdfService.generateNcReport(nc);

      // 3. Configuration du téléchargement
      const fileName = nc.NC_Reference ? `NC_${nc.NC_Reference}.pdf` : `NC_${id}.pdf`;

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${fileName}`,
        'Content-Length': pdfBuffer.length,
      });

      return res.send(pdfBuffer);

    } catch (error: any) {
      throw new InternalServerErrorException(
        `Erreur lors de l'export de la NC : ${error.message}`
      );
    }
  }
}