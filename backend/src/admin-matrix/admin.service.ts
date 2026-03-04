/**
 * 🛰️ ADMIN SERVICE - QUALISOFT ELITE RD-2026 (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Gestion souveraine des utilisateurs, facturation et monitoring.
 * FIX : Fusion intégrale des méthodes (Impersonation, Facturation, Tenants).
 * RÉVISION : 04 Mars 2026 | 18:03 GMT
 * -------------------------------------------------------------------------
 */

import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
  ConflictException
} from '@nestjs/common';
import {
  Site,
  SubscriptionStatus,
  Tenant,
  Ticket,
  TicketStatus,
  TransactionStatus,
  Role,
  User
} from '@prisma/client';
import { addMonths } from 'date-fns';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { EmailService } from '../common/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { BackupTaskService } from './tasks/backup-task.service';
import { UpdateTenantDto } from './dto/update-tenant.dto';

// Outils de génération PDF et Templates
import { getInvoiceEmailTemplate } from './templates/invoice-email.template';
import { generateInvoicePDF } from './utils/pdf-invoice.util';
import { generateProformaPDF } from './utils/pdf-proforma.util';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private backupTask: BackupTaskService
  ) {}

  // ==========================================
  // 1. GESTION DES TENANTS (NŒUDS MATRIX)
  // ==========================================

  async findAllTenants() {
    return this.prisma.tenant.findMany({
      include: {
        _count: { select: { T_Users: true, T_Sites: true } },
      },
      orderBy: { T_CreatedAt: 'desc' },
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

  async getTenantFullDetails(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { T_Id: tenantId },
      include: {
        T_Users: true,
        T_Sites: true,
        T_OrgUnits: { include: { OU_Type: true } }
      }
    });
    if (!tenant) throw new NotFoundException("Tenant introuvable.");
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

  // ==========================================
  // 2. GESTION SOUVERAINE DES UTILISATEURS
  // ==========================================

  async updateUserSovereign(userId: string, data: any, adminUser: User) {
    if (adminUser.U_Role !== Role.SUPER_ADMIN) {
      throw new UnauthorizedException("Seul l'Architecte peut modifier des données inter-tenants.");
    }

    return this.prisma.user.update({
      where: { U_Id: userId },
      data: {
        U_FirstName: data.firstName,
        U_LastName: data.lastName,
        U_Role: data.role,
        U_IsActive: data.isActive,
        tenantId: data.tenantId 
      }
    });
  }

  async createExternalUser(tenantId: string, data: any) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { T_Id: tenantId },
      include: { T_Sites: true }
    });
    if (!tenant) throw new NotFoundException("Tenant cible introuvable.");

    const existing = await this.prisma.user.findUnique({ where: { U_Email: data.email } });
    if (existing) throw new ConflictException("Cet email est déjà utilisé dans la Matrix.");

    const password = data.password || 'Qualisoft@2030';
    const hashedPassword = await bcrypt.hash(password, 12);

    return this.prisma.user.create({
      data: {
        U_Email: data.email,
        U_PasswordHash: hashedPassword,
        U_FirstName: data.firstName || 'Utilisateur',
        U_LastName: data.lastName || 'System',
        U_Role: data.role || Role.USER,
        U_IsActive: true,
        tenantId: tenantId,
        U_SiteId: tenant.T_Sites[0]?.S_Id || null 
      }
    });
  }

  async generateImpersonationToken(tenantId: string) {
    const adminTarget = await this.prisma.user.findFirst({
      where: { tenantId, U_Role: Role.ADMIN, U_IsActive: true }
    });

    if (!adminTarget) throw new NotFoundException("Aucun admin actif trouvé sur ce nœud.");

    const payload = { 
      sub: adminTarget.U_Id, 
      email: adminTarget.U_Email, 
      role: adminTarget.U_Role, 
      tenantId: tenantId,
      isImpersonated: true 
    };

    return {
      access_token: this.jwtService.sign(payload),
      targetUser: adminTarget
    };
  }

  // ==========================================
  // 3. FACTURATION, MASTER DATA & OUTILS
  // ==========================================

  async processProformaRequest(tenantId: string, plan: any): Promise<{ success: boolean; message: string }> {
    const tenant = await this.getTenantById(tenantId);
    try {
      const pdfBuffer = await generateProformaPDF(tenant, plan);
      await this.emailService.sendMail({
        to: tenant.T_Email,
        subject: `📄 Facture Pro-forma Qualisoft RD 2030 - Plan ${plan.name}`,
        html: `<p>Bonjour, veuillez trouver ci-joint notre facture pro-forma Qualisoft.</p>`,
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

  async getBackups(): Promise<any[]> { 
    return this.backupTask.getBackupsList(); 
  }
}