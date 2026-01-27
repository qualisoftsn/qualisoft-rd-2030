import { 
  Controller, Get, Post, Body, Req, Param, 
  UseGuards, UnauthorizedException, NotFoundException 
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { BackupTaskService } from './tasks/backup-task.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PLANS_DATA } from './constants/plans';
import { Plan, Role } from '@prisma/client';
import { Request } from 'express';

// --- INTERFACE POUR LE REQUÊTAGE TYPÉ ---
interface AuthenticatedRequest extends Request {
  user: {
    U_Id: string;
    U_Email: string;
    tenantId: string;
    U_Role: Role;
  };
}

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  // 🛡️ Identifiant unique du Master Qualisoft
  private readonly MASTER_EMAIL = 'ab.thiongane@qualisoft.sn';

  constructor(
    private readonly adminService: AdminService,
    private readonly backupTaskService: BackupTaskService
  ) {}

  /**
   * 🔑 TENANT IDENTITY (ROUTE MANQUANTE QUI CAUSAIT LE 404)
   * Permet à chaque instance de récupérer ses propres paramètres au démarrage.
   */
  @Get('tenant/me')
  async getMyTenant(@Req() req: AuthenticatedRequest) {
    const tenantId = req.user.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException("Identifiant de l'instance introuvable.");
    }
    return this.adminService.getTenantById(tenantId);
  }

  /**
   * 📊 MASTER DATA : Statistiques globales pour Abdoulaye
   */
  @Get('master-data')
  async getMasterData(@Req() req: AuthenticatedRequest) {
    const isMaster = req.user.U_Email === this.MASTER_EMAIL;
    return this.adminService.getMasterData(isMaster);
  }

  /**
   * 📄 GÉNÉRATION PRO-FORMA
   */
  @Post('generate-proforma')
  async handleProforma(
    @Body() body: { planId: string }, 
    @Req() req: AuthenticatedRequest
  ) {
    const plan = PLANS_DATA.find(p => p.id === (body.planId as Plan));
    
    if (!plan) {
      throw new NotFoundException(`Le plan [${body.planId}] n'existe pas.`);
    }
    
    return this.adminService.processProformaRequest(req.user.tenantId, plan);
  }

  /**
   * ✅ VALIDATION DE TRANSACTION
   */
  @Post('transactions/:txId/validate')
  async validateTx(
    @Param('txId') txId: string, 
    @Req() req: AuthenticatedRequest
  ) {
    if (req.user.U_Email !== this.MASTER_EMAIL) {
      throw new UnauthorizedException("Accès restreint au Master Qualisoft.");
    }
    return this.adminService.validateTransaction(txId);
  }

  /**
   * 💿 GESTION DES BACKUPS
   */
  @Get('backups')
  async listBackups(@Req() req: AuthenticatedRequest) {
    if (req.user.U_Email !== this.MASTER_EMAIL) {
      throw new UnauthorizedException("Accès restreint aux archives système.");
    }
    return this.backupTaskService.getBackupsList();
  }
}