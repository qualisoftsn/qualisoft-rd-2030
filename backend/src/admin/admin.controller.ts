import { 
  Controller, Get, Post, Body, Req, Param, 
  UseGuards, UnauthorizedException, NotFoundException 
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { BackupTaskService } from './tasks/backup-task.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PLANS_DATA } from './constants/plans';
import { Plan } from '@prisma/client';

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
   * 📊 MASTER DATA : Statistiques globales pour Abdoulaye
   * Seul le Master voit les chiffres financiers réels.
   */
  @Get('master-data')
  async getMasterData(@Req() req: any) {
    const isMaster = req.user.U_Email === this.MASTER_EMAIL;
    return this.adminService.getMasterData(isMaster);
  }

  /**
   * 📄 GÉNÉRATION PRO-FORMA
   * Correction du typage : Conversion explicite du string en Enum Plan
   */
  @Post('generate-proforma')
  async handleProforma(@Body() body: { planId: string }, @Req() req: any) {
    // ✅ On cast le string en Plan pour correspondre au type attendu par PLANS_DATA
    const plan = PLANS_DATA.find(p => p.id === (body.planId as Plan));
    
    if (!plan) {
      throw new NotFoundException(`Le plan [${body.planId}] n'existe pas dans le référentiel Qualisoft.`);
    }
    
    // req.user.tenantId est injecté par le JwtAuthGuard
    return this.adminService.processProformaRequest(req.user.tenantId, plan);
  }

  /**
   * ✅ VALIDATION DE TRANSACTION (WAVE / ORANGE MONEY)
   * Route appelée depuis ta Master Console pour activer une instance Élite.
   */
  @Post('transactions/:txId/validate')
  async validateTx(@Param('txId') txId: string, @Req() req: any) {
    if (req.user.U_Email !== this.MASTER_EMAIL) {
      throw new UnauthorizedException("Seul l'Administrateur de Sociétés peut valider des flux financiers.");
    }
    return this.adminService.validateTransaction(txId);
  }

  /**
   * 💿 GESTION DES BACKUPS
   * Permet de surveiller l'état des sauvegardes du serveur OVH.
   */
  @Get('backups')
  async listBackups(@Req() req: any) {
    if (req.user.U_Email !== this.MASTER_EMAIL) {
      throw new UnauthorizedException("Accès restreint aux archives du noyau.");
    }
    return this.backupTaskService.getBackupsList();
  }
}