import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Req, 
  Param, 
  UseGuards, 
  UnauthorizedException, 
  NotFoundException, 
  Logger,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { BackupTaskService } from './tasks/backup-task.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PLANS_DATA } from './constants/plans';
import { Plan, Role } from '@prisma/client';
import { Request } from 'express';

/**
 * 🛠️ INTERFACE AUTHENTICATED REQUEST
 * Garantit que l'objet req.user contient toutes les métadonnées de sécurité Qualisoft
 */
interface AuthenticatedRequest extends Request {
  user: {
    U_Id: string;
    U_Email: string;
    tenantId: string;
    U_Role: Role;
  };
}

/**
 * 🏛️ ADMIN CONTROLLER : Pivot de la Gouvernance Qualisoft Elite
 * Gère l'identité des instances, les flux financiers et la pérennité des données.
 */
@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  private readonly logger = new Logger(AdminController.name);
  
  // 🛡️ Identifiant unique du Master Qualisoft (Souveraineté Totale)
  private readonly MASTER_EMAIL = 'ab.thiongane@qualisoft.sn';

  constructor(
    private readonly adminService: AdminService,
    private readonly backupTaskService: BackupTaskService
  ) {}

  /**
   * 🆔 TENANT IDENTITY (Profil de l'Instance)
   * Permet au Dashboard de charger les paramètres propres à l'organisation connectée.
   */
  @Get('tenant/me')
  @HttpCode(HttpStatus.OK)
  async getMyTenant(@Req() req: AuthenticatedRequest) {
    const tenantId = req.user.tenantId;
    if (!tenantId) {
      this.logger.error(`Tentative d'accès identité sans TenantID - User: ${req.user.U_Id}`);
      throw new UnauthorizedException("Identifiant de l'instance non résolu.");
    }
    
    try {
      return await this.adminService.getTenantById(tenantId);
    } catch (error) {
      throw new NotFoundException("L'instance demandée n'existe plus sur ce nœud.");
    }
  }

  /**
   * 📊 MASTER DATA : Vision Stratégique Globale
   * Accessible uniquement par Abdoulaye (Master) ou pour des statistiques limitées.
   */
  @Get('master-data')
  async getMasterData(@Req() req: AuthenticatedRequest) {
    const isMaster = req.user.U_Email === this.MASTER_EMAIL;
    this.logger.log(`Accès MasterData - Mode ${isMaster ? 'SOUVERAIN' : 'TENANT'}`);
    return this.adminService.getMasterData(isMaster);
  }

  /**
   * 📄 GÉNÉRATION PRO-FORMA (§8.2 ISO 9001)
   * Transforme un choix de plan en document contractuel PDF.
   */
  @Post('generate-proforma')
  @HttpCode(HttpStatus.CREATED)
  async handleProforma(
    @Body() body: { planId: string }, 
    @Req() req: AuthenticatedRequest
  ) {
    // Validation du Plan via les constantes officielles
    const plan = PLANS_DATA.find(p => p.id === (body.planId as Plan));
    
    if (!plan) {
      this.logger.warn(`Plan invalide demandé : ${body.planId}`);
      throw new NotFoundException(`Le plan d'abonnement [${body.planId}] est inconnu.`);
    }
    
    return this.adminService.processProformaRequest(req.user.tenantId, plan);
  }

  /**
   * ✅ VALIDATION DE TRANSACTION (Closing Financier)
   * Seul le Master peut valider manuellement ou via webhook le paiement d'un tenant.
   */
  @Post('transactions/:txId/validate')
  async validateTx(
    @Param('txId') txId: string, 
    @Req() req: AuthenticatedRequest
  ) {
    if (req.user.U_Email !== this.MASTER_EMAIL) {
      this.logger.error(`ALERTE SÉCURITÉ : Tentative de validation transaction par ${req.user.U_Email}`);
      throw new UnauthorizedException("Autorité insuffisante pour valider les flux financiers.");
    }
    
    return this.adminService.validateTransaction(txId);
  }

  /**
   * 💿 GESTION DES BACKUPS (Pérennité du Système)
   * Accès restreint aux archives du cluster pour maintenance ou restauration.
   */
  @Get('backups')
  async listBackups(@Req() req: AuthenticatedRequest) {
    if (req.user.U_Email !== this.MASTER_EMAIL) {
      throw new UnauthorizedException("Accès réservé au contrôle souverain du système.");
    }
    
    try {
      const backups = await this.backupTaskService.getBackupsList();
      return {
        count: backups.length,
        lastBackup: backups[0] || null,
        data: backups
      };
    } catch (error) {
      this.logger.error("Erreur lors de la lecture des archives de sauvegarde");
      return { data: [], error: "Service de backup momentanément indisponible." };
    }
  }
}