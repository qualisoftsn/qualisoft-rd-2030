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

  // --- GESTION DES TENANTS (POUR SUPER-ADMIN) ---
async findAllTenants() {
  return this.prisma.tenant.findMany({
    include: {
      _count: {
        select: {
          T_Users: true,  // Important pour l'affichage des "Citoyens"
          T_Sites: true,
        },
      },
    },
  });
}

  async getTenantById(T_Id: string): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findUnique({ 
      where: { T_Id },
      include: { _count: { select: { T_Users: true, T_Sites: true } } }
    });
    if (!tenant) throw new NotFoundException(`Instance [${T_Id}] introuvable.`);
    return tenant;
  }

  async updateTenant(id: string, dto: UpdateTenantDto): Promise<Tenant> {
    try {
      return await this.prisma.tenant.update({
        where: { T_Id: id },
        data: {
          ...dto,
          ...(dto.T_ExpiryDate && { T_SubscriptionEndDate: new Date(dto.T_ExpiryDate) })
        }
      });
    } catch (error: any) {
      this.logger.error(`Échec mise à jour Tenant ${id} : ${error.message}`);
      throw new InternalServerErrorException("Mise à jour impossible.");
    }
  }

  async deleteTenant(id: string): Promise<void> {
    try {
      await this.prisma.tenant.delete({ where: { T_Id: id } });
    } catch (error: any) {
      throw new InternalServerErrorException("Erreur lors de la suppression de l'instance.");
    }
  }

  // --- FACTURATION & TRANSACTIONS ---

  async processProformaRequest(tenantId: string, plan: any): Promise<{ success: boolean; message: string }> {
    const tenant = await this.getTenantById(tenantId);
    try {
      const pdfBuffer = await generateProformaPDF(tenant, plan);
      await this.emailService.sendMail({
        to: tenant.T_Email,
        subject: `📄 Facture Pro-forma Qualisoft RD 2030 - Plan ${plan.name}`,
        html: `<p>Bonjour, veuillez trouver ci-joint votre facture pro-forma Qualisoft.</p>`,
        attachments: [{ filename: `Proforma_${plan.id}.pdf`, content: pdfBuffer }]
      });
      return { success: true, message: "Pro-forma envoyée." };
    } catch (error: any) {
      this.logger.error(`Échec Pro-forma : ${error.message}`);
      throw new InternalServerErrorException("Erreur génération PDF/Email");
    }
  }

  async validateTransaction(transactionId: string): Promise<Tenant> {
    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { TX_Id: transactionId },
        include: { tenant: true }
      });
      if (!transaction) throw new NotFoundException("Transaction inconnue.");

      await tx.transaction.update({
        where: { TX_Id: transactionId },
        data: { TX_Status: TransactionStatus.COMPLETE }
      });

      const updatedTenant = await tx.tenant.update({
        where: { T_Id: transaction.tenantId },
        data: {
          T_SubscriptionEndDate: addMonths(new Date(), 24),
          T_SubscriptionStatus: SubscriptionStatus.ACTIVE,
          T_IsActive: true,
          T_ContractDuration: 24
        }
      });

      try {
        const invoiceBuffer = await generateInvoicePDF(updatedTenant, transaction);
        await this.emailService.sendMail({
          to: updatedTenant.T_Email,
          subject: `🚀 Bienvenue chez Qualisoft - Activation`,
          html: getInvoiceEmailTemplate(updatedTenant.T_Name, transaction.TX_Amount.toLocaleString()),
          attachments: [{ filename: `Facture_${updatedTenant.T_Name}.pdf`, content: invoiceBuffer }]
        });
      } catch (e: any) {
        this.logger.error(`Erreur envoi facture finale : ${e.message}`);
      }

      return updatedTenant;
    });
  }

  async getMasterData(isMaster: boolean): Promise<any> {
    try {
      const tenants = await this.prisma.tenant.findMany({
        include: {
          T_Transactions: { where: { TX_Status: TransactionStatus.COMPLETE } },
          T_Tickets: { where: { TK_Status: { not: TicketStatus.ARCHIVED } } }
        }
      });

      const revenue = tenants.reduce((acc, t) => acc + t.T_Transactions.reduce((sum, tx) => sum + tx.TX_Amount, 0), 0);

      return {
        tenants,
        stats: {
          totalRevenue: isMaster ? `${revenue.toLocaleString()} XOF` : "•••••• XOF",
          activeCount: tenants.filter(t => t.T_SubscriptionStatus === SubscriptionStatus.ACTIVE).length,
          openTickets: tenants.reduce((acc, t) => acc + (t.T_Tickets?.filter(tk => tk.TK_Status === TicketStatus.OPEN).length || 0), 0),
          backupsCount: (await this.backupTask.getBackupsList()).length
        }
      };
    } catch (error: any) {
      throw new InternalServerErrorException("Erreur Master Data.");
    }
  }

  async answerTicket(ticketId: string, response: string): Promise<Ticket> {
    try {
      const ticket = await this.prisma.ticket.update({
        where: { TK_Id: ticketId },
        data: { TK_Response: response, TK_Status: TicketStatus.RESOLVED, TK_ResponseAt: new Date() },
        include: { tenant: true }
      });
      await this.emailService.sendMail({
        to: ticket.tenant.T_Email,
        subject: `Support Qualisoft : Réponse au ticket`,
        text: response
      });
      return ticket;
    } catch (error: any) {
      throw new InternalServerErrorException("Erreur traitement ticket.");
    }
  }

  async createSite(data: any, T_Id: string): Promise<Site> { 
    return this.prisma.site.create({ data: { ...data, tenantId: T_Id } }); 
  }

  async getBackups(): Promise<any[]> { return this.backupTask.getBackupsList(); }
}