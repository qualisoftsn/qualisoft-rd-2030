import { 
  Controller, 
  Get, 
  Query, 
  UseGuards, 
  Req, 
  BadRequestException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { CopilService } from './copil.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

/**
 * @interface AuthenticatedRequest
 * Extension de la requête Express pour inclure l'utilisateur injecté par le JWT Guard
 */
interface AuthenticatedRequest extends Request {
  user: {
    tenantId: string;
    U_Id: string;
    U_Role: string;
  };
}

@Controller('copil')
@UseGuards(JwtAuthGuard) // 🛡️ Accès réservé aux utilisateurs authentifiés du Noyau
export class CopilController {
  constructor(private readonly copilService: CopilService) {}

  /**
   * @route   GET /copil/analysis
   * @desc    Analyse consolidée de la performance pour le Comité de Pilotage (COPIL)
   * @access  Private (Multi-Tenant)
   */
  @Get('analysis')
  async getAnalysis(
    @Req() req: AuthenticatedRequest, 
    @Query('month') month: string, 
    @Query('year') year: string
  ) {
    // 1. Extraction du Tenant ID (Souveraineté Multi-Tenant)
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      throw new BadRequestException("Identification de l'instance Qualisoft impossible.");
    }

    // 2. Parsing et Validation Rigoureuse (Anti-Crash)
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);

    if (isNaN(m) || isNaN(y) || m < 1 || m > 12) {
      throw new BadRequestException(
        "Les paramètres temporels (Mois/Année) sont invalides ou manquants."
      );
    }

    // 3. Exécution de l'Analyse Transversale via le Service
    try {
      const analysis = await this.copilService.getCopilAnalysis(tenantId, m, y);

      // Réponse formatée pour le Dashboard Élite
      return {
        status: 'SUCCESS',
        payload: {
          ...analysis,
          generatedAt: new Date().toISOString(),
          authorizedBy: req.user.U_Id
        }
      };
    } catch (error: any) {
      // Gestion propre de l'erreur TypeScript 'unknown'
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue du noyau";
      
      throw new InternalServerErrorException(
        `Échec de la consolidation des données SMI : ${errorMessage}`
      );
    }
  }
}