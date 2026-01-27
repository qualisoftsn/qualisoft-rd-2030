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

// Utilitaires de génération PDF
import { getInvoiceEmailTemplate } from './templates/invoice-email.template';
import { generateInvoicePDF } from './utils/pdf-invoice.util';
import { generateProformaPDF } from './utils/pdf-proforma.util';

// Interfaces pour le typage strict
interface PlanConfig { id: Plan; name: string; rawPrice: number }
interface SiteData { S_Name: string; S_Address?: string; S_City?: string; S_Country?: string; S_IsActive?: boolean }

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  private readonly MASTER_EMAIL = 'ab.thiongane@qualisoft.sn';

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private backupTask: BackupTaskService
  ) {}

  /**
   * 🆔 RÉCUPÉRATION IDENTITÉ TENANT
   * Résout l'erreur TypeError: getTenantById is not a function
   */
  async getTenantById(T_Id: string): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findUnique({ 
      where: { T_Id },
      include: {
        _count: {
          select: { T_Users: true, T_Sites: true }
        }
      }
    });
    if (!tenant) throw new NotFoundException(`Instance [${T_Id}] introuvable.`);
    return tenant;
  }

  /**
   * 📄 ÉTAPE 1 : GÉNÉRATION PRO-FORMA (AVANT PAIEMENT)
   * Engagement sur 24 mois pour le devis initial.
   */
  async processProformaRequest(tenantId: string, plan: PlanConfig): Promise<{ success: boolean; message: string }> {
    const tenant = await this.prisma.tenant.findUnique({ where: { T_Id: tenantId } });
    if (!tenant) throw new NotFoundException("Organisation Qualisoft introuvable.");

    try {
      const pdfBuffer = await generateProformaPDF(tenant, plan);

      await this.emailService.sendMail({
        to: tenant.T_Email,
        subject: `📄 Facture Pro-forma Qualisoft RD 2030 - Plan ${plan.name}`,
        html: `<p>Bonjour M./Mme ${tenant.T_CeoName || 'le Responsable'}, veuillez trouver ci-joint votre facture pro-forma Qualisoft.</p>`,
        attachments: [{
          filename: `Proforma_Qualisoft_${plan.id}.pdf`,
          content: pdfBuffer,
        }]
      });

      return { success: true, message: "Pro-forma envoyée par e-mail." };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erreur SMTP/PDF inconnue";
      this.logger.error(`❌ Erreur Pro-forma : ${msg}`);
      throw new InternalServerErrorException(`Échec de génération pro-forma : ${msg}`);
    }
  }

  /**
   * ✅ ÉTAPE 2 : VALIDATION MASTER & CLOSING (APRÈS PAIEMENT)
   * Déclenche l'activation et génère la facture finale acquittée.
   */
  async validateTransaction(transactionId: string): Promise<Tenant> {
    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { TX_Id: transactionId },
        include: { tenant: true }
      });

      if (!transaction) throw new NotFoundException("Transaction non identifiée dans le Noyau.");

      // Mise à jour statut financier
      await tx.transaction.update({
        where: { TX_Id: transactionId },
        data: { TX_Status: TransactionStatus.COMPLETE }
      });

      // Calcul de la pérennité (Engagement 24 mois)
      const newEndDate = addMonths(new Date(), 24);

      // Activation de la licence
      const updatedTenant = await tx.tenant.update({
        where: { T_Id: transaction.tenantId },
        data: {
          T_SubscriptionEndDate: newEndDate,
          T_SubscriptionStatus: SubscriptionStatus.ACTIVE,
          T_IsActive: true,
          T_ContractDuration: 24
        }
      });

      // Facture finale acquittée
      try {
        const invoiceBuffer = await generateInvoicePDF(updatedTenant, transaction);
        const amountFormatted = transaction.TX_Amount.toLocaleString('fr-FR');

        await this.emailService.sendMail({
          to: updatedTenant.T_Email,
          subject: `🚀 Bienvenue chez Qualisoft - Facture Acquittée & Activation`,
          html: getInvoiceEmailTemplate(updatedTenant.T_Name, amountFormatted),
          attachments: [{
            filename: `Facture_Qualisoft_${transaction.TX_Id.slice(0, 8)}.pdf`,
            content: invoiceBuffer,
          }]
        });
      } catch (e: unknown) {
        this.logger.error(`⚠️ Échec envoi pack activation : ${e instanceof Error ? e.message : 'Erreur SMTP/PDF'}`);
      }

      return updatedTenant;
    });
  }

  /** * 📊 MASTER DATA : Vision Stratégique
   */
  async getMasterData(isMaster: boolean): Promise<any> {
    const tenants = await this.prisma.tenant.findMany({
      include: {
        T_Transactions: { orderBy: { TX_CreatedAt: 'desc' } },
        T_Tickets: { 
          where: { TK_Status: { not: TicketStatus.ARCHIVED } },
          orderBy: { TK_CreatedAt: 'desc' }
        }
      },
      orderBy: { T_CreatedAt: 'desc' }
    });

    const realTotalRevenue = tenants.reduce((acc, t) => acc + t.T_Transactions
      .filter(tx => tx.TX_Status === TransactionStatus.COMPLETE)
      .reduce((sum, tx) => sum + tx.TX_Amount, 0), 0);

    return {
      tenants,
      stats: {
        totalRevenue: isMaster ? `${realTotalRevenue.toLocaleString()} XOF` : "•••••• XOF",
        activeCount: tenants.filter(t => t.T_SubscriptionStatus === SubscriptionStatus.ACTIVE).length,
        pendingTrials: tenants.filter(t => t.T_SubscriptionStatus === SubscriptionStatus.TRIAL).length,
        openTickets: tenants.reduce((acc, t) => acc + (t.T_Tickets?.filter(tk => tk.TK_Status === TicketStatus.OPEN).length || 0), 0),
        backupsCount: (await this.backupTask.getBackupsList()).length
      }
    };
  }

  /** ✅ GESTION DES ACCÈS TRIAL */
  async handleTenantAction(tenantId: string, action: 'APPROVE' | 'REJECT'): Promise<Tenant> {
    const isApprove = action === 'APPROVE';
    return this.prisma.tenant.update({
      where: { T_Id: tenantId },
      data: {
        T_IsActive: isApprove,
        T_SubscriptionStatus: isApprove ? SubscriptionStatus.ACTIVE : SubscriptionStatus.EXPIRED,
        T_SubscriptionEndDate: isApprove ? addDays(new Date(), 14) : new Date()
      }
    });
  }

  /** ✅ SUPPORT TECHNIQUE */
  async answerTicket(ticketId: string, response: string): Promise<Ticket> {
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
      subject: `Support Qualisoft : Réponse au ticket #${ticket.TK_Id.slice(0, 5)}`,
      text: response
    });
    return ticket;
  }

  /** ✅ CONFIGURATION MULTI-SITE */
  async getTenantConfig(T_Id: string): Promise<Tenant | null> { 
    return this.prisma.tenant.findUnique({ where: { T_Id } }); 
  }

  async getSites(T_Id: string): Promise<Site[]> { 
    return this.prisma.site.findMany({ where: { tenantId: T_Id } }); 
  }

  async createSite(data: SiteData, T_Id: string): Promise<Site> { 
    return this.prisma.site.create({ data: { ...data, tenantId: T_Id } }); 
  }
  
  async updateSite(id: string, data: Partial<SiteData>, T_Id: string): Promise<Site> {
    const site = await this.prisma.site.findFirst({ where: { S_Id: id, tenantId: T_Id } });
    if (!site) throw new ForbiddenException("Accès non autorisé à ce site.");
    return this.prisma.site.update({ where: { S_Id: id }, data });
  }

  async getBackups(): Promise<any[]> { 
    return this.backupTask.getBackupsList(); 
  }
}