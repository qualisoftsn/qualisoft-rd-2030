import { 
  ForbiddenException, 
  Injectable, 
  InternalServerErrorException, 
  Logger, 
  NotFoundException 
} from '@nestjs/common';
import { 
  Plan, 
  Site, 
  SubscriptionStatus, 
  Tenant, 
  Ticket, 
  TicketStatus, 
  TransactionStatus 
} from '@prisma/client';
import { addDays, addMonths } from 'date-fns';
import { EmailService } from '../common/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { BackupTaskService } from './tasks/backup-task.service';
import { UpdateTenantDto } from './dto/update-tenant.dto';

// Utilitaires de documents souverains
import { getInvoiceEmailTemplate } from './templates/invoice-email.template';
import { generateInvoicePDF } from './utils/pdf-invoice.util';
import { generateProformaPDF } from './utils/pdf-proforma.util';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private backupTask: BackupTaskService
  ) {}

  // ==========================================
  // 📊 GESTION DES INSTANCES (SYSTEM MATRIX)
  // ==========================================

  /**
   * Récupère toutes les instances avec le décompte des nœuds (utilisateurs/sites)
   */
  async findAllTenants(): Promise<Tenant[]> {
    try {
      return await this.prisma.tenant.findMany({
        include: {
          _count: { 
            select: { T_Users: true, T_Sites: true } 
          }
        },
        orderBy: { T_CreatedAt: 'desc' }
      });
    } catch (error) {
      this.logger.error(`Erreur lors de l'extraction de la Matrix : ${error.message}`);
      throw new InternalServerErrorException("Erreur de base de données lors du scan des instances.");
    }
  }

  /**
   * Récupère l'identité complète d'un Tenant spécifique
   */
  async getTenantById(T_Id: string): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findUnique({ 
      where: { T_Id },
      include: { 
        _count: { select: { T_Users: true, T_Sites: true } } 
      }
    });
    
    if (!tenant) {
      throw new NotFoundException(`L'instance [${T_Id}] est introuvable dans le cluster.`);
    }
    return tenant;
  }

  /**
   * Met à jour les paramètres de souveraineté et d'abonnement d'un Tenant
   */
  async updateTenant(id: string, dto: UpdateTenantDto): Promise<Tenant> {
    try {
      const updateData: any = { ...dto };
      
      // Conversion de la date d'expiration si fournie
      if (dto.T_ExpiryDate) {
        updateData.T_SubscriptionEndDate = new Date(dto.T_ExpiryDate);
        delete updateData.T_ExpiryDate; // Nettoyage pour Prisma
      }

      return await this.prisma.tenant.update({
        where: { T_Id: id },
        data: updateData
      });
    } catch (error) {
      this.logger.error(`Échec mise à jour Tenant ${id} : ${error.message}`);
      throw new InternalServerErrorException("Impossible de mettre à jour les protocoles de l'instance.");
    }
  }

  /**
   * Purge définitive d'une instance (Action irréversible)
   */
  async deleteTenant(id: string): Promise<void> {
    try {
      await this.prisma.tenant.delete({ where: { T_Id: id } });
      this.logger.warn(`⚠️ Instance ${id} purgée définitivement par le Master.`);
    } catch (error) {
      throw new InternalServerErrorException("Erreur lors de la purge de l'instance.");
    }
  }

  // ==========================================
  // 💸 FACTURATION & FLUX FINANCIERS
  // ==========================================

  /**
   * Émission de facture pro-forma (Engagement contractuel)
   */
  async processProformaRequest(tenantId: string, plan: any): Promise<{ success: boolean; message: string }> {
    const tenant = await this.getTenantById(tenantId);
    
    try {
      const pdfBuffer = await generateProformaPDF(tenant, plan);
      
      await this.emailService.sendMail({
        to: tenant.T_Email,
        subject: `📄 Facture Pro-forma Qualisoft RD 2030 - Plan ${plan.name}`,
        html: `<p>Bonjour M./Mme ${tenant.T_CeoName || 'le Responsable'},<br><br>Veuillez trouver ci-joint votre facture pro-forma pour l'activation de votre instance <strong>${tenant.T_Name}</strong>.</p>`,
        attachments: [{ 
          filename: `Proforma_Qualisoft_${plan.id}.pdf`, 
          content: pdfBuffer 
        }]
      });

      return { success: true, message: "Pro-forma générée et transmise avec succès." };
    } catch (error) {
      this.logger.error(`Échec Pro-forma : ${error.message}`);
      throw new InternalServerErrorException("Erreur lors de la génération du document PDF ou de l'envoi e-mail.");
    }
  }

  /**
   * Validation de transaction et activation de licence (24 mois)
   */
  async validateTransaction(transactionId: string): Promise<Tenant> {
    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { TX_Id: transactionId },
        include: { tenant: true }
      });

      if (!transaction) throw new NotFoundException("Transaction financière non identifiée.");

      // 1. Marquer la transaction comme complète
      await tx.transaction.update({
        where: { TX_Id: transactionId },
        data: { TX_Status: TransactionStatus.COMPLETE }
      });

      // 2. Activer la licence souveraine (Engagement 24 mois par défaut)
      const updatedTenant = await tx.tenant.update({
        where: { T_Id: transaction.tenantId },
        data: {
          T_SubscriptionEndDate: addMonths(new Date(), 24),
          T_SubscriptionStatus: SubscriptionStatus.ACTIVE,
          T_IsActive: true,
          T_ContractDuration: 24
        }
      });

      // 3. Génération et envoi de la facture acquittée
      try {
        const invoiceBuffer = await generateInvoicePDF(updatedTenant, transaction);
        await this.emailService.sendMail({
          to: updatedTenant.T_Email,
          subject: `🚀 Activation Réussie : Bienvenue dans l'Écosystème Qualisoft`,
          html: getInvoiceEmailTemplate(updatedTenant.T_Name, transaction.TX_Amount.toLocaleString()),
          attachments: [{ 
            filename: `Facture_Acquittee_${updatedTenant.T_Name}.pdf`, 
            content: invoiceBuffer 
          }]
        });
      } catch (e) {
        this.logger.error(`Erreur envoi facture finale : ${e.message}`);
      }

      return updatedTenant;
    });
  }

  // ==========================================
  // 📈 INTELLIGENCE & STATISTIQUES MASTER
  // ==========================================

  /**
   * Statistiques globales du Cluster Qualisoft
   */
  async getMasterData(isMaster: boolean): Promise<any> {
    try {
      const tenants = await this.prisma.tenant.findMany({
        include: {
          T_Transactions: { where: { TX_Status: TransactionStatus.COMPLETE } },
          T_Tickets: { where: { TK_Status: { not: TicketStatus.ARCHIVED } } }
        }
      });

      // Calcul du Chiffre d'Affaires Réel
      const revenue = tenants.reduce((acc, t) => 
        acc + t.T_Transactions.reduce((sum, tx) => sum + tx.TX_Amount, 0), 0
      );

      return {
        tenants,
        stats: {
          totalRevenue: isMaster ? `${revenue.toLocaleString()} XOF` : "•••••• XOF",
          activeCount: tenants.filter(t => t.T_SubscriptionStatus === SubscriptionStatus.ACTIVE).length,
          openTickets: tenants.reduce((acc, t) => 
            acc + (t.T_Tickets?.filter(tk => tk.TK_Status === TicketStatus.OPEN).length || 0), 0
          ),
          backupsCount: (await this.backupTask.getBackupsList()).length
        }
      };
    } catch (error) {
      throw new InternalServerErrorException("Erreur lors de la compilation des Master Data.");
    }
  }

  // ==========================================
  // 🛠️ SUPPORT & CONFIGURATION
  // ==========================================

  /**
   * Réponse officielle du Master à un ticket de support
   */
  async answerTicket(ticketId: string, response: string): Promise<Ticket> {
    try {
      const ticket = await this.prisma.ticket.update({
        where: { TK_Id: ticketId },
        data: { 
          TK_Response: response, 
          TK_Status: TicketStatus.RESOLVED, 
          TK_ResponseAt: new Date() 
        },
        include: { tenant: true }
      });

      await this.emailService.sendMail({
        to: ticket.tenant.T_Email,
        subject: `Support Qualisoft : Résolution du ticket #${ticket.TK_Id.slice(0, 5)}`,
        text: `Votre ticket a été traité par l'équipe souveraine.\n\nRéponse :\n${response}`
      });

      return ticket;
    } catch (error) {
      throw new InternalServerErrorException("Échec du traitement du ticket support.");
    }
  }

  /**
   * Création d'un nouveau site opérationnel pour un Tenant
   */
  async createSite(data: any, T_Id: string): Promise<Site> { 
    return this.prisma.site.create({ 
      data: { 
        ...data, 
        tenantId: T_Id 
      } 
    }); 
  }

  /**
   * Récupération de la liste des sauvegardes système
   */
  async getBackups(): Promise<any[]> { 
    return this.backupTask.getBackupsList(); 
  }
}